const MiniAuctionPoolEntry = require('../models/MiniAuctionPoolEntry');
const WeeklyReleaseRequest = require('../models/WeeklyReleaseRequest');
const RosterTransaction = require('../models/RosterTransaction');
const Player = require('../models/Player');
const Team = require('../models/Team');
const { getAuctionState, setAuctionState } = require('../services/auctionStateService');

// PHASE 7.1: Seed the mini-auction pool from Released players + Main Auction Unsold players
exports.seedPool = async (req, res) => {
    try {
        const { auctionId, weekId } = req.params;
        let seeded = 0;

        // 1. Collect all PENDING release requests for this week
        const releases = await WeeklyReleaseRequest.find({ auctionId, weekId, status: 'PENDING' });
        
        for (const release of releases) {
            const playerIds = release.releasedPlayerIds || [];
            for (const playerId of playerIds) {
                try {
                    // Check if player is already in the pool
                    let existingEntry = await MiniAuctionPoolEntry.findOne({ auctionId, weekId, playerId });
                    
                    if (existingEntry) {
                        // If they were already processed as a RELEASE by this exact team, skip entirely.
                        if (existingEntry.source === 'RELEASED' && String(existingEntry.releasedByTeamId) === String(release.teamId)) {
                            continue;
                        }
                        
                        // Otherwise, they might be a phantom MAIN_UNSOLD entry that was bought later. We MUST overwrite them to RELEASED.
                        existingEntry.source = 'RELEASED';
                        existingEntry.releasedByTeamId = release.teamId;
                        existingEntry.status = 'AVAILABLE';
                        await existingEntry.save();
                    } else {
                        // Brand new eviction entry
                        await MiniAuctionPoolEntry.create({
                            auctionId, weekId, playerId,
                            source: 'RELEASED',
                            releasedByTeamId: release.teamId
                        });
                    }
                    
                    // Log the release transaction (this is safe because we skipped actual duplicates above)
                    await RosterTransaction.create({
                        auctionId, weekId,
                        teamId: release.teamId,
                        type: 'RELEASE',
                        playerId
                    });

                    // Remove player from team roster
                    const team = await Team.findById(release.teamId);
                    if (team) {
                        const player = await Player.findById(playerId);
                        team.playersBought = team.playersBought.filter(id => String(id) !== String(playerId));
                        if (player) {
                            team.purseRemaining += player.soldPrice || 0;
                            if (player.isOverseas) team.overseasCount = Math.max(0, team.overseasCount - 1);
                            
                            if (player.role === 'WK' || player.role === 'BAT') {
                                team.roleCounts.wkBatCount = Math.max(0, team.roleCounts.wkBatCount - 1);
                            } else if (player.role === 'ALL' || player.role === 'BOWL') {
                                team.roleCounts.allBowlCount = Math.max(0, team.roleCounts.allBowlCount - 1);
                            }

                            if (player.iplTeam) {
                                const currentIplCount = team.iplTeamCounts.get(player.iplTeam) || 0;
                                if (currentIplCount > 0) {
                                    team.iplTeamCounts.set(player.iplTeam, currentIplCount - 1);
                                }
                            }

                            player.status = 'unsold';
                            player.soldPrice = 0;
                            player.soldToTeamId = null;
                            await player.save();
                        }
                        await team.save();
                    }
                    seeded++;
                } catch (e) {
                    console.error('Error processing single release entry:', e);
                }
            }
            release.status = 'PROCESSED';
            await release.save();
        }

        // 2. Collect all unsold players from the main auction that haven't been pooled yet
        const unsoldPlayers = await Player.find({ auctionId, status: 'unsold' });
        for (const player of unsoldPlayers) {
            try {
                await MiniAuctionPoolEntry.create({
                    auctionId, weekId,
                    playerId: player._id,
                    source: 'MAIN_UNSOLD'
                });
                seeded++;
            } catch (e) {
                if (e.code !== 11000) console.error(e); // Ignore duplicates
            }
        }

        res.status(200).json({ message: `Mini-Auction Pool seeded with ${seeded} new entries.`, seeded });
    } catch (err) {
        res.status(500).json({ message: 'Error seeding mini-auction pool', error: err.message });
    }
};

// PHASE 7.2: Get the current pool
exports.getPool = async (req, res) => {
    try {
        const { auctionId, weekId } = req.params;
        const pool = await MiniAuctionPoolEntry.find({ auctionId, weekId })
            .populate('playerId')
            .populate('releasedByTeamId')
            .populate('soldToTeamId');
        res.status(200).json(pool);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching pool', error: err.message });
    }
};

// PHASE 7.3: Start a mini-auction — load pool players into the existing auction engine queue
exports.startMiniAuction = async (req, res) => {
    try {
        const { auctionId, weekId } = req.params;

        const availablePool = await MiniAuctionPoolEntry.find({
            auctionId, weekId, status: 'AVAILABLE'
        }).populate('playerId');

        if (availablePool.length === 0) {
            return res.status(400).json({ message: 'No available players in the mini-auction pool.' });
        }

        // Prepare a shuffled queue from pool entries
        let players = availablePool.map(entry => entry.playerId).filter(Boolean);
        
        // Fisher-Yates shuffle
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }

        // Reset all pool players to 'unsold' + isPassed = false so they're eligible
        for (const player of players) {
            player.status = 'unsold';
            player.isPassed = false;
            await player.save();
        }

        // Load them into the existing auction state engine
        let state = await getAuctionState(auctionId);
        state.playerQueue = players;
        state.upcomingPlayers = players.slice(0, 3);
        state.queueLength = players.length;
        state.auctionStatus = 'WAITING';
        state.currentPlayer = null;
        state.currentBid = 0;
        state.highestBidderTeamId = null;
        state.highestBidderTeamName = null;
        state.timerEndTime = null;
        state.mode = 'MINI';
        state.miniAuctionWeekId = weekId;
        await setAuctionState(auctionId, state);

        const io = req.app.get('io');
        if (io) io.to(auctionId).emit('auctionUpdate', state);

        res.status(200).json({ 
            message: `Mini-Auction initialized with ${players.length} players.`,
            queueLength: players.length 
        });
    } catch (err) {
        res.status(500).json({ message: 'Error starting mini-auction', error: err.message });
    }
};

// PHASE 7.4: After the existing timer/socket sells a player, record the mini-auction sale
exports.recordMiniSale = async (req, res) => {
    try {
        const { auctionId, weekId } = req.params;
        const { playerId, teamId, soldPrice } = req.body;

        // Update pool entry
        await MiniAuctionPoolEntry.findOneAndUpdate(
            { auctionId, weekId, playerId },
            { status: 'SOLD', soldToTeamId: teamId, soldPrice }
        );

        // Log the roster transaction
        await RosterTransaction.create({
            auctionId, weekId,
            teamId,
            type: 'MINI_AUCTION_BUY',
            playerId,
            price: soldPrice
        });

        res.status(200).json({ message: 'Mini-auction sale recorded.' });
    } catch (err) {
        res.status(500).json({ message: 'Error recording mini-auction sale', error: err.message });
    }
};

// PHASE 7.5: Get transaction history for a week
exports.getTransactions = async (req, res) => {
    try {
        const { auctionId, weekId } = req.params;
        const transactions = await RosterTransaction.find({ auctionId, weekId })
            .populate('playerId')
            .populate('teamId')
            .sort({ createdAt: -1 });
        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching transactions', error: err.message });
    }
};
