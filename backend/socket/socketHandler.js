const { getAuctionState, setAuctionState, getStateKey } = require('../services/auctionStateService');
const { redis } = require('../services/redisService');
const { getTimerDuration } = require('../workers/timerWorker');
const Player = require('../models/Player');
const Team = require('../models/Team');

const socketHandler = (io) => {
    io.on('connection', async (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on('joinAuction', async (data) => {
            const { auctionId, teamId } = data || {};
            if (!auctionId) return;
            
            socket.join(auctionId);
            socket.teamId = teamId;
            socket.auctionId = auctionId;
            
            console.log(`Socket ${socket.id} (Team ${teamId || 'Admin'}) joined auction loop for ${auctionId}`);
            
            // Push initial state only to this socket
            const state = await getAuctionState(auctionId);
            socket.emit('auctionUpdate', state);
        });

        socket.on('syncStateRequest', async (data) => {
            const { auctionId } = data || {};
            if (!auctionId) return;

            try {
                const state = await getAuctionState(auctionId);
                let populatedPlayer = state.currentPlayer;
                if (state.currentPlayer) {
                    populatedPlayer = await Player.findById(state.currentPlayer._id).populate('soldToTeamId');
                }
                const teamDataList = await Team.find({ auctionId }).populate('playersBought');

                socket.emit('auctionStateSync', {
                    currentPlayer: populatedPlayer,
                    currentBid: state.currentBid,
                    highestBidderTeamId: state.highestBidderTeamId,
                    timerEndTime: state.timerEndTime,
                    auctionStatus: state.auctionStatus,
                    teamDataList: teamDataList,
                    upcomingPlayersQueue: state.upcomingPlayers || state.playerQueue.slice(0, 3)
                });
            } catch (err) {
                console.error("Error syncing state", err);
            }
        });

        socket.on('placeBid', async (data) => {
            try {
                const { auctionId, teamId } = data;
                if (!auctionId || !teamId) return socket.emit('error', { message: 'Missing auctionId or teamId' });

                const STATE_KEY = getStateKey(auctionId);

                if (redis.status === 'ready') await redis.watch(STATE_KEY);
                
                let stateStr = null;
                if (redis.status === 'ready') stateStr = await redis.get(STATE_KEY);
                
                let state;
                if (stateStr) {
                    state = JSON.parse(stateStr);
                } else {
                    state = await getAuctionState(auctionId); 
                }

                if (state.auctionStatus !== 'LIVE') {
                    if (redis.status === 'ready') await redis.unwatch();
                    return socket.emit('error', { message: 'Auction is not LIVE' });
                }

                if (!state.currentPlayer) {
                    if (redis.status === 'ready') await redis.unwatch();
                    return socket.emit('error', { message: 'No player currently in auction' });
                }

                if (state.highestBidderTeamId === teamId) {
                    if (redis.status === 'ready') await redis.unwatch();
                    return socket.emit('error', { message: 'You are already the highest bidder' });
                }

                const team = await Team.findById(teamId);
                if (!team || String(team.auctionId) !== String(auctionId)) {
                    if (redis.status === 'ready') await redis.unwatch();
                    return socket.emit('error', { message: 'Invalid Team ID or mismatch' });
                }

                let nextBid;
                if (state.highestBidderTeamId === null) {
                    nextBid = state.currentPlayer.basePrice;
                } else {
                    const cb = state.currentBid;
                    if (cb < 10000000) nextBid = cb + 500000;       // < 1Cr: +5 Lakhs
                    else if (cb < 20000000) nextBid = cb + 1000000; // 1Cr - 2Cr: +10 Lakhs
                    else if (cb < 30000000) nextBid = cb + 2000000; // 2Cr - 3Cr: +20 Lakhs
                    else if (cb < 50000000) nextBid = cb + 2500000; // 3Cr - 5Cr: +25 Lakhs
                    else nextBid = cb + 5000000;                    // > 5Cr: +50 Lakhs
                }

                if (team.purseRemaining < nextBid) {
                    if (redis.status === 'ready') await redis.unwatch();
                    return socket.emit('error', { message: 'Insufficient purse remaining' });
                }
                if (team.playersBought.length >= 18) {
                    if (redis.status === 'ready') await redis.unwatch();
                    return socket.emit('error', { message: 'Maximum 18 players limit reached' });
                }
                if (state.currentPlayer.isOverseas && team.overseasCount >= 6) {
                    if (redis.status === 'ready') await redis.unwatch();
                    return socket.emit('error', { message: 'Maximum 6 overseas players limit reached' });
                }
                const currentIplCount = team.iplTeamCounts.get(state.currentPlayer.iplTeam) || 0;
                if (currentIplCount >= 2) {
                    if (redis.status === 'ready') await redis.unwatch();
                    return socket.emit('error', { message: 'Maximum 2 players from same IPL franchise limit reached' });
                }
                
                const role = state.currentPlayer.role;
                // Constraints for 9 BAT/WK and 9 ALL/BOWL have been intentionally lifted per user request.

                state.currentBid = nextBid;
                state.highestBidderTeamId = team._id.toString();
                state.highestBidderTeamName = team.teamName;
                state.timerEndTime = new Date().getTime() + getTimerDuration(state.currentPlayer);

                if (redis.status === 'ready') {
                    const multi = redis.multi();
                    multi.set(STATE_KEY, JSON.stringify(state));
                    const execResult = await multi.exec();

                    if (!execResult) {
                        return socket.emit('error', { message: 'Another bid was placed simultaneously. Please try again.' });
                    }
                } else {
                    await setAuctionState(auctionId, state);
                }

                // Broadcast to everyone in THAT specific auction room
                io.to(auctionId).emit('auctionUpdate', state);
                console.log(`Bid placed by ${team.teamName} for ${nextBid} in auction ${auctionId}`);

            } catch (error) {
                if (redis.status === 'ready') await redis.unwatch();
                console.error(error);
                socket.emit('error', { message: 'Internal Server Error' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });
};

module.exports = socketHandler;
