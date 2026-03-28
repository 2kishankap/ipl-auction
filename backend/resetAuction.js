const mongoose = require('mongoose');
const Player = require('./models/Player');
const Team = require('./models/Team');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    // 1. Delete all teams
    await Team.deleteMany({});
    console.log('Wiped all previous teams.');

    // 2. Reset all players
    const res = await Player.updateMany(
        {}, 
        { 
            $set: { 
                status: 'unsold', 
                soldPrice: null, 
                soldToTeamId: null, 
                isPassed: false 
            } 
        }
    );
    console.log(`Successfully reset ${res.modifiedCount} players to their default unsold state.`);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
