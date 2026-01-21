"use client";

import React from 'react';
import ClicksChart from "@/app/component/ui/clickChart";

interface UrlStats {
  stats: {
    peakDay: string;
    lastClicked: string;
    avgDailyClicks: number;
    mostClickedIp: string;
    mostClickedCountry: string;
    mostClickedCity: string;
    mostClickedDevice: string;
    mostClickedBrowser: string;
    mostClickedOs: string;
  };
}

interface ClickAnalyticsProps {
  stats: UrlStats;
  formatTimeAgo: (dateString: string) => string;
}

export const ClickAnalytics = ({ stats, formatTimeAgo }: ClickAnalyticsProps) => {

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Click Analytics</h3>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px' 
      }}>
        {/* Chart Section */}
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '24px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          minHeight: '400px'
        }}>
           <ClicksChart stats={stats} />
        </div>

        {/* Insights Section */}
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '24px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' 
        }}>
          <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '4px', height: '16px', backgroundColor: '#2563eb', borderRadius: '2px' }}></span>
            Key Insights
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <InsightItem label="Peak Day" value={stats.stats.peakDay || "No data"} />
            <InsightItem 
              label="Last Clicked" 
              value={stats.stats.lastClicked ? formatTimeAgo(stats.stats.lastClicked) : "Never"} 
            />
            <InsightItem label="Most Active IP" value={stats.stats?.mostClickedIp == "unknown" ? "None" : stats.stats?.mostClickedIp} />
            <InsightItem label="Top Country" value={stats.stats?.mostClickedCountry == "unknown" ? "None" : stats.stats?.mostClickedCountry} />
          </div>

          {stats.stats.mostClickedDevice != "unknown" || stats.stats.mostClickedBrowser != "unknown" || stats.stats.mostClickedOs != "unknown" ? <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
            <h5 style={{ fontSize: '14px', fontWeight: '600', color: '#4b5563', marginBottom: '12px' }}>Top Environment</h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
             { stats.stats.mostClickedDevice != "unknown" && <Badge label={stats.stats.mostClickedDevice || "unknown device"} />}
             { stats.stats.mostClickedBrowser != "unknown" && <Badge label={stats.stats.mostClickedBrowser || "unknown browser"} />}
             { stats.stats.mostClickedOs != "unknown" && <Badge label={stats.stats.mostClickedOs || "unknown os"} />}
            </div>
          </div> : null}
        </div>
      </div>
    </div>
  );
};

const InsightItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
    <div style={{ fontSize: '14px', fontWeight: '600', color: '#111827', wordBreak: 'break-word' }}>{value}</div>
  </div>
);

const Badge = ({ label }: { label: string }) => (
  <span style={{ 
    backgroundColor: '#f3f4f6', 
    color: '#374151', 
    padding: '4px 10px', 
    borderRadius: '6px', 
    fontSize: '12px', 
    fontWeight: '500',
    border: '1px solid #e5e7eb'
  }}>
    {label}
  </span>
);
