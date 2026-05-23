import { useCallback, useRef, useEffect } from 'react';
import { useTypingStore } from '../store/typingStore';

// Singleton AudioContext to avoid overhead and memory leaks
let audioCtx = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
};

export const useTypingSound = () => {
  const { soundEnabled } = useTypingStore();
  const soundsRef = useRef({});

  // Initialize sounds (can be oscillators or decoded buffers)
  const playSound = useCallback((type = 'keypress') => {
    if (!soundEnabled) return;

    const ctx = getAudioCtx();
    
    // Ensure context is resumed (browsers block auto-play)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (type === 'keypress') {
      // Clean "pop" sound
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.04, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.05);
    } else if (type === 'error') {
      // Low "thud" for errors
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(150, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.1);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.1);
    } else if (type === 'success') {
      // Ding for session completion
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
      oscillator.start();
      oscillator.stop(ctx.currentTime + 0.4);
    }
  }, [soundEnabled]);

  return { playSound };
};
