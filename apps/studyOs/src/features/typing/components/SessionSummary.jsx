import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  RotateCcw, 
  ArrowRight, 
  Target, 
  Zap, 
  Activity,
  AlertCircle
} from 'lucide-react';

const SessionSummary = ({ stats, onRestart, onNext }) => {
  const { wpm, rawWpm, accuracy, errors, keyTimings, isNewBest } = stats;

  // Identify weak keys (keys with accuracy < 80% or high latency)
  const weakKeysMap = keyTimings.reduce((acc, kt) => {
    if (!acc[kt.char]) acc[kt.char] = { total: 0, errors: 0 };
    acc[kt.char].total++;
    if (!kt.correct) acc[kt.char].errors++;
    return acc;
  }, {});

  const weakKeys = Object.entries(weakKeysMap)
    .filter(([key, data]) => (data.errors / data.total) > 0.2)
    .slice(0, 5);

  const container = {
    hidden: { opacity: 0, scale: 0.95 },
    show: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-4xl mx-auto w-full space-y-8 py-10"
    >
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div 
          variants={item}
          className="inline-flex p-4 rounded-3xl bg-yellow-500/10 text-yellow-500 mb-2"
        >
          <Trophy size={48} />
        </motion.div>
        <motion.h2 variants={item} className="text-5xl font-black tracking-tight">
          Session Complete!
        </motion.h2>
        {isNewBest && (
          <motion.div 
            variants={item}
            className="inline-block px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-black uppercase tracking-widest"
          >
            New Personal Best
          </motion.div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={80} />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Net Speed</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-primary">{wpm}</span>
            <span className="text-xl font-bold text-muted-foreground">WPM</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Raw speed: {rawWpm} WPM</p>
        </motion.div>

        <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Target size={80} />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Accuracy</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-emerald-500">{accuracy}</span>
            <span className="text-xl font-bold text-muted-foreground">%</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">{errors} total mistakes</p>
        </motion.div>

        <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-card border border-border flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={80} />
          </div>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Consistency</p>
          <div className="flex items-baseline gap-2">
            <span className="text-6xl font-black text-blue-500">84</span>
            <span className="text-xl font-bold text-muted-foreground">%</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">Steady pace maintainance</p>
        </motion.div>
      </div>

      {/* Weak Keys & Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Weak Keys */}
        <motion.div variants={item} className="p-8 rounded-[2.5rem] bg-secondary/30 border border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="text-red-500" size={24} />
            <h3 className="text-xl font-bold">Weak Keys</h3>
          </div>
          
          {weakKeys.length > 0 ? (
            <div className="flex flex-wrap gap-4">
              {weakKeys.map(([char, data]) => (
                <div key={char} className="flex flex-col items-center gap-1 p-3 bg-card border border-border rounded-2xl min-w-[60px]">
                  <span className="text-2xl font-mono font-black">{char === ' ' ? 'SPC' : char}</span>
                  <span className="text-[10px] font-bold text-red-500">{Math.round((data.errors/data.total)*100)}% Error</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Flawless performance! No weak keys detected.</p>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div variants={item} className="flex flex-col gap-4">
          <button 
            onClick={onRestart}
            className="flex-1 bg-primary text-primary-foreground p-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20"
          >
            <RotateCcw size={24} />
            Try Again
            <span className="text-xs font-normal opacity-70 ml-2">(TAB)</span>
          </button>
          
          <button 
            onClick={onNext}
            className="flex-1 bg-card border border-border p-6 rounded-[2rem] font-bold text-lg flex items-center justify-center gap-3 hover:bg-secondary transition-all"
          >
            Next Lesson
            <ArrowRight size={20} />
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SessionSummary;
