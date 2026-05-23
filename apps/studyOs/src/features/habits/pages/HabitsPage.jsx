import React, { useEffect, useState } from 'react';
import { SEO } from '../../../components/seo/SEO';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

import { useHabitStore } from '../store/habitStore';
import HabitsHeader from '../components/HabitsHeader';
import HabitsTable from '../components/HabitsTable';
import DailyScoreCard from '../components/DailyScoreCard';
import StreakCard from '../components/StreakCard';
import ConsistencyCard from '../components/ConsistencyCard';
import HabitCalendarHeatmap from '../components/HabitCalendarHeatmap';
import AISuggestionCard from '../components/AISuggestionCard';

import AddEditHabitModal from '../components/AddEditHabitModal';
import LogProgressModal from '../components/LogProgressModal';

const HabitsPage = () => {
  const { fetchHabits, fetchAnalytics, addHabit, updateHabit, deleteHabit, logProgress } = useHabitStore();

  // Modals state
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [habitToEdit, setHabitToEdit] = useState(null);

  const [isLogOpen, setIsLogOpen] = useState(false);
  const [logHabit, setLogHabit] = useState(null);
  const [logDateStr, setLogDateStr] = useState('');
  const [logCurrentValue, setLogCurrentValue] = useState(0);
  const [logCurrentNotes, setLogCurrentNotes] = useState('');

  useEffect(() => {
    fetchHabits();
    fetchAnalytics();
  }, []);

  const handleCreateNew = () => {
    setHabitToEdit(null);
    setIsAddEditOpen(true);
  };

  const handleEditHabit = (habit) => {
    setHabitToEdit(habit);
    setIsAddEditOpen(true);
  };

  const handleLogNumericProgress = (habit, dateStr, currentValue, currentNotes) => {
    setLogHabit(habit);
    setLogDateStr(dateStr);
    setLogCurrentValue(currentValue);
    setLogCurrentNotes(currentNotes);
    setIsLogOpen(true);
  };

  const handleSaveHabit = async (habitData) => {
    if (habitToEdit) {
      await updateHabit(habitToEdit.id, habitData);
    } else {
      await addHabit(habitData);
    }
  };

  const handleDeleteHabit = async (id) => {
    await deleteHabit(id);
  };

  const handleSaveProgress = async (habitId, dateStr, value, notes) => {
    await logProgress(habitId, dateStr, value, notes);
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Premium ambient backdrop */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.10),transparent_24%),radial-gradient(circle_at_50%_115%,rgba(16,185,129,0.08),transparent_32%)] dark:bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.08),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.12),transparent_24%),radial-gradient(circle_at_50%_115%,rgba(16,185,129,0.08),transparent_32%)] opacity-90" />
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_12%,transparent_88%,rgba(0,0,0,0.04))] dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_12%,transparent_88%,rgba(0,0,0,0.08))]" />
      <div className="absolute inset-0 pointer-events-none bg-noise opacity-[0.035] mix-blend-soft-light" />
      <div className="space-y-8 animate-in fade-in duration-500 relative z-10">
        <SEO
          title="Habit Tracking"
          description="Build premium micro-habits, track daily completions, track streaks, and visual consistency."
          robots="noindex,nofollow"
          canonical="/habits"
        />

        {/* Main Page Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left main column: Habits list matrix */}
          <div className="lg:col-span-2 space-y-6">
            <HabitsHeader />
            
            <HabitsTable 
              onEditHabit={handleEditHabit} 
              onLogNumericProgress={handleLogNumericProgress} 
            />

            {/* Add Habit center float button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleCreateNew}
                className="px-6 py-3.5 bg-primary text-primary-foreground rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/15 cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/20 transition-all"
              >
                <Plus size={18} strokeWidth={2.5} />
                Add New Habit
              </button>
            </div>
          </div>

          {/* Right column: Analytics side deck panels */}
          <div className="space-y-6">
            <DailyScoreCard />
            <StreakCard />
            <ConsistencyCard />
            <HabitCalendarHeatmap />
            <AISuggestionCard />
          </div>

        </div>

        {/* Modals & Dialog overlays */}
        <AddEditHabitModal 
          isOpen={isAddEditOpen} 
          onClose={() => setIsAddEditOpen(false)} 
          habitToEdit={habitToEdit}
          onSave={handleSaveHabit}
          onDelete={handleDeleteHabit}
        />

        <LogProgressModal 
          isOpen={isLogOpen} 
          onClose={() => setIsLogOpen(false)} 
          habit={logHabit}
          dateStr={logDateStr}
          currentValue={logCurrentValue}
          currentNotes={logCurrentNotes}
          onSave={handleSaveProgress}
        />
      </div>
    </div>
  );
};

export default HabitsPage;
