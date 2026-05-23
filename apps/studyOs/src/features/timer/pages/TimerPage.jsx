import React, { useEffect, useRef, useState } from 'react';
import { SEO, schemaBreadcrumb } from '../../../components/seo/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2,
  Minimize2,
  Coffee, 
  Brain, 
  Timer as TimerIcon,
  Clock,
  MonitorOff,
  MonitorPlay,
  Volume2,
  Flag,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTimerStore } from '../store/timerStore';
import { clsx } from 'clsx';
import Counter from '../components/Counter';

const TimestampsPanel = ({ timestamps, deleteTimestamp, handleNoteChange, formatTimestamp, clearTimestamps }) => (
  <div className={clsx(
    "flex flex-col h-full overflow-hidden transition-all duration-700 ease-out",
    
    // Mobile: Neomorphism (Debossed / Inset)
    "bg-background rounded-[2rem]",
    "shadow-[inset_6px_6px_12px_rgba(0,0,0,0.5),_inset_-6px_-6px_12px_rgba(255,255,255,0.03)]",
    "border border-white/[0.02]",

    // Desktop: Glassmorphism (Frosted floating panel)
    "lg:bg-white/[0.03] lg:dark:bg-black/[0.2] lg:backdrop-blur-3xl lg:rounded-[2.5rem]",
    "lg:shadow-[0_16px_40px_-12px_rgba(0,0,0,0.5),_inset_0_1px_0_rgba(255,255,255,0.1)]",
    "lg:border-white/[0.08]"
  )}>
    <div className="flex items-center justify-between border-b border-border/10 p-5 bg-black/5">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold flex items-center gap-2 text-foreground/80">
          <Flag size={14} className="text-primary" />
          Timestamps
        </h3>
        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-md">
          {timestamps.length}
        </span>
      </div>
      {timestamps.length > 0 && (
        <button 
          onClick={clearTimestamps}
          className="text-xs font-medium text-muted-foreground hover:text-destructive transition-colors bg-secondary/30 hover:bg-secondary/60 px-2 py-1 rounded-md"
        >
          Clear All
        </button>
      )}
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar max-h-[50vh] lg:max-h-[60vh]">
      {timestamps.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 space-y-3 py-12">
          <Flag size={32} strokeWidth={1.5} />
          <p className="text-sm">No timestamps yet</p>
        </div>
      ) : (
        timestamps.map((ts) => (
          <motion.div 
            key={ts.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="group relative flex flex-col gap-2 p-3.5 bg-black/10 hover:bg-black/20 lg:bg-secondary/20 lg:hover:bg-secondary/40 rounded-2xl border border-white/[0.02] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-primary font-bold bg-primary/10 px-2.5 py-1 rounded-lg text-xs tracking-tight shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] lg:shadow-none">
                {formatTimestamp(ts.time)}
              </span>
              <button 
                onClick={() => deleteTimestamp(ts.id)}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1"
              >
                <X size={14} />
              </button>
            </div>
            <input 
              type="text"
              value={ts.note}
              onChange={(e) => handleNoteChange(ts.id, e)}
              placeholder="Add a short note..."
              className="bg-transparent border-none focus:ring-0 text-sm text-foreground/90 placeholder:text-muted-foreground/40 w-full p-0 leading-relaxed font-medium"
            />
          </motion.div>
        ))
      )}
    </div>
  </div>
);

