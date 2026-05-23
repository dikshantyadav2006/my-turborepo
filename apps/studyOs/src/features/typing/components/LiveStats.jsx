import React, { memo } from 'react';
import { Timer, Zap, Target, Flame } from 'lucide-react';
import { cn } from '../../../lib/utils';

const StatCard = memo(({ icon: Icon, label, value, colorClass, suffix }) => (
  <div className="flex flex-col items-center px-6 py-2 border-r border-border/50 last:border-0 group">
    <div className={cn("flex items-center gap-2 mb-1", colorClass)}>
      <Icon size={14} className="opacity-70 group-hover:scale-110 transition-transform" />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-black tabular-nums tracking-tight">{value}</span>
      {suffix && <span className="text-xs font-bold text-muted-foreground">{suffix}</span>}
    </div>
  </div>
));

const LiveStats = ({ wpm, accuracy, timeLeft, errors, mode, isFinished, zenMode }) => {
  if (isFinished) return null;

  return (
    <div className={cn(
      "flex justify-center transition-all duration-500",
      zenMode ? "opacity-0 translate-y-4" : "opacity-100",
      "hover:opacity-100 hover:translate-y-0"
    )}>
      <div className="flex bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
        {mode === 'time' && (
          <StatCard 
            icon={Timer} 
            label="Timer" 
            value={timeLeft} 
            suffix="s" 
            colorClass="text-blue-500"
          />
        )}
        
        <StatCard 
          icon={Zap} 
          label="WPM" 
          value={wpm} 
          colorClass="text-primary"
        />
        
        <StatCard 
          icon={Target} 
          label="Accuracy" 
          value={accuracy} 
          suffix="%" 
          colorClass="text-emerald-500"
        />
        
        <StatCard 
          icon={Flame} 
          label="Errors" 
          value={errors} 
          colorClass="text-red-500"
        />
      </div>
    </div>
  );
};

export default memo(LiveStats);
