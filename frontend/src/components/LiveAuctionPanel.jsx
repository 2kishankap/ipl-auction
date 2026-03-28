import React from 'react';
import { useSocket } from '../context/SocketContext';
import BidControls from './BidControls';
import AuctionHistory from './AuctionHistory';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuctionSounds } from '../hooks/useAuctionSounds';
import { useSoldAnimation } from '../hooks/useSoldAnimation';
import { Volume2, VolumeX } from 'lucide-react';
import Timer from './Timer';

const LiveAuctionPanel = ({ teams, startAuction }) => {
  const { auctionState, soldEvent } = useSocket();
  const { currentPlayer, currentBid, highestBidderTeamName, auctionStatus } = auctionState;

  const { isMuted, toggleMute, playBidSound, playSoldSound } = useAuctionSounds();
  const { showHammer, animationData } = useSoldAnimation(auctionStatus, soldEvent);

  const [flashBid, setFlashBid] = React.useState(false);

  React.useEffect(() => {
    if (currentBid > 0 && auctionStatus === 'LIVE') {
      playBidSound();
      setFlashBid(true);
      const timer = setTimeout(() => setFlashBid(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentBid, auctionStatus, playBidSound]);

  React.useEffect(() => {
    if (auctionStatus === 'SOLD') {
      playSoldSound();
    }
  }, [auctionStatus, playSoldSound]);

  const formatMoney = (amount) => (amount ? (amount / 10000000).toFixed(2) + ' Cr' : '0 Cr');

  if (!currentPlayer) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-500">
        <h2 className="text-2xl tracking-widest uppercase">No Player on the Block</h2>
      </div>
    );
  }

  return (
    <div className="w-full flex w-full h-full flex-col px-2 md:px-4 py-2 items-center">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentPlayer._id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center w-full"
        >
          {/* Status Badges */}
          <div className="flex space-x-2 mb-2">
            <span className="px-2 py-0.5 bg-brand-blue/20 text-brand-blue rounded-full border border-brand-blue/50 text-[10px] font-bold tracking-widest uppercase">
              {currentPlayer.role}
            </span>
            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold tracking-widest uppercase ${
              currentPlayer.isOverseas ? 'bg-orange-500/20 text-orange-400 border-orange-500/50' : 'bg-brand-green/20 text-brand-green border-brand-green/50'
            }`}>
              {currentPlayer.isOverseas ? 'OVERSEAS' : 'INDIAN'}
            </span>
            <span className="px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded-full border border-slate-600 text-[10px] font-bold tracking-widest uppercase">
              {currentPlayer.country}
            </span>
          </div>

          {/* Player Name */}
          <h2 className="text-3xl md:text-4xl font-black text-white text-center tracking-tight text-glow mb-1">
            {currentPlayer.name.toUpperCase()}
          </h2>

          <h3 className="text-sm md:text-base text-slate-400 tracking-widest font-semibold mb-2">
            {currentPlayer.iplTeam}
          </h3>

          {/* Scouting Stats Grid */}
          <div className="flex space-x-4 mb-4 text-center text-slate-300">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-0.5">Matches</span>
              <span className="text-base font-bold">{currentPlayer.stats?.matches || '100+'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Strike Rate</span>
              <span className="text-xl font-bold">{currentPlayer.stats?.strikeRate || '145.5'}</span>
            </div>
            {(currentPlayer.role === 'ALL' || currentPlayer.role === 'BAT' || currentPlayer.role === 'WK') && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Average</span>
                <span className="text-xl font-bold">{currentPlayer.stats?.average || '35.4'}</span>
              </div>
            )}
            {(currentPlayer.role === 'ALL' || currentPlayer.role === 'BOWL') && (
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Economy</span>
                <span className="text-xl font-bold">{currentPlayer.stats?.economy || '7.85'}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">Tier</span>
              <span className="text-xl font-bold text-brand-blue">{currentPlayer.basePrice >= 20000000 ? 'MARQUEE' : 'PREMIUM'}</span>
            </div>
          </div>

          {/* Sound Control Toggle */}
          <div className="w-full max-w-2xl flex justify-end mb-2 pr-2">
             <button onClick={toggleMute} className="flex items-center space-x-2 text-xs font-bold tracking-widest hover:text-white transition group border border-slate-700/50 px-3 py-1 rounded-full bg-slate-800/50">
                {isMuted ? (
                    <><VolumeX className="w-4 h-4 text-brand-red group-hover:scale-110 transition" /> <span className="text-slate-500">SOUND OFF</span></>
                ) : (
                    <><Volume2 className="w-4 h-4 text-brand-green group-hover:scale-110 transition" /> <span className="text-brand-green">SOUND ON</span></>
                )}
             </button>
          </div>

          {/* Bid Information Box */}
          <div className="bg-slate-900 w-full max-w-2xl rounded-2xl p-4 border border-slate-700 relative overflow-hidden flex flex-col items-center shadow-2xl">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1">
               Current Bid
            </div>
            
            <motion.div 
               animate={flashBid ? { scale: [1, 1.15, 1], color: "#34d399", textShadow: "0 0 30px #10b981" } : {}}
               transition={{ duration: 0.3 }}
               className="text-4xl font-black text-brand-green glow-green flex items-center"
            >
               ₹ {formatMoney(currentBid)}
            </motion.div>
            
            <div className="mt-2 flex flex-col items-center">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Highest Bidder</span>
              <span className={`text-sm md:text-base font-bold px-4 py-1.5 rounded transition-colors ${
                highestBidderTeamName ? 'bg-brand-blue/20 text-brand-blue border border-brand-blue/50' : 'bg-slate-800 text-slate-500'
              }`}>
                {highestBidderTeamName || 'NO BIDS YET'}
              </span>
            </div>

            {/* Auction Status Badges & Timer */}
            {auctionStatus === 'SOLD' && (
              <motion.div 
                initial={{ scale: 2, opacity: 0, rotate: -20 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-sm z-20"
              >
                <div className="text-6xl font-black text-brand-red tracking-widest border-4 border-brand-red px-8 py-4 rounded-xl rotate-[-15deg] glow-red">
                  SOLD!
                </div>
                <p className="mt-6 text-2xl text-white font-bold">To {highestBidderTeamName} for {formatMoney(currentBid)}</p>
              </motion.div>
            )}

            <Timer timerEndTime={auctionState.timerEndTime} />

            {/* Hammer Overlay */}
            <AnimatePresence>
               {showHammer && animationData && (
                 <motion.div 
                   initial={{ opacity: 0, scale: 0.8 }}
                   animate={{ opacity: 1, scale: 1 }}
                   exit={{ opacity: 0, scale: 1.1 }}
                   className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm"
                 >
                   <motion.div 
                     initial={{ rotate: -45, y: -100, scale: 2 }}
                     animate={{ rotate: 15, y: -10, scale: 1.5 }}
                     transition={{ type: "spring", stiffness: 300, damping: 10 }}
                     className="text-8xl mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]"
                   >
                     🔨
                   </motion.div>
                   <motion.div 
                     initial={{ scale: 0.5, opacity: 0, y: 50 }}
                     animate={{ scale: 1, opacity: 1, y: 0 }}
                     transition={{ delay: 0.15, type: "spring" }}
                     className="bg-brand-green/90 text-white px-8 py-4 rounded-2xl text-2xl font-black tracking-widest border-4 border-white shadow-[0_0_50px_rgba(16,185,129,0.8)] text-center"
                   >
                     SOLD TO {animationData.team?.teamName?.toUpperCase() || highestBidderTeamName} <br/>
                     <span className="text-3xl mt-2 block glow-white">₹ {(animationData.soldPrice ? (animationData.soldPrice / 10000000).toFixed(2) : (currentBid / 10000000).toFixed(2))} Cr</span>
                   </motion.div>
                 </motion.div>
               )}
            </AnimatePresence>

          </div>

        </motion.div>
      </AnimatePresence>

      <div className="flex w-full mt-2 space-x-6">
        <div className="flex-1">
          {auctionStatus === 'WAITING' ? (
             <button 
               onClick={startAuction} 
               className="w-full h-full min-h-[80px] bg-brand-green/20 hover:bg-brand-green/30 border-2 border-brand-green rounded-xl text-2xl font-black text-brand-green glow-green transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] tracking-widest uppercase cursor-pointer"
             >
               START AUCTION
             </button>
          ) : (
             <BidControls player={currentPlayer} currentBid={currentBid} teams={teams} />
          )}
        </div>
        <div className="flex-1 hidden md:block max-w-[400px]">
          <AuctionHistory />
        </div>
      </div>

    </div>
  );
};

export default LiveAuctionPanel;
