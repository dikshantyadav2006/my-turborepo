import { useState, useEffect, useCallback, useRef, useSyncExternalStore } from 'react';
import { TypingEngine } from '../engine/typingEngine';

export const useTypingEngine = (text, onComplete) => {
  // Use a ref to hold the engine instance to prevent React from seeing its mutations
  const engineRef = useRef(null);
  
  // We use a state only for the "snapshot" that components will consume
  const [snapshot, setSnapshot] = useState(() => {
    // If engine is already created (e.g. during re-renders or HMR), get its snapshot
    if (engineRef.current) return engineRef.current.getSnapshot();
    return null;
  });

  if (!engineRef.current) {
    engineRef.current = new TypingEngine(text, {
      onComplete: (finalStats) => {
        setSnapshot(finalStats);
        if (onComplete) onComplete(finalStats);
      }
    });
    // Set initial snapshot for the very first render cycle
    if (!snapshot) {
      setSnapshot(engineRef.current.getSnapshot());
    }
  }

  // Update engine text if it changes externally
  useEffect(() => {
    if (engineRef.current.text !== text) {
      engineRef.current.reset(text);
      setSnapshot(engineRef.current.getSnapshot());
    }
  }, [text]);

  const handleKeyDown = useCallback((e) => {
    const engine = engineRef.current;
    if (engine.isFinished) return;

    // 1. Critical Fix: Prevent browser defaults
    if (e.key === ' ' || e.key === 'Tab') {
      e.preventDefault();
    }

    // 2. Handle KeyDown in engine
    engine.handleKeyDown(e.key);

    // 3. Update snapshot so React can render the new character
    // Note: This is still a render, but the engine handles the logic outside React.
    // In Phase 2, we will optimize TypingArea to minimize the cost of this render.
    setSnapshot(engine.getSnapshot());
  }, []);

  const reset = useCallback(() => {
    engineRef.current.reset(text);
    setSnapshot(engineRef.current.getSnapshot());
  }, [text]);

  // Initial snapshot
  useEffect(() => {
    setSnapshot(engineRef.current.getSnapshot());
  }, []);

  // Global listener for Tab reset
  useEffect(() => {
    const handleGlobalKey = (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        reset();
      }
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, [reset]);

  return {
    userInput: snapshot?.input || "",
    wpm: snapshot?.wpm || 0,
    rawWpm: snapshot?.rawWpm || 0,
    accuracy: snapshot?.accuracy || 100,
    errors: snapshot?.errors || 0,
    currentIndex: snapshot?.currentIndex || 0,
    isFinished: snapshot?.isFinished || false,
    keyTimings: snapshot?.keyTimings || [],
    startTime: snapshot?.startTime || null,
    handleKeyDown,
    reset,
    engine: engineRef.current 
  };
};
