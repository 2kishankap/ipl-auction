const mongoose = require('mongoose');

const leagueWeekSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true
    },
    weekNumber: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['UPCOMING', 'ACTIVE', 'COMPLETED'],
        default: 'UPCOMING'
    },
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Ensure a single auction only has one unique week block for any given number
leagueWeekSchema.index({ auctionId: 1, weekNumber: 1 }, { unique: true });

module.exports = mongoose.model('LeagueWeek', leagueWeekSchema);
