const express = require('express');
const router = express.Router();
const auctionInstanceController = require('../controllers/auctionInstanceController');

router.get('/', auctionInstanceController.listAuctions);
router.post('/create', auctionInstanceController.createAuction);
router.delete('/:auctionId', auctionInstanceController.deleteAuction);

module.exports = router;
