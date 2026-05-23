import React from 'react';
import HeatMap from '@uiw/react-heat-map';
import { motion } from 'framer-motion';

const StudyHeatmap = ({ data = {} }) => {
  // Convert our xpHistory object { '2026-05-14': 100 } 
  // to @uiw/react-heat-map format [{ date: '2026/05/14', count: 100 }]
  const heatmapData = Object.entries(data).map(([date, xp]) => ({
    date: date.replace(/-/g, '/'),
    count: xp
  }));

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <HeatMap
        value={heatmapData}
        width={750}
        startDate={startDate}
        endDate={endDate}
        legendRender={(props) => {
          const { key, ...rest } = props;
          return <rect key={key} {...rest} rx={2} />;
        }}
        rectProps={{
          rx: 2
        }}
        panelColors={{
          0: '#18181b', // zinc-900
          1: '#064e3b', // emerald-950
          50: '#065f46', // emerald-900
          100: '#047857', // emerald-700
          200: '#10b981', // emerald-500
          500: '#34d399', // emerald-400
        }}
        rectRender={(props, data) => {
          const { key, ...rest } = props;
          return (
            <motion.rect
              key={key}
              {...rest}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.2 }}
            />
          );
        }}
      />
    </div>
  );
};

export default StudyHeatmap;
