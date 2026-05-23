import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Plus, Minus, AlignLeft } from 'lucide-react';

const COLORS = {
  emerald: { text: 'text-emerald-500', bg: 'bg-emerald-500', border: 'border-emerald-500/30', hover: 'hover:bg-emerald-500/10' },
  blue: { text: 'text-blue-500', bg: 'bg-blue-500', border: 'border-blue-500/30', hover: 'hover:bg-blue-500/10' },
  purple: { text: 'text-purple-500', bg: 'bg-purple-500', border: 'border-purple-500/30', hover: 'hover:bg-purple-500/10' },
  orange: { text: 'text-orange-500', bg: 'bg-orange-500', border: 'border-orange-500/30', hover: 'hover:bg-orange-500/10' },
  rose: { text: 'text-rose-500', bg: 'bg-rose-500', border: 'border-rose-500/30', hover: 'hover:bg-rose-500/10' },
  pink: { text: 'text-pink-500', bg: 'bg-pink-500', border: 'border-pink-500/30', hover: 'hover:bg-pink-500/10' }
};

const LogProgressModal = ({ isOpen, onClose, habit, dateStr, currentValue = 0, currentNotes = '', onSave }) => {
  const [value, setValue] = useState(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      setValue(currentValue);
      setNotes(currentNotes);
    }
  }, [isOpen, currentValue, currentNotes]);

  if (!isOpen || !habit) return null;

  const colorConfig = COLORS[habit.color] || COLORS.emerald;

  const handleIncrement = (amount) => {
    setValue(prev => Math.max(0, Math.round((parseFloat(prev) + amount) * 100) / 100));
  };

  const handleQuickSet = (pct) => {
    setValue(Math.round(habit.target * pct * 100) / 100);
  };

  const handleSave = () => {
    onSave(habit.id, dateStr, parseFloat(value) || 0, notes.trim());
    onClose();
  };

  // Define dynamic shortcuts based on type
  const getShortcuts = () => {
    if (habit.type === 'duration') {
      return [
        { label: '+5m', val: 5 },
        { label: '+15m', val: 15 },
        { label: '+30m', val: 30 },
        { label: '+60m', val: 60 }
      ];
    }
    if (habit.type === 'counter') {
      return [
        { label: '+1', val: 1 },
        { label: '+5', val: 5 },
        { label: '+10', val: 10 },
        { label: '+25', val: 25 }
      ];
    }
    if (habit.type === 'number') {
      if (habit.unit?.toLowerCase() === 'glasses' || habit.unit?.toLowerCase() === 'water') {
        return [
          { label: '+1 gl', val: 1 },
          { label: '+2 gl', val: 2 },
          { label: '+4 gl', val: 4 }
        ];
      }
      return [
        { label: '+0.5', val: 0.5 },
        { label: '+1.0', val: 1 },
        { label: '+2.0', val: 2 },
        { label: '+5.0', val: 5 }
      ];
    }
    return [];
  };

  const formattedDate = new Date(dateStr).toLocaleDateString(undefined, { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/60 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl p-6 flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-bold text-lg tracking-tight text-foreground">{habit.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Form Content */}
          <div className="py-6 space-y-6 flex-1">
            
            {/* Display Target Target */}
            <div className="text-center space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Daily Goal Target
              </span>
              <span className="text-sm font-medium text-foreground block">
                {habit.target} {habit.unit || 'units'}
              </span>
            </div>

            {/* Selector Value Controls */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => handleIncrement(-1)}
                className={`w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer`}
              >
                <Minus size={20} />
              </button>

              <div className="flex items-baseline gap-1 text-center min-w-[120px]">
                <input 
                  type="number"
                  step="any"
                  value={value}
                  onChange={e => setValue(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full text-4xl font-extrabold tracking-tight bg-transparent text-center text-foreground focus:outline-none border-b border-transparent focus:border-border transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-sm font-semibold text-muted-foreground lowercase">
                  {habit.unit}
                </span>
              </div>

              <button
                onClick={() => handleIncrement(1)}
                className={`w-12 h-12 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors cursor-pointer`}
              >
                <Plus size={20} />
              </button>
            </div>

            {/* Quick addition shortcuts */}
            {getShortcuts().length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {getShortcuts().map(shortcut => (
                  <button
                    key={shortcut.label}
                    onClick={() => handleIncrement(shortcut.val)}
                    className={`py-1.5 px-1 rounded-xl text-xs border border-border bg-secondary/20 text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all font-medium cursor-pointer`}
                  >
                    {shortcut.label}
                  </button>
                ))}
              </div>
            )}

            {/* Percentage completion shortcuts */}
            <div className="grid grid-cols-3 gap-2 border-t border-border/50 pt-4">
              <button
                onClick={() => handleQuickSet(0.5)}
                className={`py-1.5 rounded-xl text-xs font-semibold border ${colorConfig.border} text-foreground bg-secondary/10 hover:bg-secondary/40 cursor-pointer`}
              >
                50% Goal
              </button>
              <button
                onClick={() => handleQuickSet(1.0)}
                className={`py-1.5 rounded-xl text-xs font-semibold ${colorConfig.bg} text-white hover:opacity-90 cursor-pointer`}
              >
                100% Goal
              </button>
              <button
                onClick={() => handleQuickSet(1.5)}
                className={`py-1.5 rounded-xl text-xs font-semibold border ${colorConfig.border} text-foreground bg-secondary/10 hover:bg-secondary/40 cursor-pointer`}
              >
                150% Goal
              </button>
            </div>

            {/* Add journal daily notes */}
            <div className="space-y-2 border-t border-border/50 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <AlignLeft size={12} />
                <span>Daily Notes (Optional)</span>
              </div>
              <textarea
                placeholder="Write a quick reflection or journal note..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-secondary/30 border border-border text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/40 resize-none transition-colors"
              />
            </div>

          </div>

          {/* Footer Save */}
          <button
            onClick={handleSave}
            className={`w-full py-3.5 rounded-2xl ${colorConfig.bg} text-white font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity text-sm cursor-pointer shadow-lg shadow-black/10`}
          >
            <Check size={18} strokeWidth={2.5} />
            Save Daily Progress
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LogProgressModal;
