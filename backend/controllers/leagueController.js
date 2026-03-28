const LeagueWeek = require('../models/LeagueWeek');
const WeekMatch = require('../models/WeekMatch');
const WeeklyLineup = require('../models/WeeklyLineup');
const PlayerMatchPoints = require('../models/PlayerMatchPoints');
const WeeklyReleaseRequest = require('../models/WeeklyReleaseRequest');
const mongoose = require('mongoose');
const Team = require('../models/Team');
const Player = require('../models/Player');

exports.getWeeks = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const weeks = await LeagueWeek.find({ auctionId }).sort({ weekNumber: 1 });
        res.status(200).json(weeks);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching Schedule', error: error.message });
    }
};

exports.createWeek = async (req, res) => {
    try {
        const { auctionId } = req.params;
        const { name, startDate, endDate } = req.body;
        
        const existingWeeks = await LeagueWeek.countDocuments({ auctionId });
        const weekNumber = existingWeeks + 1;

        const week = new LeagueWeek({
            auctionId,
            weekNumber,
            name: name || `Gameweek ${weekNumber}`,
            startDate,
            endDate
        });

        await week.save();
        res.status(201).json(week);
    } catch (error) {
        res.status(500).json({ message: 'Error generating new Gameweek', error: error.message });
    }
};

exports.updateWeekStatus = async (req, res) => {
    try {
        const { weekId } = req.params;
        const { status } = req.body;
        
        const week = await LeagueWeek.findByIdAndUpdate(weekId, { status }, { new: true });
        if (!week) return res.status(404).json({ message: 'Gameweek not found' });
        
        res.status(200).json(week);
    } catch (error) {
        res.status(500).json({ message: 'Error locking Gameweek status', error: error.message });
    }
};

exports.getMatches = async (req, res) => {
    try {
        const { weekId } = req.params;
        const matches = await WeekMatch.find({ weekId }).sort({ matchNumber: 1 });
        res.status(200).json(matches);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching Active Matches', error: error.message });
    }
};

exports.createMatch = async (req, res) => {
    try {
        const { auctionId, weekId } = req.params;
        const { title, teamA, teamB, venue, matchDate } = req.body;
        
        const existingMatches = await WeekMatch.countDocuments({ weekId });

        const match = new WeekMatch({
            auctionId,
            weekId,
            matchNumber: existingMatches + 1,
            title,
            teamA,
            teamB,
            venue,
            matchDate
        });

        await match.save();
        res.status(201).json(match);
    } catch (error) {
        res.status(500).json({ message: 'Error defining new Match fixture', error: error.message });
    }
};

// --- PHASE 3: LINEUP EXPOSURE ---

exports.getLineup = async (req, res) => {
    try {
        const { weekId, teamId } = req.params;
        const lineup = await WeeklyLineup.findOne({ weekId, teamId }).populate('selectedPlayerIds');
        res.status(200).json(lineup || { selectedPlayerIds: [] });
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving Lineup block', error: err.message });
    }
};

