import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useSocket } from '../context/SocketContext';
import UpcomingPlayers from './UpcomingPlayers';

const SetPlayersPanel = () => {
  const [players, setPlayers] = useState([]);
  const [sets, setSets] = useState({});
  const [selectedSet, setSelectedSet] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { auctionState, socket, auctionId } = useSocket();

  const fetchPlayers = async () => {
    try {
      if (!auctionId) {
          setLoading(false);
          return;
      }
      const res = await api.get('/players', { params: { auctionId } });
      const allPlayers = res.data.sort((a, b) => a.setNumber - b.setNumber);
      
      const grouped = {};
      allPlayers.forEach(p => {
        if (!grouped[p.setNumber]) {
          grouped[p.setNumber] = { name: p.setName, players: [] };
        }
        grouped[p.setNumber].players.push(p);
      });
      
      setPlayers(allPlayers);
      setSets(grouped);
      
      if (auctionState.currentPlayer) {
        setSelectedSet(auctionState.currentPlayer.setNumber);
      } else if (!selectedSet && Object.keys(grouped).length > 0) {
        setSelectedSet(Object.keys(grouped)[0]);
      }
    } catch (err) {
      console.error('Error fetching players:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
    
    if (socket) {
      socket.on('playerSold', fetchPlayers);
      socket.on('markUnsold', fetchPlayers);
    }
    return () => {
      if (socket) {
        socket.off('playerSold', fetchPlayers);
        socket.off('markUnsold', fetchPlayers);
      }
    };
  }, [socket, auctionState.currentPlayer?._id, auctionId]);

  if (loading) {
    return <div className="p-4 text-slate-500 font-bold tracking-widest text-xs uppercase animate-pulse">Loading Database Pipeline...</div>;
  }

  if (Object.keys(sets).length === 0) {
    return (
        <div className="p-6 text-center text-slate-400">
            <h3 className="font-bold text-red-400 mb-2">Ghost Zone Detected! 👻</h3>
            <p className="text-sm">This is an old deleted Auction URL.<br/>Please go back to the main domain <b>( / )</b> and Create a new Auction!</p>
        </div>
    );
  }

  const currentSetData = sets[selectedSet];

  let stats = { total: 0, sold: 0, passed: 0, yet: 0 };
  if (currentSetData) {
    stats.total = currentSetData.players.length;
    stats.sold = currentSetData.players.filter(p => p.status === 'sold').length;
    stats.passed = currentSetData.players.filter(p => p.status === 'unsold' && p.isPassed).length;
    stats.yet = currentSetData.players.filter(p => p.status === 'unsold' && !p.isPassed).length;
  }

  const displayedPlayers = searchTerm.trim() 
    ? players.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : (currentSetData ? currentSetData.players : []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col mb-2 border-b border-slate-700 pb-2">
        <div className="flex items-center justify-between mb-2">
          <div className="flex space-x-2">
            <select 
              value={selectedSet}
              onChange={(e) => setSelectedSet(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-300 rounded px-1 text-xs focus:outline-none focus:border-brand-blue"
            >
              {Object.keys(sets).map(setNum => (
                <option key={setNum} value={setNum}>
                  Set {setNum} - {sets[setNum].name}
                </option>
              ))}
            </select>
            <button 
              onClick={async () => {
                if (auctionState.auctionStatus === 'LIVE') {
                  return alert('Cannot jump sets while auction is LIVE. Please pass or sell current player.');
                }
                try {
                  await api.post(`/auction/${auctionId}/start`, { setNumber: parseInt(selectedSet) });
                } catch (e) {
                  alert(e.response?.data?.message || e.message);
                }
              }}
              disabled={auctionState.auctionStatus === 'LIVE'}
              className="bg-brand-blue/20 text-brand-blue px-2 py-0.5 rounded text-[10px] font-bold hover:bg-brand-blue/30 border border-brand-blue/50 disabled:opacity-50 transition"
            >
              START SET
            </button>
          </div>
        </div>
        
        {currentSetData && !searchTerm && (
          <div className="flex justify-between items-center bg-slate-800/80 rounded px-2 py-1 text-[9px] font-bold tracking-wider mb-2">
            <div className="flex flex-col items-center"><span className="text-slate-500 uppercase">Total</span><span className="text-slate-200 text-xs">{stats.total}</span></div>
            <div className="flex flex-col items-center"><span className="text-brand-green uppercase">Sold</span><span className="text-brand-green text-xs">{stats.sold}</span></div>
            <div className="flex flex-col items-center"><span className="text-slate-400 uppercase">Passed</span><span className="text-slate-400 text-xs">{stats.passed}</span></div>
            <div className="flex flex-col items-center"><span className="text-brand-blue uppercase">Remaining</span><span className="text-brand-blue text-xs">{stats.yet}</span></div>
          </div>
        )}

        <div className="w-full">
            <input 
              type="text" 
              placeholder="GLOBAL SEARCH FOR PLAYER..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/30 border border-slate-700 rounded p-1.5 text-[10px] font-bold text-slate-300 focus:outline-none focus:border-brand-blue tracking-wider"
            />
        </div>
      </div>
      
      {auctionState.auctionStatus === 'LIVE' && (
        <div className="mb-2">
          <UpcomingPlayers players={auctionState.upcomingPlayers || []} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
        {displayedPlayers.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 pb-2">
            {displayedPlayers.map(p => {
              const isCurrent = auctionState.currentPlayer?._id === p._id;
              
              let statusBadge = null;
              let bgClass = "";

              if (isCurrent) {
                statusBadge = <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] font-bold border border-white/50 shadow-[0_0_10px_rgba(255,255,255,0.3)]">AUCTIONING</span>;
                bgClass = 'bg-white/10 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] text-white scale-[1.03] z-10';
              } else if (p.status === 'sold') {
                statusBadge = <span className="bg-brand-green/20 text-brand-green px-2 py-0.5 rounded text-[10px] font-bold border border-brand-green/30">SOLD</span>;
                bgClass = 'bg-brand-green/10 border-brand-green/40 opacity-90';
              } else if (p.isPassed) {
                statusBadge = <span className="bg-brand-red/20 text-brand-red px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-brand-red/30">UNSOLD</span>;
                bgClass = 'bg-brand-red/10 border-brand-red/40';
              } else {
                statusBadge = <span className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded text-[10px] uppercase font-bold border border-yellow-500/30">PENDING</span>;
                bgClass = 'bg-yellow-500/5 border-yellow-500/30 hover:border-yellow-500/60';
              }

              return (
                <div 
                  key={p._id} 
                  onClick={async () => {
                     if (isCurrent) return;
                     if (auctionState.auctionStatus === 'LIVE') {
                        return alert('Cannot preview player while auction is LIVE. Please pass or sell current player.');
                     }
                     try {
                        await api.post(`/auction/${auctionId}/preview`, { playerId: p._id });
                     } catch (e) {
                        alert(e.response?.data?.message || e.message);
                     }
                  }}
                  className={`flex flex-col items-center justify-center p-1.5 rounded-md border transition-all ${bgClass} ${!isCurrent ? 'cursor-pointer hover:scale-[1.02]' : ''}`}
                 >
                  <div className="text-xs font-bold text-slate-200 text-center truncate w-full mb-0.5">{p.name}</div>
                  
                  {p.status === 'sold' && p.soldToTeamId ? (
                    <div className="flex flex-col items-center w-full bg-black/20 rounded p-1 border border-black/30">
                       <span className="text-[10px] font-bold text-brand-green">Set {p.setNumber} • {(p.soldPrice / 10000000).toFixed(2)} Cr</span>
                       <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300 truncate w-full text-center">
                         {p.soldToTeamId.ownerName || p.soldToTeamId.teamName}
                       </span>
                    </div>
                  ) : (
                    <div className="flex justify-between w-full items-center">
                       <span className="text-[10px] text-slate-400">Set {p.setNumber} • {(p.basePrice / 10000000).toFixed(2)} Cr</span>
                       {statusBadge}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-slate-500 text-center mt-4">No players found in this set.</div>
        )}
      </div>
    </div>
  );
};

export default SetPlayersPanel;
