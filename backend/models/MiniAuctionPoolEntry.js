const mongoose = require('mongoose');

const miniAuctionPoolEntrySchema = new mongoose.Schema({
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
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    source: {
        type: String,
        enum: ['MAIN_UNSOLD', 'RELEASED'],
        required: true
    },
    releasedByTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    status: {
        type: String,
        enum: ['AVAILABLE', 'SOLD', 'UNSOLD'],
        default: 'AVAILABLE'
    },
    soldToTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    soldPrice: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// A player can only appear once in a mini-auction pool per week
miniAuctionPoolEntrySchema.index({ weekId: 1, playerId: 1 }, { unique: true });

module.exports = mongoose.model('MiniAuctionPoolEntry', miniAuctionPoolEntrySchema);
