import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const UpcomingPlayers = ({ players = [] }) => {
  return (
    <div className="mt-4 bg-slate-900/40 border border-slate-700/50 rounded-xl p-3">
      <h3 className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-3 border-b border-slate-700/50 pb-2">
        Upcoming Players
      </h3>
      
      <div className="flex flex-col space-y-2 relative">
        <AnimatePresence mode="popLayout">
          {players.length > 0 ? (
            players.map((p, index) => {
              const isFirst = index === 0;
              return (
                <motion.div
                  layout
                  key={p._id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: isFirst ? 1 : 0.6, y: 0, scale: isFirst ? 1 : 0.95 }}
                  exit={{ opacity: 0, x: -50, filter: "blur(10px)" }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className={`flex items-center justify-between p-2 rounded border bg-slate-800/80 ${
                    isFirst 
                      ? 'border-brand-blue/50 shadow-[0_0_15px_rgba(56,189,248,0.15)] z-10' 
                      : 'border-slate-700/50 pointer-events-none'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white truncate max-w-[120px]">{p.name}</span>
                    <span className="text-[9px] text-slate-400 uppercase">{p.iplTeam}</span>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                      p.role === 'BAT' ? 'bg-blue-500/20 text-blue-400' :
                      p.role === 'BOWL' ? 'bg-red-500/20 text-red-400' :
                      p.role === 'ALL' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-orange-500/20 text-orange-400'
                    }`}>
                      {p.role}
                    </span>
                    <span className="text-[10px] text-brand-green font-bold mt-1">
                      {p.basePrice >= 10000000 ? `${p.basePrice / 10000000} Cr` : `${p.basePrice / 100000} L`}
                    </span>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs italic text-slate-500 text-center py-4"
            >
              No upcoming players
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UpcomingPlayers;
