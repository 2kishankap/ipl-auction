import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Zap, Save } from 'lucide-react';
import { api } from '../services/api';

const MatchPointsEntry = () => {
  const { auctionId, weekId, matchId } = useParams();
  const [matchDetails, setMatchDetails] = useState(null);
  const [teamAObj, setTeamAObj] = useState(null);
  const [teamBObj, setTeamBObj] = useState(null);
  const [lineupA, setLineupA] = useState([]);
  const [lineupB, setLineupB] = useState([]);
  const [pointsGrid, setPointsGrid] = useState({}); // { playerId: numericPointValue }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      // Fetch match
      const reqM = await api.get(`/league/${auctionId}/weeks/${weekId}/matches`);
      const targetMatch = reqM.data.find(m => m._id === matchId);
      setMatchDetails(targetMatch);

      if (!targetMatch) return;

      // Fetch all players for fallback
      const reqP = await api.get('/players', { params: { auctionId } });
      const auctionPlayers = reqP.data;

      // Fetch ALL teams to match abbreviations
      const reqT = await api.get('/teams', { params: { auctionId } });
      const tA = reqT.data.find(t => t.teamAbbreviation === targetMatch.teamA || (t.teamName && t.teamName.includes(targetMatch.teamA)));
      const tB = reqT.data.find(t => t.teamAbbreviation === targetMatch.teamB || (t.teamName && t.teamName.includes(targetMatch.teamB)));
      
      setTeamAObj(tA);
      setTeamBObj(tB);

      // Fetch lineups or use fallback
      if (tA) {
        try {
          const lA = await api.get(`/league/${auctionId}/weeks/${weekId}/lineup/${tA._id}`);
          if (lA.data && lA.data.selectedPlayerIds && lA.data.selectedPlayerIds.length > 0) {
            setLineupA(lA.data.selectedPlayerIds);
          } else {
            setLineupA(auctionPlayers.filter(p => p.iplTeam === targetMatch.teamA));
          }
        } catch {
          setLineupA(auctionPlayers.filter(p => p.iplTeam === targetMatch.teamA));
        }
      } else {
        setLineupA(auctionPlayers.filter(p => p.iplTeam === targetMatch.teamA));
      }

      if (tB) {
        try {
          const lB = await api.get(`/league/${auctionId}/weeks/${weekId}/lineup/${tB._id}`);
          if (lB.data && lB.data.selectedPlayerIds && lB.data.selectedPlayerIds.length > 0) {
            setLineupB(lB.data.selectedPlayerIds);
          } else {
            setLineupB(auctionPlayers.filter(p => p.iplTeam === targetMatch.teamB));
          }
        } catch {
          setLineupB(auctionPlayers.filter(p => p.iplTeam === targetMatch.teamB));
        }
      } else {
        setLineupB(auctionPlayers.filter(p => p.iplTeam === targetMatch.teamB));
      }

      // Fetch pre-existing points mapped to this match
      const ptsReq = await api.get(`/league/${auctionId}/weeks/${weekId}/matches/${matchId}/points`);
      const preMapped = {};
      ptsReq.data.forEach(p => {
          preMapped[p.playerId] = p.points;
      });
      setPointsGrid(preMapped);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePointChange = (playerId, val) => {
      setPointsGrid(prev => ({ ...prev, [playerId]: Number(val) }));
  };

  const handleBulkSave = async () => {
      const payload = Object.keys(pointsGrid).map(pId => ({
          playerId: pId,
          points: pointsGrid[pId]
      }));

      try {
          await api.post(`/league/${auctionId}/weeks/${weekId}/matches/${matchId}/points`, { pointAllocations: payload });
          alert('Bulk database mutation successfully reconciled. Points permanently cast!');
      } catch (err) {
          alert('System logic error submitting bulk payload: ' + (err.response?.data?.message || err.message));
      }
  };

  if (loading || !matchDetails) return <div className="min-h-screen bg-slate-950 p-20 text-slate-500 font-bold uppercase tracking-widest text-center animate-pulse">Initializing Points Grid...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter p-8">
      <div className="max-w-6xl mx-auto">
        <Link to={`/auction/${auctionId}/league/week/${weekId}/matches`} className="flex items-center text-slate-400 hover:text-white mb-8 font-bold tracking-widest text-xs uppercase transition">
           <ChevronLeft className="w-4 h-4 mr-1" /> Back to Fixtures
        </Link>

        <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600 flex items-center">
                <Zap className="w-10 h-10 mr-4 text-orange-500" /> Match Points Grid
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Inject Fantasy Point Algorithms into specific match players</p>
            </div>
            <button onClick={handleBulkSave} className="flex items-center px-6 py-4 bg-orange-600/20 text-orange-400 border border-orange-500/50 rounded-xl hover:bg-orange-600/40 font-black tracking-widest uppercase transition shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                <Save className="w-5 h-5 mr-3" /> Commit Data Payload
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team A Data Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
               <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-6 border-b border-slate-800 pb-4">{matchDetails.teamA} Lineup</h3>
               <div className="space-y-3">
                   {lineupA.length === 0 ? <p className="italic text-slate-600">No lineup configured for {matchDetails.teamA} in Gameweek.</p> :
                    lineupA.map(p => (
                       <div key={p._id} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition">
                          <div>
                            <div className="font-black text-slate-300 uppercase tracking-widest">{p.name}</div>
                            <div className="text-[10px] text-slate-600 uppercase font-bold">{p.role}</div>
                          </div>
                          <input 
                            type="number" 
                            className="bg-slate-900 w-24 border border-slate-700 rounded-lg p-2 text-center font-black text-orange-400 focus:outline-none focus:border-orange-500"
                            placeholder="0"
                            value={pointsGrid[p._id] || ''}
                            onChange={(e) => handlePointChange(p._id, e.target.value)}
                          />
                       </div>
                    ))
                   }
               </div>
            </div>

            {/* Team B Data Grid */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
               <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-6 border-b border-slate-800 pb-4">{matchDetails.teamB} Lineup</h3>
               <div className="space-y-3">
                   {lineupB.length === 0 ? <p className="italic text-slate-600">No lineup configured for {matchDetails.teamB} in Gameweek.</p> :
                    lineupB.map(p => (
                       <div key={p._id} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl hover:border-slate-700 transition">
                          <div>
                            <div className="font-black text-slate-300 uppercase tracking-widest">{p.name}</div>
                            <div className="text-[10px] text-slate-600 uppercase font-bold">{p.role}</div>
                          </div>
                          <input 
                            type="number" 
                            className="bg-slate-900 w-24 border border-slate-700 rounded-lg p-2 text-center font-black text-orange-400 focus:outline-none focus:border-orange-500"
                            placeholder="0"
                            value={pointsGrid[p._id] || ''}
                            onChange={(e) => handlePointChange(p._id, e.target.value)}
                          />
                       </div>
                    ))
                   }
               </div>
            </div>

        </div>

      </div>
    </div>
  );
};

export default MatchPointsEntry;
