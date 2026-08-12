import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Gavel, Rocket, RefreshCw, ArrowRightLeft, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../services/api';

const MiniAuction = () => {
  const { auctionId, weekId } = useParams();
  const navigate = useNavigate();
  const [pool, setPool] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [tab, setTab] = useState('pool'); // 'pool' | 'transactions'

  useEffect(() => {
    fetchData();
  }, [weekId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [poolRes, txnRes] = await Promise.all([
        api.get(`/mini-auction/${auctionId}/weeks/${weekId}/pool`),
        api.get(`/mini-auction/${auctionId}/weeks/${weekId}/transactions`)
      ]);
      setPool(poolRes.data);
      setTransactions(txnRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedPool = async () => {
    setSeeding(true);
    try {
      const res = await api.post(`/mini-auction/${auctionId}/weeks/${weekId}/seed`);
      alert(res.data.message);
      fetchData();
    } catch (err) {
      alert('Error seeding pool: ' + (err.response?.data?.message || err.message));
    } finally {
      setSeeding(false);
    }
  };

  const handleStartMiniAuction = async () => {
    if (!window.confirm('This will load all AVAILABLE players into the live auction room. The existing Socket.io bidding engine will take over. Proceed?')) return;
    try {
      const res = await api.post(`/mini-auction/${auctionId}/weeks/${weekId}/start`);
      alert(res.data.message);
      // Navigate to the main auction room where the live bidding happens with admin mode
      navigate(`/auction/${auctionId}?mode=admin`);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const exportData = pool.map(entry => ({
         'Player Name': entry.playerId?.name || 'Unknown',
         'Role': entry.playerId?.role || 'Unknown',
         'Status': entry.status,
         'Source Details': entry.source === 'RELEASED' ? `Released by ${entry.releasedByTeamId?.teamName || 'Unknown'}` : 'Main Auction Unsold',
         'New Franchise (If Sold)': entry.soldToTeamId?.teamName || '-',
         'Sold Price (Cr)': entry.soldPrice ? (entry.soldPrice / 10000000).toFixed(2) : '-'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const colWidths = [
          { wch: 25 }, // Player Name
          { wch: 15 }, // Role
          { wch: 12 }, // Status
          { wch: 40 }, // Source Details
          { wch: 25 }, // New Franchise
          { wch: 15 }  // Sold Price
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Mini Auction Pool`);

      XLSX.writeFile(workbook, `Mini_Auction_Pool_Week_${weekId}.xlsx`);
    } catch (err) {
      console.error('Export failed', err);
      alert('Failed to generate Excel file.');
    } finally {
      setIsExporting(false);
    }
  };

  const available = pool.filter(e => e.status === 'AVAILABLE');
  const sold = pool.filter(e => e.status === 'SOLD');
  const unsold = pool.filter(e => e.status === 'UNSOLD');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter p-8">
      <div className="max-w-5xl mx-auto">
        <Link to={`/auction/${auctionId}/league`} className="flex items-center text-slate-400 hover:text-white mb-8 font-bold tracking-widest text-xs uppercase transition">
           <ChevronLeft className="w-4 h-4 mr-1" /> Back to Schedule
        </Link>

        <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-600 flex items-center">
                <Gavel className="w-10 h-10 mr-4 text-fuchsia-500" /> Mini-Auction Engine
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Re-using the live Socket.io bidding core for released & unsold players</p>
            </div>
            <div className="flex space-x-3">
                <button onClick={handleExportExcel} disabled={isExporting || pool.length === 0} className="flex items-center px-5 py-3 bg-green-900/40 text-green-400 border border-green-500/50 rounded-xl hover:bg-green-600/40 font-black tracking-widest uppercase text-xs transition disabled:opacity-50">
                   <FileSpreadsheet className={`w-4 h-4 mr-2 ${isExporting ? 'animate-pulse' : ''}`} /> Excel
                </button>
                <button onClick={handleSeedPool} disabled={seeding} className="flex items-center px-5 py-3 bg-fuchsia-600/20 text-fuchsia-400 border border-fuchsia-500/50 rounded-xl hover:bg-fuchsia-600/40 font-black tracking-widest uppercase text-xs transition disabled:opacity-50">
                   <RefreshCw className={`w-4 h-4 mr-2 ${seeding ? 'animate-spin' : ''}`} /> {seeding ? 'Seeding...' : 'Seed'}
                </button>
                <button onClick={handleStartMiniAuction} disabled={available.length === 0} className="flex items-center px-5 py-3 bg-violet-600/20 text-violet-400 border border-violet-500/50 rounded-xl hover:bg-violet-600/40 font-black tracking-widest uppercase text-xs transition disabled:opacity-50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                   <Rocket className="w-4 h-4 mr-2" /> Launch Bidding
                </button>
            </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
               <div className="text-3xl font-black text-fuchsia-400">{available.length}</div>
               <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Available</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
               <div className="text-3xl font-black text-green-400">{sold.length}</div>
               <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Sold</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-center">
               <div className="text-3xl font-black text-slate-500">{unsold.length}</div>
               <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Unsold</div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-slate-800 pb-4">
           <button onClick={() => setTab('pool')} className={`font-black uppercase tracking-widest text-xs pb-2 border-b-2 transition ${tab === 'pool' ? 'text-fuchsia-400 border-fuchsia-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>
              Player Pool ({pool.length})
           </button>
           <button onClick={() => setTab('transactions')} className={`font-black uppercase tracking-widest text-xs pb-2 border-b-2 transition ${tab === 'transactions' ? 'text-fuchsia-400 border-fuchsia-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>
              <ArrowRightLeft className="w-3 h-3 inline mr-2" />Roster Transactions ({transactions.length})
           </button>
        </div>

        {loading ? (
            <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest animate-pulse">Loading Pool Data...</div>
        ) : tab === 'pool' ? (
            <div className="space-y-3">
              {pool.length === 0 ? <p className="text-center text-slate-600 italic py-12">Pool is empty. Click "Seed Pool" to populate from releases & unsold players.</p> :
               pool.map(entry => (
                 <div key={entry._id} className={`flex items-center justify-between bg-slate-900 border rounded-xl p-4 transition ${entry.status === 'SOLD' ? 'border-green-500/30 bg-green-900/10' : entry.status === 'UNSOLD' ? 'border-slate-800 opacity-50' : 'border-slate-800 hover:border-fuchsia-500/30'}`}>
                    <div className="flex items-center">
                       <span className={`w-2 h-2 rounded-full mr-4 ${entry.status === 'AVAILABLE' ? 'bg-fuchsia-500' : entry.status === 'SOLD' ? 'bg-green-500' : 'bg-slate-600'}`}></span>
                       <div>
                          <div className="font-black uppercase tracking-wider text-white">{entry.playerId?.name || 'Unknown'}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-600 mt-1">
                             {entry.playerId?.role} | {entry.source === 'RELEASED' ? `Released by ${entry.releasedByTeamId?.teamName || 'Unknown'}` : 'Main Auction Unsold'}
                          </div>
                       </div>
                    </div>
                    <div className="text-right">
                       <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${entry.status === 'AVAILABLE' ? 'text-fuchsia-400 border-fuchsia-500/30 bg-fuchsia-500/10' : entry.status === 'SOLD' ? 'text-green-400 border-green-500/30 bg-green-500/10' : 'text-slate-500 border-slate-700 bg-slate-800'}`}>
                          {entry.status}
                       </span>
                       {entry.status === 'SOLD' && <div className="text-xs text-green-400 font-bold mt-1">→ {entry.soldToTeamId?.teamName} @ ₹{(entry.soldPrice / 10000000).toFixed(2)} Cr</div>}
                    </div>
                 </div>
               ))
              }
            </div>
        ) : (
            <div className="space-y-3">
              {transactions.length === 0 ? <p className="text-center text-slate-600 italic py-12">No roster transactions recorded yet.</p> :
               transactions.map(txn => (
                 <div key={txn._id} className={`flex items-center justify-between bg-slate-900 border rounded-xl p-4 ${txn.type === 'RELEASE' ? 'border-red-500/20' : 'border-green-500/20'}`}>
                    <div className="flex items-center">
                       <span className={`w-2 h-2 rounded-full mr-4 ${txn.type === 'RELEASE' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                       <div>
                          <div className="font-black uppercase tracking-wider text-white">{txn.playerId?.name || 'Unknown'}</div>
                          <div className="text-[10px] uppercase font-bold text-slate-600 mt-1">{txn.teamId?.teamName}</div>
                       </div>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border ${txn.type === 'RELEASE' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-green-400 border-green-500/30 bg-green-500/10'}`}>
                       {txn.type === 'RELEASE' ? 'Released' : `Bought @ ₹${(txn.price / 10000000).toFixed(2)} Cr`}
                    </span>
                 </div>
               ))
              }
            </div>
        )}
      </div>
    </div>
  );
};

export default MiniAuction;
