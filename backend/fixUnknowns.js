const mongoose = require('mongoose');
const Player = require('./models/Player');

mongoose.connect('mongodb://localhost:27017/ipl-auction')
  .then(async () => {
    console.log('Connected to DB. Running unknown patches...');
    
    // Updates
    const updates = [
        { name: 'Prithvi Shaw', team: 'DC' },
        { name: 'Arjun Tendulkar', team: 'LSG' },
        { name: 'Ajay Mandal', team: 'DC' },
        { name: 'Onkar Tarmale', team: 'SRH' },
        { name: 'Mayank Yadav', team: 'LSG' },
        { name: 'Mohammed Izhar', team: 'MI' }
    ];

    for (const u of updates) {
        const res = await Player.updateMany(
            { name: u.name, iplTeam: 'Unknown' },
            { $set: { iplTeam: u.team } }
        );
        console.log(`Updated ${res.modifiedCount} records for ${u.name} -> ${u.team}`);
    }

    // Deletes
    // For Varun Chakravarthy, we only delete the 'Unknown' duplicate so we don't wipe his actual legitimate KKR instance.
    const delVarun = await Player.deleteMany({ name: 'Varun Chakravarthy', iplTeam: 'Unknown' });
    console.log(`Deleted ${delVarun.deletedCount} duplicate Unknown records for Varun Chakravarthy`);

    const deletes = [
        'Maheesh Theekshana',
        'Adam Zampa',
        'Andre Russell'
    ];

    for (const d of deletes) {
        const res = await Player.deleteMany({ name: d });
        console.log(`Deleted ${res.deletedCount} records for ${d} (Not playing this IPL)`);
    }

    console.log('Database patched successfully.');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
