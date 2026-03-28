const mongoose = require('mongoose');

const weekMatchSchema = new mongoose.Schema({
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
    matchNumber: {
        type: Number,
        required: true
    },
    title: {
        type: String, // e.g., 'MI vs CSK'
        required: true
    },
    teamA: {
        type: String,
        required: true
    },
    teamB: {
        type: String,
        required: true
    },
    venue: {
        type: String
    },
    matchDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED'],
        default: 'SCHEDULED'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('WeekMatch', weekMatchSchema);