exports.saveLineup = async (req, res) => {
    try {
        const { auctionId, weekId, teamId } = req.params;
        const { selectedPlayerIds } = req.body;
        
        if (!selectedPlayerIds || selectedPlayerIds.length > 11) {
            return res.status(400).json({ message: 'Illegal Lineup: Array size exceeds 11 mathematically.' });
        }

        const lineup = await WeeklyLineup.findOneAndUpdate(
            { weekId, teamId }, 
            { auctionId, weekId, teamId, selectedPlayerIds }, 
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json(lineup);
    } catch (err) {
        res.status(500).json({ message: 'Security Block: Error forcing new Lineup state', error: err.message });
    }
};

// --- PHASE 4: MATCH POINTS ENGINE ---

exports.getMatchPoints = async (req, res) => {
    try {
        const { matchId } = req.params;
        const points = await PlayerMatchPoints.find({ matchId });
        res.status(200).json(points);
    } catch (err) {
        res.status(500).json({ message: 'Server error retrieving numeric matrix', error: err.message });
    }
};

exports.saveMatchPoints = async (req, res) => {
    try {
        const { auctionId, weekId, matchId } = req.params;
        const { pointAllocations } = req.body; // Expects an array: [{ playerId, points }]
        
        if (!pointAllocations || !Array.isArray(pointAllocations)) {
            return res.status(400).json({ message: 'Invalid bulk configuration.' });
        }

        const operations = pointAllocations.map(p => ({
            updateOne: {
                filter: { matchId, playerId: p.playerId },
                update: { $set: { auctionId, weekId, points: p.points } },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await PlayerMatchPoints.bulkWrite(operations);
        }

        res.status(200).json({ message: 'Bulk database mutation successfully reconciled.' });
    } catch (err) {
        res.status(500).json({ message: 'Catastrophic error during bulk Write', error: err.message });
    }
};

// --- PHASE 5: LEADERBOARD MATRIX ---

exports.getLeaderboard = async (req, res) => {
    try {
        const { auctionId, weekId } = req.params;
        const mongoose = require('mongoose');
        const weekObjectId = new mongoose.Types.ObjectId(weekId);
        const auctionObjectId = new mongoose.Types.ObjectId(auctionId);

        const leaderboard = await WeeklyLineup.aggregate([
            { $match: { weekId: weekObjectId, auctionId: auctionObjectId } },
            { $lookup: { from: 'teams', localField: 'teamId', foreignField: '_id', as: 'teamInfo' } },
            { $unwind: '$teamInfo' },
            { $lookup: {
                from: 'playermatchpoints',
                let: { selectedPlayers: '$selectedPlayerIds' },
                pipeline: [
                    { $match: { 
                        $expr: { 
                            $and: [
                                { $eq: ['$weekId', weekObjectId] },
                                { $in: ['$playerId', '$$selectedPlayers'] }
                            ]
                        }
                    } }
                ],
                as: 'matchPoints'
            }},
            { $addFields: {
                totalPoints: { $sum: '$matchPoints.points' }
            }},
            { $project: {
                teamId: 1,
                teamName: '$teamInfo.teamName',
                teamAbbreviation: '$teamInfo.teamAbbreviation',
                totalPoints: 1
            }},
            { $sort: { totalPoints: -1 } }
        ]);

        res.status(200).json(leaderboard);
    } catch (err) {
        res.status(500).json({ message: 'Error compiling Leaderboard Aggregation Matrix', error: err.message });
    }
};

exports.getTeamPerformance = async (req, res) => {
    try {
        const { weekId, teamId } = req.params;

        const team = await Team.findById(teamId).populate('playersBought');
        if (!team) return res.status(404).json({ message: 'Franchise not found' });

        const lineup = await WeeklyLineup.findOne({ weekId, teamId });
        const startingPlayerIds = lineup ? lineup.selectedPlayerIds.map(id => id.toString()) : [];

        // Fetch all matches for this week to get titles
        const matches = await WeekMatch.find({ weekId });
        const matchMap = {};
        matches.forEach(m => {
            matchMap[m._id.toString()] = m.title;
        });

        const playerPoints = await PlayerMatchPoints.find({ 
            weekId: new mongoose.Types.ObjectId(weekId),
            playerId: { $in: team.playersBought.map(p => p._id) }
        });

        const performance = team.playersBought.map(player => {
            const playerMatchRecords = playerPoints.filter(p => p.playerId.toString() === player._id.toString());
            const totalPoints = playerMatchRecords.reduce((sum, record) => sum + record.points, 0);
            
            const matchHistory = playerMatchRecords.map(record => ({
                matchTitle: matchMap[record.matchId.toString()] || "Unknown Match",
                points: record.points
            }));

            return {
                _id: player._id,
                name: player.name,
                role: player.role,
                isOverseas: player.isOverseas,
                points: totalPoints,
                isStarting: startingPlayerIds.includes(player._id.toString()),
                matchHistory
            };
        });

        res.status(200).json({
            teamName: team.teamName,
            performance
        });
    } catch (err) {
        console.error('Error in getTeamPerformance:', err);
        res.status(500).json({ message: 'Error compiling Team Performance block', error: err.message });
    }
};

// --- PHASE 6: WEEKLY RELEASES ---

exports.getReleaseRequests = async (req, res) => {
    try {
        const { weekId, teamId } = req.params;
        const releaseReq = await WeeklyReleaseRequest.findOne({ weekId, teamId }).populate('releasedPlayerIds');
        res.status(200).json(releaseReq || { releasedPlayerIds: [] });
    } catch (err) {
        res.status(500).json({ message: 'Error retrieving active Drop block', error: err.message });
    }
};

exports.submitReleaseRequest = async (req, res) => {
    try {
        const { auctionId, weekId, teamId } = req.params;
        const { releasedPlayerIds } = req.body;
        
        if (!releasedPlayerIds || releasedPlayerIds.length > 2) {
            return res.status(400).json({ message: 'A Franchise is legally barred from releasing more than 2 players per Gameweek.' });
        }

        const releaseReq = await WeeklyReleaseRequest.findOneAndUpdate(
            { weekId, teamId }, 
            { auctionId, weekId, teamId, releasedPlayerIds }, 
            { new: true, upsert: true, runValidators: true }
        );
        res.status(200).json(releaseReq);
    } catch (err) {
        res.status(500).json({ message: 'System Error registering Player Draft Drops', error: err.message });
    }
};
