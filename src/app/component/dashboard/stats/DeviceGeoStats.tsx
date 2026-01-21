"use client";

import React from 'react';
import GeographicalDistribution from "@/app/component/ui/geographicDistribution";
import DeviceStatisticsTable from "@/app/component/ui/deviceStatisticTable";

interface UrlStats {
  stats: {
    deviceDistribution: Record<string, number>;
    continentDistribution: any;
    topCountries: Array<{ name: string, count: number }>;
    totalClicks: number;
    // Add other properties needed by GeographicalDistribution if any
    [key: string]: any; 
  };
}

interface DeviceGeoStatsProps {
  stats: UrlStats;
}

export const DeviceGeoStats = ({ stats }: DeviceGeoStatsProps) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px', marginBottom: '32px' }}>
      
      {/* Geographical Distribution */}
      {/* <div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Geographical Distribution</h3>
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', overflow: 'hidden' }}>
          <GeographicalDistribution 
            stats={{
              ...stats,
              stats: {
                ...stats.stats,
                continentDistribution: (typeof stats.stats.continentDistribution === 'object' ? stats.stats.continentDistribution : {}) as Record<string, number>,
                countryDetails: stats.stats.topCountries.map(country => ({
                  country: country.name,
                  count: country.count,
                  percentage: ((country.count / stats.stats.totalClicks) * 100).toFixed(1) + '%'
                }))
              }
            }} 
          />
        </div>
      </div> */}

      {/* Device Statistics */}
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#111827' }}>Device Breakdown</h3>
        <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', padding: '24px' }}>
          <DeviceStatisticsTable deviceDistribution={stats.stats.deviceDistribution} />
        </div>
      </div>
      
    </div>
  );
};
