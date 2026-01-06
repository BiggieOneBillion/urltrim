// app/component/ui/deviceStatisticTable.tsx
"use client";

import React from 'react';
import { Smartphone, Monitor, Tablet, HelpCircle } from 'lucide-react';

interface DeviceStatisticsTableProps {
  deviceDistribution: Record<string, number | string>;
}

const DeviceStatisticsTable: React.FC<DeviceStatisticsTableProps> = ({ deviceDistribution }) => {
  const totalVisits = Object.values(deviceDistribution).reduce(
    (sum: number, count) => sum + Number(count), 
    0
  );
  
  const sortedDevices = Object.entries(deviceDistribution)
    .map(([device, count]) => ({
      device,
      count: Number(count),
      percentage: totalVisits > 0 ? ((Number(count) / totalVisits) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.count - a.count);

  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes('mobile') || d.includes('phone')) return <Smartphone size={16} className="text-blue-400" />;
    if (d.includes('desktop') || d.includes('window') || d.includes('mac')) return <Monitor size={16} className="text-purple-400" />;
    if (d.includes('tablet') || d.includes('ipad')) return <Tablet size={16} className="text-pink-400" />;
    return <HelpCircle size={16} className="text-gray-400" />;
  };

  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-white tracking-tight">Device Usage</h3>
          <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">Technographic Breakdown</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedDevices.map((item, index) => (
          <div key={index} className="group">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                  {getDeviceIcon(item.device)}
                </div>
                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{item.device}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-black text-white">{item.count}</span>
                <span className="text-[10px] text-gray-500 font-bold ml-2 uppercase tracking-tight">{item.percentage}%</span>
              </div>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
        
        {sortedDevices.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
              <Smartphone size={24} className="text-gray-600" />
            </div>
            <p className="text-gray-500 font-bold tracking-tight">No device data detected</p>
          </div>
        )}
      </div>

      {totalVisits > 0 && (
        <div className="pt-4 mt-2 border-t border-white/5 flex justify-between items-center">
          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Cumulative Visits</span>
          <span className="text-lg font-black text-white tracking-tighter">{totalVisits}</span>
        </div>
      )}
    </div>
  );
};

export default DeviceStatisticsTable;