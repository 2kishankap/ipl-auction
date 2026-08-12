const Team = require('../models/Team');
const Player = require('../models/Player');
const WeeklyLineup = require('../models/WeeklyLineup');
const WeeklyReleaseRequest = require('../models/WeeklyReleaseRequest');
const LeagueWeek = require('../models/LeagueWeek');

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

exports.releasePlayer = async (req, res) => {
    try {
        const { teamId, playerId } = req.params;
        console.log(`[DEBUG] Attempting to release player ${playerId} from team ${teamId}`);
        
        const team = await Team.findById(teamId);
        const player = await Player.findById(playerId);
        
        if (!team || !player) {
            console.log(`[DEBUG] Team or Player not found. Team: ${!!team}, Player: ${!!player}`);
            return res.status(404).json({ message: 'Team or Player not found' });
        }
        
        // Ensure player is actually in the team
        const playerIndex = team.playersBought.findIndex(id => String(id) === String(player._id));
        if (playerIndex === -1) {
            return res.status(400).json({ message: 'Player is not in this team' });
        }
        
        // Unlink and update team counters
        team.playersBought = team.playersBought.filter(id => String(id) !== String(player._id));
        team.purseRemaining += player.soldPrice || 0;
        
        if (player.isOverseas) {
            team.overseasCount = Math.max(0, team.overseasCount - 1);
        }
        
        if (player.role === 'WK' || player.role === 'BAT') {
            team.roleCounts.wkBatCount = Math.max(0, team.roleCounts.wkBatCount - 1);
        } else if (player.role === 'ALL' || player.role === 'BOWL') {
            team.roleCounts.allBowlCount = Math.max(0, team.roleCounts.allBowlCount - 1);
        }

        if (player.iplTeam) {
            const currentIplCount = team.iplTeamCounts.get(player.iplTeam) || 0;
            if (currentIplCount > 0) {
                team.iplTeamCounts.set(player.iplTeam, currentIplCount - 1);
            }
        }
        
        await team.save();
        
        // Reset player to 'unsold' state
        player.status = 'unsold';
        player.soldPrice = 0;
        player.soldToTeamId = null;
        await player.save();

        // --- League Sync Phase ---
        // 1. Remove the player from any ACTIVE or UPCOMING weekly lineups for this team
        try {
            const activeWeeks = await LeagueWeek.find({ 
                auctionId: team.auctionId, 
                status: { $in: ['UPCOMING', 'ACTIVE'] } 
            });
            const activeWeekIds = activeWeeks.map(w => w._id);

            if (activeWeekIds.length > 0) {
                // Bulk update all active/upcoming lineups for this team to remove the player
                await WeeklyLineup.updateMany(
                    { 
                        teamId: team._id, 
                        weekId: { $in: activeWeekIds } 
                    },
                    { 
                        $pull: { selectedPlayerIds: player._id } 
                    }
                );
            }

            // 2. Remove the player from any PENDING release requests (redundant now player is released)
            await WeeklyReleaseRequest.updateMany(
                {
                    teamId: team._id,
                    status: 'PENDING'
                },
                {
                    $pull: { releasedPlayerIds: player._id }
                }
            );
            console.log(`[DEBUG] Sync Complete: Player ${player.name} removed from League Engine active states.`);
        } catch (syncError) {
            console.error(`[DEBUG] League Sync Error: ${syncError.message}`);
            // We don't fail the entire release if sync fails, but we log the error
        }
        // --- End Sync Phase ---
        
        // Notify socket clients to trigger UI refresh
        const io = req.app.get('io');
        if (io && team.auctionId) {
            io.to(String(team.auctionId)).emit('playerSold'); // trigger teams refetch
        }
        
        res.status(200).json({ message: 'Player released and purse refunded successfully', team });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
