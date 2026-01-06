// app/component/ui/geographicDistribution.tsx
"use client";

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Map, Globe, Navigation } from 'lucide-react';

interface CountryDetail {
  country: string;
  count: number;
  percentage: string;
}

interface GeographicalDistributionProps {
  stats: {
    stats: {
      continentDistribution: Record<string, number>;
      countryDetails: CountryDetail[];
    };
  };
}

const GeographicalDistribution: React.FC<GeographicalDistributionProps> = ({ stats }) => {
  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1', '#f43f5e'];

  const continentData = Object.entries(stats.stats.continentDistribution || {}).map(
    ([name, value]) => ({
      name,
      value: Number(value),
    })
  );

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass !bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{payload[0].name}</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-black text-white">{payload[0].value} Visits</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Continent Distribution */}
      <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Continents</h3>
            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">Global Reach Breakdown</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Map size={20} className="text-blue-500" />
          </div>
        </div>

        <div className="h-64 mt-4">
          {continentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={continentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {continentData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  align="center"
                  iconType="circle"
                  formatter={(value) => <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3 opacity-50">
              <Globe size={32} className="text-gray-600" />
              <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Awaiting spatial data</p>
            </div>
          )}
        </div>
      </div>

      {/* Country Distribution List */}
      <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-white tracking-tight">Top Regions</h3>
            <p className="text-xs text-gray-500 font-bold mt-1 uppercase tracking-widest">High Traffic Locations</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
            <Globe size={20} className="text-purple-500" />
          </div>
        </div>

        <div className="overflow-y-auto max-h-64 pr-2 custom-scrollbar">
          <div className="space-y-4">
            {stats.stats.countryDetails && stats.stats.countryDetails.length > 0 ? (
              stats.stats.countryDetails.map((country, index) => (
                <div key={index} className="group">
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                        <Navigation size={12} className="text-gray-500 group-hover:text-blue-400 transition-colors" />
                      </div>
                      <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                        {country.country}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-white">{country.count}</span>
                      <span className="text-[10px] text-gray-500 font-bold ml-2 uppercase tracking-widest">
                        {country.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-600 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${country.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center gap-3 opacity-50">
                <Map size={32} className="text-gray-600" />
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No regional matches</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeographicalDistribution;
