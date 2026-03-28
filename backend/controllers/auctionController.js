const { getNextPlayer, initQueue } = require('../services/auctionService');
const { getAuctionState, setAuctionState, updateAuctionField, DEFAULT_STATE } = require('../services/auctionStateService');
const Player = require('../models/Player');
const Team = require('../models/Team');
const { parse } = require('json2csv');

exports.startAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { setNumber, playerId } = req.body || {};
        let state = await getAuctionState(auctionId);
        
        if (state.auctionStatus === 'LIVE') {
            return res.status(400).json({ message: 'Auction is already LIVE' });
        }
        
        if (setNumber) {
            await initQueue(auctionId, setNumber);
            state = await getAuctionState(auctionId);
        }

        let player;
        if (playerId) {
            player = await Player.findOne({ _id: playerId, auctionId });
            if (!player || player.status !== 'unsold') {
                return res.status(400).json({ message: 'Player not found or already sold' });
            }
            state.playerQueue = state.playerQueue.filter(p => String(p._id) !== String(playerId));
            state.queueLength = state.playerQueue.length;
            state.upcomingPlayers = state.playerQueue.slice(0, 3);
            await setAuctionState(auctionId, state);
        } else if (state.currentPlayer && state.auctionStatus === 'WAITING' && !setNumber) {
            player = state.currentPlayer;
        } else {
            player = await getNextPlayer(auctionId);
            state = await getAuctionState(auctionId);
        }

        if (!player) {
            await updateAuctionField(auctionId, { auctionStatus: 'COMPLETED' });
            return res.status(400).json({ message: 'No unsold players left in the queue!' });
        }

        state.currentPlayer = player;
        state.currentBid = player.basePrice;
        state.highestBidderTeamId = null;
        state.highestBidderTeamName = null;
        state.auctionStatus = 'LIVE';
        state.timerEndTime = null;

        await setAuctionState(auctionId, state);

        const io = req.app.get('io');
        if (io) io.to(auctionId).emit('auctionUpdate', state);

        res.status(200).json({ message: 'Auction started', state });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.nextPlayer = async (req, res) => {
    try {
        const { auctionId } = req.params;
        let state = await getAuctionState(auctionId);
        
        if (state.currentPlayer) {
            const prevPlayer = await Player.findOne({ _id: state.currentPlayer._id, auctionId });
            if (prevPlayer && prevPlayer.status === 'unsold') {
                 prevPlayer.isPassed = true;
                 await prevPlayer.save();
            }
        }
        
        const player = await getNextPlayer(auctionId);
        state = await getAuctionState(auctionId);

        if (!player) {
            await updateAuctionField(auctionId, { auctionStatus: 'COMPLETED' });
            return res.status(400).json({ message: 'This Set is completely finished! Please select a new Set to start.' });
        }

        state.currentPlayer = player;
        state.currentBid = player.basePrice;
        state.highestBidderTeamId = null;
        state.highestBidderTeamName = null;
        state.auctionStatus = 'WAITING';
        state.timerEndTime = null;

        await setAuctionState(auctionId, state);

        const io = req.app.get('io');
        if (io) io.to(auctionId).emit('newPlayer', state);

        res.status(200).json({ message: 'Next player loaded', state });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.markUnsold = async (req, res) => {
    try {
        const { auctionId } = req.params;
        let state = await getAuctionState(auctionId);
        
        if (!state.currentPlayer || state.highestBidderTeamId) {
            return res.status(400).json({ message: 'Cannot mark unsold. Bids exist or no active player.' });
        }
        
        const player = await Player.findOne({ _id: state.currentPlayer._id, auctionId });
        if (player) {
            player.status = 'unsold';
            player.isPassed = true;
            await player.save();
        }
        
        state.auctionStatus = 'WAITING';
        state.timerEndTime = null;
        await setAuctionState(auctionId, state);
        
        const io = req.app.get('io');
        if (io) io.to(auctionId).emit('markUnsold', { player: state.currentPlayer });
        
        res.status(200).json({ message: 'Player marked as unsold', state });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getState = async (req, res) => {
    const { auctionId } = req.params;
    const state = await getAuctionState(auctionId);
    res.status(200).json(state);
};

exports.forceSold = async (req, res) => {
    try {
        const { auctionId } = req.params;
        let state = await getAuctionState(auctionId);
        if (state.auctionStatus !== 'LIVE' || !state.highestBidderTeamId) {
            return res.status(400).json({ message: 'Cannot mark sold. No active bids exist.' });
        }
        
        state.timerEndTime = Date.now() - 1000;
        await setAuctionState(auctionId, state);
        
        res.status(200).json({ message: 'Forced sold trigger activated', state });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.previewPlayer = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { playerId } = req.body;
        let state = await getAuctionState(auctionId);

        if (state.auctionStatus === 'LIVE') {
            return res.status(400).json({ message: 'Auction is currently LIVE' });
        }
        
        const player = await Player.findOne({ _id: playerId, auctionId }).populate('soldToTeamId');
        if (!player) return res.status(404).json({ message: 'Player not found' });
        
        state.currentPlayer = player;

        if (player.status === 'sold') {
            state.currentBid = player.soldPrice;
            state.highestBidderTeamId = player.soldToTeamId?._id || null;
            state.highestBidderTeamName = player.soldToTeamId?.teamName || null;
            state.auctionStatus = 'SOLD';
        } else {
            state.currentBid = player.basePrice;
            state.highestBidderTeamId = null;
            state.highestBidderTeamName = null;
            state.auctionStatus = 'WAITING';
        }
        
        state.timerEndTime = null;
        await setAuctionState(auctionId, state);

        const io = req.app.get('io');
        if (io) io.to(auctionId).emit('newPlayer', state);

        res.status(200).json({ message: 'Preview loaded', state });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.exportTeamSquad = async (req, res) => {
    try {
        const { auctionId, teamId } = req.params;
        const team = await Team.findOne({ _id: teamId, auctionId }).populate('playersBought');
        if (!team) return res.status(404).json({ message: 'Team not found in this auction' });
        
        const fields = ['Name', 'Role', 'Country', 'IPL Team', 'Base Price (Cr)', 'Sold Price (Cr)'];
        
        const data = team.playersBought.map(p => ({
            'Name': p.name,
            'Role': p.role,
            'Country': p.country,
            'IPL Team': p.iplTeam,
            'Base Price (Cr)': (p.basePrice / 10000000).toFixed(2),
            'Sold Price (Cr)': (p.soldPrice / 10000000).toFixed(2)
        }));

        let csv = '';
        if (data.length > 0) csv = parse(data, { fields });
        else csv = 'No players drafted yet.';

        const headerStr = `Team Name,${team.teamName}\nOwner Name,${team.ownerName}\nTotal Players,${team.playersBought.length}\nTotal Spent (Cr),${((1000000000 - team.purseRemaining)/10000000).toFixed(2)}\nPurse Left (Cr),${(team.purseRemaining/10000000).toFixed(2)}\n\n`;
        const finalCsv = headerStr + csv;

        res.header('Content-Type', 'text/csv');
        res.attachment(`${team.teamName.replace(/\s+/g, '_')}_squad.csv`);
        return res.send(finalCsv);

    } catch (err) {
        res.status(500).json({ message: 'Error generating CSV', error: err.message });
    }
};

exports.revertLastPlayer = async (req, res) => {
    try {
        const { auctionId } = req.params;
        let state = await getAuctionState(auctionId);
        
        if (state.auctionStatus === 'LIVE') {
            return res.status(400).json({ message: 'Cannot revert while a player is currently LIVE on the board. Please pass them first.' });
        }

        const lastPlayer = await Player.findOne({ 
            auctionId, 
            $or: [{ status: 'sold' }, { isPassed: true }]
        }).sort({ updatedAt: -1 });

        if (!lastPlayer) {
            return res.status(404).json({ message: 'No completed auction events found to revert.' });
        }

        if (lastPlayer.status === 'sold' && lastPlayer.soldToTeamId) {
            const team = await Team.findById(lastPlayer.soldToTeamId);
            if (team) {
                team.purseRemaining += lastPlayer.soldPrice;
                team.playersBought = team.playersBought.filter(id => String(id) !== String(lastPlayer._id));
                if (lastPlayer.isOverseas) team.overseasCount -= 1;
                
                if (lastPlayer.role === 'WK' || lastPlayer.role === 'BAT') team.roleCounts.wkBatCount -= 1;
                else if (lastPlayer.role === 'ALL' || lastPlayer.role === 'BOWL') team.roleCounts.allBowlCount -= 1;
                
                const currentIplCount = team.iplTeamCounts.get(lastPlayer.iplTeam) || 0;
                if (currentIplCount > 0) {
                    team.iplTeamCounts.set(lastPlayer.iplTeam, currentIplCount - 1);
                }
                
                await team.save();
            }
        }
        
        lastPlayer.status = 'unsold';
        lastPlayer.isPassed = false;
        lastPlayer.soldPrice = 0;
        lastPlayer.soldToTeamId = null;
        await lastPlayer.save();

        if (state.playerQueue) {
            state.playerQueue = state.playerQueue.filter(p => String(p._id) !== String(lastPlayer._id));
            state.playerQueue.unshift(lastPlayer);
            state.upcomingPlayers = state.playerQueue.slice(0, 3);
            state.queueLength = state.playerQueue.length;
        }

        if (state.currentPlayer && state.currentPlayer.status === 'unsold' && !state.currentPlayer.isPassed && String(state.currentPlayer._id) !== String(lastPlayer._id)) {
             // Put the current unwrapped player back into the queue
             if (state.playerQueue) {
                  state.playerQueue = state.playerQueue.filter(p => String(p._id) !== String(state.currentPlayer._id));
                  state.playerQueue.splice(1, 0, state.currentPlayer);
                  state.upcomingPlayers = state.playerQueue.slice(0, 3);
                  state.queueLength = state.playerQueue.length;
             }
        }

        state.currentPlayer = lastPlayer;
        state.currentBid = lastPlayer.basePrice;
        state.highestBidderTeamId = null;
        state.highestBidderTeamName = null;
        state.auctionStatus = 'WAITING';
        state.timerEndTime = null;

        await setAuctionState(auctionId, state);

        const io = req.app.get('io');
        if (io) {
             io.to(auctionId).emit('newPlayer', state);
             io.to(auctionId).emit('playerSold'); // trigger teams refetch
             io.to(auctionId).emit('playerReverted');
        }

        res.status(200).json({ message: 'Last player successfully reverted back to the active queue', state });

    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

exports.completeMainAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const AuctionInstance = require('../models/Auction');
        
        const auctionRec = await AuctionInstance.findById(auctionId);
        if (!auctionRec) return res.status(404).json({ message: 'Auction not found' });
        
        if (auctionRec.phase === 'LEAGUE_MODE') {
            return res.status(400).json({ message: 'Auction is already safely locked in Fantasy League Mode.' });
        }

        auctionRec.phase = 'LEAGUE_MODE';
        auctionRec.status = 'COMPLETED';
        await auctionRec.save();

        let state = await getAuctionState(auctionId);
        
        state.auctionStatus = 'COMPLETED';
        state.timerEndTime = null;
        state.currentPlayer = null;
        state.currentBid = 0;
        state.highestBidderTeamId = null;
        state.highestBidderTeamName = null;
        state.mode = 'MAIN'; // Preparing phase 7 logic hook
        
        await setAuctionState(auctionId, state);

        const io = req.app.get('io');
        if (io) io.to(auctionId).emit('auctionCompleted', { redirect: 'league' });

        res.status(200).json({ message: 'Auction Phase locked. Fantasy League engine engaged!', phase: auctionRec.phase });

    } catch (err) {
        res.status(500).json({ message: 'Server error compiling league bridge.', error: err.message });
    }
};
