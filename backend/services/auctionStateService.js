const redisService = require('./redisService');
const { redis } = redisService;

const DEFAULT_STATE = {
    currentPlayer: null,
    currentBid: 0,
    highestBidderTeamId: null,
    highestBidderTeamName: null,
    timerEndTime: null,
    auctionStatus: 'WAITING',
    playerQueue: [],
    queueLength: 0,
    upcomingPlayers: []
};

let memoryState = {}; 

const getStateKey = (auctionId) => `auction:state:${auctionId}`;

const getAuctionState = async (auctionId) => {
    if (!auctionId) throw new Error("auctionId is required");
    
    if (!redisService.isReady) {
        if (!memoryState[auctionId]) memoryState[auctionId] = { ...DEFAULT_STATE };
        return { ...memoryState[auctionId] };
    }
    
    try {
        const data = await redis.get(getStateKey(auctionId));
        if (data) {
            return JSON.parse(data);
        }
        await setAuctionState(auctionId, DEFAULT_STATE);
        return { ...DEFAULT_STATE };
    } catch (err) {
        console.error('Error reading state from Redis, falling back to memory', err);
        return memoryState[auctionId] || { ...DEFAULT_STATE };
    }
};

const setAuctionState = async (auctionId, newState) => {
    if (!auctionId) throw new Error("auctionId is required");

    if (!redisService.isReady) {
        memoryState[auctionId] = { ...newState };
        return true;
    }

    try {
        await redis.set(getStateKey(auctionId), JSON.stringify(newState));
        return true;
    } catch (err) {
        console.error('Error writing state to Redis, falling back to memory', err);
        memoryState[auctionId] = { ...newState };
        return false;
    }
};

const updateAuctionField = async (auctionId, updates) => {
    const currentState = await getAuctionState(auctionId);
    const updatedState = { ...currentState, ...updates };
    await setAuctionState(auctionId, updatedState);
    return updatedState;
};

const getAllAuctionStatesMemory = () => memoryState;

module.exports = {
    getAuctionState,
    setAuctionState,
    updateAuctionField,
    getStateKey,
    getAllAuctionStatesMemory,
    DEFAULT_STATE
};
