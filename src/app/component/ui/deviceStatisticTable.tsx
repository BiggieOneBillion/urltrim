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
    <div style={{ gap: "20px", display: "flex", flexDirection: "column" }} className="bg-white rounded-xl shadow-sm p-6">
      <h3 style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "10px" }}>Device Statistics</h3>
      
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 4px" }}>
          <thead>
            <tr style={{ color: "#6b7280", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600" }}>Device Type</th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: "600" }}>Visits</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600" }}>Percentage</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px", color: "#374151" }}>
            {sortedDevices.map((item, index) => (
              <tr 
                key={index} 
                style={{ 
                  backgroundColor: index % 2 === 0 ? "#f9fafb" : "transparent",
                  transition: "background-color 0.2s"
                }}
              >
                <td style={{ padding: "16px", borderRadius: "8px 0 0 8px" }}>{item.device}</td>
                <td style={{ padding: "16px", textAlign: "center", fontWeight: "500" }}>{item.count}</td>
                <td style={{ padding: "16px", borderRadius: "0 8px 8px 0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ flex: 1, backgroundColor: "#e5e7eb", borderRadius: "9999px", height: "6px", maxWidth: "100px" }}>
                      <div 
                        style={{ 
                          width: `${item.percentage}%`, 
                          backgroundColor: "#111827", 
                          height: "100%", 
                          borderRadius: "9999px" 
                        }} 
                      />
                    </div>
                    <span style={{ fontSize: "12px", color: "#6b7280", minWidth: "40px" }}>{item.percentage}%</span>
                  </div>
                </td>
              </tr>
            ))}
            
            {/* Total row */}
            <tr style={{ fontWeight: "600", borderTop: "1px solid #f3f4f6", marginTop: "8px" }}>
              <td style={{ padding: "16px", borderRadius: "8px 0 0 8px" }}>Total</td>
              <td style={{ padding: "16px", textAlign: "center" }}>{totalVisits}</td>
              <td style={{ padding: "16px", borderRadius: "0 8px 8px 0" }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DeviceStatisticsTable;