import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Trophy, Medal, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../services/api';
import TeamPerformanceModal from './TeamPerformanceModal';

const PublicLeaderboard = () => {
  const { auctionId, weekId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const leaderboardRef = useRef(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [weekId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/league/${auctionId}/weeks/${weekId}/leaderboard`);
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      
      const exportData = [];
      
      for (let i = 0; i < leaderboard.length; i++) {
         const team = leaderboard[i];
         const res = await api.get(`/league/${auctionId}/weeks/${weekId}/performance/${team.teamId}`);
         const performance = res.data.performance;
         
         const startingPlayers = performance.filter(p => p.isStarting);
         const playerStrings = startingPlayers.map(p => `${p.name} (${p.points})`).join(' | ');
         
         exportData.push({
           'Rank': i + 1,
           'Franchise Name': team.teamName,
           'Total Points': team.totalPoints || 0,
           'Starting XI Breakdown': playerStrings
         });
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      const colWidths = [
          { wch: 8 }, 
          { wch: 25 }, 
          { wch: 15 }, 
          { wch: 120 } 
      ];
      worksheet['!cols'] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, `Leaderboard Data`);

      XLSX.writeFile(workbook, `Leaderboard_Data_Week_${weekId}.xlsx`);
      
    } catch (err) {
      console.error('Failed to export Excel', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-inter p-8">
      <div className="max-w-4xl mx-auto" ref={leaderboardRef}>

        
        <div className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-5xl font-black tracking-tighter uppercase mb-2 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center">
                <Trophy className="w-10 h-10 mr-4 text-yellow-500" /> Leaderboard Matrix
              </h1>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Dynamic Gameweek Standings via MongoDB Aggregation Pipeline</p>
            </div>
            <button 
              onClick={handleExportCSV}
              disabled={isExporting}
              className="flex items-center bg-green-900 border border-green-700 hover:bg-green-800 text-green-100 transition-colors px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-widest disabled:opacity-50"
            >
              {isExporting ? <FileSpreadsheet className="w-4 h-4 mr-2 animate-pulse" /> : <Download className="w-4 h-4 mr-2" />}
              {isExporting ? 'Extracting Data...' : 'Export to Excel'}
            </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
           {loading ? (
               <div className="text-center py-20 text-slate-500 font-bold uppercase tracking-widest animate-pulse">Running Database Math Algorithm...</div>
           ) : leaderboard.length === 0 ? (
               <div className="text-center py-20 text-slate-600 font-bold italic">No lineup blocks or match algorithms found for this week.</div>
           ) : (
               <div className="w-full">
                  <div className="bg-slate-950 flex justify-between px-8 py-4 border-b border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-500">
                     <div className="flex-[3]">Franchise</div>
                     <div className="flex-1 text-right">Points Yield</div>
                  </div>
                  {leaderboard.map((team, idx) => (
                      <div 
                        key={team.teamId} 
                        onClick={() => setSelectedTeamId(team.teamId)}
                        className={`flex justify-between items-center px-8 py-6 border-b border-slate-800 hover:bg-slate-800/50 transition cursor-pointer group ${idx === 0 ? 'bg-yellow-500/5' : ''}`}
                      >
                         <div className="flex-[3] flex items-center">
                            <span className={`w-8 font-black text-xl mr-4 ${idx === 0 ? 'text-yellow-500' : idx === 1 ? 'text-slate-400' : idx === 2 ? 'text-orange-500' : 'text-slate-700'}`}>
                               {idx + 1}.
                            </span>
                            <div>
                               <div className="text-xl font-black uppercase tracking-wider text-white group-hover:text-yellow-400 transition-colors">{team.teamName}</div>
                               <div className="text-[10px] text-slate-500 font-black tracking-widest mt-1 uppercase">ID: {team.teamAbbreviation}</div>
                            </div>
                         </div>
                         <div className="flex-1 text-right flex justify-end items-center">
                            <span className={`text-4xl font-black ${idx === 0 ? 'text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'text-slate-300'}`}>
                               {team.totalPoints || 0}
                            </span>
                         </div>
                      </div>
                  ))}
               </div>
           )}
        </div>

        {/* Breakdown Modal */}
        {selectedTeamId && (
          <TeamPerformanceModal 
            key={selectedTeamId}
            teamId={selectedTeamId}
            weekId={weekId}
            auctionId={auctionId}
            onClose={() => setSelectedTeamId(null)}
          />
        )}
      </div>
    </div>
  );
};

export default PublicLeaderboard;
