const mongoose = require('mongoose');
const Auction = require('./models/Auction');
const Team = require('./models/Team');
const Player = require('./models/Player');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ipl-auction';
const SOURCE_AUCTION_ID = '69c72c65c6de65daf256b7dd';
const NEW_AUCTION_NAME = 'Demo - Sandbox';

async function duplicateAuction() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Fetch Source Auction
        const sourceAuc = await Auction.findById(SOURCE_AUCTION_ID);
        if (!sourceAuc) throw new Error("Source auction not found");

        // 2. Create the New Auction Record
        const newAuc = new Auction({
            name: NEW_AUCTION_NAME,
            status: sourceAuc.status,
            purseLimit: sourceAuc.purseLimit,
            squadLimit: sourceAuc.squadLimit,
            phase: sourceAuc.phase
        });
        await newAuc.save();
        const NEW_AUCTION_ID = newAuc._id;
        console.log(`Created New Auction: ${NEW_AUCTION_NAME} (${NEW_AUCTION_ID})`);

        // 3. Duplicate Teams
        const sourceTeams = await Team.find({ auctionId: SOURCE_AUCTION_ID });
        console.log(`Duplicating ${sourceTeams.length} teams...`);
        const teamIdMap = {}; // oldId -> newId

        for (const st of sourceTeams) {
            const nt = new Team({
                ownerName: st.ownerName,
                auctionId: NEW_AUCTION_ID,
                teamName: `${st.teamName} (Sandbox)`,
                purseRemaining: st.purseRemaining,
                playersBought: [], // Will populate after player duplication
                overseasCount: st.overseasCount,
                roleCounts: st.roleCounts,
                iplTeamCounts: st.iplTeamCounts,
                isAdmin: st.isAdmin
            });
            await nt.save();
            teamIdMap[st._id.toString()] = nt._id.toString();
            console.log(`  - Duplicated Team: ${nt.teamName}`);
        }

        // 4. Duplicate Players
        const sourcePlayers = await Player.find({ auctionId: SOURCE_AUCTION_ID });
        console.log(`Duplicating ${sourcePlayers.length} players...`);
        const playerIdMap = {}; // oldId -> newId

        for (const sp of sourcePlayers) {
            const np = new Player({
                auctionId: NEW_AUCTION_ID,
                name: sp.name,
                role: sp.role,
                country: sp.country,
                isOverseas: sp.isOverseas,
                iplTeam: sp.iplTeam,
                basePrice: sp.basePrice,
                setNumber: sp.setNumber,
                setName: sp.setName,
                status: sp.status,
                soldPrice: sp.soldPrice,
                soldToTeamId: sp.soldToTeamId ? teamIdMap[sp.soldToTeamId.toString()] : null,
                isPassed: sp.isPassed
            });
            await np.save();
            playerIdMap[sp._id.toString()] = np._id.toString();
        }

        // 5. Update Team Rosters (pointing to new Player IDs)
        console.log('Finalizing Team Rosters (remapping player IDs)...');
        const newTeams = await Team.find({ auctionId: NEW_AUCTION_ID });
        for (const nt of newTeams) {
            // Find the original team to get its playersBought array
            const st = sourceTeams.find(t => t.teamName === nt.teamName.replace(' (Sandbox)', ''));
            if (st && st.playersBought.length > 0) {
                nt.playersBought = st.playersBought.map(oldId => playerIdMap[oldId.toString()]).filter(id => !!id);
                await nt.save();
                console.log(`  - Re-mapped Roster for Team: ${nt.teamName}`);
            }
        }

        // 6. Final Reconciliation (ensure all totals are aligned)
        console.log('Running final reconciliation on the new Sandbox auction...');
        for (const nt of newTeams) {
            const populatedTeam = await Team.findById(nt._id).populate('playersBought');
            let totalSpent = 0;
            let overseasCount = 0;
            let wkBatCount = 0;
            let allBowlCount = 0;
            const iplTeamCounts = new Map();

            for (const p of populatedTeam.playersBought) {
                totalSpent += (p.soldPrice || 0);
                if (p.isOverseas) overseasCount++;
                if (p.role === 'WK' || p.role === 'BAT') wkBatCount++;
                else if (p.role === 'ALL' || p.role === 'BOWL') allBowlCount++;
                if (p.iplTeam) {
                    const currentCount = iplTeamCounts.get(p.iplTeam) || 0;
                    iplTeamCounts.set(p.iplTeam, currentCount + 1);
                }
            }

            populatedTeam.purseRemaining = newAuc.purseLimit - totalSpent;
            populatedTeam.overseasCount = overseasCount;
            populatedTeam.roleCounts = { wkBatCount, allBowlCount };
            populatedTeam.iplTeamCounts = iplTeamCounts;
            await populatedTeam.save();
        }

        console.log('\nDUPLICATION COMPLETE!');
        console.log(`====================================`);
        console.log(`New Auction ID: ${NEW_AUCTION_ID}`);
        console.log(`New Auction Name: ${NEW_AUCTION_NAME}`);
        console.log(`====================================\n`);
        process.exit(0);
    } catch (err) {
        console.error('Duplication Error:', err);
        process.exit(1);
    }
}

duplicateAuction();
