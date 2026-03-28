const Player = require('../models/Player');

const { getAuctionState, setAuctionState } = require('./auctionStateService');

const getNextPlayer = async (auctionId) => {
    try {
        const state = await getAuctionState(auctionId);
        if (state.playerQueue && state.playerQueue.length > 0) {
            const nextP = state.playerQueue.shift();
            state.upcomingPlayers = state.playerQueue.slice(0, 3);
            state.queueLength = state.playerQueue.length;
            await setAuctionState(auctionId, state);
            return nextP;
        }

        const player = await Player.findOne({ 
            auctionId, 
            status: 'unsold', 
            isPassed: false 
        }).sort({ setNumber: 1, basePrice: -1 });

        return player;
    } catch (error) {
        console.error('Error fetching next player', error);
        return null;
    }
};

const initQueue = async (auctionId, setNumber) => {
    try {
        const query = { auctionId, status: 'unsold' };
        if (setNumber) query.setNumber = setNumber;

        let players = await Player.find(query);
        
        // Fisher-Yates shuffle implementation
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
        
        const state = await getAuctionState(auctionId);
        state.playerQueue = players;
        state.upcomingPlayers = players.slice(0, 3);
        state.queueLength = players.length;
        await setAuctionState(auctionId, state);
        
        return players;
    } catch (error) {
        console.error('Error initializing queue', error);
        return [];
    }
};

module.exports = {
    getNextPlayer,
    initQueue
};
