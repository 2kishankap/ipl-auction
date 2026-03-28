const mongoose = require('mongoose');
const Player = require('./models/Player');

const teamMapping = {
  "Rohit Sharma": "MI",
  "Shubman Gill": "GT",
  "Suryakumar Yadav": "MI",
  "Mohammed Shami": "GT",
  "Rashid Khan": "GT",
  "Hardik Pandya": "MI",
  "Ravindra Jadeja": "CSK",
  "David Warner": "DC",
  "Tilak Varma": "MI",
  "Sai Sudharsan": "GT",
  "Ruturaj Gaikwad": "CSK",
  "Yashasvi Jaiswal": "RR",
  "Heinrich Klaasen": "SRH",
  "Kuldeep Yadav": "DC",
  "Varun Chakravarthy": "KKR",
  "Axar Patel": "DC",
  "Jasprit Bumrah": "MI",
  "T Natarajan": "SRH",
  "Andre Russell": "KKR",
  "Sunil Narine": "KKR",
  "Sanju Samson": "RR",
  "Dhruv Jurel": "RR",
  "Kane Williamson": "GT"
};

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    let patchedCount = 0;
    for (const [name, team] of Object.entries(teamMapping)) {
      const result = await Player.updateOne(
        { name: name },
        { $set: { iplTeam: team } }
      );
      if (result.matchedCount > 0) {
        patchedCount++;
        console.log(`Successfully patched: ${name} -> ${team}`);
      }
    }
    
    console.log(`\n============================`);
    console.log(`Total Players Patched: ${patchedCount}`);
    console.log(`============================\n`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error patching teams:', err);
    process.exit(1);
  });
