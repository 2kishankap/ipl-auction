import React, { useRef, useEffect } from 'react';
import { IndianRupee, Users, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import BudgetBar from './BudgetBar';

const TeamCard = ({ team, isHighestBidder, onClick }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isHighestBidder && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [isHighestBidder]);
  const formatMoney = (amount) => {
    return (amount / 10000000).toFixed(2) + ' Cr';
  };

  return (
    <motion.div 
      ref={cardRef}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={isHighestBidder ? { 
        scale: [1.02, 1.05, 1.02],
        boxShadow: ["0 0 15px rgba(234, 179, 8, 0.4)", "0 0 35px rgba(234, 179, 8, 0.7)", "0 0 15px rgba(234, 179, 8, 0.4)"]
      } : { 
        scale: 1, 
        boxShadow: "0 0 0px rgba(0,0,0,0)",
        opacity: 1 
      }}
      transition={isHighestBidder ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
      whileHover={!isHighestBidder ? { y: -5, scale: 1.02 } : {}}
      onClick={onClick}
      className={`relative min-w-[280px] p-4 rounded-xl border transition-colors cursor-pointer duration-300 ${
        isHighestBidder 
          ? 'bg-gradient-to-br from-yellow-500/20 to-slate-800 border-yellow-500 z-10' 
          : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-500 z-0'
      }`}
    >
      {isHighestBidder && (
        <div className="absolute -top-3 -right-3 bg-yellow-500 text-slate-900 p-1.5 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.8)] z-20">
          <Crown className="w-5 h-5 drop-shadow-md" />
        </div>
      )}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-white truncate w-40" title={team.teamName}>
            {team.teamName}
          </h3>
          <p className="text-xs text-slate-400 truncate w-40">{team.ownerName}</p>
        </div>
        {isHighestBidder && (
          <span className="px-2 py-1 text-[10px] font-bold bg-yellow-500/20 text-yellow-500 rounded border border-yellow-500/50">
            HIGHEST BID
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex flex-col bg-slate-900/50 rounded p-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Purse</span>
          <div className="flex items-center text-brand-green font-bold">
            <IndianRupee className="w-3 h-3 mr-1" />
            {formatMoney(team.purseRemaining)}
          </div>
        </div>
        
        <div className="flex flex-col bg-slate-900/50 rounded p-2">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Squad</span>
          <div className="flex items-center text-white font-bold">
            <Users className="w-3 h-3 mr-1" />
            {team.playersBought?.length || 0} / 18
          </div>
        </div>
      </div>

      <div className="mt-2 text-[10px] text-slate-400 flex justify-between px-1">
        <span>OVERSEAS: <strong className={team.overseasCount >= 6 ? 'text-brand-red' : 'text-slate-200'}>{team.overseasCount} / 6</strong></span>
      </div>
      <BudgetBar purseRemaining={team.purseRemaining} />
    </motion.div>
  );
};

export default TeamCard;
