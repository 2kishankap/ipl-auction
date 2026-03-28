const Team = require('../models/Team');

exports.getTeams = async (req, res) => {
    try {
        const { auctionId } = req.query;
        if (!auctionId) return res.status(400).json({ message: 'auctionId query parameter is required' });

        const teams = await Team.find({ auctionId }).populate('playersBought');
        res.status(200).json(teams);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addTeam = async (req, res) => {
    try {
        const { auctionId } = req.body;
        if (!auctionId) return res.status(400).json({ message: 'auctionId is required to spawn a team' });

        const newTeam = new Team(req.body);
        await newTeam.save();
        res.status(201).json(newTeam);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

exports.joinAuction = async (req, res) => {
    try {
        const { ownerName, teamName, auctionId, isAdmin } = req.body;
        if (!auctionId && !isAdmin) return res.status(400).json({ message: 'auctionId is required to join an auction' });

        if (isAdmin) {
             return res.status(200).json({ 
                 message: 'Admin joined', 
                 team: { _id: 'admin', teamName: 'Admin', ownerName: 'Admin', isAdmin: true, auctionId }
             });
        }

        if (!teamName || !ownerName) return res.status(400).json({ message: 'Missing fields' });

        let team = await Team.findOne({ teamName, auctionId });
        if (!team) {
            team = new Team({ ownerName, teamName, auctionId });
            await team.save();
        } else {
            // Update owner name if returning
            team.ownerName = ownerName;
            await team.save();
        }

        res.status(200).json({ message: 'Team joined successfully', team });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getTeamPlayers = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findById(teamId).populate('playersBought');
        if (!team) return res.status(404).json({ message: 'Team not found' });
        res.status(200).json(team.playersBought);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
