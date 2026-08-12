import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import TeamCard from './TeamCard';
import LiveAuctionPanel from './LiveAuctionPanel';
import SetPlayersPanel from './SetPlayersPanel';
import TeamDetailsModal from './TeamDetailsModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipForward, Plus, X, Home, ShieldAlert } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StageAuctionView from './StageAuctionView';
import JoinPage from './JoinPage';

const AuctionDashboard = () => {
  const navigate = useNavigate();
  const { auctionState, isConnected, isSyncing, syncedTeams, socket, auctionId } = useSocket();
  const [teams, setTeams] = useState([]);
  const [showAddTeam, setShowAddTeam] = useState(false);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  
  const queryParameters = new URLSearchParams(window.location.search);
  const mode = queryParameters.get("mode");

  const [newPlayerForm, setNewPlayerForm] = useState({
    name: '',
    role: 'BAT',
    country: 'India',
    iplTeam: 'Released',
    isOverseas: false,
    basePrice: 20000000,
    setNumber: 99
  });

  const handleAddPlayer = async (e) => {
    e.preventDefault();
    if (!newPlayerForm.name) return alert('Player Name is required');
    try {
      await api.post('/players/add', {
        ...newPlayerForm,
        auctionId,
        basePrice: Number(newPlayerForm.basePrice),
        setNumber: Number(newPlayerForm.setNumber)
      });
      setShowAddPlayer(false);
      setNewPlayerForm({ name: '', role: 'BAT', country: 'India', iplTeam: 'Released', isOverseas: false, basePrice: 20000000, setNumber: 99 });
      alert('Player manually injected into the Auction database!');
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const fetchTeams = async () => {
    try {
      if (!auctionId) return;
      const res = await api.get('/teams', { params: { auctionId } });
      setTeams(res.data);
      if (selectedTeam) {
        const updated = res.data.find(t => t._id === selectedTeam._id);
        if (updated) setSelectedTeam(updated);
      }
    } catch (err) {
      console.error('Failed to fetch teams', err);
    }
  };

  useEffect(() => {
    if (syncedTeams) {
      setTeams(syncedTeams);
    }
  }, [syncedTeams]);

  useEffect(() => {
    fetchTeams();

    if (socket) {
      socket.on('playerSold', fetchTeams);
      socket.on('error', (err) => {
        alert(`Bidding Rejected: ${err.message}`);
      });
    }
    return () => {
      if (socket) {
        socket.off('playerSold', fetchTeams);
        socket.off('error');
      }
    };
  }, [socket, auctionState.auctionStatus, auctionId]);

  const startAuction = async () => {
    try {
      await api.post(`/auction/${auctionId}/start`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const nextPlayer = async () => {
    try {
      await api.post(`/auction/${auctionId}/next`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const completeMainAuction = async () => {
    if (!window.confirm("WARNING: Are you absolutely certain you want to officially CLOSE the main auction? Bidding will be completely locked, and the zone will permanently transition to League Mode!")) return;
    try {
      await api.post(`/auction/${auctionId}/complete`);
      navigate(`/auction/${auctionId}/league`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const revertLastPlayer = async () => {
    try {
      await api.post(`/auction/${auctionId}/revert`);
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleAddTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName || !newOwnerName) return alert('Fill all fields');
    try {
      await api.post('/teams/join', { teamName: newTeamName, ownerName: newOwnerName, auctionId, isAdmin: false });
      setShowAddTeam(false);
      setNewTeamName('');
      setNewOwnerName('');
      fetchTeams();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const savedTeam = localStorage.getItem(`auctionTeam_${auctionId}`);
  if (!savedTeam && mode !== 'stage' && mode !== 'admin' && mode !== 'view') {
    return <JoinPage />;
  }

  if (mode === 'stage') {
    return <StageAuctionView />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden relative">
      <TeamDetailsModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
      
      {/* Add Team Modal */}
      {showAddTeam && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 w-96 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add New Team</h2>
              <button onClick={() => setShowAddTeam(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleAddTeam} className="space-y-4">
              <div>
                <label className="text-xs font-bold tracking-wider text-slate-400">Team Name</label>
                <input 
                  type="text" 
                  value={newTeamName} 
                  onChange={e => setNewTeamName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-brand-green" 
                  placeholder="e.g. Mumbai Indians" 
                />
              </div>
              <div>
                <label className="text-xs font-bold tracking-wider text-slate-400">Owner Name</label>
                <input 
                  type="text" 
                  value={newOwnerName} 
                  onChange={e => setNewOwnerName(e.target.value)}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-brand-green" 
                  placeholder="e.g. Mukesh Ambani" 
                />
              </div>
              <button type="submit" className="w-full mt-4 bg-brand-green text-white font-bold py-2 rounded hover:bg-emerald-500 transition">
                Create Team
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 w-[500px] shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Add Missing Player</h2>
              <button onClick={() => setShowAddPlayer(false)} className="text-slate-400 hover:text-white"><X /></button>
            </div>
            <form onSubmit={handleAddPlayer} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400">Player Name</label>
                  <input type="text" value={newPlayerForm.name} onChange={e => setNewPlayerForm({...newPlayerForm, name: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-brand-blue" placeholder="e.g. Jasprit Bumrah" required />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider text-slate-400">Role</label>
                  <select value={newPlayerForm.role} onChange={e => setNewPlayerForm({...newPlayerForm, role: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-brand-blue">
                    <option value="BAT">Batsman (BAT)</option>
                    <option value="BOWL">Bowler (BOWL)</option>
                    <option value="ALL">All-Rounder (ALL)</option>
                    <option value="WK">Wicket Keeper (WK)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider text-slate-400">Set Number</label>
                  <input type="number" value={newPlayerForm.setNumber} onChange={e => setNewPlayerForm({...newPlayerForm, setNumber: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-brand-blue" />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider text-slate-400">Country</label>
                  <input type="text" value={newPlayerForm.country} onChange={e => setNewPlayerForm({...newPlayerForm, country: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-brand-blue" required />
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider text-slate-400">Base Price (INR)</label>
                  <select value={newPlayerForm.basePrice} onChange={e => setNewPlayerForm({...newPlayerForm, basePrice: parseInt(e.target.value)})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-brand-blue">
                    <option value={20000000}>2.00 Cr</option>
                    <option value={15000000}>1.50 Cr</option>
                    <option value={10000000}>1.00 Cr</option>
                    <option value={7500000}>75 Lakhs</option>
                    <option value={5000000}>50 Lakhs</option>
                    <option value={3000000}>30 Lakhs</option>
                    <option value={2000000}>20 Lakhs</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold tracking-wider text-slate-400">Current Team</label>
                  <select value={newPlayerForm.iplTeam} onChange={e => setNewPlayerForm({...newPlayerForm, iplTeam: e.target.value})} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-2 text-white focus:outline-none focus:border-brand-blue">
                    <option value="Released">Released</option>
                    <option value="NONE">None / Free Agent</option>
                    <option value="CSK">Chennai Super Kings (CSK)</option>
                    <option value="DC">Delhi Capitals (DC)</option>
                    <option value="GT">Gujarat Titans (GT)</option>
                    <option value="KKR">Kolkata Knight Riders (KKR)</option>
                    <option value="LSG">Lucknow Super Giants (LSG)</option>
                    <option value="MI">Mumbai Indians (MI)</option>
                    <option value="PBKS">Punjab Kings (PBKS)</option>
                    <option value="RR">Rajasthan Royals (RR)</option>
                    <option value="RCB">Royal Challengers Bengaluru (RCB)</option>
                    <option value="SRH">Sunrisers Hyderabad (SRH)</option>
                  </select>
                </div>
                <div className="col-span-2 flex items-center mb-2">
                  <input type="checkbox" checked={newPlayerForm.isOverseas} onChange={e => setNewPlayerForm({...newPlayerForm, isOverseas: e.target.checked})} className="mr-2" id="isOverseas" />
                  <label htmlFor="isOverseas" className="text-sm font-bold text-slate-300 cursor-pointer">Is Overseas Player?</label>
                </div>
              </div>
              <button type="submit" className="w-full bg-brand-blue text-white font-bold py-3 rounded hover:bg-blue-600 transition shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                Inject Player Into Database
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-slate-900/80 border-b border-slate-700 py-2 px-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-4">
          <Link to="/" className="p-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition border border-slate-600">
            <Home className="w-5 h-5" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-widest text-white text-glow hidden md:block">
              IPL AUCTION LIVE ({mode === 'admin' ? 'AUCTIONEER' : 'FRANCHISE'} VIEW)
            </h1>
            <button 
              onClick={() => {
                const newMode = mode === 'admin' ? 'view' : 'admin';
                navigate(`?mode=${newMode}`);
              }}
              className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-blue hover:text-white transition text-left"
            >
              [ Switch to {mode === 'admin' ? 'Franchise' : 'Auctioneer'} View ]
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowAddPlayer(true)}
            className="flex items-center px-4 py-2 bg-slate-800 text-slate-200 border border-slate-600 rounded hover:bg-slate-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Player
          </button>
          <button 
            onClick={() => setShowAddTeam(true)}
            className="flex items-center px-4 py-2 bg-slate-800 text-slate-200 border border-slate-600 rounded hover:bg-slate-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Team
          </button>
          <button 
            onClick={revertLastPlayer}
            className="flex items-center px-4 py-2 bg-brand-red/20 text-brand-red border border-brand-red rounded hover:bg-brand-red/30 transition shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            <X className="w-4 h-4 mr-2" /> Undo Last
          </button>
          {mode === 'admin' && (
            <button 
              onClick={completeMainAuction}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-600/20 to-brand-blue/20 text-purple-400 border border-purple-500 rounded hover:from-purple-600/40 hover:to-brand-blue/40 transition shadow-[0_0_15px_rgba(168,85,247,0.3)] uppercase text-xs font-black tracking-widest"
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> End Auction Phase
            </button>
          )}
          <button 
            onClick={nextPlayer}
            className="flex items-center px-4 py-2 bg-brand-blue/20 text-brand-blue border border-brand-blue rounded hover:bg-brand-blue/30 transition shadow-[0_0_10px_rgba(59,130,246,0.2)]"
          >
            <SkipForward className="w-4 h-4 mr-2" /> Next Player
          </button>
          <div className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${
            !isConnected ? 'bg-brand-red/20 text-brand-red border border-brand-red/30' 
            : isSyncing ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 animate-pulse' 
            : 'bg-brand-green/20 text-brand-green border border-brand-green/30'
          }`}>
            {!isConnected ? 'DISCONNECTED' : isSyncing ? 'SYNCING...' : 'LIVE ZONE DIRECT'}
          </div>
        </div>
      </div>

      {/* Top Strip - Team Cards */}
      <div className="flex space-x-2 p-2 overflow-x-auto scrollbar-hide border-b border-slate-700/50 min-h-[100px] items-center">
        {teams.length === 0 && <span className="text-slate-500 text-sm italic py-4">No squads initialized in this zone. Click the "+ Add Team" button to spawn participants.</span>}
        {teams.map(team => (
          <TeamCard 
            key={team._id} 
            team={team} 
            isHighestBidder={auctionState.highestBidderTeamId === team._id} 
            onClick={() => setSelectedTeam(team)}
          />
        ))}
      </div>

      {/* Main Content Split */}
      <div className="flex flex-1 overflow-hidden p-2 space-x-3">
        {/* Left Panel - Live Auction */}
        <div className="flex-[3] flex flex-col h-full space-y-3 overflow-hidden">
          <div className="flex-1 glass-panel flex flex-col items-center relative overflow-y-auto shadow-2xl border-slate-600/50">
            <LiveAuctionPanel teams={teams} startAuction={startAuction} />
          </div>
        </div>

        {/* Right Panel - Players List */}
         <div className="flex-1 flex flex-col h-full min-w-[320px] max-w-[400px]">
            <SetPlayersPanel />
         </div>
      </div>
    </div>
  );
};

export default AuctionDashboard;
