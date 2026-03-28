const { getAuctionState, setAuctionState, getStateKey, getAllAuctionStatesMemory } = require('../services/auctionStateService');
const { redis } = require('../services/redisService');
const Player = require('../models/Player');
const Team = require('../models/Team');

let workerInterval = null;
let ioInstance = null;
let isProcessing = false;

const getTimerDuration = (player) => {
    // User requested a strict global 20-second hammer timeout across all player tiers
    return 20000;
};

const initTimerWorker = (io) => {
    ioInstance = io;
    if (workerInterval) clearInterval(workerInterval);
    workerInterval = setInterval(checkGlobalTimer, 500);
    console.log('Background Auction Timer Worker started running');
};

const checkGlobalTimer = async () => {
    if (isProcessing) return; 
    
    try {
        isProcessing = true;
        
        let keys = [];
        if (redis.status === 'ready') {
            keys = await redis.keys('auction:state:*');
        } else {
            const memStates = getAllAuctionStatesMemory();
            keys = Object.keys(memStates).map(id => `auction:state:${id}`);
        }
        
        for (const key of keys) {
            const auctionId = key.split(':')[2];
            if (auctionId) {
                await processTimerForAuction(auctionId, key);
            }
        }

    } catch (err) {
        console.error("Timer Worker Error:", err);
    } finally {
        isProcessing = false;
    }
};

const processTimerForAuction = async (auctionId, STATE_KEY) => {
    try {
        let stateStr = null;
        if (redis.status === 'ready') {
            stateStr = await redis.get(STATE_KEY);
        } else {
            const memState = await getAuctionState(auctionId);
            stateStr = JSON.stringify(memState);
        }
        
        if (!stateStr) return;

        const state = JSON.parse(stateStr);

        if (state.auctionStatus !== 'LIVE' || !state.timerEndTime) return;

        const now = Date.now();
        if (now >= state.timerEndTime) {
            if (redis.status === 'ready') {
                await redis.watch(STATE_KEY);
                const currentStateStr = await redis.get(STATE_KEY);
                const currentState = JSON.parse(currentStateStr);
                
                if (currentState.auctionStatus !== 'LIVE' || !currentState.timerEndTime || now < currentState.timerEndTime) {
                    await redis.unwatch();
                    return;
                }

                const multi = redis.multi();
                currentState.timerEndTime = null;
                currentState.auctionStatus = 'PENDING_PROCESS'; 
                multi.set(STATE_KEY, JSON.stringify(currentState));
                const execResult = await multi.exec();

                if (!execResult) return;
            }

            if (state.highestBidderTeamId) {
                await processPlayerSold(auctionId, state);
            } else {
                await processPlayerUnsold(auctionId, state);
            }
        }
    } catch (err) {
        console.error(`Error processing timer for ${auctionId}`, err);
    }
}

const processPlayerSold = async (auctionId, oldState) => {
    try {
        const state = await getAuctionState(auctionId);
        
        const player = await Player.findById(state.currentPlayer._id);
        const team = await Team.findById(state.highestBidderTeamId);

        if (player && team) {
            player.status = 'sold';
            player.soldPrice = state.currentBid;
            player.soldToTeamId = team._id;
            await player.save();

            team.purseRemaining -= state.currentBid;
            if (!team.playersBought.includes(player._id)) {
                team.playersBought.push(player._id);
            }
            if (player.isOverseas) team.overseasCount += 1;
            if (player.role === 'WK' || player.role === 'BAT') team.roleCounts.wkBatCount += 1;
            else if (player.role === 'ALL' || player.role === 'BOWL') team.roleCounts.allBowlCount += 1;

            const currentIplCount = team.iplTeamCounts.get(player.iplTeam) || 0;
            team.iplTeamCounts.set(player.iplTeam, currentIplCount + 1);

            await team.save();
        }

        state.auctionStatus = 'SOLD';
        state.timerEndTime = null;
        await setAuctionState(auctionId, state);

        const hydratedTeam = await Team.findById(team._id).populate('playersBought');
        
        if (ioInstance) ioInstance.to(auctionId).emit('playerSold', { player, team: hydratedTeam, soldPrice: state.currentBid });

    } catch (err) {
        console.error("Error finalizing SOLD player", err);
    }
};

const processPlayerUnsold = async (auctionId, oldState) => {
    try {
        const state = await getAuctionState(auctionId);
        const player = await Player.findById(state.currentPlayer._id);
        
        if (player) {
            player.status = 'unsold';
            player.isPassed = true;
            await player.save();
        }
        
        state.auctionStatus = 'WAITING';
        state.timerEndTime = null;
        await setAuctionState(auctionId, state);
        
        if (ioInstance) ioInstance.to(auctionId).emit('markUnsold', { player: state.currentPlayer });

    } catch (err) {
        console.error("Error finalizing UNSOLD player", err);
    }
};

module.exports = {
    initTimerWorker,
    getTimerDuration
};
