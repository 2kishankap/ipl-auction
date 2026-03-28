const mongoose = require('mongoose');

const rosterTransactionSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },
    weekId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeagueWeek',
        required: true
    },
    teamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    type: {
        type: String,
        enum: ['RELEASE', 'MINI_AUCTION_BUY'],
        required: true
    },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    price: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('RosterTransaction', rosterTransactionSchema);
