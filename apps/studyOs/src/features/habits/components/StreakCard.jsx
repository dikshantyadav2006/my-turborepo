import React from 'react';
import { useHabitStore } from '../store/habitStore';

const StreakCard = () => {
  const { analytics } = useHabitStore();
  const currentStreak = analytics?.currentStreak ?? 0;
  const bestStreak = analytics?.bestStreak ?? 0;

  return (
    <div className="relative overflow-hidden p-5 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/70 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.55)] flex items-center justify-between gap-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_35%)]" />
      <div className="space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
          Current Streak
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-extrabold tracking-tight text-foreground">
            {currentStreak}
          </span>
          <span className="text-sm font-semibold text-muted-foreground">
            days
          </span>
        </div>
        <span className="text-xs text-muted-foreground block pt-1">
          Best Streak: <strong className="text-foreground font-medium">{bestStreak} days</strong>
        </span>
      </div>

      {/* Pulsing Animated SVG Fire Icon */}
      <div className="relative w-14 h-14 bg-orange-500/10 border border-orange-500/15 rounded-2xl flex items-center justify-center text-orange-500 shadow-inner shadow-orange-500/10">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className={`w-8 h-8 ${currentStreak > 0 ? 'animate-pulse text-orange-500' : 'text-muted-foreground opacity-40'}`}
        >
          <path d="M19.485 10.185a.75.75 0 0 0-1.03-1.03 7.5 7.5 0 0 1-11.455.555 7.5 7.5 0 0 0-.077 10.74 7.5 7.5 0 0 1 .533-10.427 7.5 7.5 0 0 0 1.25 10.15 7.5 7.5 0 0 1 .65-10.375 7.5 7.5 0 0 0 1.22 9.562 7.5 7.5 0 0 1-.15-10.585 7.5 7.5 0 0 0 2.21 8.216 7.5 7.5 0 0 1-.22-10.222 7.5 7.5 0 0 0 2.5 7.375 7.5 7.5 0 0 1-.36-10.025 7.5 7.5 0 0 0 2.5 7.5c2.476-2.023 3.906-5.064 3.906-8.315Z" />
        </svg>
        {currentStreak > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-orange-500 rounded-full animate-ping" />
        )}
      </div>
    </div>
  );
};

export default StreakCard;
