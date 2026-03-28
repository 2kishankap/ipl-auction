import { useState, useCallback, useEffect } from 'react';

export const useSoldAnimation = (auctionStatus, soldEvent) => {
  const [showHammer, setShowHammer] = useState(false);
  const [animationData, setAnimationData] = useState(null); // holds team name and price for floating text

  useEffect(() => {
    if (auctionStatus === 'SOLD' && soldEvent) {
      // Trigger the hammer sequence
      setShowHammer(true);
      setAnimationData(soldEvent);

      // Clean up the hammer visual after exactly 3.5 seconds
      const timer = setTimeout(() => {
        setShowHammer(false);
      }, 3500);

      return () => clearTimeout(timer);
    } else {
      setShowHammer(false);
    }
  }, [auctionStatus, soldEvent]);

  return { showHammer, animationData };
};
