import React, { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SquadWarningPanel from './SquadWarningPanel';
import { SpentProgressBar, RoleCountChips, OverseasTags } from './SquadAnalytics';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

const TeamDetailsModal = ({ team, onClose }) => {
  const { auctionState, auctionId } = useSocket();
  const [isDownloading, setIsDownloading] = useState(false);

  if (!team) return null;

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await api.get(`/auction/${auctionId}/export/team/${team._id}?t=${Date.now()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${team.teamName.replace(/\s+/g, '_')}_squad.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      
      // Toast notification
      alert('Squad CSV Downloaded!');
    } catch (err) {
      console.error(err);
      alert('Failed to download CSV');
    } finally {
      setIsDownloading(false);
    }
  };

  const isAuctionFinished = auctionState?.auctionStatus === 'COMPLETED';

  return (
    <AnimatePresence>
      <div className="absolute inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm">
        <motion.div 
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="bg-slate-900 border-l border-slate-700/80 w-full max-w-2xl h-full shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-slate-800/50 p-6 flex justify-between items-start border-b border-slate-700">
            <div>
              <div className="flex justify-between w-full pr-4 mb-2">
                <h2 className="text-3xl font-extrabold text-white tracking-wider flex items-center">
                  {team.teamName} <span className="ml-3 text-sm font-normal text-slate-400 tracking-normal badge bg-slate-700 px-2 py-1 rounded-full">{team.ownerName}</span>
                </h2>
              </div>
              <div className="flex space-x-6 mt-4 text-xs font-bold tracking-widest text-slate-400 bg-slate-950/50 inline-flex p-3 rounded-xl border border-slate-700/50">
                <div className="flex flex-col"><span className="text-[10px] text-slate-500">PURSE LEFT</span><span className="text-xl text-brand-green">{(team.purseRemaining / 10000000).toFixed(2)} Cr</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-500">SQUAD SIZE</span><span className="text-xl text-brand-blue">{team.playersBought.length} / 18</span></div>
                <div className="flex flex-col"><span className="text-[10px] text-slate-500">OVERSEAS</span><span className="text-xl text-yellow-500">{team.overseasCount} / 6</span></div>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-4">
              <button onClick={onClose} className="p-2 cursor-pointer bg-slate-800 hover:bg-brand-red/20 hover:text-brand-red text-slate-400 rounded-full transition-colors self-end">
                <X className="w-6 h-6" />
              </button>
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                  isDownloading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                    : 'bg-brand-green/20 text-brand-green hover:bg-brand-green/30 border border-brand-green/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                }`}
                title="Download Live Roster"
              >
                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span>{isDownloading ? 'EXPORTING...' : 'SQUAD CSV'}</span>
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto flex-1 scrollbar-thin">
            <SpentProgressBar purseRemaining={team.purseRemaining} />
            <RoleCountChips players={team.playersBought} />
            <OverseasTags players={team.playersBought} />
            
            <table className="w-full text-left text-sm mt-4 border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-700 text-slate-400 uppercase tracking-widest text-[10px] font-bold">
                  <th className="py-3 px-2">Player Name</th>
                  <th className="py-3 px-2">Role</th>
                  <th className="py-3 px-2">IPL Team</th>
                  <th className="py-3 px-2 text-right">Sold Price</th>
                </tr>
              </thead>
              <tbody>
                {team.playersBought.map((p, i) => (
                   <tr key={p._id} className="border-b border-slate-800/50 hover:bg-slate-800/50 transition-colors">
                     <td className="py-4 px-2 font-bold text-slate-200">
                       <span className="text-slate-600 font-mono text-xs mr-3">{i+1}.</span>
                       {p.name} {p.isOverseas && <span className="text-[9px] bg-orange-500/20 text-orange-400 px-1 py-0.5 rounded ml-2 align-middle border border-orange-500/30">OS</span>}
                     </td>
                     <td className="py-4 px-2 text-brand-blue font-bold text-xs">{p.role}</td>
                     <td className="py-4 px-2 text-slate-400 text-xs font-mono">{p.iplTeam}</td>
                     <td className="py-4 px-2 text-right text-brand-green font-black text-base">₹ {(p.soldPrice / 10000000).toFixed(2)} Cr</td>
                   </tr>
                ))}
                {team.playersBought.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-500 italic text-xs">No players drafted yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TeamDetailsModal;
