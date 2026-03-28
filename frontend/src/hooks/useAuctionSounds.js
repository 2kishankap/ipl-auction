import { useState, useEffect, useCallback, useRef } from 'react';

// Using synthetic Web Audio API to avoid external file dependencies, ensuring it always works!
const createBeep = (audioCtx, type = 'sine', freq = 800, duration = 0.1, vol = 0.1) => {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
};

// Deep hammer strike sound
const createHammerBang = (audioCtx) => {
  if (!audioCtx) return;
  
  // Oscillator for the low thud
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'square';
  osc.frequency.setValueAtTime(150, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.3);
  
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.5);

  // Noise burst for the "crack" impact
  const bufferSize = audioCtx.sampleRate * 0.2; // 0.2 seconds
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 1000;
  
  const noiseGain = audioCtx.createGain();
  noiseGain.gain.setValueAtTime(0.4, audioCtx.currentTime);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
  
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(audioCtx.destination);
  
  noise.start();
};

export const useAuctionSounds = () => {
  const [isMuted, setIsMuted] = useState(true); // Browsers block auto-play, default muted until user interacts
  const audioCtxRef = useRef(null);

  useEffect(() => {
    // Initialize exactly once upon user interaction/mount
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext && !audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
    }
  }, []);

  const playBidSound = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    
    // High pitched double-click sound for bids
    createBeep(audioCtxRef.current, 'sine', 1200, 0.05, 0.1);
    setTimeout(() => {
        createBeep(audioCtxRef.current, 'sine', 1600, 0.1, 0.1);
    }, 60);

  }, [isMuted]);

  const playSoldSound = useCallback(() => {
    if (isMuted || !audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();
    
    // Heavy wooden hammer crack
    createHammerBang(audioCtxRef.current);
    
  }, [isMuted]);

  const toggleMute = () => {
      setIsMuted(prev => {
          const next = !prev;
          if (!next && audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
              audioCtxRef.current.resume();
          }
          return next;
      });
  };

  return { isMuted, toggleMute, playBidSound, playSoldSound };
};
