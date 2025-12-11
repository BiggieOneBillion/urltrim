import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Map, Globe } from 'lucide-react';

// Add this interface to your existing UrlStats interface
interface ExtendedUrlStats extends UrlStats {
  stats: {
    // existing properties...
    continentDistribution: Record<string, number>;
    countryDetails: Array<{
      country: string;
      count: number;
      percentage: string;
    }>;
  }
}

// Add this component to your file
const GeographicalDistribution = ({ stats }: { stats: ExtendedUrlStats }) => {
  // Colors for pie chart
  const COLORS = ['red', 'black', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#83a6ed', '#8dd1e1'];

  // Prepare data for continent pie chart
  const continentData = Object.entries(stats.stats.continentDistribution || {}).map(
    ([name, value], index) => ({
      name,
      value,
    })
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {/* Continent Distribution Pie Chart */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center mb-4">
          <div className="mr-4 text-black">
            <Map />
          </div>
          <h3 className="text-xl font-bold">Continent Distribution</h3>
        </div>

        <div className="h-64">
          {continentData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={continentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {continentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} visits`, 'Visits']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">No continent data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Country Distribution List */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="flex items-center mb-4">
          <div className="mr-4 text-black">
            <Globe />
          </div>
          <h3 className="text-xl font-bold">Country Distribution</h3>
        </div>

        <div className="overflow-y-auto max-h-64">
          <table className="min-w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visits
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats.stats.countryDetails && stats.stats.countryDetails.length > 0 ? (
                stats.stats.countryDetails.map((country, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {country.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {country.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                      {country.percentage}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                    No country data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeographicalDistribution;
