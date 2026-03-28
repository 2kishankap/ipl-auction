const mongoose = require('mongoose');
const Player = require('./models/Player');
const Auction = require('./models/Auction');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ipl-auction').then(async () => {
    await Player.deleteMany({ auctionId: { $ne: null } });
    await Auction.deleteMany();
    console.log("Deleted all broken clones and auctions.");
    process.exit(0);
}).catch(console.error);
