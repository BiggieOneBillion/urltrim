// app/stats/[shortId]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface UrlStats {
  shortId: string;
  originalUrl: string;
  createdAt: string;
  expireAt: string | null;
  stats: {
    totalClicks: number;
    deviceStats: Record<string, number>;
    geoStats: Record<string, number>;
    clicksByDay: Record<string, number>;
    referralStats: Array<{
      code: string;
      description: string | null;
      clicks: number;
      devices: Record<string, number>;
      countries: Record<string, number>;
    }>;
  };
}

export default function StatsPage() {
  const { shortId } = useParams();
  const [stats, setStats] = useState<UrlStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!shortId) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats/${shortId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch statistics');
        }

        setStats(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [shortId]);

  if (loading) {
    return <div className="flex justify-center p-12">Loading statistics...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">{error}</div>;
  }

  if (!stats) {
    return <div className="p-6 text-center">No statistics available</div>;
  }

  // Prepare data for charts
  const clicksByDayData = {
    labels: Object.keys(stats.stats.clicksByDay).sort(),
    datasets: [
      {
        label: 'Clicks per Day',
        data: Object.keys(stats.stats.clicksByDay)
          .sort()
          .map(day => stats.stats.clicksByDay[day]),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const deviceData = {
    labels: Object.keys(stats.stats.deviceStats),
    datasets: [
      {
        label: 'Clicks by Device',
        data: Object.values(stats.stats.deviceStats),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
        ],
      },
    ],
  };

  const geoData = {
    labels: Object.keys(stats.stats.geoStats),
    datasets: [
      {
        label: 'Clicks by Country',
        data: Object.values(stats.stats.geoStats),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">URL Statistics</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Link Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Original URL</p>
            <p className="break-all">{stats.originalUrl}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Short URL</p>
            <p>{`${window.location.origin}/${stats.shortId}`}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p>{new Date(stats.createdAt).toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Expires</p>
            <p>{stats.expireAt ? new Date(stats.expireAt).toLocaleString() : 'Never'}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="text-3xl font-bold text-center mb-4">
          {stats.stats.totalClicks}
          <span className="block text-sm font-normal text-gray-500">Total Clicks</span>
        </div>
        
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2">Clicks Over Time</h3>
          <div className="h-64">
            <Bar
              data={clicksByDayData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top' as const,
                  },
                  title: {
                    display: true,
                    text: 'Clicks by Day',
                  },
                },
              }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-medium mb-2">Device Breakdown</h3>
            <div className="h-64">
              <Bar
                data={deviceData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Clicks by Device Type',
                    },
                  },
                }}
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Geographic Distribution</h3>
            <div className="h-64">
              <Bar
                data={geoData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top' as const,
                    },
                    title: {
                      display: true,
                      text: 'Clicks by Country',
                    },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {stats.stats.referralStats.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Referral Performance</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referral Code
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Clicks
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Top Device
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Top Country
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.stats.referralStats.map((referral) => {
                  const topDevice = Object.entries(referral.devices).reduce(
                    (max, [device, count]) => (count > max.count ? { device, count } : max),
                    { device: 'none', count: 0 }
                  );
                  
                  const topCountry = Object.entries(referral.countries).reduce(
                    (max, [country, count]) => (count > max.count ? { country, count } : max),
                    { country: 'none', count: 0 }
                  );
                  
                  return (
                    <tr key={referral.code}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {referral.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                   
                        {referral.description || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {referral.clicks}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {topDevice.device} ({topDevice.count})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {topCountry.country} ({topCountry.count})
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}
