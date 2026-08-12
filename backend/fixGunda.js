require('dotenv').config();
const mongoose = require('mongoose');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/auctionDB');
        console.log('Connected to DB');

        const Auction = require('./models/Auction');
        const Team = require('./models/Team');
        const Player = require('./models/Player');
        const MiniAuctionPoolEntry = require('./models/MiniAuctionPoolEntry');
        const RosterTransaction = require('./models/RosterTransaction');
        
        const auctionId = '69c72c65c6de65daf256b7dd';
        const weekId = '69c72ed749a4a5b5dcf0403a';
        
        const team = await Team.findOne({ auctionId: auctionId, teamName: { $regex: /gunda/i } });
        if (!team) throw new Error('Gunda Team not found');
        console.log('Found team:', team.teamName, 'Purse:', team.purseRemaining);

        const player = await Player.findOne({ auctionId: auctionId, name: { $regex: /venkatesh iyer/i } });
        if (!player) throw new Error('Venkatesh Iyer not found');
        console.log('Found player:', player.name, 'Sold Price:', player.soldPrice);

        // 1. Restore Purse and remove from playersBought
        team.purseRemaining += player.soldPrice || 24000000;
        team.playersBought = team.playersBought.filter(id => String(id) !== String(player._id));
        await team.save();
        console.log('Team purse updated to:', team.purseRemaining);

        // 2. Set Player as unsold
        player.status = 'unsold';
        player.soldPrice = 0;
        player.soldToTeamId = null;
        await player.save();
        console.log('Player marked as unsold');

        // 3. Ensure MiniAuctionPoolEntry exists and is correct
        let entry = await MiniAuctionPoolEntry.findOne({ auctionId, weekId, playerId: player._id });
        if (!entry) {
            entry = new MiniAuctionPoolEntry({ auctionId, weekId, playerId: player._id });
        }
        entry.source = 'RELEASED';
        entry.releasedByTeamId = team._id;
        entry.status = 'AVAILABLE';
        await entry.save();
        console.log('MiniAuction Pool Entry saved');

        // 4. Create RosterTransaction
        const txnExists = await RosterTransaction.findOne({ auctionId, weekId, playerId: player._id, type: 'RELEASE' });
        if (!txnExists) {
            await RosterTransaction.create({
                auctionId, weekId,
                teamId: team._id,
                type: 'RELEASE',
                playerId: player._id
            });
            console.log('RosterTransaction logged');
        } else {
            console.log('RosterTransaction already existed');
        }

        console.log('MANUAL FIX COMPLETE!');
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await mongoose.disconnect();
    }
}
run();
