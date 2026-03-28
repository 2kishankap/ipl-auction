import React from 'react';
import { motion } from 'framer-motion';
import { Globe, UserRound, Zap } from 'lucide-react';

export const SpentProgressBar = ({ purseRemaining }) => {
  const formatMoney = (amount) => (amount / 10000000).toFixed(2);
  const totalPurse = 1000000000; // 100 Cr
  const spent = totalPurse - purseRemaining;
  const spentPercentage = (spent / totalPurse) * 100;

  let colorClass = 'bg-brand-green border-brand-green glow-green';
  if (spentPercentage >= 50 && spentPercentage <= 80) colorClass = 'bg-yellow-500 border-yellow-500 glow-yellow';
  if (spentPercentage > 80) colorClass = 'bg-brand-red border-brand-red glow-red';
  
  const isCritical = spentPercentage > 90;

  return (
    <div className="w-full flex justify-center mb-6">
      <div className="w-full max-w-lg bg-slate-900/50 p-4 border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-center items-center">
        <div className="w-full flex justify-between text-xs font-bold tracking-widest uppercase mb-3">
          <span className="text-slate-400">Total Spent</span>
          <span className="text-white">₹ {formatMoney(spent)} Cr</span>
        </div>
        <div className="w-full bg-slate-800 h-4 rounded-full overflow-hidden border border-slate-700/50 relative">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${spentPercentage}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full border-r-2 ${colorClass} ${isCritical ? 'animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]' : ''}`}
          />
        </div>
      </div>
    </div>
  );
};

export const RoleCountChips = ({ players }) => {
  const batWkCount = players.filter(p => p.role === 'BAT' || p.role === 'WK').length;
  const allBowlCount = players.filter(p => p.role === 'ALL' || p.role === 'BOWL').length;

  const getChipStyle = (count, limit) => {
    if (count >= limit) return 'bg-brand-red/20 text-brand-red border border-brand-red/50 shadow-[0_0_10px_rgba(239,68,68,0.3)]';
    if (count === limit - 1) return 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50';
    return 'bg-brand-green/20 text-brand-green border border-brand-green/50';
  };

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
       <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Role Targets:</span>
       <div 
         title={batWkCount >= 9 ? "Role Limit Reached" : ""}
         className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-colors ${getChipStyle(batWkCount, 9)}`}
       >
         <UserRound className="w-4 h-4" />
         <span>BAT/WK <span className="ml-1 text-white">{batWkCount}</span> / 9</span>
       </div>
       <div 
         title={allBowlCount >= 9 ? "Role Limit Reached" : ""}
         className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-wider transition-colors ${getChipStyle(allBowlCount, 9)}`}
       >
         <Zap className="w-4 h-4" />
         <span>ALL/BOWL <span className="ml-1 text-white">{allBowlCount}</span> / 9</span>
       </div>
    </div>
  );
};

export const OverseasTags = ({ players }) => {
  const overseasPlayers = players.filter(p => p.isOverseas);
  
  return (
    <div className="flex flex-col mb-8">
      <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-500 uppercase tracking-widest">
        <span className="flex items-center"><Globe className="w-4 h-4 mr-2" /> Overseas Players</span>
        {overseasPlayers.length >= 6 && <span className="text-brand-red animate-pulse glow-red">Overseas Limit Reached</span>}
      </div>
      <div className="flex flex-wrap gap-2">
        {overseasPlayers.map(p => (
           <div key={p._id} className="bg-slate-800 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide flex items-center hover:bg-slate-700 transition cursor-default shadow-md">
             {p.name}
           </div>
        ))}
        {overseasPlayers.length === 0 && (
           <span className="text-xs text-slate-600 italic">No overseas players bought yet.</span>
        )}
      </div>
    </div>
  );
};
