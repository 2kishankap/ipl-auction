const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: false // Master templates will have null auctionId
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        type: String,
        required: true,
        enum: ['WK', 'BAT', 'ALL', 'BOWL']
    },
    country: {
        type: String,
        required: true
    },
    isOverseas: {
        type: Boolean,
        required: true,
        default: false
    },
    iplTeam: {
        type: String,
        required: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    setNumber: {
        type: Number,
        default: 99
    },
    setName: {
        type: String,
        default: 'Uncategorized'
    },
    status: {
        type: String,
        enum: ['unsold', 'sold'],
        default: 'unsold'
    },
    soldPrice: {
        type: Number,
        default: null
    },
    soldToTeamId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    isPassed: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Player', playerSchema);
