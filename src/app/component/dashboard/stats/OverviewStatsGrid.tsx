"use client";

import React from 'react';
import { BarChart2, Globe, TrendingUp, Plane, Clock } from 'lucide-react';

interface UrlStats {
  createdAt: string;
  stats: {
    totalClicks: number;
    totalReferralClicks: any;
    totalOverallClicks: any;
    uniqueVisitors: number;
    avgDailyClicks: number;
    totalCountries: number;
  };
}

interface OverviewStatsGridProps {
  stats: UrlStats;
  formatTimeAgo: (dateString: string) => string;
}

export const OverviewStatsGrid = ({ stats, formatTimeAgo }: OverviewStatsGridProps) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Performance Overview</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px' 
      }}>
        <StatCard
          icon={<BarChart2 size={24} />}
          title="Total Clicks"
          value={stats.stats.totalOverallClicks?.toString() || "0"}
          color="blue"
        />
        <StatCard
          icon={<Globe size={24} />}
          title="Unique Visitors"
          value={stats.stats.uniqueVisitors?.toString() || "0"}
          color="indigo"
        />
        <StatCard
          icon={<TrendingUp size={24} />}
          title="Avg Daily Clicks"
          value={typeof stats.stats.avgDailyClicks === 'number' ? stats.stats.avgDailyClicks.toFixed(1) : "0.0"}
          color="emerald"
        />
        <StatCard
          icon={<Plane size={24} />}
          title="Countries Reach"
          value={stats.stats.totalCountries?.toString() || "0"}
          color="violet"
        />
        <StatCard
          icon={<Clock size={24} />}
          title="Created"
          value={formatTimeAgo(stats.createdAt)}
          color="gray"
        />
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: string }) => {
  const colors: Record<string, { bg: string, text: string }> = {
    blue: { bg: '#eff6ff', text: '#2563eb' },
    indigo: { bg: '#eef2ff', text: '#4f46e5' },
    emerald: { bg: '#ecfdf5', text: '#059669' },
    violet: { bg: '#f5f3ff', text: '#7c3aed' },
    gray: { bg: '#f9fafb', text: '#4b5563' },
  };

  const theme = colors[color] || colors.gray;

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      padding: '20px', 
      borderRadius: '12px', 
      boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      border: '1px solid #f3f4f6'
    }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        borderRadius: '10px', 
        backgroundColor: theme.bg, 
        color: theme.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500', marginBottom: '4px' }}>{title}</div>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827' }}>{value}</div>
      </div>
    </div>
  );
};
