import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Server } from 'lucide-react';
import { api } from '../services/api';

const CreateAuctionModal = ({ onClose, onAuctionCreated }) => {
  const [name, setName] = useState('');
  const [purseLimit, setPurseLimit] = useState(100);
  const [squadLimit, setSquadLimit] = useState(18);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
         name,
         purseLimit: purseLimit * 10000000,
         squadLimit
      };
      await api.post('/auctions/create', payload);
      onAuctionCreated();
    } catch (err) {
      console.error(err);
      alert('Failed to spawn auction instance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 border border-slate-700/80 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-slate-800/50 p-6 flex justify-between items-center border-b border-slate-700">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center">
            <Server className="text-brand-green mr-3 w-6 h-6" /> Initialize Arena
          </h2>
          <button onClick={onClose} disabled={loading} className="text-slate-400 hover:text-brand-red p-1"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Auction Name</label>
            <input required type="text" value={name} onChange={e => setName(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-brand-green transition" placeholder="e.g. Mega Auction 2026" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Purse (Crores)</label>
              <input required type="number" min="10" value={purseLimit} onChange={e => setPurseLimit(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-brand-green font-black focus:outline-none focus:border-brand-green transition" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Max Squad Size</label>
              <input required type="number" min="11" max="25" value={squadLimit} onChange={e => setSquadLimit(e.target.value)} disabled={loading} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-brand-blue font-black focus:outline-none focus:border-brand-blue transition" />
            </div>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-4 rounded-xl font-black tracking-widest uppercase transition ${loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-brand-green text-slate-950 hover:bg-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] glow-green'}`}>
            {loading ? 'Cloning Database...' : 'Spawn Instance'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateAuctionModal;
