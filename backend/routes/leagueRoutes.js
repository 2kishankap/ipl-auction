const express = require('express');
const router = express.Router();
const leagueController = require('../controllers/leagueController');

router.get('/:auctionId/weeks', leagueController.getWeeks);
router.post('/:auctionId/weeks', leagueController.createWeek);
router.patch('/:auctionId/weeks/:weekId/status', leagueController.updateWeekStatus);

router.get('/:auctionId/weeks/:weekId/matches', leagueController.getMatches);
router.post('/:auctionId/weeks/:weekId/matches', leagueController.createMatch);

// Phase 3 & 4 routes
router.get('/:auctionId/weeks/:weekId/lineup/:teamId', leagueController.getLineup);
router.post('/:auctionId/weeks/:weekId/lineup/:teamId', leagueController.saveLineup);

router.get('/:auctionId/weeks/:weekId/matches/:matchId/points', leagueController.getMatchPoints);
router.post('/:auctionId/weeks/:weekId/matches/:matchId/points', leagueController.saveMatchPoints);

// Phase 5 & 6 routes
router.get('/:auctionId/weeks/:weekId/leaderboard', leagueController.getLeaderboard);
router.get('/:auctionId/weeks/:weekId/performance/:teamId', leagueController.getTeamPerformance);

router.get('/:auctionId/weeks/:weekId/releases/:teamId', leagueController.getReleaseRequests);
router.post('/:auctionId/weeks/:weekId/releases/:teamId', leagueController.submitReleaseRequest);

module.exports = router;
