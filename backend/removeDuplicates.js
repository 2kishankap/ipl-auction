const mongoose = require('mongoose');
const Player = require('./models/Player');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    const players = await Player.find({});
    const nameMap = new Map();
    let duplicatesRemoved = 0;

    for (const player of players) {
      // Normalize name for comparison
      const nameKey = player.name.trim().toLowerCase();
      
      if (nameMap.has(nameKey)) {
        // Repeated name found! Delete the duplicate.
        await Player.findByIdAndDelete(player._id);
        duplicatesRemoved++;
        console.log(`Removed duplicate record for: ${player.name}`);
      } else {
        // First time seeing this name, save it
        nameMap.set(nameKey, player._id);
      }
    }

    console.log(`\n===================================`);
    console.log(`Total duplicate players removed: ${duplicatesRemoved}`);
    console.log(`===================================\n`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error removing duplicates:', err);
    process.exit(1);
  });
