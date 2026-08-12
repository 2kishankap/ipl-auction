import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Home, Trophy, CalendarDays, Users, Plus, ChevronRight } from 'lucide-react';
import { api } from '../services/api';

const LeagueDashboard = () => {
  const { auctionId } = useParams();
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWeeks = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/league/${auctionId}/weeks`);
      setWeeks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeks();
  }, [auctionId]);

  const handleCreateWeek = async () => {
    try {
      await api.post(`/league/${auctionId}/weeks`, {});
      fetchWeeks();
    } catch (err) {
      alert('Error creating week: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-purple-500">
            Fantasy League Engine
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Official Schedule Hub</p>
        </div>
        <div className="flex space-x-4 mt-6 md:mt-0">
            <button 
              onClick={handleCreateWeek}
              className="flex items-center px-6 py-4 bg-purple-600/20 border border-purple-500 text-purple-400 rounded-2xl hover:bg-purple-600/40 transition-all font-black uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.3)]"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Gameweek
            </button>
            <Link 
              to="/" 
              className="flex items-center px-6 py-4 bg-slate-900 border border-slate-700 text-slate-300 rounded-2xl hover:bg-slate-800 transition-all font-black uppercase tracking-widest"
            >
              <Home className="w-5 h-5 mr-3" /> Return to Grid
            </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
           <div className="col-span-3 py-16 text-center text-slate-500 font-bold animate-pulse uppercase tracking-widest">Compiling Schedule Matrix...</div>
        ) : weeks.length === 0 ? (
           <div className="col-span-3 text-center py-20 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-blue rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
             <CalendarDays className="w-24 h-24 text-slate-600 mx-auto mb-8 animate-bounce opacity-80" />
             <h2 className="text-3xl font-black uppercase tracking-wider text-slate-400 mb-4">No Active Schedule</h2>
             <p className="text-slate-500 font-bold max-w-2xl mx-auto">
               Click "Add Gameweek" to permanently lock Week 1 into the League database.
             </p>
           </div>
        ) : (
           weeks.map(week => (
             <div key={week._id} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 hover:bg-slate-800/80 transition relative overflow-hidden group">
                 {week.status === 'ACTIVE' && <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 rounded-full blur-[80px] opacity-20 pointer-events-none"></div>}
                 
                 <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider">{week.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      week.status === 'ACTIVE' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 animate-pulse' :
                      week.status === 'COMPLETED' ? 'bg-slate-800 text-slate-500 border border-slate-700' :
                      'bg-brand-blue/20 text-brand-blue border border-brand-blue/30'
                    }`}>
                      {week.status}
                    </span>
                 </div>

                 <div className="flex flex-col space-y-4 mb-8">
                    <Link to={`/auction/${auctionId}/league/week/${week._id}/matches`} className="w-full text-left bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center hover:border-purple-500/50 transition overflow-hidden">
                       <div>
                         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Matchups</div>
                         <div className="text-sm font-black text-slate-300 mt-1">Configure Fixtures</div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-600" />
                    </Link>
                    <Link to={`/auction/${auctionId}/league/week/${week._id}/lineups`} className="w-full text-left bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center hover:border-teal-500/50 transition overflow-hidden">
                       <div>
                         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Lineups</div>
                         <div className="text-sm font-black text-slate-300 mt-1">Manage Squads</div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-600" />
                    </Link>
                    <Link to={`/auction/${auctionId}/league/week/${week._id}/leaderboard`} className="w-full text-left bg-slate-950/50 border border-slate-800 rounded-xl p-4 flex justify-between items-center hover:border-yellow-500/50 transition overflow-hidden">
                       <div>
                         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Leaderboard</div>
                         <div className="text-sm font-black text-slate-300 mt-1">View Standings</div>
                       </div>
                       <ChevronRight className="w-5 h-5 text-slate-600" />
                    </Link>
                 </div>
             </div>
           ))
        )}
      </div>
    </div>
  );
};

export default LeagueDashboard;
