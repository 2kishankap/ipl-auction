import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Rocket, Zap, Clock, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import CreateAuctionModal from './CreateAuctionModal';

const AuctionListPage = () => {
  const [auctions, setAuctions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [auctionToDelete, setAuctionToDelete] = useState(null);

  const fetchAuctions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auctions');
      setAuctions(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pt-16">
      {/* Header */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-16">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-green">
            IPL Auctions Engine
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Select an active operating zone</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="mt-6 md:mt-0 flex items-center px-6 py-4 bg-brand-green/10 border border-brand-green text-brand-green rounded-2xl hover:bg-brand-green hover:text-slate-950 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] font-black uppercase tracking-widest glow-green"
        >
          <Plus className="w-5 h-5 mr-3" /> Create Auction
        </button>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-3 py-12 text-center text-slate-500 animate-pulse font-mono uppercase tracking-widest">Scanning Grid...</div>
        ) : auctions.length === 0 ? (
          <div className="col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center shadow-xl">
             <Rocket className="w-16 h-16 text-slate-600 mx-auto mb-4" />
             <h3 className="text-2xl font-black text-slate-400 tracking-wider">NO ACTIVE ZONES</h3>
             <p className="text-slate-600 mt-2">Initialize your first localized auction instance to begin drafting.</p>
          </div>
        ) : (
          auctions.map(auc => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-slate-900/80 border ${auc.status === 'LIVE' ? 'border-brand-green/50 shadow-[0_0_30px_rgba(16,185,129,0.1)]' : 'border-slate-800'} rounded-3xl p-8 hover:bg-slate-800 transition overflow-hidden relative group`} 
              key={auc._id}
            >
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  setAuctionToDelete(auc);
                }}
                className="absolute top-4 right-4 text-slate-600 hover:text-brand-red transition-colors z-10"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              {auc.status === 'LIVE' && <div className="absolute top-0 right-0 w-32 h-32 bg-brand-green rounded-full blur-[80px] opacity-20 pointer-events-none"></div>}
              
              <div className="flex justify-between items-start mb-6">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-wider w-full truncate pr-4">{auc.name}</h3>
                    <div className="flex items-center text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-2">
                      <Clock className="w-3 h-3 mr-1" /> {new Date(auc.createdAt).toLocaleDateString()}
                    </div>
                 </div>
                 {auc.status === 'LIVE' && <span className="bg-brand-green/20 text-brand-green border border-brand-green/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse whitespace-nowrap">LIVE</span>}
                 {auc.status === 'NOT_STARTED' && <span className="bg-slate-800 text-slate-400 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">PENDING</span>}
                 {auc.status === 'COMPLETED' && <span className="bg-brand-blue/20 text-brand-blue border border-brand-blue/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap">DONE</span>}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                 <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Base Purse</div>
                   <div className="text-lg font-black text-brand-green mt-1">₹ {(auc.purseLimit / 10000000).toFixed(0)} Cr</div>
                 </div>
                 <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                   <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Roster Max</div>
                   <div className="text-lg font-black text-brand-blue mt-1">{auc.squadLimit} Slots</div>
                 </div>
              </div>

              {auc.phase === 'LEAGUE_MODE' ? (
                <div className="flex gap-3">
                  <Link to={`/auction/${auc._id}?mode=view`} className="flex-1 block text-center py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 hover:border-slate-500">
                    View Auction
                  </Link>
                  <Link to={`/auction/${auc._id}/league`} className="flex-1 block text-center py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                    Enter League Zone
                  </Link>
                </div>
              ) : (
                <Link to={
                  auc.status === 'NOT_STARTED' ? `/auction/${auc._id}?mode=admin` : 
                  `/auction/${auc._id}`
                } className={`block w-full text-center py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition ${auc.status === 'LIVE' ? 'bg-brand-green text-slate-900 hover:bg-emerald-400 shadow-md' : 'bg-slate-800 text-white hover:bg-slate-700 border border-slate-700'}`}>
                  {auc.status === 'NOT_STARTED' ? 'Configure Launch' : 'Enter Auction Zone'}
                </Link>
              )}
            </motion.div>
          ))
        )}
      </div>

      {showModal && (
         <CreateAuctionModal 
            onClose={() => setShowModal(false)}
            onAuctionCreated={() => {
              setShowModal(false);
              fetchAuctions();
            }}
         />
      )}

      {auctionToDelete && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-brand-red/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-black text-brand-red uppercase mb-4 flex items-center"><Trash2 className="w-6 h-6 mr-2"/> Confirm Deletion</h2>
            <p className="text-slate-300 font-bold mb-2">Are you sure you want to completely wipe <span className="text-white">{auctionToDelete.name}</span>?</p>
            <p className="text-slate-500 text-sm mb-6">This will aggressively erase all mathematically mapped Teams and Players from the localized database. This transaction cannot be mathematically undone.</p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setAuctionToDelete(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded hover:bg-slate-700 font-bold uppercase tracking-widest text-xs"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  api.delete(`/auctions/${auctionToDelete._id}`)
                    .then(() => {
                      setAuctionToDelete(null);
                      fetchAuctions();
                    })
                    .catch(err => {
                       alert('Error deleting: ' + (err.response?.data?.message || err.message));
                       setAuctionToDelete(null);
                    });
                }}
                className="px-4 py-2 bg-brand-red text-white flex items-center rounded hover:bg-red-600 font-black uppercase tracking-widest text-xs shadow-[0_0_15px_rgba(239,68,68,0.3)] shadow-brand-red/40"
              >
                Permanently Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuctionListPage;
