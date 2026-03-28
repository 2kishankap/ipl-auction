const mongoose = require('mongoose');
const Player = require('./models/Player');
const Auction = require('./models/Auction');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ipl-auction').then(async () => {
    const auctions = await Auction.find();
    console.log(`Auctions: ${auctions.length}`);
    for (let a of auctions) {
        const pCount = await Player.countDocuments({ auctionId: a._id });
        console.log(`Auction ${a.name} (${a._id}) has ${pCount} players`);
        const p = await Player.findOne({ auctionId: a._id });
        if (p) {
           console.log("Sample Player for auction:", p.name, p.setNumber, p.setName);
        }
    }
    process.exit(0);
}).catch(console.error);
