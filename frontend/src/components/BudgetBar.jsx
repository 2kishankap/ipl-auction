import React from 'react';

const BudgetBar = ({ purseRemaining }) => {
  // Convert basic unit to Crores
  const purseLeftCr = purseRemaining / 10000000;
  
  // Calculate percentage Left (Total is 100Cr, so purseLeftCr is exactly the percentage left)
  // E.g., 62.5 Cr = 62.5%
  const percentageLeft = Math.min(Math.max(purseLeftCr, 0), 100);

  let barColorClass = '';
  let glowClass = '';

  if (purseLeftCr > 60) {
    barColorClass = 'bg-brand-green';
  } else if (purseLeftCr >= 30) {
    barColorClass = 'bg-yellow-500';
  } else {
    barColorClass = 'bg-brand-red';
  }

  if (purseLeftCr < 20) {
    glowClass = 'shadow-[0_0_10px_rgba(239,68,68,0.8)]'; // slight red glow using tailwind arbitrary shadow
  }

  return (
    <div className="w-full mt-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Budget Status</span>
      </div>
      
      {/* Container Track */}
      <div className={`relative w-full h-5 bg-slate-800 rounded-full overflow-hidden border border-slate-700 ${glowClass}`}>
        
        {/* Animated Progress Bar */}
        <div 
          className={`h-full ${barColorClass} transition-all duration-700 ease-in-out`} 
          style={{ width: `${percentageLeft}%` }}
        />
        
        {/* Text Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[10px] font-bold text-white drop-shadow-md tracking-wider">
            ₹ {purseLeftCr.toFixed(2)} Cr Left
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetBar;