const Timer = () => {
  const navigate = useNavigate();
  const { 
    timeLeft, 
    isActive, 
    mode, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    setMode, 
    syncTime,
    stopwatchTime,
    isStopwatchActive,
    timestamps,
    addTimestamp,
    updateTimestampNote,
    deleteTimestamp,
    clearTimestamps
  } = useTimerStore();

  const timerRef = useRef(null);
  const wakeLockRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isWakeLockActive, setIsWakeLockActive] = useState(false);
  const [baseFontSize, setBaseFontSize] = useState(160);
  const [isMobileTimestampsOpen, setIsMobileTimestampsOpen] = useState(false);

  const currentTime = mode === 'stopwatch' ? stopwatchTime : timeLeft;
  const currentActive = mode === 'stopwatch' ? isStopwatchActive : isActive;

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      if (width < 400) setBaseFontSize(48);
      else if (width < 500) setBaseFontSize(56);
      else if (width < 640) setBaseFontSize(64);
      else if (width < 768) setBaseFontSize(80);
      else if (width < 1024) setBaseFontSize(100);
      else if (width < 1280) setBaseFontSize(110);
      else setBaseFontSize(120);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    syncTime();
    
    if (isActive || isStopwatchActive) {
      timerRef.current = setInterval(() => {
        syncTime();
      }, 200);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, isStopwatchActive, syncTime]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  };

  const toggleWakeLock = async () => {
    if ('wakeLock' in navigator) {
      try {
        if (isWakeLockActive && wakeLockRef.current) {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
          setIsWakeLockActive(false);
        } else {
          wakeLockRef.current = await navigator.wakeLock.request('screen');
          setIsWakeLockActive(true);
          wakeLockRef.current.addEventListener('release', () => setIsWakeLockActive(false));
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (isWakeLockActive && document.visibilityState === 'visible') {
        if ('wakeLock' in navigator) wakeLockRef.current = await navigator.wakeLock.request('screen');
      } else if (document.visibilityState === 'visible') {
        syncTime();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isWakeLockActive, syncTime]);

  const modes = [
    { id: 'pomodoro', label: 'Pomodoro', icon: Brain },
    { id: 'shortBreak', label: 'Short Break', icon: Coffee },
    { id: 'longBreak', label: 'Long Break', icon: TimerIcon },
    { id: 'stopwatch', label: 'Stopwatch', icon: Clock },
  ];

  const h = Math.floor(currentTime / 3600);
  const m = Math.floor((currentTime % 3600) / 60);
  const s = currentTime % 60;
  const showHours = h > 0 || mode === 'stopwatch';
  const pad = (num) => num.toString().padStart(2, '0');

  const handleQuickTimestamp = () => {
    addTimestamp(''); 
    if (!isMobileTimestampsOpen) setIsMobileTimestampsOpen(true);
  };

  const handleNoteChange = (id, e) => {
    const text = e.target.value;
    const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    if (wordCount > 25) return; 
    updateTimestampNote(id, text);
  };

  const formatTimestamp = (seconds) => {
    const th = Math.floor(seconds / 3600);
    const tm = Math.floor((seconds % 3600) / 60);
    const ts = seconds % 60;
    if (th > 0) return `${pad(th)}:${pad(tm)}:${pad(ts)}`;
    return `${pad(tm)}:${pad(ts)}`;
  };

  const activeFontSize = mode === 'stopwatch' ? Math.floor(baseFontSize * 0.75) : baseFontSize;

  return (
    <div className="w-full flex justify-center min-h-[80vh] items-center relative pb-24 overflow-x-hidden">
      <SEO
        title="Study Timer – Pomodoro, Stopwatch & Focus Mode"
        description="Free Pomodoro timer, stopwatch, and deep work focus mode. Stay productive with session tracking, timestamps, and screen wake lock. Works offline."
        keywords={['pomodoro timer', 'study timer', 'focus mode', 'stopwatch', 'productivity timer', 'deep work', 'sai library timer', 'free online timer']}
        canonical="/timer"
        robots="index,follow"
        schema={schemaBreadcrumb([{ name: 'Home', url: '/' }, { name: 'Study Timer', url: '/timer' }])}
      />
      <div className={clsx(
        "flex flex-col lg:flex-row items-center w-full px-4 z-10 transition-all duration-700 ease-out",
        mode === 'stopwatch' ? "gap-4 lg:gap-8 max-w-[85rem]" : "max-w-4xl"
      )}>
        
        {/* Main Content Area */}
        <div className="flex flex-col items-center flex-1 w-full min-w-0 relative">
          
          {/* Mode Switcher */}
          <div className="flex p-1.5 bg-secondary/40 lg:bg-secondary/60 backdrop-blur-xl rounded-2xl gap-1 overflow-x-auto max-w-full no-scrollbar shadow-sm mb-6 lg:mb-12 border border-white/[0.05]">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap",
                  mode === m.id 
                    ? "bg-primary text-primary-foreground shadow-md scale-[1.02]" 
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <m.icon size={16} className="hidden sm:block" />
                <m.icon size={14} className="sm:hidden" />
                {m.label}
              </button>
            ))}
          </div>

          {/* Timer Display Container */}
          <div className="w-full flex justify-center px-2 sm:px-4">
            <motion.div
              key="rolling-clock-wrapper"
              layout
              className={clsx(
                "flex justify-center items-center font-black tracking-tighter select-none relative",
                "transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] w-full max-w-full",
                
                // Mobile: Neomorphism (Extruded Soft UI)
                "py-8 px-2 sm:py-10 sm:px-6 rounded-[2rem] sm:rounded-[3rem]",
                "bg-background",
                "shadow-[12px_12px_24px_rgba(0,0,0,0.5),_-10px_-10px_24px_rgba(255,255,255,0.02)]",
                "border border-white/[0.01]",
                
                // Desktop: Glassmorphism (Frosted floating glass)
                "lg:py-16 lg:px-8 lg:rounded-[4rem]",
                "lg:bg-white/[0.02] lg:dark:bg-black/[0.15]",
                "lg:backdrop-blur-3xl",
                "lg:border lg:border-white/[0.06]",
                "lg:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.4),_inset_0_1px_0_rgba(255,255,255,0.1)]"
              )}
            >
              {/* Subtle background glow for glassmorphism */}
              <div className="hidden lg:block absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-50 rounded-[inherit] overflow-hidden" />
              
              <div className="flex items-center justify-center relative z-10 w-full drop-shadow-md lg:drop-shadow-none whitespace-nowrap">
                {showHours && (
                  <>
                    <Counter value={pad(h)} fontSize={activeFontSize} textColor="hsl(var(--foreground))" />
                    <span className="opacity-80 mx-1 sm:mx-3 text-foreground" style={{ fontSize: activeFontSize * 0.8, paddingBottom: activeFontSize * 0.1 }}>:</span>
                  </>
                )}
                <Counter value={pad(m)} fontSize={activeFontSize} textColor="hsl(var(--foreground))" />
                <span className="opacity-80 mx-1 sm:mx-3 text-foreground" style={{ fontSize: activeFontSize * 0.8, paddingBottom: activeFontSize * 0.1 }}>:</span>
                <Counter value={pad(s)} fontSize={activeFontSize} textColor="hsl(var(--foreground))" />
              </div>
            </motion.div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-12 lg:mt-16 relative z-20">
            <button
              onClick={toggleWakeLock}
              title={isWakeLockActive ? "Screen stays on" : "Allow screen to turn off"}
              className={clsx(
                "p-4 rounded-full transition-all flex items-center justify-center",
                // Mobile Neomorphism buttons
                "bg-background shadow-[4px_4px_10px_rgba(0,0,0,0.4),_-4px_-4px_10px_rgba(255,255,255,0.02)]",
                // Desktop Glass buttons
                "lg:bg-secondary/40 lg:backdrop-blur-md lg:shadow-none lg:border lg:border-white/[0.05] lg:hover:bg-secondary/60",
                isWakeLockActive ? "text-primary shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)] lg:shadow-none" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isWakeLockActive ? <MonitorPlay size={22} /> : <MonitorOff size={22} />}
            </button>

            <button
              onClick={resetTimer}
              className={clsx(
                "p-4 rounded-full transition-all flex items-center justify-center text-muted-foreground hover:text-foreground",
                "bg-background shadow-[4px_4px_10px_rgba(0,0,0,0.4),_-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]",
                "lg:bg-secondary/40 lg:backdrop-blur-md lg:shadow-none lg:border lg:border-white/[0.05] lg:hover:bg-secondary/60 lg:active:shadow-none"
              )}
              title="Reset"
            >
              <RotateCcw size={22} />
            </button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={currentActive ? pauseTimer : startTimer}
              className={clsx(
                "rounded-full flex items-center justify-center shadow-xl hover:opacity-90 transition-all",
                "bg-primary text-primary-foreground",
                // Enhanced glow on desktop
                "lg:shadow-[0_0_30px_-5px_hsl(var(--primary))] lg:hover:shadow-[0_0_40px_-5px_hsl(var(--primary))]",
                mode === 'stopwatch' ? "w-20 h-20 sm:w-24 sm:h-24" : "w-20 h-20 sm:w-28 sm:h-28"
              )}
            >
              {currentActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1.5" fill="currentColor" />}
            </motion.button>

            {mode === 'stopwatch' && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleQuickTimestamp}
                className={clsx(
                  "w-14 h-14 sm:w-16 sm:h-16 text-foreground rounded-full flex items-center justify-center transition-all",
                  "bg-background shadow-[4px_4px_10px_rgba(0,0,0,0.4),_-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]",
                  "lg:bg-secondary/80 lg:backdrop-blur-md lg:shadow-none lg:border lg:border-white/[0.05] lg:hover:bg-secondary"
                )}
                title="Flag Timestamp"
              >
                <Flag size={22} />
              </motion.button>
            )}

            <button
              onClick={async () => {
                try {
                  if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
                } catch (err) {}
                navigate('/focus');
              }}
              className={clsx(
                "p-4 rounded-full transition-all flex items-center justify-center text-muted-foreground hover:text-foreground",
                "bg-background shadow-[4px_4px_10px_rgba(0,0,0,0.4),_-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]",
                "lg:bg-secondary/40 lg:backdrop-blur-md lg:shadow-none lg:border lg:border-white/[0.05] lg:hover:bg-secondary/60 lg:active:shadow-none"
              )}
              title="Focus Mode"
            >
              <Volume2 size={22} />
            </button>

            <button
              onClick={toggleFullscreen}
              className={clsx(
                "p-4 rounded-full transition-all flex items-center justify-center text-muted-foreground hover:text-foreground",
                "bg-background shadow-[4px_4px_10px_rgba(0,0,0,0.4),_-4px_-4px_10px_rgba(255,255,255,0.02)] active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4)]",
                "lg:bg-secondary/40 lg:backdrop-blur-md lg:shadow-none lg:border lg:border-white/[0.05] lg:hover:bg-secondary/60 lg:active:shadow-none"
              )}
              title="Toggle Fullscreen"
            >
              {isFullscreen ? <Minimize2 size={22} /> : <Maximize2 size={22} />}
            </button>
          </div>

          {/* Mobile Timestamps Collapsible */}
          {mode === 'stopwatch' && (
            <div className="w-full lg:hidden mt-12 px-2">
              <button 
                onClick={() => setIsMobileTimestampsOpen(!isMobileTimestampsOpen)}
                className="flex items-center justify-between w-full p-5 bg-background shadow-[inset_4px_4px_8px_rgba(0,0,0,0.4),_inset_-4px_-4px_8px_rgba(255,255,255,0.02)] rounded-[2rem] text-sm font-semibold border border-white/[0.01]"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-full text-primary">
                    <Flag size={16} />
                  </div>
                  Timestamps ({timestamps.length})
                </div>
                {isMobileTimestampsOpen ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
              </button>
              <AnimatePresence>
                {isMobileTimestampsOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4"
                  >
                    <div className="h-[45vh] pb-4">
                      <TimestampsPanel 
                        timestamps={timestamps} 
                        deleteTimestamp={deleteTimestamp} 
                        handleNoteChange={handleNoteChange} 
                        formatTimestamp={formatTimestamp} 
                        clearTimestamps={clearTimestamps}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Desktop Timestamps Sidebar */}
        {mode === 'stopwatch' && (
          <div className="hidden lg:block w-72 xl:w-96 h-[75vh] flex-shrink-0 z-20 transition-all duration-700 ease-out">
            <TimestampsPanel 
              timestamps={timestamps} 
              deleteTimestamp={deleteTimestamp} 
              handleNoteChange={handleNoteChange} 
              formatTimestamp={formatTimestamp} 
              clearTimestamps={clearTimestamps}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default Timer;
