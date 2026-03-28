const mongoose = require('mongoose');
const Player = require('./models/Player');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ipl-auction').then(async () => {
    const allPlayers = await Player.countDocuments();
    const noAuctionIdExistsFalse = await Player.countDocuments({ auctionId: { $exists: false } });
    const noAuctionIdNull = await Player.countDocuments({ auctionId: null });
    
    console.log("Total Players:", allPlayers);
    console.log("Exists False:", noAuctionIdExistsFalse);
    console.log("Null:", noAuctionIdNull);
    
    const p = await Player.findOne();
    console.log("Sample:", p ? p.auctionId : 'No players');
    
    process.exit(0);
}).catch(console.error);
