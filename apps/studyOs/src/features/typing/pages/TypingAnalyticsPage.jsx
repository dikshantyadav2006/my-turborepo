import React, { useEffect } from 'react';
import { SEO, schemaBreadcrumb } from '../../../components/seo/SEO';
import { useTypingAnalyticsStore } from '../store/typingAnalyticsStore';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  Calendar,
  ChevronRight,
  History
} from 'lucide-react';
import { cn } from '../../../lib/utils';

const AnalyticsCard = ({ title, value, subValue, icon: Icon, colorClass }) => (
  <div className="bg-card border border-border/50 p-8 rounded-[2.5rem] relative overflow-hidden group">
    <div className={cn("absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity", colorClass)}>
      <Icon size={120} />
    </div>
    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">{title}</p>
    <div className="flex items-baseline gap-2">
      <span className="text-5xl font-black">{value}</span>
      {subValue && <span className="text-xl font-bold text-muted-foreground">{subValue}</span>}
    </div>
  </div>
);

const TypingAnalyticsPage = () => {
  const { history, bestScores, weakKeys, loadLocalData, isLoading } = useTypingAnalyticsStore();

  useEffect(() => {
    loadLocalData();
  }, [loadLocalData]);

  const stats = [
    { 
      title: "All-Time Best", 
      value: bestScores['time']?.wpm || 0, 
      subValue: "WPM", 
      icon: TrendingUp, 
      colorClass: "text-primary" 
    },
    { 
      title: "Avg. Accuracy", 
      value: history.length > 0 ? Math.round(history.reduce((a, b) => a + b.accuracy, 0) / history.length) : 0, 
      subValue: "%", 
      icon: Target, 
      colorClass: "text-emerald-500" 
    },
    { 
      title: "Total Sessions", 
      value: history.length, 
      subValue: "", 
      icon: Calendar, 
      colorClass: "text-blue-500" 
    }
  ];

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 space-y-12">
      <SEO
        title="Typing Analytics – Performance Tracking"
        description="Detailed insights into your typing speed, accuracy, and weak keys. Track your progress over time."
        noindex={true}
        schema={[schemaBreadcrumb([{ name: 'Home', url: '/' }, { name: 'Typing', url: '/typing' }, { name: 'Analytics', url: '/typing/analytics' }])]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight mb-2">Performance Analytics</h1>
          <p className="text-muted-foreground">Track your progress and identify areas for improvement.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <AnalyticsCard key={i} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <History size={24} className="text-primary" />
            <h2 className="text-2xl font-bold">Recent Sessions</h2>
          </div>
          
          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/30">
                <tr>
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mode</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">WPM</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Accuracy</th>
                  <th className="px-8 py-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {history.map((session, i) => (
                  <tr key={i} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-secondary rounded-full text-[10px] font-black uppercase tracking-wider">
                        {session.mode}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-black text-xl">{session.wpm}</td>
                    <td className="px-8 py-5 font-bold text-emerald-500">{session.accuracy}%</td>
                    <td className="px-8 py-5 text-xs text-muted-foreground">
                      {new Date(session.timestamp).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center text-muted-foreground">
                      No sessions recorded yet. Start practicing!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Weak Keys Heatmap Sidebar */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Zap size={24} className="text-yellow-500" />
            <h2 className="text-2xl font-bold">Weak Keys</h2>
          </div>

          <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-[2.5rem] p-8 space-y-6">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Keys with the highest error rates. Practice these specifically in <strong>Rows mode</strong>.
            </p>
            
            <div className="space-y-4">
              {Object.values(weakKeys)
                .sort((a, b) => (b.errors / b.attempts) - (a.errors / a.attempts))
                .slice(0, 8)
                .map((wk) => (
                  <div key={wk.key} className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl border border-border/30">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 flex items-center justify-center bg-card border border-border rounded-xl font-mono font-black text-xl">
                        {wk.key === ' ' ? 'SPC' : wk.key.toUpperCase()}
                      </span>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Error Rate</p>
                        <p className="text-sm font-bold text-red-500">{Math.round((wk.errors/wk.attempts)*100)}%</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground" />
                  </div>
                ))}
              {Object.keys(weakKeys).length === 0 && (
                <div className="text-center py-10 opacity-30">
                  <Target size={40} className="mx-auto mb-2" />
                  <p className="text-xs font-bold">Data will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingAnalyticsPage;
