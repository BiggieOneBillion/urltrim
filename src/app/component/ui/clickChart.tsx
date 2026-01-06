// app/component/ui/clickChart.tsx
"use client";

import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface ClicksChartProps {
  stats: any;
}

const ClicksChart: React.FC<ClicksChartProps> = ({ stats }) => {
  const clickData = useMemo(() => {
    if (!stats || !stats.stats) return [];
    
    const clicksByDay = stats.stats.clicksByDay || {};
    
    return Object.entries(clicksByDay).map(([date, clicks]) => {
      const formattedDate = new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
      
      return {
        date: formattedDate,
        clicks: clicks,
        dateObj: new Date(date)
      };
    }).sort((a: any, b: any) => a.dateObj.getTime() - b.dateObj.getTime());
  }, [stats]);

  if (clickData.length === 0) {
    return (
      <div className="glass p-8 rounded-[2rem] border border-white/5 h-64 flex flex-col items-center justify-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
          <span className="text-gray-600">📊</span>
        </div>
        <p className="text-gray-500 font-bold tracking-tight">No activity recorded yet</p>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass !bg-black/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <p className="text-lg font-black text-white">{payload[0].value}</p>
            <p className="text-xs text-gray-400 font-bold mt-1">Clicks</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Daily Performance</h3>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">Global Interaction Trends</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Total Clicks</span>
          </div>
        </div>
      </div>

      <div className="h-[300px] w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={clickData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="rgba(255,255,255,0.05)" 
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 900 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 10, fontWeight: 900 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 12 }} />
            <Bar 
              dataKey="clicks" 
              radius={[12, 12, 12, 12]}
              barSize={32}
            >
              {clickData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#barGradient)`} 
                  className="transition-all duration-300 hover:opacity-80"
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                <stop offset="100%" stopColor="#1e3a8a" stopOpacity={0.8} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ClicksChart;