import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, UserCheck } from 'lucide-react';
import { api } from '../services/api';

const LeagueLineups = () => {
  const { auctionId, weekId } = useParams();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamRoster, setTeamRoster] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [auctionId]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams', { params: { auctionId } });
      setTeams(res.data);
      if (res.data.length > 0) {
        setSelectedTeamId(res.data[0]._id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeamId) {
      fetchLineupState();
    }
  }, [selectedTeamId, weekId]);

  const fetchLineupState = async () => {
    try {
      // 1. Fetch current locked lineup
      const lineupRes = await api.get(`/league/${auctionId}/weeks/${weekId}/lineup/${selectedTeamId}`);
      setSelectedPlayerIds(lineupRes.data.selectedPlayerIds.map(p => p._id || p));

      // 2. Fetch team's actual roster (players bought during auction)
      const rosterRes = await api.get(`/teams/${selectedTeamId}/players`);
      setTeamRoster(rosterRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlayer = (playerId) => {
    if (selectedPlayerIds.includes(playerId)) {
      setSelectedPlayerIds(prev => prev.filter(id => id !== playerId));
    } else {
      if (selectedPlayerIds.length >= 11) {
        return alert("Maximum 11 players allowed in the Weekly Lineup!");
      }
      setSelectedPlayerIds(prev => [...prev, playerId]);
    }
  };

  const saveLineup = async () => {
    if (selectedPlayerIds.length !== 11) {
       if (!window.confirm(`You only have ${selectedPlayerIds.length}/11 selected. Save incomplete lineup?`)) return;
    }
    try {
      await api.post(`/league/${auctionId}/weeks/${weekId}/lineup/${selectedTeamId}`, { selectedPlayerIds });
      alert('Lineup mathematically locked for the Gameweek!');
    } catch (err) {
      alert('Error saving lineup: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter p-8">
      <div className="max-w-4xl mx-auto">
        <Link to={`/auction/${auctionId}/league`} className="flex items-center text-slate-400 hover:text-white mb-8 font-bold tracking-widest text-xs uppercase transition">
           <ChevronLeft className="w-4 h-4 mr-1" /> Back to Schedule
        </Link>
        
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-600 flex items-center">
          <ShieldCheck className="w-10 h-10 mr-4 text-teal-500" /> Lineup Constructor
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-12">Submit exactly 11 active players for the Gameweek</p>

        <div className="flex space-x-4 mb-8">
           {teams.map(t => (
             <button 
               key={t._id} 
               onClick={() => setSelectedTeamId(t._id)}
               className={`px-4 py-2 flex-1 rounded-xl font-black uppercase text-xs tracking-widest border transition ${selectedTeamId === t._id ? 'bg-teal-500/20 text-teal-400 border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
             >
               {t.teamAbbreviation || t.teamName.substring(0,3)}
             </button>
           ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
           <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Active Roster</h3>
              <div className="text-sm font-bold tracking-widest uppercase">
                  <span className={selectedPlayerIds.length === 11 ? 'text-teal-400' : 'text-slate-400'}>{selectedPlayerIds.length}</span><span className="text-slate-600"> / 11 SELECTED</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 mb-8">
             {teamRoster.length === 0 ? <span className="col-span-2 text-center py-4 italic text-slate-600">Squad data syncing or no players assigned.</span> : 
               teamRoster.map(p => {
                 const isSelected = selectedPlayerIds.includes(p._id);
                 return (
                   <div 
                     key={p._id} 
                     onClick={() => togglePlayer(p._id)}
                     className={`cursor-pointer border p-4 rounded-xl flex justify-between items-center transition ${isSelected ? 'bg-teal-900/40 border-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.1)]' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                   >
                     <div>
                       <div className={`font-black uppercase tracking-wider ${isSelected ? 'text-teal-400' : 'text-slate-300'}`}>{p.name}</div>
                       <div className="text-[10px] uppercase font-bold text-slate-600 mt-1">{p.role} | {p.country}</div>
                     </div>
                     {isSelected && <UserCheck className="w-5 h-5 text-teal-500" />}
                   </div>
                 )
               })
             }
           </div>

           <button onClick={saveLineup} className="w-full py-4 rounded-xl font-black uppercase tracking-widest border transition bg-gradient-to-r from-teal-600/20 to-emerald-600/20 text-teal-400 border-teal-500/50 hover:bg-teal-600/40">
              Lock Final Lineup
           </button>
        </div>
      </div>
    </div>
  );
};

export default LeagueLineups;
