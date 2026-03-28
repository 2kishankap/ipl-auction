const mongoose = require('mongoose');
const Player = require('./models/Player');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    const res = await Player.updateOne(
        { name: /Shubman Gill/i },
        { $set: { role: 'BAT' } }
    );
    console.log('Fixed Shubman Gill:', res.modifiedCount === 1 ? 'Success' : 'Not found/already BAT');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
