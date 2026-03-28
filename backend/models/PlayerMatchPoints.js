const mongoose = require('mongoose');

const playerMatchPointsSchema = new mongoose.Schema({
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
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WeekMatch',
        required: true
    },
    playerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    points: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// A specific player can only log points once per fixture match ID.
playerMatchPointsSchema.index({ matchId: 1, playerId: 1 }, { unique: true });

module.exports = mongoose.model('PlayerMatchPoints', playerMatchPointsSchema);
