import React from 'react';
import { useHabitStore } from '../store/habitStore';

const DailyScoreCard = () => {
  const { analytics } = useHabitStore();
  const score = analytics?.dailyScore ?? 0;
  const weeklyHistory = analytics?.weeklyConsistency || [];

  // Circumference for radius 40 = 2 * pi * r = 251.2
  const strokeDashoffset = 251.2 - (251.2 * score) / 100;

  // Calculate coordinates for SVG sparkline chart
  // Width: 120, Height: 40. We map weekly scores to X, Y
  const generateSparklinePath = () => {
    if (weeklyHistory.length === 0) return '';
    const points = weeklyHistory.map((item, index) => {
      const x = (index / (weeklyHistory.length - 1)) * 120;
      // Invert y since SVG 0 is top. We map 0-100 score to 35-5 height range
      const y = 38 - (item.value / 100) * 32;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const sparklinePath = generateSparklinePath();

  // Compare today's score to yesterday's
  const getComparison = () => {
    if (weeklyHistory.length < 2) return { text: 'Starting strong!', isPositive: true };
    const todayVal = weeklyHistory[weeklyHistory.length - 1]?.value || 0;
    const yesterdayVal = weeklyHistory[weeklyHistory.length - 2]?.value || 0;
    const diff = todayVal - yesterdayVal;

    if (diff > 0) return { text: `+${diff}% vs yesterday`, isPositive: true };
    if (diff < 0) return { text: `${diff}% vs yesterday`, isPositive: false };
    return { text: 'Same as yesterday', isPositive: true };
  };

  const comp = getComparison();

  return (
    <div className="relative overflow-hidden p-5 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/70 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.55)] space-y-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_38%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_35%)]" />
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">Daily Score</h3>
        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">Today</span>
      </div>

      <div className="flex items-center justify-between gap-4 py-2">
        {/* Circular Progress Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="34"
              className="stroke-secondary fill-transparent"
              strokeWidth="5"
            />
            <circle
              cx="40"
              cy="40"
              r="34"
              className="stroke-primary fill-transparent transition-all duration-700 ease-out"
              strokeWidth="5"
              strokeDasharray="213.6" // 2 * pi * 34 = 213.6
              strokeDashoffset={213.6 - (213.6 * score) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute text-center">
            <span className="text-lg font-extrabold tracking-tighter text-foreground">{score}</span>
            <span className="text-[10px] text-muted-foreground block -mt-1">/100</span>
          </div>
        </div>

        {/* Dynamic Sparkline Chart */}
        <div className="flex-1 h-12 relative">
          {weeklyHistory.length > 0 ? (
            <svg className="w-full h-full" viewBox="0 0 120 40">
              {/* Glow filter under line */}
              <defs>
                <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Sparkline curve */}
              <path
                d={sparklinePath}
                fill="none"
                className="stroke-primary"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* End pointer node */}
              {weeklyHistory.length > 0 && (
                <circle
                  cx="120"
                  cy={38 - ((weeklyHistory[weeklyHistory.length - 1]?.value || 0) / 100) * 32}
                  r="3.5"
                  className="fill-primary stroke-card"
                  strokeWidth="1.5"
                />
              )}
            </svg>
          ) : (
            <div className="w-full h-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
              <span className="text-[10px] text-muted-foreground">Tracking history...</span>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Text */}
      <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
        <span className="font-semibold text-foreground">
          {score >= 80 ? '🔥 Great job!' : score >= 50 ? '⚡ Keep pushing!' : '💤 Getting started!'}
        </span>
        <span className={comp.isPositive ? 'text-emerald-500 font-medium' : 'text-rose-500 font-medium'}>
          {comp.text}
        </span>
      </div>
    </div>
  );
};

export default DailyScoreCard;
