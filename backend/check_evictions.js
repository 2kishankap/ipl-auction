require('dotenv').config();
const mongoose = require('mongoose');
const WeeklyReleaseRequest = require('./models/WeeklyReleaseRequest');
const MiniAuctionPoolEntry = require('./models/MiniAuctionPoolEntry');

async function run() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auctionDB');
    
    const requests = await WeeklyReleaseRequest.find({}).populate('teamId releasedPlayerIds');
    console.log("=== RELEASE REQUESTS ===");
    requests.forEach(r => {
        console.log(`Team: ${r.teamId?.teamName}, Status: ${r.status}, Players: ${r.releasedPlayerIds.map(p => p.name).join(', ')}`);
    });
    
    console.log("\n=== POOL ENTRIES (RELEASED) ===");
    const pool = await MiniAuctionPoolEntry.find({ source: 'RELEASED' }).populate('playerId releasedByTeamId');
    pool.forEach(p => {
        console.log(`Pool Player: ${p.playerId?.name}, Released By: ${p.releasedByTeamId?.teamName}, Status: ${p.status}`);
    });
    
    mongoose.disconnect();
}
run();
