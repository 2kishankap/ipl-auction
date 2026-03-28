import React from 'react';
import { Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

const StatBadge = ({ label, current, max, warningThreshold = 1, tooltipMsg }) => {
  const isMax = current >= max;
  const isWarning = current === max - warningThreshold;

  let colorClass = 'text-slate-300 border-slate-700 bg-slate-800/50';
  let Icon = CheckCircle2;
  let iconColor = 'text-brand-green';

  if (isMax) {
    colorClass = 'text-brand-red border-brand-red/50 bg-brand-red/10 animate-pulse';
    Icon = Lock;
    iconColor = 'text-brand-red';
  } else if (isWarning) {
    colorClass = 'text-yellow-500 border-yellow-500/50 bg-yellow-500/10';
    Icon = AlertTriangle;
    iconColor = 'text-yellow-500';
  }

  return (
    <div 
      className={`relative group flex items-center justify-between px-3 py-2 rounded-lg border ${colorClass} transition-all`}
    >
      <div className="flex items-center">
        <Icon className={`w-3.5 h-3.5 mr-2 ${iconColor}`} />
        <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-bold ml-3">{current} / {max}</span>

      {isMax && tooltipMsg && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10 pointer-events-none border border-brand-red/50">
          {tooltipMsg}
        </div>
      )}
    </div>
  );
};

const SquadWarningPanel = ({ team }) => {
  if (!team || !team.playersBought) return null;

  const squadSize = team.playersBought.length;
  const overseas = team.overseasCount !== undefined ? team.overseasCount : team.playersBought.filter(p => p.isOverseas).length;
  
  const batWkCount = team.playersBought.filter(p => p.role === 'BAT' || p.role === 'WK').length;
  const allBowlCount = team.playersBought.filter(p => p.role === 'ALL' || p.role === 'BOWL').length;

  // Calculate IPL Team limits (max 2 from same team)
  const iplTeamCounts = {};
  team.playersBought.forEach(p => {
    if (p.iplTeam && p.iplTeam !== 'Unknown') {
      iplTeamCounts[p.iplTeam] = (iplTeamCounts[p.iplTeam] || 0) + 1;
    }
  });

  const maxIplTeamTriggers = Object.entries(iplTeamCounts).filter(([_, count]) => count >= 2);
  const warnIplTeamTriggers = Object.entries(iplTeamCounts).filter(([_, count]) => count === 1);

  return (
    <div className="w-full bg-slate-900/80 border border-slate-700/50 rounded-xl p-4 mb-4">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center">
        <ShieldAlertIcon className="w-4 h-4 mr-2 text-yellow-500" />
        Squad Composition Rules
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatBadge 
          label="Squad" 
          current={squadSize} 
          max={18} 
          tooltipMsg="Cannot bid — Squad is full"
        />
        <StatBadge 
          label="Overseas" 
          current={overseas} 
          max={6} 
          tooltipMsg="Cannot bid — Overseas limit reached"
        />
        <StatBadge 
          label="BAT + WK" 
          current={batWkCount} 
          max={9} 
          tooltipMsg="Cannot bid — Max Batters/WK reached"
        />
        <StatBadge 
          label="ALL + BOWL" 
          current={allBowlCount} 
          max={9} 
          tooltipMsg="Cannot bid — Max All-rounders/Bowlers reached"
        />
      </div>

      {/* IPL Team constraints feedback */}
      {(maxIplTeamTriggers.length > 0 || warnIplTeamTriggers.length > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {maxIplTeamTriggers.map(([tName]) => (
            <span key={tName} className="text-[9px] px-2 py-1 bg-brand-red/20 text-brand-red border border-brand-red/40 rounded uppercase font-bold flex items-center">
              <Lock className="w-2.5 h-2.5 mr-1" /> Max 2 reached for {tName}
            </span>
          ))}
          {warnIplTeamTriggers.map(([tName]) => (
            <span key={tName} className="text-[9px] px-2 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 rounded uppercase font-bold flex items-center">
              <AlertTriangle className="w-2.5 h-2.5 mr-1" /> 1 slot left for {tName}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Extracted mini icon for header
const ShieldAlertIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M12 8v4"/>
    <path d="M12 16h.01"/>
  </svg>
);

export default SquadWarningPanel;
