const mongoose = require('mongoose');
const Team = require('./models/Team');
const Player = require('./models/Player');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Maintenance script to synchronize team squad statistics with actual player records.
 * Use this if bidding is being blocked due to incorrect "out-of-sync" counts.
 */
async function synchronizeAllTeams() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ipl-auction');
        console.log('Connected successfully.');

        const teams = await Team.find({}).populate('playersBought');
        console.log(`Found ${teams.length} teams to synchronize.`);

        for (const team of teams) {
            console.log(`Processing Team: ${team.teamName} (${team.ownerName})...`);

            // 1. Reset counts
            let overseasCount = 0;
            let wkBatCount = 0;
            let allBowlCount = 0;
            const iplTeamCounts = new Map();

            // 2. Recalculate from playersBought array
            for (const player of team.playersBought) {
                if (!player) continue;

                // Overseas
                if (player.isOverseas) overseasCount++;

                // Roles
                if (player.role === 'WK' || player.role === 'BAT') wkBatCount++;
                else if (player.role === 'ALL' || player.role === 'BOWL') allBowlCount++;

                // IPL Franchise Counts
                if (player.iplTeam) {
                    const currentCount = iplTeamCounts.get(player.iplTeam) || 0;
                    iplTeamCounts.set(player.iplTeam, currentCount + 1);
                }
            }

            // 3. Update Team object
            team.overseasCount = overseasCount;
            team.roleCounts = { wkBatCount, allBowlCount };
            team.iplTeamCounts = iplTeamCounts;

            // Mark as modified if using Map
            team.markModified('iplTeamCounts');
            team.markModified('roleCounts');

            await team.save();
            console.log(` - OK: ${team.playersBought.length} players mapped. (OS: ${overseasCount}, PBKS: ${iplTeamCounts.get('PBKS') || 0})`);
        }

        console.log('\nSUCCESS: All teams have been synchronized with their actual squad data.');
        process.exit(0);

    } catch (err) {
        console.error('CRITICAL ERROR during synchronization:', err);
        process.exit(1);
    }
}

synchronizeAllTeams();
