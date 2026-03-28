const mongoose = require('mongoose');
const Player = require('./models/Player');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    const unknownPlayers = await Player.find({ iplTeam: { $in: ['Unknown', '', null] } }).sort({ setNumber: 1 });
    console.log(`Found ${unknownPlayers.length} players with unknown IPL teams:`);
    const names = unknownPlayers.map(p => `- ${p.name} (Set ${p.setNumber})`);
    console.log(names.join('\n'));
    process.exit(0);
  })
  .catch(err => {
    console.error('Error fetching unknown players:', err);
    process.exit(1);
  });
