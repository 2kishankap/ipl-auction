import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import { Maximize, Minimize, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Timer from './Timer';
import AuctionHistory from './AuctionHistory';
import { useSoldAnimation } from '../hooks/useSoldAnimation';
import { useAuctionSounds } from '../hooks/useAuctionSounds';

const StageAuctionView = () => {
  const { auctionState, soldEvent } = useSocket();
  const { currentPlayer, currentBid, highestBidderTeamName, auctionStatus } = auctionState;
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const { playSoldSound, playBidSound } = useAuctionSounds();
  const { showHammer, animationData } = useSoldAnimation(auctionStatus, soldEvent);

  const [flashBid, setFlashBid] = useState(false);

  useEffect(() => {
    if (currentBid > 0 && auctionStatus === 'LIVE') {
      playBidSound();
      setFlashBid(true);
      const timer = setTimeout(() => setFlashBid(false), 300);
      return () => clearTimeout(timer);
    }
  }, [currentBid, auctionStatus, playBidSound]);

  useEffect(() => {
    if (auctionStatus === 'SOLD') {
      playSoldSound();
    }
  }, [auctionStatus, playSoldSound]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = async (e) => {
      // Ignore if typing in an input
      if (document.activeElement.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();
      try {
        if (key === 'n') {
          await api.post(`/auction/${auctionId}/next`);
        } else if (key === 's') {
          // Force sold or start depending on state
          if (auctionStatus === 'WAITING' && currentPlayer) {
             await api.post(`/auction/${auctionId}/start`);
          } else if (auctionStatus === 'LIVE' && highestBidderTeamName) {
             await api.post(`/auction/${auctionId}/sold`);
          }
        } else if (key === 'u') {
          if (auctionStatus === 'LIVE' || auctionStatus === 'WAITING') {
              await api.post(`/auction/${auctionId}/unsold`);
          }
        } else if (key === 'f') {
          toggleFullscreen();
        }
      } catch (err) {
        console.error(err);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [auctionStatus, currentPlayer, highestBidderTeamName]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const formatMoney = (amount) => (amount ? (amount / 10000000).toFixed(2) + ' Cr' : '0 Cr');

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden flex flex-col items-center justify-center font-sans tracking-widest text-white selection:bg-brand-green selection:text-white">
      {/* Stadium Spotlight Background CSS Effect */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at top, rgba(56, 189, 248, 0.2) 0%, transparent 70%), radial-gradient(circle at center, rgba(16, 185, 129, 0.1) 0%, transparent 60%)'
      }}>
        <div className="absolute top-[-20%] left-[20%] w-px h-[140%] bg-gradient-to-b from-transparent via-white to-transparent opacity-20 rotate-45 transform origin-top blur-[2px]"></div>
        <div className="absolute top-[-20%] right-[20%] w-px h-[140%] bg-gradient-to-b from-transparent via-white to-transparent opacity-20 -rotate-45 transform origin-top blur-[2px]"></div>
      </div>

      <button onClick={toggleFullscreen} className="absolute top-6 right-6 z-50 text-slate-500 hover:text-white transition bg-slate-900/50 p-3 rounded-full border border-slate-700">
        {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
      </button>

      <Link to="/" className="absolute top-6 left-6 z-50 p-3 bg-slate-900/50 text-slate-500 hover:text-white hover:bg-slate-700 rounded-full transition border border-slate-700">
         <Home className="w-6 h-6" />
      </Link>

      <div className="absolute top-6 left-24 z-50 text-slate-600 font-mono text-xs hidden md:flex h-12 items-center">
        [N] Next | [S] Start/Sold | [U] Unsold | [F] Fullscreen
      </div>

      {!currentPlayer ? (
        <div className="z-10 text-6xl text-slate-600 font-black tracking-tighter uppercase text-center animate-pulse drop-shadow-2xl">
          IPL AUCTION WAITING
        </div>
      ) : (
        <div className="z-10 w-full max-w-[90vw] flex flex-col items-center justify-center">
          
          <div className="flex space-x-4 mb-8">
             <span className="text-2xl md:text-3xl font-black text-brand-blue uppercase px-6 py-2 border-2 border-brand-blue/30 rounded-full shadow-[0_0_20px_rgba(56,189,248,0.2)]">
               {currentPlayer.role}
             </span>
             <span className="text-2xl md:text-3xl font-black text-slate-300 uppercase px-6 py-2 border-2 border-slate-600/50 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.05)]">
               {currentPlayer.country}
             </span>
          </div>

          {/* Player Name */}
          <h1 className="text-[6rem] md:text-[8rem] leading-none font-black text-center text-glow mb-4 tracking-tighter w-full truncate">
            {currentPlayer.name.toUpperCase()}
          </h1>
          
          <h2 className="text-3xl md:text-5xl text-slate-400 tracking-widest font-semibold mb-12">
            {currentPlayer.iplTeam}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 text-center text-slate-300 mb-16 w-full max-w-5xl bg-slate-900/40 p-10 rounded-3xl border border-slate-700/50 backdrop-blur-md shadow-2xl">
              <div className="flex flex-col">
                <span className="text-xl uppercase font-bold text-slate-500 mb-2 tracking-widest">Base</span>
                <span className="text-4xl font-black text-slate-100">{formatMoney(currentPlayer.basePrice)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl uppercase font-bold text-slate-500 mb-2 tracking-widest">Matches</span>
                <span className="text-4xl font-black text-slate-100">{currentPlayer.stats?.matches || '100+'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl uppercase font-bold text-slate-500 mb-2 tracking-widest">Strike Rate</span>
                <span className="text-4xl font-black text-brand-blue drop-shadow-[0_0_10px_rgba(56,189,248,0.5)]">{currentPlayer.stats?.strikeRate || '145.5'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl uppercase font-bold text-slate-500 mb-2 tracking-widest">Average</span>
                <span className="text-4xl font-black text-slate-100">{currentPlayer.stats?.average || '35.4'}</span>
              </div>
          </div>

          <div className="relative flex flex-col items-center w-full">
            <span className="text-2xl text-slate-500 font-bold tracking-[0.5em] uppercase mb-4">Current Bid</span>
            <motion.div 
               animate={flashBid ? { scale: [1, 1.2, 1], color: "#10b981", textShadow: "0 0 50px #10b981" } : {}}
               transition={{ duration: 0.4 }}
               className="text-[8rem] md:text-[12rem] leading-none font-black text-brand-green glow-green"
            >
               ₹ {formatMoney(currentBid)}
            </motion.div>
            
            <div className={`mt-6 text-4xl md:text-6xl font-black transition-colors ${
              highestBidderTeamName ? 'text-brand-blue drop-shadow-[0_0_20px_rgba(56,189,248,0.8)]' : 'text-slate-600'
            }`}>
               {highestBidderTeamName ? `${highestBidderTeamName}` : 'AWAITING BIDS'}
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2 scale-150 transform origin-right">
              <Timer timerEndTime={auctionState.timerEndTime} />
            </div>
          </div>

        </div>
      )}

      {/* Hammer Overlay */}
      <AnimatePresence>
         {showHammer && animationData && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             className="absolute inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center bg-black/80 backdrop-blur-xl"
           >
             <motion.div 
               initial={{ rotate: -50, y: -200, scale: 3 }}
               animate={{ rotate: 15, y: -20, scale: 2 }}
               transition={{ type: "spring", stiffness: 400, damping: 15 }}
               className="text-[15rem] mb-12 drop-shadow-[0_0_80px_rgba(255,255,255,1)]"
             >
               🔨
             </motion.div>
             <motion.div 
               initial={{ scale: 0.2, opacity: 0, y: 100 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               transition={{ delay: 0.15, type: "spring" }}
               className="bg-brand-green text-white px-20 py-8 rounded-full text-6xl font-black tracking-widest border-8 border-white shadow-[0_0_100px_rgba(16,185,129,1)] text-center mix-blend-screen"
             >
               SOLD TO {animationData.team?.teamName?.toUpperCase() || highestBidderTeamName} <br/>
               <span className="text-7xl mt-6 block drop-shadow-[0_0_30px_rgba(255,255,255,0.8)]">₹ {(animationData.soldPrice ? (animationData.soldPrice / 10000000).toFixed(2) : (currentBid / 10000000).toFixed(2))} Cr</span>
             </motion.div>
           </motion.div>
         )}
      </AnimatePresence>

      <div className="absolute bottom-6 w-full max-w-4xl opacity-50 hover:opacity-100 transition-opacity">
        <AuctionHistory />
      </div>

    </div>
  );
};

export default StageAuctionView;
