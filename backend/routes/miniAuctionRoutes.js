const express = require('express');
const router = express.Router();
const miniAuctionController = require('../controllers/miniAuctionController');

// Seed pool from releases + unsold players
router.post('/:auctionId/weeks/:weekId/seed', miniAuctionController.seedPool);

// Get the current pool
router.get('/:auctionId/weeks/:weekId/pool', miniAuctionController.getPool);

// Start the mini-auction (loads pool into existing bidding engine)
router.post('/:auctionId/weeks/:weekId/start', miniAuctionController.startMiniAuction);

// Record a mini-auction sale
router.post('/:auctionId/weeks/:weekId/record-sale', miniAuctionController.recordMiniSale);

// Get transaction history
router.get('/:auctionId/weeks/:weekId/transactions', miniAuctionController.getTransactions);

module.exports = router;
