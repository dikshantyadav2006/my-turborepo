import React, { useState, useEffect } from 'react';
import { SEO, schemaBreadcrumb } from '../../../components/seo/SEO';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Zap, 
  Clock,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

import { useAuthStore } from '../../../store/authStore';
import axios from 'axios';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState('Weekly');
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const sortBy = timeframe === 'Weekly' ? 'xp' : timeframe === 'Monthly' ? 'xp' : 'xp'; // Placeholder logic
        const response = await axios.get(`${API_URL}/study/leaderboard?sortBy=${sortBy}`);
        if (response.data.success) {
          setLeaderboard(response.data.leaderboard);
          setUserRank(response.data.userRank);
        }
      } catch (err) {
        console.error('Leaderboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [timeframe, API_URL]);

  if (loading && leaderboard.length === 0) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use top 3 for podium, rest for list
  const topThree = leaderboard.slice(0, 3);
  const listData = leaderboard;

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <SEO
        title="Student Leaderboard – Top Scholars"
        description="See the global leaderboard for Sai Library Study OS. Track top students by XP, study streaks, and focus time. Compete and rise through the ranks."
        keywords={['student leaderboard', 'study ranking', 'top students', 'sai library', 'xp leaderboard', 'focus time ranking']}
        canonical="/leaderboard"
        robots="index,follow"
        schema={schemaBreadcrumb([
          { name: 'Home', url: '/' },
          { name: 'Leaderboard', url: '/leaderboard' },
        ])}
      />
      {/* Header */}
      <header className="text-center space-y-4">
        <div className="inline-flex p-1 bg-secondary rounded-2xl">
          {['Weekly', 'Monthly', 'All-time'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={clsx(
                "px-6 py-2 rounded-xl text-sm font-bold transition-all",
                timeframe === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <h1 className="text-5xl font-black tracking-tight mt-6">Global Rankings</h1>
        <p className="text-muted-foreground">Top scholars in the ecosystem</p>
      </header>

      {/* Podium - Hidden on mobile */}
      <div className="hidden md:flex items-end justify-center gap-4 py-12">
        {/* 2nd Place */}
        {topThree[1] && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 shadow-lg">
              <Medal size={32} />
            </div>
            <div className="w-32 h-32 bg-slate-200/50 rounded-t-3xl flex flex-col items-center justify-center p-4">
              <span className="text-sm font-bold truncate w-full text-center">{topThree[1].username}</span>
              <span className="text-xs text-muted-foreground">{topThree[1].totalXP} XP</span>
            </div>
          </div>
        )}

        {/* 1st Place */}
        {topThree[0] && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-900 shadow-xl ring-4 ring-yellow-400/20">
              <Crown size={40} />
            </div>
            <div className="w-40 h-48 bg-yellow-400/10 border-x border-t border-yellow-400/20 rounded-t-3xl flex flex-col items-center justify-center p-6">
              <span className="text-lg font-black truncate w-full text-center">{topThree[0].username}</span>
              <span className="text-sm text-yellow-600 font-bold">{topThree[0].totalXP} XP</span>
              <div className="mt-4 px-3 py-1 bg-yellow-400 text-yellow-950 text-[10px] font-black uppercase rounded-full">
                Champion
              </div>
            </div>
          </div>
        )}

        {/* 3rd Place */}
        {topThree[2] && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-orange-400 flex items-center justify-center text-orange-900 shadow-lg">
              <Medal size={32} />
            </div>
            <div className="w-32 h-24 bg-orange-400/10 rounded-t-3xl flex flex-col items-center justify-center p-4">
              <span className="text-sm font-bold truncate w-full text-center">{topThree[2].username}</span>
              <span className="text-xs text-muted-foreground">{topThree[2].totalXP} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden mt-6 md:mt-0">
        {listData.length > 0 ? (
          listData.map((user, i) => (
            <div 
              key={user.userId || i}
              className={clsx(
                "flex items-center gap-4 md:gap-6 p-4 md:p-6 transition-colors border-b border-border last:border-0",
                i < 3 ? "bg-secondary/20" : "hover:bg-secondary/10"
              )}
            >
              <span className="text-lg md:text-xl font-black text-muted-foreground w-6 md:w-8 text-center">{i + 1}</span>
              
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-muted-foreground overflow-hidden flex-shrink-0">
                {user.profilePic ? (
                  <img src={user.profilePic} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.username?.[0]?.toUpperCase() || '?'
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate text-sm md:text-base">{user.username}</h3>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[10px] md:text-xs text-muted-foreground mt-0.5">
                  <span className="flex items-center gap-1"><Zap size={12} /> {user.totalXP} XP</span>
                  <span className="flex items-center gap-1"><Clock size={12} /> {Math.round(user.totalFocusTime / 60)}h</span>
                  {user.currentStreak > 0 && <span className="hidden sm:flex items-center gap-1 text-orange-500 font-bold"><Medal size={12} /> {user.currentStreak} day streak</span>}
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {userRank?.rank === i + 1 && (
                  <div className="px-2 py-0.5 bg-primary/10 text-primary text-[8px] font-black uppercase rounded-full border border-primary/20">
                    You
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-10 md:p-20 text-center text-muted-foreground text-sm md:text-base">
            No rankings available yet. Start studying to appear here!
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
