import React from 'react';
import HeatMap from '@uiw/react-heat-map';
import { motion } from 'framer-motion';
import { useHabitStore } from '../store/habitStore';
import { isDarkTheme, THEME_CHANGE_EVENT } from '../../../lib/theme';

const HabitCalendarHeatmap = () => {
  const { analytics } = useHabitStore();
  const rawData = analytics?.heatmapData || [];
  const [darkTheme, setDarkTheme] = React.useState(isDarkTheme());

  React.useEffect(() => {
    const syncTheme = () => setDarkTheme(isDarkTheme());
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);
    syncTheme();

    return () => window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
  }, []);

  // Convert database YYYY-MM-DD or standard dates to @uiw/react-heat-map format
  // [{ date: '2026/05/23', count: 82 }]
  const heatmapValue = rawData.map(item => ({
    date: item.date.replace(/-/g, '/'),
    count: item.count
  }));

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 4); // Display past 4 months for sleek compact side-panel fit

  const panelColors = darkTheme
    ? {
        0: '#0f172a',
        1: '#0f2f28',
        20: '#134e4a',
        45: '#0f766e',
        70: '#14b8a6',
        100: '#5eead4',
      }
    : {
        0: '#e2e8f0',
        1: '#cbd5e1',
        20: '#94a3b8',
        45: '#64748b',
        70: '#0f766e',
        100: '#14b8a6',
      };

  return (
    <div className="relative overflow-hidden p-5 rounded-3xl bg-card/80 backdrop-blur-xl border border-border/70 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.55)] space-y-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.10),transparent_35%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_32%)]" />
      <div className="relative flex justify-between items-center">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">Habit Calendar</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Past four months of consistency</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-2 h-2 rounded-[2px] bg-muted/80" />
            <div className="w-2 h-2 rounded-[2px] bg-emerald-900/70" />
            <div className="w-2 h-2 rounded-[2px] bg-emerald-700/80" />
            <div className="w-2 h-2 rounded-[2px] bg-emerald-500/80" />
            <div className="w-2 h-2 rounded-[2px] bg-emerald-300/90" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden flex justify-center">
        <div className="scale-[0.98] origin-center">
          <HeatMap
            value={heatmapValue}
            width={260}
            height={112}
            startDate={startDate}
            endDate={endDate}
            rectSize={11}
            space={2}
            monthLabels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
            weekLabels={['', 'M', '', 'W', '', 'F', '']}
            legendRender={() => null} // Hide legend to conserve space in the side panel
            rectProps={{
              rx: 2.5,
              ry: 2.5,
            }}
            panelColors={panelColors}
            rectRender={(props, data) => {
              const { key, ...rest } = props;
              return (
                <motion.rect
                  key={key}
                  {...rest}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ scale: 1.18 }}
                  transition={{ type: 'spring', stiffness: 340, damping: 24 }}
                />
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default HabitCalendarHeatmap;
