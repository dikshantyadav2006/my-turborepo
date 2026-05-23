import React from 'react';
import { useHabitStore } from '../store/habitStore';
import { useAuthStore } from '../../../store/authStore';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';

const HabitsHeader = () => {
  const { user, isGuest } = useAuthStore();
  const { selectedDate, setSelectedDate, filter, setFilter, habits } = useHabitStore();

  const activeCount = habits.filter(h => !h.archived).length;

  const handlePrevWeek = () => {
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Get greeting
  const getGreeting = () => {
    const hrs = new Date().getHours();
    const name = user?.fullname?.split(' ')[0] || (isGuest ? 'DK' : 'Scholar');
    if (hrs < 12) return `Good morning, ${name} 🌅`;
    if (hrs < 18) return `Good afternoon, ${name} ☀️`;
    return `Good evening, ${name} 👋`;
  };

  const tabs = [
    { id: 'all', label: 'All Habits' },
    { id: 'active', label: `Active (${activeCount})` },
    { id: 'completed', label: 'Completed' },
    { id: 'archived', label: 'Archived' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner (Greeting + Date Cycler) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            {getGreeting()}
          </h1>
          <p className="text-sm md:text-[15px] text-muted-foreground/80 mt-2 max-w-xl leading-relaxed">
            Stay consistent, progress is silent.
          </p>
        </div>

        {/* Date cycle control widgets */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-card/80 backdrop-blur-xl border border-border/70 p-1.5 rounded-3xl shadow-[0_16px_50px_-30px_rgba(0,0,0,0.45)]">
          <button 
            onClick={handleToday}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-semibold text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
          >
            <CalendarDays size={14} className="text-primary" />
            <span>Today</span>
          </button>
          
          <div className="w-px h-4 bg-border" />

          <div className="flex items-center">
            <button 
              onClick={handlePrevWeek}
              className="p-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={handleNextWeek}
              className="p-2 rounded-2xl text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight size={16} />
            </button>
          </div>

        </div>
      </div>

      {/* Filter Horizontal Tab bar */}
      <div className="flex overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex bg-secondary/20 backdrop-blur-sm p-1 rounded-3xl border border-border/60 shadow-sm shadow-black/5">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                filter === tab.id 
                  ? 'bg-card text-foreground shadow-md shadow-black/5' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/30'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HabitsHeader;
