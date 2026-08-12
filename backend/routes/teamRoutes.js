const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');

router.post('/join', teamController.joinAuction);
router.get('/', teamController.getTeams);
router.get('/:teamId/players', teamController.getTeamPlayers);
router.post('/:teamId/release/:playerId', teamController.releasePlayer);

module.exports = router;
