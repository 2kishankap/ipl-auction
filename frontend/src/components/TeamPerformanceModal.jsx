import React, { useState, useEffect } from 'react';
import { X, Trophy, UserRound, Zap, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const TeamPerformanceModal = ({ teamId, weekId, auctionId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (teamId && weekId) {
      fetchPerformance();
    }
  }, [teamId, weekId]);

  const fetchPerformance = async () => {
    try {
      setData(null);
      setLoading(true);
      const res = await api.get(`/league/${auctionId}/weeks/${weekId}/performance/${teamId}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert('Error fetching team performance breakdown');
    } finally {
      setLoading(false);
    }
  };

  if (!teamId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-slate-900 border-l border-slate-700/80 w-full max-w-2xl h-full shadow-[ -20px_0_50px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-800/50 p-6 flex justify-between items-start border-b border-slate-700">
            <div>
               <div className="text-[10px] text-yellow-500 font-black tracking-[0.2em] uppercase mb-1 flex items-center">
                 <Trophy className="w-3 h-3 mr-2" /> Weekly Performance Matrix
               </div>
               <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">
                 {data?.teamName || 'Loading...'}
               </h2>
            </div>
            <button onClick={onClose} className="p-2 cursor-pointer bg-slate-800 hover:bg-red-500/20 hover:text-red-500 text-slate-400 rounded-full transition-all">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-slate-500 font-bold uppercase tracking-widest gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
                Aggregating Player Algorithms...
              </div>
            ) : (
              <div className="space-y-8">
                {/* Summary Section */}
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                      <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Squad Influence</div>
                      <div className="text-2xl font-black text-white uppercase">{data.performance.length} Players</div>
                   </div>
                   <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl">
                      <div className="text-[10px] text-yellow-500 font-black uppercase tracking-widest mb-1">Weekly Yield</div>
                      <div className="text-2xl font-black text-yellow-400 uppercase">
                        {data.performance.reduce((acc, curr) => curr.isStarting ? acc + curr.points : acc, 0)} Pts
                      </div>
                   </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">
                    <span>Active Squad Performance</span>
                    <span>Points</span>
                  </div>

                  <div className="space-y-2">
                    {data.performance.sort((a, b) => b.isStarting - a.isStarting || b.points - a.points).map((p) => (
                      <div 
                        key={p._id} 
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                          p.isStarting 
                            ? 'bg-slate-800/50 border-slate-700/50 hover:border-yellow-500/30' 
                            : 'bg-slate-950/30 border-slate-900 opacity-60 grayscale hover:grayscale-0 transition-all'
                        }`}
                      >
                         <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black ${
                               p.isStarting ? 'bg-yellow-500 text-slate-900 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-slate-800 text-slate-500'
                            }`}>
                               {p.isStarting ? 'XI' : 'SUB'}
                            </div>
                            <div>
                               <div className="font-black text-slate-200 uppercase tracking-wide flex items-center">
                                 {p.name}
                                 {p.isOverseas && <Globe className="w-3 h-3 ml-2 text-brand-blue" />}
                               </div>
                               <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                 {p.role} 
                                 <span className="w-1 h-1 bg-slate-700 rounded-full" />
                                 {p.isStarting ? <span className="text-yellow-500/80">Counting to Score</span> : <span>Benched</span>}
                               </div>

                               {/* Match History Breakdown */}
                               {p.matchHistory && p.matchHistory.length > 0 && (
                                 <div className="mt-2 space-y-1">
                                   {p.matchHistory.map((history, hIdx) => (
                                     <div key={hIdx} className="flex items-center text-[9px] font-bold text-slate-400 gap-2 uppercase tracking-tighter">
                                        <span className="text-slate-600">●</span>
                                        <span>{history.matchTitle}:</span>
                                        <span className={history.points > 0 ? 'text-yellow-500/80' : 'text-slate-600'}>
                                          {history.points} Pts
                                        </span>
                                     </div>
                                   ))}
                                 </div>
                               )}
                            </div>
                         </div>
                         <div className="text-right">
                            <div className={`text-2xl font-black ${p.points > 0 ? 'text-white' : 'text-slate-700'}`}>
                               {p.points}
                            </div>
                            <div className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Gameweek Pts</div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 bg-slate-950/80 border-t border-slate-800 text-center">
             <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest italic">
               * Bench player algorithms are tracked but do not aggregate into the team composite score.
             </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TeamPerformanceModal;
