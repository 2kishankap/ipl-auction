const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['NOT_STARTED', 'LIVE', 'COMPLETED'],
        default: 'NOT_STARTED'
    },
    purseLimit: {
        type: Number,
        default: 1000000000 // 100 Cr default
    },
    squadLimit: {
        type: Number,
        default: 18 // 18 default
    },
    phase: {
        type: String,
        enum: ['AUCTION', 'LEAGUE_MODE'],
        default: 'AUCTION'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Auction', auctionSchema);
