import React, { useEffect } from 'react';
import { SEO } from '../../../components/seo/SEO';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Flame, 
  Target, 
  Clock, 
  ChevronRight,
  Plus,
  Trophy
} from 'lucide-react';
import StudyHeatmap from '../components/StudyHeatmap';
import { useAnalyticsStore } from '../store/analyticsStore';
import { useAuthStore } from '../../../store/authStore';
import { useTaskStore } from '../../tasks/store/taskStore';

const Dashboard = () => {
  const { xp, level, streak, xpHistory, updateStreak, loadHistory } = useAnalyticsStore();
  const { user } = useAuthStore();
  const { tasks, initTasks } = useTaskStore();

  useEffect(() => {
    initTasks();
    loadHistory();
    updateStreak();
  }, []);

  const stats = [
    { label: 'Current Streak', value: `${streak} Days`, icon: Flame, color: 'text-orange-500' },
    { label: 'Level', value: level, icon: Trophy, color: 'text-yellow-500' },
    { label: 'Total XP', value: xp, icon: Zap, color: 'text-blue-500' },
    { label: 'Daily Goal', value: '75%', icon: Target, color: 'text-emerald-500' },
  ];

  const activeTasks = tasks.filter(t => !t.completed).slice(0, 3);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SEO
        title="My Dashboard"
        description="Your personal Study OS dashboard – track XP, streaks, tasks and study activity."
        robots="index,follow"
        canonical="/"
      />
      {/* Welcome Header */}
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullname?.split(' ')[0] || 'Scholar'}
          </h1>
          <p className="text-muted-foreground mt-1">
            You've completed 75% of your daily study goal. Keep going!
          </p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:opacity-90 transition-opacity">
          <Plus size={18} />
          New Session
        </button>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl bg-card border border-border flex flex-col gap-2"
          >
            <div className={`p-2 rounded-lg bg-secondary w-fit ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Heatmap Section */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-card border border-border space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Study Activity</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                <div className="w-3 h-3 rounded-[2px] bg-zinc-800" />
                <div className="w-3 h-3 rounded-[2px] bg-emerald-900" />
                <div className="w-3 h-3 rounded-[2px] bg-emerald-700" />
                <div className="w-3 h-3 rounded-[2px] bg-emerald-500" />
                <div className="w-3 h-3 rounded-[2px] bg-emerald-400" />
              </div>
              <span>More</span>
            </div>
          </div>
          <StudyHeatmap data={xpHistory} />
        </div>

        {/* Quick Tasks */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Up Next</h2>
            <button className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="space-y-4">
            {activeTasks.length > 0 ? (
              activeTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-border transition-colors group">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="flex-1 text-sm font-medium truncate">{task.title}</span>
                  <Clock size={14} className="text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">No pending tasks</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
