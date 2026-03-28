const express = require('express');
const router = express.Router();
const playerController = require('../controllers/playerController');

router.get('/', playerController.getPlayers);
router.post('/add', playerController.addPlayer);
router.post('/add-multiple', playerController.addMultiplePlayers);

module.exports = router;
