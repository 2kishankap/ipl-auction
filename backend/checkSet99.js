const mongoose = require('mongoose');
const Player = require('./models/Player');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    const uncat = await Player.find({ setNumber: 99 });
    console.log(uncat.map(p => p.name).join(', '));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
