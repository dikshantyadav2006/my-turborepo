import React from 'react';
import { useHabitStore } from '../store/habitStore';
import { Sparkles } from 'lucide-react';

const AISuggestionCard = () => {
  const { analytics } = useHabitStore();
  const suggestion = analytics?.aiSuggestion || {
    message: "Analyzing your habits routine for insights...",
    habitName: "General"
  };

  return (
    <div className="relative overflow-hidden p-4 rounded-3xl border border-border/60 bg-card/70 backdrop-blur-xl shadow-[0_18px_60px_-40px_rgba(0,0,0,0.55)] space-y-3 group">
      {/* Decorative premium glass orb */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none group-hover:bg-primary/15 transition-colors duration-500" />
      
      <div className="flex items-center gap-2 text-primary/80 font-semibold text-[10px] uppercase tracking-[0.22em]">
        <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/15">
          <Sparkles size={14} />
        </div>
        <span>AI Suggestion</span>
      </div>

      <p className="text-xs md:text-[13px] text-foreground/90 leading-relaxed font-medium max-w-[28ch]">
        "{suggestion.message}"
      </p>

      <div className="flex items-center justify-between text-[11px] pt-1 text-muted-foreground border-t border-border/50">
        <span>Powered by Study OS Core AI</span>
        <button 
          type="button"
          onClick={() => alert("Smart habits analyzer is running background scans on your logs to optimize consistency cycles.")}
          className="text-primary/80 font-semibold hover:underline cursor-pointer"
        >
          View Insights &rarr;
        </button>
      </div>
    </div>
  );
};

export default AISuggestionCard;
