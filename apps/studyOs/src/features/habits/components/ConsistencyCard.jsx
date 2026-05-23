import React from 'react';
import { useHabitStore } from '../store/habitStore';

const ConsistencyCard = () => {
  const { analytics } = useHabitStore();
  const weeklyData = analytics?.weeklyConsistency || [];

  return (
    <div className="relative overflow-hidden p-5 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/70 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.55)] space-y-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_35%)]" />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Consistency</h3>
        <span className="text-[10px] text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full font-medium">
          This Week
        </span>
      </div>

      <div className="flex items-end justify-between h-20 px-1 pt-2">
        {weeklyData.map((dayData, i) => {
          const heightPct = Math.max(8, dayData.value); // Ensure a tiny visible bar even if 0%
          const isFull = dayData.value >= 100;
          const isMedium = dayData.value >= 50 && dayData.value < 100;
          
          return (
            <div key={dayData.date + '_' + i} className="flex flex-col items-center gap-2 flex-1 group">
              {/* Tooltip on hover */}
              <div className="absolute transform -translate-y-8 bg-popover text-popover-foreground text-[10px] px-1.5 py-0.5 rounded border border-border shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 font-medium">
                {dayData.value}%
              </div>

              {/* Vertical Bar */}
              <div className="w-2.5 h-16 bg-secondary/30 rounded-full flex items-end overflow-hidden relative">
                <div 
                  className={`w-full rounded-full transition-all duration-500 ease-out origin-bottom ${
                    isFull ? 'bg-primary' : 
                    isMedium ? 'bg-primary/60' : 
                    dayData.value > 0 ? 'bg-primary/30' : 'bg-secondary/40'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Day Label */}
              <span className={`text-[10px] font-semibold tracking-tighter ${
                dayData.date === new Date().toISOString().split('T')[0] 
                  ? 'text-primary font-bold' 
                  : 'text-muted-foreground'
              }`}>
                {dayData.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConsistencyCard;
