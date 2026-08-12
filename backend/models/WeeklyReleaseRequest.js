const mongoose = require('mongoose');

const weeklyReleaseRequestSchema = new mongoose.Schema({
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
    releasedPlayerIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    status: {
        type: String,
        enum: ['PENDING', 'PROCESSED'],
        default: 'PENDING'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// A team can only file one overarching release request block per week.
weeklyReleaseRequestSchema.index({ weekId: 1, teamId: 1 }, { unique: true });

// Custom constraint ensuring a team cannot release more than 3 players per week.
weeklyReleaseRequestSchema.pre('validate', function() {
    if (this.releasedPlayerIds && this.releasedPlayerIds.length > 3) {
        throw new Error('A Franchise cannot legally release more than 3 players per Gameweek block.');
    }
});

module.exports = mongoose.model('WeeklyReleaseRequest', weeklyReleaseRequestSchema);
