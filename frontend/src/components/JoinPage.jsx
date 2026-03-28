import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { api, joinTeam } from '../services/api';
import { Trophy, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const JoinPage = () => {
  const [ownerName, setOwnerName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { socket, isConnected, auctionId } = useSocket();

  const handleJoin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!ownerName || !teamName) {
      setError('Please fill in both fields');
      return;
    }

    setLoading(true);
    try {
      const data = await joinTeam(ownerName, teamName, auctionId);
      
      if (socket && isConnected) {
        socket.emit('joinAuction', { teamId: data.team._id, auctionId });
        localStorage.setItem(`auctionTeam_${auctionId}`, JSON.stringify(data.team));
        window.location.reload();
      } else {
        setError('Socket not connected. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to join auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-panel w-full max-w-md p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-blue to-brand-green"></div>
        <Link to="/" className="absolute top-4 left-4 p-2 bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
           <Home className="w-5 h-5" />
        </Link>
        
        <div className="flex flex-col items-center mb-8 mt-4">
          <div className="bg-slate-900/50 p-4 rounded-full mb-4 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Trophy className="w-12 h-12 text-brand-green" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide">IPL AUCTION ROOM</h1>
          <p className="text-slate-400 mt-2">Enter your franchise details to join</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          {error && (
            <div className="bg-brand-red/20 border border-brand-red/50 text-brand-red px-4 py-3 rounded text-sm text-center glow-red">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Owner Name</label>
            <input 
              type="text" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green transition-all"
              placeholder="e.g. Mukesh Ambani" 
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-300">Franchise Name</label>
            <input 
              type="text" 
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all"
              placeholder="e.g. Mumbai Indians" 
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-white tracking-wide uppercase transition-all duration-300 ${loading ? 'bg-slate-700 cursor-not-allowed' : 'bg-gradient-to-r from-brand-green to-emerald-400 hover:from-emerald-400 hover:to-brand-green glow-green hover:scale-[1.02]'}`}
          >
            {loading ? 'Entering Arena...' : 'Join Auction'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default JoinPage;
