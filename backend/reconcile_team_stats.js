const mongoose = require('mongoose');
const Team = require('./models/Team');
const Player = require('./models/Player');
const Auction = require('./models/Auction');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ipl-auction';

async function reconcile() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const teams = await Team.find({}).populate('playersBought');
        console.log(`Reconciling stats for ${teams.length} teams...`);

        for (const team of teams) {
            console.log(`Processing Team: ${team.teamName} (${team.ownerName})`);
            
            // Get Auction for purse limits
            const auction = await Auction.findById(team.auctionId);
            const startingPurse = auction ? (auction.purseLimit || 1000000000) : 1000000000;

            let totalSpent = 0;
            let overseasCount = 0;
            let wkBatCount = 0;
            let allBowlCount = 0;
            const iplTeamCounts = new Map();

            for (const player of team.playersBought) {
                totalSpent += (player.soldPrice || 0);
                if (player.isOverseas) overseasCount++;
                
                if (player.role === 'WK' || player.role === 'BAT') {
                    wkBatCount++;
                } else if (player.role === 'ALL' || player.role === 'BOWL') {
                    allBowlCount++;
                }

                if (player.iplTeam) {
                    const currentCount = iplTeamCounts.get(player.iplTeam) || 0;
                    iplTeamCounts.set(player.iplTeam, currentCount + 1);
                }
            }

            // Update team fields
            team.purseRemaining = startingPurse - totalSpent;
            team.overseasCount = overseasCount;
            team.roleCounts = {
                wkBatCount,
                allBowlCount
            };
            team.iplTeamCounts = iplTeamCounts;

            await team.save();
            console.log(`  - Reconciled! Overseas: ${overseasCount}, Purse: ${team.purseRemaining / 10000000} Cr, Players: ${team.playersBought.length}`);
        }

        console.log('\nReconciliation Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Reconciliation Error:', err);
        process.exit(1);
    }
}

reconcile();
