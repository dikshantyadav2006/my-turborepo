import React, { useState } from 'react';
import { useHabitStore } from '../store/habitStore';
import { 
  Zap, BookOpen, Activity, Code, Dumbbell, Droplet, Heart, Smile, Brain,
  CheckCircle2, XCircle, Star, GripVertical, Archive, ArchiveRestore, Edit3, Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';

const ICONS = { Zap, BookOpen, Activity, Code, Dumbbell, Droplet, Heart, Smile, Brain };

const COLORS = {
  emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500', border: 'border-emerald-500/20', cellBg: 'bg-emerald-500/10' },
  blue: { bg: 'bg-blue-500', text: 'text-blue-500', border: 'border-blue-500/20', cellBg: 'bg-blue-500/10' },
  purple: { bg: 'bg-purple-500', text: 'text-purple-500', border: 'border-purple-500/20', cellBg: 'bg-purple-500/10' },
  orange: { bg: 'bg-orange-500', text: 'text-orange-500', border: 'border-orange-500/20', cellBg: 'bg-orange-500/10' },
  rose: { bg: 'bg-rose-500', text: 'text-rose-500', border: 'border-rose-500/20', cellBg: 'bg-rose-500/10' },
  pink: { bg: 'bg-pink-500', text: 'text-pink-500', border: 'border-pink-500/20', cellBg: 'bg-pink-500/10' }
};

const getStartOfWeek = (d) => {
  const date = new Date(d);
  const day = date.getDay();
  // Adjust so Monday is the first day of the week
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const HabitsTable = ({ onEditHabit, onLogNumericProgress }) => {
  const { habits, logs, logProgress, reorderHabits, selectedDate, filter, updateHabit } = useHabitStore();
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Generate 7 week dates
  const startOfWeek = getStartOfWeek(selectedDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  // Filter habits based on current tab selection
  const filteredHabits = habits.filter(habit => {
    if (filter === 'archived') return habit.archived;
    if (habit.archived) return false; // don't show archived on other tabs
    
    if (filter === 'active') return !habit.archived;
    if (filter === 'completed') {
      // Completed today check
      const todayStr = new Date().toISOString().split('T')[0];
      const todayLog = logs.find(l => l.habitId === habit.id && l.date === todayStr);
      return todayLog && ['completed', 'exceeded'].includes(todayLog.status);
    }
    return true; // 'all'
  });

  // Drag and Drop Handling (Native HTML5 Drag & Drop - React 19 stable)
  const handleDragStart = (e, index) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    // Perform swap array positions
    const reorderedIds = [...filteredHabits].map(h => h.id);
    const draggedId = reorderedIds[draggedIdx];
    
    reorderedIds.splice(draggedIdx, 1);
    reorderedIds.splice(index, 0, draggedId);
    
    reorderHabits(reorderedIds);
    setDraggedIdx(index);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  const handleCellClick = (habit, day) => {
    const dateStr = day.toISOString().split('T')[0];
    const existingLog = logs.find(l => l.habitId === habit.id && l.date === dateStr);
    
    if (habit.type === 'boolean') {
      // Boolean type: toggle completed (1) vs missed/deleted (0)
      const currentVal = existingLog?.value || 0;
      const newVal = currentVal === 1 ? 0 : 1;
      logProgress(habit.id, dateStr, newVal);
    } else {
      // Numeric/Duration/Counter type: open progress dial logger modal
      onLogNumericProgress(habit, dateStr, existingLog?.value || 0, existingLog?.notes || '');
    }
  };

  const renderCellIndicator = (habit, day) => {
    const dateStr = day.toISOString().split('T')[0];
    const log = logs.find(l => l.habitId === habit.id && l.date === dateStr);
    const color = COLORS[habit.color] || COLORS.emerald;

    if (!log) {
      // Empty target state (dashed outline or subtle dot)
      return (
        <div className="w-8 h-8 rounded-full border border-dashed border-border/60 hover:border-foreground/40 transition-colors flex items-center justify-center cursor-pointer group/cell relative">
          <span className="w-1.5 h-1.5 rounded-full bg-border group-hover/cell:bg-foreground/30 transition-colors" />
        </div>
      );
    }

    if (log.status === 'completed') {
      return (
        <div className={`w-8 h-8 rounded-full ${color.bg} text-white flex items-center justify-center shadow-md shadow-black/10 cursor-pointer hover:scale-105 active:scale-95 transition-all`}>
          <CheckCircle2 size={18} strokeWidth={2.5} />
        </div>
      );
    }

    if (log.status === 'exceeded') {
      return (
        <div className="w-8 h-8 rounded-full bg-yellow-500 text-white flex items-center justify-center shadow-md shadow-yellow-500/20 cursor-pointer hover:scale-105 active:scale-95 transition-all">
          <Star size={18} fill="currentColor" strokeWidth={2} />
        </div>
      );
    }

    if (log.status === 'partial') {
      // Draw beautiful half-circle representing partial completion progress
      return (
        <div className={`w-8 h-8 rounded-full border-2 ${color.border} relative overflow-hidden flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all`}>
          {/* Half arc mask */}
          <div className={`absolute top-0 bottom-0 left-0 right-1/2 ${color.bg} opacity-80`} />
          <span className={`text-[10px] font-bold z-10 ${color.text}`}>
            {Math.round((log.value / habit.target) * 100)}%
          </span>
        </div>
      );
    }

    if (log.status === 'missed') {
      return (
        <div className="w-8 h-8 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all">
          <XCircle size={18} strokeWidth={2} />
        </div>
      );
    }

    return null;
  };

  const handleToggleArchive = (habit) => {
    updateHabit(habit.id, { archived: !habit.archived });
  };

  return (
    <>
      {/* Desktop Table (visible on md and up) */}
      <div className="hidden md:block rounded-3xl border border-border/70 bg-card/70 backdrop-blur-xl shadow-[0_18px_60px_-40px_rgba(0,0,0,0.55)] p-2">
        <table className="w-full table-fixed border-separate border-spacing-y-2 text-left">
          <colgroup>
            <col className="w-10" />
            <col className="w-[34%]" />
            <col className="w-[16%]" />
            {weekDays.map((day) => (
              <col key={day.toISOString()} className="w-[6.5%]" />
            ))}
            <col className="w-16" />
          </colgroup>
          
          {/* Table Headers */}
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              <th className="px-2 py-3"></th>
              <th className="px-4 py-3 font-semibold">Habit</th>
              <th className="px-4 py-3 font-semibold">Goal</th>
              {weekDays.map((day, idx) => {
                const isToday = day.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];
                return (
                  <th 
                    key={day.toISOString() + '_' + idx} 
                    className={`py-3 text-center font-semibold ${
                      isToday ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span className="uppercase text-[10px] tracking-[0.2em]">
                        {day.toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                      <span className={`text-[11px] mt-1 w-6 h-6 flex items-center justify-center rounded-full font-semibold ${
                        isToday ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20' : 'bg-secondary/60 text-foreground/90'
                      }`}>
                        {day.getDate()}
                      </span>
                    </div>
                  </th>
                );
              })}
              <th className="px-2 py-3 text-center"></th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {filteredHabits.length > 0 ? (
              filteredHabits.map((habit, index) => {
                const IconComponent = ICONS[habit.icon] || Zap;
                const colorConfig = COLORS[habit.color] || COLORS.emerald;

                return (
                  <tr 
                    key={habit.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`group transition-all ${
                      draggedIdx === index ? 'opacity-40 bg-secondary/30' : ''
                    }`}
                  >
                    {/* Drag Handle */}
                    <td className="pl-3 pr-2 py-4 text-center align-middle cursor-grab active:cursor-grabbing first:rounded-l-2xl bg-card/90">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/60 hover:text-foreground">
                        <GripVertical size={16} />
                      </div>
                    </td>

                    {/* Habit Visual & Name */}
                    <td className="px-4 py-4 align-middle bg-card/90">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2.5 rounded-2xl ${colorConfig.cellBg} ${colorConfig.text} border ${colorConfig.border} flex items-center justify-center shadow-sm shadow-black/5`}>
                          <IconComponent size={18} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-sm text-foreground truncate">{habit.name}</h4>
                          <p className="text-xs text-muted-foreground truncate max-w-[220px] mt-1">
                            {habit.description || 'No description added'}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Goal target column */}
                    <td className="px-4 py-4 align-middle bg-card/90">
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold text-foreground block truncate">
                          {habit.type === 'boolean' ? 'Done' : `${habit.target} ${habit.unit}`}
                        </span>
                        <span className="text-[10px] text-muted-foreground uppercase block tracking-[0.22em] font-medium">
                          {habit.frequency}
                        </span>
                      </div>
                    </td>

                    {/* Week Tracking Cells */}
                    {weekDays.map((day, idx) => (
                      <td 
                        key={day.toISOString() + '_cell_' + idx} 
                        className="py-4 text-center align-middle bg-card/90"
                        onClick={() => handleCellClick(habit, day)}
                      >
                        <div className="flex justify-center items-center">
                          {renderCellIndicator(habit, day)}
                        </div>
                      </td>
                    ))}

                    {/* Actions Menu */}
                    <td className="px-2 text-center align-middle bg-card/90 last:rounded-r-2xl">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end pr-2">
                        <button
                          onClick={() => onEditHabit(habit)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
                          title="Edit Habit"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleArchive(habit)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
                          title={habit.archived ? "Restore Habit" : "Archive Habit"}
                        >
                          {habit.archived ? <ArchiveRestore size={14} /> : <Archive size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={11} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <span className="text-3xl">🌿</span>
                    <p className="text-sm font-medium text-foreground/80 mt-1">No habits tracked here</p>
                    <p className="text-xs text-muted-foreground">Get started by creating your first daily study habit!</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>

        </table>
      </div>
    {/* Mobile Cards (visible on small screens) */}
    <div className="block md:hidden mt-4 space-y-4">
      {filteredHabits.length > 0 ? (
        <div className="flex flex-col gap-4">
          {filteredHabits.map((habit) => (
            <div key={habit.id} className="w-full bg-card/80 backdrop-blur-xl rounded-3xl border border-border/70 p-4 shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`p-2 rounded-2xl ${COLORS[habit.color]?.cellBg || COLORS.emerald.cellBg} ${COLORS[habit.color]?.text || COLORS.emerald.text} border ${COLORS[habit.color]?.border || COLORS.emerald.border} flex items-center justify-center shrink-0`}> 
                    {React.createElement(ICONS[habit.icon] || Zap, { size: 16 })}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-foreground truncate">{habit.name}</h4>
                    <p className="text-[11px] text-muted-foreground truncate">{habit.description || 'No description added'}</p>
                  </div>
                </div>
                <button onClick={() => onEditHabit(habit)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors shrink-0">
                  <Edit3 size={14} />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day) => (
                  <button key={day.toISOString()} type="button" className="flex justify-center" onClick={() => handleCellClick(habit, day)}>
                    {renderCellIndicator(habit, day)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl border border-border/70 p-6 text-center text-muted-foreground shadow-[0_18px_50px_-36px_rgba(0,0,0,0.55)]">
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-3xl">🌿</span>
            <p className="text-sm font-medium text-foreground/80 mt-1">No habits tracked here</p>
            <p className="text-xs text-muted-foreground">Get started by creating your first daily study habit!</p>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default HabitsTable;
