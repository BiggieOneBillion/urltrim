import React from 'react';

const DeviceStatisticsTable = ({ deviceDistribution }) => {
  // Calculate total visits to determine percentages
  const totalVisits = Object.values(deviceDistribution).reduce(
    (sum, count) => sum + Number(count), 
    0
  );
  
  // Convert the distribution object into an array of entries and sort by count (descending)
  const sortedDevices = Object.entries(deviceDistribution)
    .map(([device, count]) => ({
      device,
      count: Number(count),
      percentage: totalVisits > 0 ? ((Number(count) / totalVisits) * 100).toFixed(1) : '0'
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-xl font-bold mb-4">Device Statistics</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="py-3 px-4 text-left font-semibold">Device Type</th>
              <th className="py-3 px-4 text-center font-semibold">Visits</th>
              <th className="py-3 px-4 text-center font-semibold">Percentage</th>
            </tr>
          </thead>
          <tbody>
            {sortedDevices.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                <td className="py-3 px-4 border-b">{item.device}</td>
                <td className="py-3 px-4 text-center border-b">{item.count}</td>
                <td className="py-3 px-4 text-center border-b">
                  <div className="flex items-center justify-center">
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 max-w-24">
                      <div 
                        className="bg-black h-2.5 rounded-full" 
                        style={{ width: `${item.percentage}%` }}>
                      </div>
                    </div>
                    {item.percentage}%
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Total row */}
            <tr className="bg-gray-100 font-semibold">
              <td className="py-3 px-4 border-t">Total</td>
              <td className="py-3 px-4 text-center border-t">{totalVisits}</td>
              <td className="py-3 px-4 text-center border-t">100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceStatisticsTable;