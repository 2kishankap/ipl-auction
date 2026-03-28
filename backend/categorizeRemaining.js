const mongoose = require('mongoose');
const Player = require('./models/Player');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    // Find players missing setNumber OR having setNumber 99
    const remainingPlayers = await Player.find({ 
        $or: [
            { setNumber: { $exists: false } },
            { setNumber: 99 }
        ]
    });
    
    console.log('Found ' + remainingPlayers.length + ' uncategorized players. Assigning sets...');
    
    let updated = 0;
    for (const p of remainingPlayers) {
        let newSet = 99;
        let newName = 'Uncategorized';
        let newPrice = 2000000; // default 20 Lakhs
        
        // Let's deduce an appropriate set for them based on role and country
        if (p.isOverseas) {
            if (p.role === 'BAT') {
                newSet = 12; newName = 'Overseas Batting Core'; newPrice = 10000000;
            } else if (p.role === 'BOWL') {
                newSet = 13; newName = 'Overseas Pace & Spin'; newPrice = 10000000;
            } else if (p.role === 'ALL') {
                newSet = 14; newName = 'Overseas All-Rounders'; newPrice = 10000000;
            } else {
                newSet = 15; newName = 'Overseas Keepers'; newPrice = 7500000;
            }
        } else {
            // Indian players
            if (p.role === 'BAT') {
                newSet = 16; newName = 'Indian Top-Order Options'; newPrice = 5000000;
            } else if (p.role === 'BOWL') {
                newSet = 17; newName = 'Indian Pace Reserve'; newPrice = 5000000;
            } else if (p.role === 'ALL') {
                newSet = 18; newName = 'Indian Base All-Rounders'; newPrice = 5000000;
            } else {
                newSet = 19; newName = 'Indian Glovemen'; newPrice = 5000000;
            }
        }
        
        // Randomly demote some Indian players to Uncapped Base Price (20 Lakh) to simulate young talent
        if (!p.isOverseas && Math.random() > 0.5) {
            newSet = 20; 
            newName = 'Uncapped / Reserve Talent'; 
            newPrice = 2000000;
        }

        p.setNumber = newSet;
        p.setName = newName;
        p.basePrice = newPrice;
        
        await p.save();
        updated++;
    }
    
    console.log('Successfully categorized ' + updated + ' players.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
