const mongoose = require('mongoose');
const Player = require('./models/Player');

const acronymMap = {
  "Chennai Super Kings": "CSK",
  "Delhi Capitals": "DC",
  "Gujarat Titans": "GT",
  "Kolkata Knight Riders": "KKR",
  "Lucknow Super Giants": "LSG",
  "Mumbai Indians": "MI",
  "Punjab Kings": "PBKS",
  "Kings XI Punjab": "PBKS",
  "Rajasthan Royals": "RR",
  "Royal Challengers Bengaluru": "RCB",
  "Royal Challengers Bangalore": "RCB",
  "Sunrisers Hyderabad": "SRH"
};

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    let normalizationCount = 0;
    
    // First, fix Dhoni's TBD status explicitly
    const dhoniFix = await Player.updateOne({ name: /Dhoni/i, iplTeam: 'TBD' }, { $set: { iplTeam: 'CSK' }});
    if (dhoniFix.modifiedCount > 0) {
      console.log('Explicitly patched manually added player Dhoni to CSK');
      normalizationCount++;
    }

    // Now loop over every player and normalize their full team string into perfect Acronyms
    const allPlayers = await Player.find({});
    for (const player of allPlayers) {
        if (acronymMap[player.iplTeam]) {
            const acronymCode = acronymMap[player.iplTeam];
            await Player.updateOne({ _id: player._id }, { $set: { iplTeam: acronymCode } });
            normalizationCount++;
            console.log(`Normalized ${player.name}: ${player.iplTeam} -> ${acronymCode}`);
        }
    }

    console.log(`\n============================`);
    console.log(`Total Database Strings Normalized: ${normalizationCount}`);
    console.log(`============================\n`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error normalizing teams:', err);
    process.exit(1);
  });
