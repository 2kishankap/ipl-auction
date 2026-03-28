const Player = require('../models/Player');

exports.getPlayers = async (req, res) => {
    try {
        const { auctionId } = req.query;
        if (!auctionId) return res.status(400).json({ message: 'auctionId query parameter is required' });
        
        const players = await Player.find({ auctionId }).sort({ setNumber: 1, basePrice: -1 });
        res.status(200).json(players);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.addPlayer = async (req, res) => {
    // Kept for manual admin injection
    try {
        const newPlayer = new Player(req.body);
        await newPlayer.save();
        res.status(201).json(newPlayer);
    } catch (error) {
        res.status(400).json({ message: 'Invalid data', error: error.message });
    }
};

exports.addMultiplePlayers = async (req, res) => {
    try {
        if (!Array.isArray(req.body)) return res.status(400).json({ message: 'Request body must be an array of players' });
        const result = await Player.insertMany(req.body);
        res.status(201).json({ message: `${result.length} players added successfully.`, result });
    } catch (err) {
        res.status(400).json({ message: 'Error adding players', error: err.message });
    }
};
