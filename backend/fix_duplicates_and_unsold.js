const mongoose = require('mongoose');
const Player = require('./models/Player');
const Team = require('./models/Team');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ipl-auction';

async function cleanup() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const allPlayers = await Player.find({}).lean();
        console.log(`Analyzing ${allPlayers.length} players...`);

        // Group by Name + AuctionId
        // Key format: "name|auctionId" (auctionId can be null for master templates)
        const groups = {};
        allPlayers.forEach(p => {
            const key = `${p.name.trim().toLowerCase()}|${p.auctionId || 'master'}`;
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });

        const idsToDelete = [];
        const remapping = {}; // oldId -> survivingId

        for (const key in groups) {
            const group = groups[key];
            if (group.length > 1) {
                console.log(`Found ${group.length} duplicates for: ${group[0].name} (${group[0].auctionId})`);

                // Picking strategy:
                // 1. Sold version
                // 2. Already passed version
                // 3. First record
                group.sort((a, b) => {
                    if (a.status === 'sold' && b.status !== 'sold') return -1;
                    if (b.status === 'sold' && a.status !== 'sold') return 1;
                    if (a.isPassed && !b.isPassed) return -1;
                    if (b.isPassed && !a.isPassed) return 1;
                    return 0;
                });

                const winner = group[0];
                const losers = group.slice(1);

                losers.forEach(l => {
                    idsToDelete.push(l._id);
                    remapping[l._id.toString()] = winner._id.toString();
                    console.log(`  - Marking for deletion: ${l._id} (${l.status}, isPassed: ${l.isPassed})`);
                });
            }
        }

        if (idsToDelete.length > 0) {
            console.log(`\nDeleting ${idsToDelete.length} duplicate records...`);
            await Player.deleteMany({ _id: { $in: idsToDelete } });

            // Update Team references
            console.log('Updating Team playersBought references...');
            const teams = await Team.find({});
            for (const team of teams) {
                let changed = false;
                const newPlayersBought = team.playersBought.map(pId => {
                    const idStr = pId.toString();
                    if (remapping[idStr]) {
                        changed = true;
                        return new mongoose.Types.ObjectId(remapping[idStr]);
                    }
                    return pId;
                });

                if (changed) {
                    team.playersBought = [...new Set(newPlayersBought.map(id => id.toString()))].map(id => new mongoose.Types.ObjectId(id));
                    await team.save();
                    console.log(`  - Updated Team: ${team.teamName}`);
                }
            }
        } else {
            console.log('\nNo duplicates found to delete.');
        }

        // status correction: "unsold players make them unsold"
        // This likely means: all remaining pending players in the current auction should be marked as passed.
        // We will target all players that are status: 'unsold' and isPassed: false.
        
        console.log('\nCorrecting status: Marking UNSOLD (Pending) players as PASSED...');
        const result = await Player.updateMany(
            { 
                status: 'unsold', 
                isPassed: false, 
                auctionId: { $ne: null } // Only for specific auctions, not master templates
            }, 
            { $set: { isPassed: true } }
        );
        console.log(`  - Updated ${result.modifiedCount} players to isPassed: true`);

        console.log('\nCleanup Complete!');
        process.exit(0);
    } catch (err) {
        console.error('Cleanup Error:', err);
        process.exit(1);
    }
}

cleanup();
