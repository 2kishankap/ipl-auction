const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    auctionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: true // All teams must belong to an auction
    },
    teamName: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    purseRemaining: {
        type: Number,
        default: 1000000000 // 100 Crores
    },
    playersBought: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player'
    }],
    overseasCount: {
        type: Number,
        default: 0
    },
    roleCounts: {
        wkBatCount: { type: Number, default: 0 },
        allBowlCount: { type: Number, default: 0 }
    },
    iplTeamCounts: {
        type: Map,
        of: Number,
        default: {}
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Team', teamSchema);
