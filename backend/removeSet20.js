const mongoose = require('mongoose');
const Player = require('./models/Player');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    const playersInSet20 = await Player.find({ setNumber: 20 });
    console.log('Found ' + playersInSet20.length + ' players in Set 20. Reassigning...');
    
    let updated = 0;
    for (const p of playersInSet20) {
        if (p.role === 'BAT') {
            p.setNumber = 16;
            p.setName = 'Indian Top-Order Options';
            p.basePrice = 5000000;
        } else if (p.role === 'BOWL') {
            p.setNumber = 17;
            p.setName = 'Indian Pace Reserve';
            p.basePrice = 5000000;
        } else if (p.role === 'ALL') {
            p.setNumber = 18;
            p.setName = 'Indian Base All-Rounders';
            p.basePrice = 5000000;
        } else {
            p.setNumber = 19;
            p.setName = 'Indian Glovemen';
            p.basePrice = 5000000;
        }
        
        await p.save();
        updated++;
    }
    
    console.log('Successfully moved ' + updated + ' players to other sets.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
