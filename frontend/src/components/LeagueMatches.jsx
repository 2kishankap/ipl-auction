import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Plus, Swords } from 'lucide-react';
import { api } from '../services/api';

const LeagueMatches = () => {
  const { auctionId, weekId } = useParams();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [newMatch, setNewMatch] = useState({
    title: '', teamA: '', teamB: '', venue: ''
  });

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/league/${auctionId}/weeks/${weekId}/matches`);
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [weekId]);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/league/${auctionId}/weeks/${weekId}/matches`, newMatch);
      setNewMatch({ title: '', teamA: '', teamB: '', venue: '' });
      fetchMatches();
    } catch (err) {
      alert('Error creating match: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter p-8">
      <div className="max-w-4xl mx-auto">
        <Link to={`/auction/${auctionId}/league`} className="flex items-center text-slate-400 hover:text-white mb-8 font-bold tracking-widest text-xs uppercase transition">
           <ChevronLeft className="w-4 h-4 mr-1" /> Back to Schedule
        </Link>
        
        <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 flex items-center">
          <Swords className="w-10 h-10 mr-4 text-purple-500" /> Fixture Generator
        </h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mb-12">Configure Matches for the selected Gameweek</p>

        <div className="bg-slate-900 border border-slate-700/50 p-6 rounded-2xl mb-8 shadow-xl">
           <h3 className="text-lg font-black uppercase text-white mb-4 tracking-wider">Add New Matchup</h3>
           <form onSubmit={handleCreateMatch} className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Match Title (e.g. MI vs CSK)" required value={newMatch.title} onChange={e => setNewMatch({...newMatch, title: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none" />
              <input type="text" placeholder="Venue (Optional)" value={newMatch.venue} onChange={e => setNewMatch({...newMatch, venue: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none" />
              <input type="text" placeholder="Team A Abbreviation (e.g. MI)" required value={newMatch.teamA} onChange={e => setNewMatch({...newMatch, teamA: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none uppercase" />
              <input type="text" placeholder="Team B Abbreviation (e.g. CSK)" required value={newMatch.teamB} onChange={e => setNewMatch({...newMatch, teamB: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none uppercase" />
              <button type="submit" className="col-span-2 mt-4 bg-purple-600/20 text-purple-400 border border-purple-500/50 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-purple-600/40 transition">Compile Fixture</button>
           </form>
        </div>

        <div className="space-y-4">
          {loading ? <p className="text-center text-slate-500 animate-pulse uppercase tracking-widest font-bold">Scanning Fixtures...</p> : 
           matches.length === 0 ? <p className="text-center text-slate-600 font-bold italic py-8">No matchups scheduled yet.</p> :
           matches.map(m => (
             <div key={m._id} className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex justify-between items-center group hover:border-slate-700 transition">
                <div>
                   <h4 className="text-xl font-black text-white uppercase tracking-wider">{m.title}</h4>
                   <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mt-1">Match {m.matchNumber} {m.venue ? `| ${m.venue}` : ''}</p>
                   <Link to={`/auction/${auctionId}/league/week/${weekId}/matches/${m._id}/points`} className="mt-3 inline-block bg-orange-600/20 text-orange-400 border border-orange-500/50 rounded p-1 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-orange-600/40 transition">Inject Points</Link>
                </div>
                <div className="flex items-center space-x-6">
                    <span className="text-3xl font-black text-slate-700">{m.teamA}</span>
                    <Swords className="w-6 h-6 text-purple-500" />
                    <span className="text-3xl font-black text-slate-700">{m.teamB}</span>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

export default LeagueMatches;
