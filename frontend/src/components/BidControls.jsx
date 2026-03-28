import React from 'react';
import { useSocket } from '../context/SocketContext';
import { Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import { api } from '../services/api';

const BidControls = ({ player, currentBid, teams }) => {
  const { socket, auctionState, isConnected, isSyncing, auctionId } = useSocket();

  const calculateNextBid = (cb) => {
    if (cb < 10000000) return cb + 500000;
    if (cb < 20000000) return cb + 1000000;
    if (cb < 30000000) return cb + 2000000;
    if (cb < 50000000) return cb + 2500000;
    return cb + 5000000;
  };

  const handleBid = (team) => {
    if (!isConnected || isSyncing || auctionState.auctionStatus !== 'LIVE') return;
    
    // Disable logic
    const nextBid = auctionState.highestBidderTeamId === null ? player.basePrice : calculateNextBid(currentBid);
    
    if (auctionState.highestBidderTeamId === team._id) return alert('Already highest bidder');
    if (team.purseRemaining < nextBid) return alert('Insufficient Purse');
    if (team.playersBought?.length >= 18) return alert('Squad Size Limit Reached');
    if (player.isOverseas && team.overseasCount >= 6) return alert('Overseas Limit Reached');

    socket.emit('placeBid', { teamId: team._id, auctionId });
  };

  const nextBidAmount = auctionState.highestBidderTeamId === null ? player?.basePrice : calculateNextBid(currentBid);
  const formatMoney = (amount) => (amount ? (amount / 10000000).toFixed(2) + ' Cr' : '0 Cr');

  if (auctionState.auctionStatus !== 'LIVE') {
    return (
      <div className="mt-8 text-center text-slate-400 p-4 border border-slate-700 border-dashed rounded-lg bg-slate-900/50">
        Waiting for Auction to Start...
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col w-full max-w-md mx-auto space-y-4 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin">
      <div className="flex items-center justify-between mb-4">
        <div className="text-center font-bold text-slate-300">
          Assign next bid: <span className="text-brand-green">{formatMoney(nextBidAmount)}</span>
        </div>
        {!auctionState.highestBidderTeamId && (
          <button 
            onClick={async () => {
              try {
                await api.post(`/auction/${auctionId}/unsold`);
              } catch(err) {
                console.error(err);
              }
            }}
            className="px-4 py-1 bg-brand-red/20 text-brand-red border border-brand-red/50 hover:bg-brand-red/40 rounded shadow-md text-xs font-bold uppercase tracking-wider"
          >
            PASS (Mark Unsold)
          </button>
        )}
      </div>
      
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {teams.map(team => {
            const isHighest = auctionState.highestBidderTeamId === team._id;
            return (
              <motion.button
                key={team._id}
                whileHover={!isHighest ? { scale: 1.05 } : {}}
                whileTap={!isHighest ? { scale: 0.95 } : {}}
                onClick={() => handleBid(team)}
                disabled={isHighest || !isConnected || isSyncing}
                className={`py-2 px-3 flex flex-col items-center justify-center rounded-lg font-bold transition-all text-xs border ${
                  isHighest || !isConnected || isSyncing
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border-slate-700'
                    : 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-brand-green/20 hover:text-brand-green hover:border-brand-green/50 cursor-pointer shadow-md'
                }`}
              >
                <div className="flex items-center space-x-1">
                  <Gavel className="w-3 h-3" />
                  <span className="truncate w-24 text-center">{team.teamName}</span>
                </div>
              </motion.button>
            );
          })}
        </div>
      ) : (
        <div className="text-sm text-slate-500 text-center">No teams available to bid.</div>
      )}
    </div>
  );
};

export default BidControls;
