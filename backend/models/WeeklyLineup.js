const mongoose = require('mongoose');

const weeklyLineupSchema = new mongoose.Schema({
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
    selectedPlayerIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    isLocked: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// A team can only have one lineup array per week.
weeklyLineupSchema.index({ weekId: 1, teamId: 1 }, { unique: true });

// Custom constraint ensuring a team cannot legally submit more than 11 players for a week.
weeklyLineupSchema.pre('validate', function() {
    if (this.selectedPlayerIds && this.selectedPlayerIds.length > 11) {
        throw new Error('A Fantasy Lineup cannot mathematically exceed 11 starting players.');
    }
});

module.exports = mongoose.model('WeeklyLineup', weeklyLineupSchema);
