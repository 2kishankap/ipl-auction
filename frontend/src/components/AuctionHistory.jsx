import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { History, XCircle, CheckCircle } from 'lucide-react';

const AuctionHistory = () => {
  const { soldEvent, unsoldEvent, revertEvent } = useSocket();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (soldEvent) {
      setHistory(prev => [{ type: 'SOLD', ...soldEvent }, ...prev].slice(0, 50));
    }
  }, [soldEvent]);

  useEffect(() => {
    if (unsoldEvent) {
      setHistory(prev => [{ type: 'UNSOLD', ...unsoldEvent }, ...prev].slice(0, 50));
    }
  }, [unsoldEvent]);

  useEffect(() => {
    if (revertEvent && history.length > 0) {
      setHistory(prev => prev.slice(1));
    }
  }, [revertEvent]);

  const formatMoney = (amount) => (amount ? (amount / 10000000).toFixed(2) + ' Cr' : '0 Cr');

  return (
    <div className="mt-8 w-full glass-panel flex flex-col max-h-[200px] overflow-hidden">
      <div className="bg-slate-900/80 p-3 border-b border-slate-700/50 flex items-center sticky top-0">
        <History className="w-4 h-4 text-brand-blue mr-2" />
        <h3 className="text-sm font-bold text-slate-200 tracking-wider">AUCTION HISTORY</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
        {history.length === 0 ? (
          <div className="text-center text-slate-500 text-xs py-4">No recent activity</div>
        ) : (
          history.map((item, i) => (
            <div 
              key={i} 
              className={`flex items-center justify-between p-2 rounded text-sm ${
                item.type === 'SOLD' ? 'bg-brand-green/10 border border-brand-green/20' : 'bg-brand-red/10 border border-brand-red/20'
              }`}
            >
              <div className="flex items-center space-x-2 overflow-hidden">
                {item.type === 'SOLD' ? <CheckCircle className="w-4 h-4 text-brand-green flex-shrink-0" /> : <XCircle className="w-4 h-4 text-brand-red flex-shrink-0" />}
                <span className="font-bold text-white truncate w-32">{item.player?.name}</span>
                {item.type === 'SOLD' && (
                  <>
                    <span className="text-slate-500 text-xs">to</span>
                    <span className="text-brand-blue font-semibold truncate w-24">{item.team?.teamName}</span>
                  </>
                )}
              </div>
              <div className="font-bold flex-shrink-0">
                {item.type === 'SOLD' ? (
                  <span className="text-brand-green">{formatMoney(item.soldPrice)}</span>
                ) : (
                  <span className="text-brand-red text-xs uppercase tracking-wider">Unsold</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AuctionHistory;
