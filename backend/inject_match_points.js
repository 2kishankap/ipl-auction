const mongoose = require('mongoose');
const Player = require('./models/Player');
const PlayerMatchPoints = require('./models/PlayerMatchPoints');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ipl-auction';
const AUCTION_ID = '69c737a0383f17d1f44671af';
const WEEK_ID = '69c7390d0e59c9ad01aae627';
const MATCH_ID = '69c739320e59c9ad01aae63a';

const pointsData = {
    "RCB": {
        "Virat Kohli": 75,
        "Phil Salt": 68,
        "Rajat Patidar": 54,
        "Devdutt Padikkal": 39,
        "Jitesh Sharma": 47,
        "Krunal Pandya": 52,
        "Tim David": 44,
        "Romario Shepherd": 36,
        "Josh Hazlewood": 58,
        "Bhuvneshwar Kumar": 49,
        "Suyash Sharma": 33
    },
    "SRH": {
        "Travis Head": 80,
        "Abhishek Sharma": 66,
        "Ishan Kishan": 61,
        "Heinrich Klaasen": 59,
        "Nitish Kumar Reddy": 51,
        "Liam Livingstone": 46,
        "Kamindu Mendis": 34,
        "Harshal Patel": 57,
        "Jaydev Unadkat": 29,
        "Zeeshan Ansari": 31,
        "Eshan Malinga": 27
    }
};

async function injectPoints() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const allPlayersInAuction = await Player.find({ auctionId: AUCTION_ID });
        console.log(`Found ${allPlayersInAuction.length} players in the specified auction.`);

        const playerIdsMap = {};
        allPlayersInAuction.forEach(p => {
            playerIdsMap[p.name.trim().toLowerCase()] = p._id;
        });

        const playerPointsToInsert = [];
        let missingPlayers = [];

        for (const teamName in pointsData) {
            for (const playerName in pointsData[teamName]) {
                const points = pointsData[teamName][playerName];
                const cleanName = playerName.trim().toLowerCase();
                const playerId = playerIdsMap[cleanName];

                if (playerId) {
                    playerPointsToInsert.push({
                        auctionId: AUCTION_ID,
                        weekId: WEEK_ID,
                        matchId: MATCH_ID,
                        playerId: playerId,
                        points: points
                    });
                } else {
                    missingPlayers.push(playerName);
                }
            }
        }

        if (missingPlayers.length > 0) {
            console.log(`Warning: The following players were not found in the auction: ${missingPlayers.join(', ')}`);
        }

        console.log(`Injecting points for ${playerPointsToInsert.length} players...`);

        for (const entry of playerPointsToInsert) {
             await PlayerMatchPoints.findOneAndUpdate(
                 { matchId: entry.matchId, playerId: entry.playerId },
                 entry,
                 { upsert: true, new: true }
             );
        }

        console.log('Points injection successfully completed!');
        process.exit(0);
    } catch (err) {
        console.error('Injection Error:', err);
        process.exit(1);
    }
}

injectPoints();
