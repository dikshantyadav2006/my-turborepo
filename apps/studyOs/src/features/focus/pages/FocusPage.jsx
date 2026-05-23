import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Minimize2, 
  Play, 
  Pause, 
  VolumeX, 
  Volume2,
  Wind,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimerStore } from '../../timer/store/timerStore';
import Counter from '../../timer/components/Counter';
import { clsx } from 'clsx';

const FocusMode = () => {
  const navigate = useNavigate();
  const { 
    mode, 
    timeLeft, 
    isActive, 
    stopwatchTime, 
    isStopwatchActive, 
    startTimer, 
    pauseTimer, 
    syncTime 
  } = useTimerStore();
  
  const [isMuted, setIsMuted] = useState(false);
  const [fontSize, setFontSize] = useState(240);

  const currentTime = mode === 'stopwatch' ? stopwatchTime : timeLeft;
  const currentActive = mode === 'stopwatch' ? isStopwatchActive : isActive;

  // Responsive font size
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 640) setFontSize(64);
      else if (width < 768) setFontSize(80);
      else if (width < 1024) setFontSize(100);
      else if (width < 1280) setFontSize(120);
      else setFontSize(140);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Timer sync
  useEffect(() => {
    syncTime();
    let interval;
    if (currentActive) {
      interval = setInterval(syncTime, 200);
    }
    return () => clearInterval(interval);
  }, [currentActive, syncTime]);

  // Wake Lock API
  useEffect(() => {
    let wakeLock = null;
    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLock = await navigator.wakeLock.request('screen');
        }
      } catch (err) {
        console.error(`${err.name}, ${err.message}`);
      }
    };
    
    if (currentActive) requestWakeLock();
    return () => wakeLock?.release();
  }, [currentActive]);

  const h = Math.floor(currentTime / 3600);
  const m = Math.floor((currentTime % 3600) / 60);
  const s = currentTime % 60;
  const showHours = h > 0 || mode === 'stopwatch';
  const pad = (num) => num.toString().padStart(2, '0');
  
  // Tailwind zinc-950 is #09090b
  const bgColor = "#09090b";

  return (
    <div className="fixed inset-0 bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center z-50">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
      </div>

      {/* Floating UI */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-10 w-full px-4"
      >
        <div className="text-center space-y-4 w-full flex flex-col items-center">
          <p className="text-zinc-500 font-medium tracking-widest uppercase text-xs flex items-center gap-2">
            {mode === 'stopwatch' ? <Clock size={14} /> : <Wind size={14} />}
            {mode === 'stopwatch' ? 'Stopwatch Mode' : 'Deep Work Mode'}
          </p>
          
          {/* Glassmorphic Container for Timer */}
          <div className={clsx(
            "relative px-4 py-8 sm:px-8 sm:py-12 md:p-16 rounded-[3rem] md:rounded-[4rem] w-full max-w-full flex justify-center",
            "bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05]",
            "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4),_inset_0_1px_0_rgba(255,255,255,0.05)]"
          )}>
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-30 rounded-[inherit] overflow-hidden" />
            
            <div className="flex justify-center items-center w-full font-black tracking-tighter select-none relative z-10 drop-shadow-2xl whitespace-nowrap">
              {showHours && (
                <>
                  <Counter value={pad(h)} fontSize={fontSize} textColor="currentColor" gradientFrom={bgColor} />
                  <span className="opacity-80 mx-2 sm:mx-4" style={{ fontSize: fontSize * 0.8, paddingBottom: fontSize * 0.1 }}>:</span>
                </>
              )}
              <Counter value={pad(m)} fontSize={fontSize} textColor="currentColor" gradientFrom={bgColor} />
              <span className="opacity-80 mx-2 sm:mx-4" style={{ fontSize: fontSize * 0.8, paddingBottom: fontSize * 0.1 }}>:</span>
              <Counter value={pad(s)} fontSize={fontSize} textColor="currentColor" gradientFrom={bgColor} />
            </div>
          </div>
        </div>

        {/* Controls inside a glass pill */}
        <div className="flex items-center gap-6 md:gap-8 bg-white/[0.03] backdrop-blur-xl border border-white/[0.05] px-8 py-4 rounded-full shadow-2xl">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className="p-3 text-zinc-500 hover:text-zinc-100 hover:bg-white/10 rounded-full transition-all"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>

          <button 
            onClick={currentActive ? pauseTimer : startTimer}
            className={clsx(
              "w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_-5px_rgba(255,255,255,0.2)]",
              currentActive ? "bg-zinc-800 text-zinc-100 border border-white/10" : "bg-zinc-100 text-zinc-950"
            )}
          >
            {currentActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>

          <button 
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              navigate(-1);
            }}
            className="p-3 text-zinc-500 hover:text-zinc-100 hover:bg-white/10 rounded-full transition-all"
          >
            <Minimize2 size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FocusMode;
