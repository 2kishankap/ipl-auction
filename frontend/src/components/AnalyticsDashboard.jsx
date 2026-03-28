import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Trophy, Download, Users, IndianRupee, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316', '#6366f1'];

const formatCrores = (amount) => (amount / 10000000).toFixed(2);

const AnalyticsDashboard = () => {
  const { auctionId } = useParams();
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeamData, setSelectedTeamData] = useState(null);
  const reportRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [playersRes, teamsRes] = await Promise.all([
          api.get('/players', { params: { auctionId } }),
          api.get('/teams', { params: { auctionId } })
        ]);
        setPlayers(playersRes.data);
        setTeams(teamsRes.data);
        setIsLoading(false);
        triggerConfetti();
      } catch (err) {
        console.error("Failed to load analytics data", err);
      }
    };
    fetchData();
  }, []);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: COLORS
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: COLORS
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, useCORS: true, backgroundColor: '#020617' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('Auction-Report-2026.pdf');
    } catch (err) {
      console.error('PDF Generation failed', err);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-brand-green">
        <Activity className="w-16 h-16 animate-spin mb-4" />
        <h2 className="text-2xl font-black tracking-widest animate-pulse">CRUNCHING DATA...</h2>
      </div>
    );
  }

  // --- Computations ---
  const soldPlayers = players.filter(p => p.status === 'sold');
  const unsoldPlayers = players.filter(p => p.status === 'unsold');
  
  const mostExpensive = soldPlayers.sort((a,b) => b.soldPrice - a.soldPrice)[0];
  
  const teamSpendData = teams.map(t => ({
    name: t.teamName,
    spend: 1000000000 - t.purseRemaining,
    spendCr: parseFloat(formatCrores(1000000000 - t.purseRemaining)),
    players: t.playersBought.length,
    overseas: t.overseasCount || 0,
    teamId: t._id,
    strength: Math.round(((1000000000 - t.purseRemaining) / 10000000) * 0.5 + (t.playersBought.length * 5) + ((t.overseasCount || 0) * 8))
  })).sort((a,b) => b.spend - a.spend);

  const topSpender = teamSpendData[0];
  
  // Budget Team (min spend per player, with at least 10 players)
  const validBudgetTeams = teamSpendData.filter(t => t.players >= 10);
  const bestBudgetTeam = validBudgetTeams.sort((a,b) => (a.spend/a.players) - (b.spend/b.players))[0] || teamSpendData.sort((a,b) => (a.spend/Math.max(a.players, 1)) - (b.spend/Math.max(b.players, 1)))[0];

  const roleDistribution = [
    { name: 'BAT', value: soldPlayers.filter(p => p.role === 'BAT').length },
    { name: 'BOWL', value: soldPlayers.filter(p => p.role === 'BOWL').length },
    { name: 'ALL', value: soldPlayers.filter(p => p.role === 'ALL').length },
    { name: 'WK', value: soldPlayers.filter(p => p.role === 'WK').length },
  ];

  const statusDistribution = [
    { name: 'SOLD', value: soldPlayers.length },
    { name: 'UNSOLD', value: unsoldPlayers.length }
  ];

  const overseasDistribution = [
    { name: 'OVERSEAS', value: soldPlayers.filter(p => p.isOverseas).length },
    { name: 'INDIAN', value: soldPlayers.filter(p => !p.isOverseas).length }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 pt-16 selection:bg-brand-green" ref={reportRef}>
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white glow-white uppercase tracking-tighter mb-2">
             Auction Analytics <span className="text-brand-green bg-brand-green/10 px-4 py-1 rounded-xl">2026</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-widest uppercase">Post-Auction Comprehensive Report</p>
        </div>
        <div className="flex space-x-4 mt-6 md:mt-0">
          <Link to={`/auction/${auctionId}`} className="px-6 py-3 border border-slate-700 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition font-bold text-sm tracking-widest hidden md:flex items-center">
            BACK TO GAVEL
          </Link>
          <button onClick={handleDownloadPDF} data-html2canvas-ignore className="px-6 py-3 border border-brand-green bg-brand-green/20 text-brand-green hover:bg-brand-green/30 transition rounded-xl flex items-center shadow-[0_0_15px_rgba(16,185,129,0.3)] font-black text-sm tracking-wider uppercase">
            <Download className="w-5 h-5 mr-2" /> PDF Report
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
         {/* Top Stats Cards */}
         <div className="bg-gradient-to-br from-brand-green/20 to-slate-900 border border-brand-green/50 rounded-3xl p-6 relative overflow-hidden group">
            <Trophy className="absolute -right-6 -bottom-6 w-32 h-32 text-brand-green opacity-10 group-hover:scale-110 transition" />
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Most Expensive Player</h3>
            <div className="text-3xl font-black text-white mt-2 truncate relative z-10">{mostExpensive?.name || 'N/A'}</div>
            <div className="text-xl font-bold text-brand-green mt-1 relative z-10">₹ {mostExpensive ? formatCrores(mostExpensive.soldPrice) : '0'} Cr</div>
            <div className="text-xs text-slate-500 mt-2 font-mono relative z-10">{mostExpensive?.soldToTeamId?.teamName || ''}</div>
         </div>

         <div className="bg-gradient-to-br from-brand-blue/20 to-slate-900 border border-brand-blue/50 rounded-3xl p-6 relative overflow-hidden group">
            <PieChartIcon className="absolute -right-6 -bottom-6 w-32 h-32 text-brand-blue opacity-10 group-hover:scale-110 transition" />
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Top Spending Team</h3>
            <div className="text-3xl font-black text-white mt-2 relative z-10 truncate">{topSpender?.name || 'N/A'}</div>
            <div className="text-xl font-bold text-brand-blue mt-1 relative z-10">₹ {topSpender?.spendCr || '0'} Cr Total</div>
            <div className="text-xs text-slate-500 mt-2 font-mono relative z-10">{topSpender?.players} Players Drafted</div>
         </div>

         <div className="bg-gradient-to-br from-purple-500/20 to-slate-900 border border-purple-500/50 rounded-3xl p-6 relative overflow-hidden group">
            <IndianRupee className="absolute -right-6 -bottom-6 w-32 h-32 text-purple-500 opacity-10 group-hover:scale-110 transition" />
            <h3 className="text-xs uppercase font-bold text-slate-400 tracking-widest mb-1">Best Budget Strategy</h3>
            <div className="text-3xl font-black text-white mt-2 relative z-10 truncate">{bestBudgetTeam?.name || 'N/A'}</div>
            <div className="text-xl font-bold text-purple-400 mt-1 relative z-10">₹ {bestBudgetTeam ? (bestBudgetTeam.spendCr / Math.max(bestBudgetTeam.players, 1)).toFixed(2) : 0} Cr / Player Avg</div>
            <div className="text-xs text-slate-500 mt-2 font-mono relative z-10">Lowest spend efficiency</div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* charts */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
           <h3 className="text-xl font-bold tracking-widest uppercase mb-6 flex items-center text-slate-300">
             Team Spending <span className="ml-2 text-xs text-slate-500">(Crores)</span>
           </h3>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={teamSpendData}>
                 <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 10}} angle={-45} textAnchor="end" height={60} />
                 <YAxis stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12}} />
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }} />
                 <Bar dataKey="spendCr" fill="#10b981" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center">
             <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-slate-400">Status</h3>
             <div className="h-[150px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center">
             <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-slate-400">Overseas</h3>
             <div className="h-[150px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={overseasDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                      <Cell fill="#f59e0b" />
                      <Cell fill="#3b82f6" />
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center">
             <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-slate-400">Roles</h3>
             <div className="h-[150px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                      {roleDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
         {/* Squad Strength Table */}
         <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 overflow-hidden shadow-xl">
           <h3 className="text-xl font-bold tracking-widest uppercase mb-6 text-slate-300">Squad Intelligence Index</h3>
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
               <thead>
                 <tr className="border-b border-slate-800 text-slate-500 font-mono">
                   <th className="py-3 px-2 font-medium">Rank</th>
                   <th className="py-3 px-2 font-medium">Team Name</th>
                   <th className="py-3 px-2 font-medium hidden sm:table-cell">Roster</th>
                   <th className="py-3 px-2 font-medium hidden sm:table-cell">OS</th>
                   <th className="py-3 px-2 font-medium text-right text-brand-blue text-xs tracking-widest">Strength Score</th>
                 </tr>
               </thead>
               <tbody>
                 {[...teamSpendData].sort((a,b) => b.strength - a.strength).map((t, idx) => (
                   <tr key={t.teamId} 
                       onClick={() => {
                         const team = teams.find(tm => tm._id === t.teamId);
                         setSelectedTeamData(team);
                       }}
                       className="border-b border-slate-800/50 hover:bg-slate-800/30 transition cursor-pointer">
                     <td className="py-4 px-2 font-black text-slate-400">#{idx + 1}</td>
                     <td className="py-4 px-2 font-bold text-slate-200">{t.name}</td>
                     <td className="py-4 px-2 text-slate-400 hidden sm:table-cell">{t.players}/18</td>
                     <td className="py-4 px-2 text-slate-400 hidden sm:table-cell">{t.overseas}/6</td>
                     <td className="py-4 px-2 text-right font-black text-brand-blue">{t.strength}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <p className="text-[10px] text-slate-600 font-mono mt-4 uppercase">Click any team row to inspect roster</p>
         </div>

         {/* Most Expensive List */}
         <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 shadow-xl">
           <h3 className="text-xl font-bold tracking-widest uppercase mb-6 text-slate-300">Top 10 Valuations</h3>
           <div className="space-y-4">
             {soldPlayers.sort((a,b) => b.soldPrice - a.soldPrice).slice(0, 10).map((p, i) => (
               <div key={p._id} className="flex justify-between items-center bg-slate-800/30 p-4 rounded-xl border border-slate-800/80">
                 <div className="flex items-center space-x-4">
                   <div className="text-lg font-black text-slate-500 w-6">{(i+1)}</div>
                   <div>
                     <div className="font-bold text-slate-200 text-sm md:text-base truncate w-32 md:w-48">{p.name}</div>
                     <div className="text-[10px] text-slate-500 font-mono">{p.soldToTeamId?.teamName || 'N/A'}</div>
                   </div>
                 </div>
                 <div className="text-brand-green font-black text-lg">
                   ₹ {formatCrores(p.soldPrice)} Cr
                 </div>
               </div>
             ))}
           </div>
         </div>
      </div>

      {/* Selected Team Data Viewer overlay */}
      {selectedTeamData && (
        <div className="fixed inset-0 z-[200] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl shadow-2xl p-8 max-h-[80vh] overflow-y-auto" data-html2canvas-ignore>
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-black text-white">{selectedTeamData.teamName} Vault</h2>
                <button onClick={() => setSelectedTeamData(null)} className="text-slate-500 hover:text-white px-4 py-2 bg-slate-800 rounded-full font-bold text-xs uppercase tracking-widest transition">Close</button>
             </div>
             
             <div className="grid grid-cols-2 gap-4 mb-8">
               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Total Spend</span>
                 <div className="text-2xl font-black text-brand-green mt-1">₹ {formatCrores(1000000000 - selectedTeamData.purseRemaining)} Cr</div>
               </div>
               <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                 <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Roster Size</span>
                 <div className="text-2xl font-black text-brand-blue mt-1">{selectedTeamData.playersBought.length} <span className="text-sm">/ 18</span></div>
               </div>
             </div>

             <h3 className="text-xs uppercase font-bold tracking-widest text-slate-500 mb-4 border-b border-slate-800 pb-2">Acquired Players</h3>
             <ul className="space-y-2">
                {soldPlayers.filter(p => p.soldToTeamId?._id === selectedTeamData._id).sort((a,b)=> b.soldPrice - a.soldPrice).map(p => (
                   <li key={p._id} className="flex justify-between items-center text-sm bg-slate-800/20 p-3 rounded-lg">
                     <div className="flex items-center space-x-3">
                       <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isOverseas ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-700 hover:bg-slate-600'}`}>{p.isOverseas ? 'OS' : 'IN'}</span>
                       <span className="text-slate-200 font-bold">{p.name}</span>
                       <span className="text-slate-500 text-[10px] hidden sm:inline">{p.role}</span>
                     </div>
                     <span className="font-mono text-brand-green font-bold">₹ {formatCrores(p.soldPrice)}</span>
                   </li>
                ))}
                {selectedTeamData.playersBought.length === 0 && (
                  <p className="text-slate-600 italic text-sm py-4">No players drafted yet.</p>
                )}
             </ul>
           </div>
        </div>
      )}

    </div>
  );
};

export default AnalyticsDashboard;
