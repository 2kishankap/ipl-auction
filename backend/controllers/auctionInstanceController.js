const Auction = require('../models/Auction');
const Player = require('../models/Player');
const Team = require('../models/Team');
const { redis } = require('../services/redisService');
const { getStateKey } = require('../services/auctionStateService');

exports.listAuctions = async (req, res) => {
    try {
        const auctions = await Auction.find().sort({ createdAt: -1 });
        res.status(200).json(auctions);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.createAuction = async (req, res) => {
    try {
        const { name, purseLimit = 1000000000, squadLimit = 18 } = req.body;
        
        if (!name) return res.status(400).json({ message: 'Auction name is required' });

        const newAuction = new Auction({
            name,
            purseLimit,
            squadLimit
        });
        await newAuction.save();
        
        const masterPlayers = await Player.find({ auctionId: { $ne: null, $exists: false } });
        
        // Fallback: if we just manually imported using a script or the previous DB snapshot, the auctionId field doesn't exist yet!
        // So finding {$exists: false} or auctionId: null fetches the original "global" players.
        const mastersToClone = masterPlayers.length > 0 ? masterPlayers : await Player.find({ auctionId: null });

        if (mastersToClone.length > 0) {
            const clonedPlayers = mastersToClone.map(p => {
                const doc = p.toObject();
                delete doc._id;
                delete doc.__v;
                return {
                    ...doc,
                    auctionId: newAuction._id,
                    status: 'unsold',
                    isPassed: false,
                    soldPrice: null,
                    soldToTeamId: null
                };
            });
            await Player.insertMany(clonedPlayers);
        }
        
        res.status(201).json({ message: 'Auction created', auction: newAuction });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.deleteAuction = async (req, res) => {
    try {
        const { auctionId } = req.params;
        
        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ message: 'Auction not found' });

        // Deep wipe cascade
        await Player.deleteMany({ auctionId });
        await Team.deleteMany({ auctionId });
        await Auction.findByIdAndDelete(auctionId);

        if (redis.status === 'ready') await redis.del(getStateKey(auctionId));

        res.status(200).json({ message: 'Auction securely wiped from the engine' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
