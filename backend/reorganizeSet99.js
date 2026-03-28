const mongoose = require('mongoose');
const Player = require('./models/Player');

const roleToSetMap = {
    'WK': { setNumber: 9, setName: 'ADDITIONAL WICKETKEEPERS' },
    'BAT': { setNumber: 10, setName: 'ADDITIONAL BATTERS' },
    'ALL': { setNumber: 11, setName: 'ADDITIONAL ALL-ROUNDERS' },
    'BOWL': { setNumber: 12, setName: 'ADDITIONAL BOWLERS' }
};

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find all players in Set 99
    const playersInSet99 = await Player.find({ setNumber: 99 });
    console.log(`Found ${playersInSet99.length} players in Set 99`);
    
    let updatedCount = 0;
    
    for (const player of playersInSet99) {
        const mapping = roleToSetMap[player.role];
        
        if (mapping) {
            player.setNumber = mapping.setNumber;
            player.setName = mapping.setName;
            await player.save();
            updatedCount++;
            console.log(`Moved ${player.name} to Set ${mapping.setNumber} (${mapping.setName})`);
        } else {
            console.log(`Warning: Player ${player.name} has unknown or missing role: ${player.role}`);
        }
    }
    
    console.log(`Successfully updated ${updatedCount} players.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
