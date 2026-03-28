const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auctionController');

router.post('/:auctionId/start', auctionController.startAuction);
router.post('/:auctionId/preview', auctionController.previewPlayer);
router.post('/:auctionId/next', auctionController.nextPlayer);
router.post('/:auctionId/unsold', auctionController.markUnsold);
router.post('/:auctionId/sold', auctionController.forceSold);
router.get('/:auctionId/state', auctionController.getState);
router.get('/:auctionId/export/team/:teamId', auctionController.exportTeamSquad);
router.post('/:auctionId/revert', auctionController.revertLastPlayer);
router.post('/:auctionId/complete', auctionController.completeMainAuction);

module.exports = router;
