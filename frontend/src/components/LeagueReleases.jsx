import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, UserMinus, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

const LeagueReleases = () => {
  const { auctionId, weekId } = useParams();
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamRoster, setTeamRoster] = useState([]);
  const [releasedIds, setReleasedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [auctionId]);

  const fetchTeams = async () => {
    try {
      const res = await api.get('/teams', { params: { auctionId } });
      setTeams(res.data);
      if (res.data.length > 0) setSelectedTeamId(res.data[0]._id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTeamId) fetchReleaseState();
  }, [selectedTeamId, weekId]);

  const fetchReleaseState = async () => {
    try {
      // 1. Fetch current releases
      const relRes = await api.get(`/league/${auctionId}/weeks/${weekId}/releases/${selectedTeamId}`);
      setReleasedIds(relRes.data.releasedPlayerIds.map(p => p._id || p));

      // 2. Fetch team's actual roster
      const rosterRes = await api.get(`/teams/${selectedTeamId}/players`);
      setTeamRoster(rosterRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleRelease = (playerId) => {
    if (releasedIds.includes(playerId)) {
      setReleasedIds(prev => prev.filter(id => id !== playerId));
    } else {
      if (releasedIds.length >= 3) {
        return alert("STRICT COMPLIANCE: A Franchise cannot legally tag more than 3 players for release per block.");
      }
      setReleasedIds(prev => [...prev, playerId]);
    }
  };

  const saveReleases = async () => {
    if (!window.confirm(`You are submitting exactly ${releasedIds.length} players for imminent eviction to the Action Pool. Are you absolutely certain? This triggers irreversible logic.`)) return;
    try {
      await api.post(`/league/${auctionId}/weeks/${weekId}/releases/${selectedTeamId}`, { releasedPlayerIds: releasedIds });
      alert('Release manifest successfully lodged in the Central Database.');
    } catch (err) {
      alert('Error saving manifest: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter p-8">
      <div className="max-w-4xl mx-auto">
        <Link to={`/auction/${auctionId}/league`} className="flex items-center text-slate-400 hover:text-white mb-8 font-bold tracking-widest text-xs uppercase transition">
           <ChevronLeft className="w-4 h-4 mr-1" /> Back to Schedule
        </Link>
        
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-rose-600 flex items-center">
          <UserMinus className="w-10 h-10 mr-4 text-red-500" /> Eviction Portal
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-12 flex items-center">
           <ShieldAlert className="w-4 h-4 mr-2 text-yellow-500" /> Mathematical limit: Max 3 Evictions Per Block
        </p>

        <div className="flex space-x-4 mb-8">
           {teams.map(t => (
             <button 
               key={t._id} 
               onClick={() => setSelectedTeamId(t._id)}
               className={`px-4 py-2 flex-1 rounded-xl font-black uppercase text-xs tracking-widest border transition ${selectedTeamId === t._id ? 'bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:text-slate-300'}`}
             >
               {t.teamAbbreviation || t.teamName.substring(0,3)}
             </button>
           ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
           <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">Active Roster Selection</h3>
              <div className="text-sm font-bold tracking-widest uppercase flex items-center">
                  <span className={releasedIds.length === 3 ? 'text-red-400' : 'text-slate-400'}>{releasedIds.length}</span><span className="text-slate-600 ml-2">/ 3 SELECTED</span>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-3 mb-8">
             {teamRoster.length === 0 ? <span className="col-span-2 text-center py-4 italic text-slate-600">Squad data syncing or no players assigned.</span> : 
               teamRoster.map(p => {
                 const isSelected = releasedIds.includes(p._id);
                 return (
                   <div 
                     key={p._id} 
                     onClick={() => toggleRelease(p._id)}
                     className={`cursor-pointer border p-4 rounded-xl flex justify-between items-center transition ${isSelected ? 'bg-red-900/40 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                   >
                     <div>
                       <div className={`font-black uppercase tracking-wider ${isSelected ? 'text-red-400 line-through' : 'text-slate-300'}`}>{p.name}</div>
                       <div className="text-[10px] uppercase font-bold text-slate-600 mt-1">{p.role} | {p.country}</div>
                     </div>
                     {isSelected && <UserMinus className="w-5 h-5 text-red-500" />}
                   </div>
                 )
               })
             }
           </div>

           <button onClick={saveReleases} className="w-full py-4 rounded-xl font-black uppercase tracking-widest border transition bg-gradient-to-r from-red-600/20 to-rose-600/20 text-red-400 border-red-500/50 hover:bg-red-600/40">
              Lock Release Manifest
           </button>
        </div>
      </div>
    </div>
  );
};

export default LeagueReleases;
