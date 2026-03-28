import React, { useState, useEffect } from 'react';

const Timer = ({ timerEndTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!timerEndTime) {
      setTimeLeft(0);
      return;
    }

    const calculateTime = () => {
      const now = new Date().getTime();
      const diff = timerEndTime - now;
      setTimeLeft(diff > 0 ? Math.ceil(diff / 1000) : 0);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 100);

    return () => clearInterval(interval);
  }, [timerEndTime]);

  if (!timerEndTime || timeLeft === 0) return null;

  const isDanger = timeLeft <= 5;

  return (
    <div className={`mt-4 px-6 py-2 rounded-full border-2 font-bold text-3xl transition-all duration-300 ${
      isDanger 
        ? 'border-brand-red bg-brand-red/20 text-brand-red glow-red animate-pulse' 
        : 'border-brand-blue bg-brand-blue/20 text-brand-blue glow-blue'
    }`}>
      {timeLeft}s
    </div>
  );
};

export default Timer;
