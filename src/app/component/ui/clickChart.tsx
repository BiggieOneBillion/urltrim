"use client"
import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const ClicksChart = ({ stats }) => {
  // Process the click data from stats
  const clickData = useMemo(() => {
    if (!stats || !stats.stats) return [];
    
    // Get the click distribution by day from your data
    const clicksByDay = stats.stats.clicksByDay || {};
    const uniqueVisitorsPerDay = stats.stats.uniqueVisitorsPerDay || {};
    
    // Convert the object to an array format that Recharts can use
    return Object.entries(clicksByDay).map(([date, clicks]) => {
      // Format the date for display (e.g., "2025-03-30" to "Mar 30")
      const formattedDate = new Date(date).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
      });
      
      return {
        date: formattedDate,
        clicks: clicks,
        // If you have unique visitors data by day, add it here
        // uniqueVisitors: uniqueVisitorsByDay[date] || 0
      };
    }).sort((a, b) => {
      // Sort by date to ensure chronological order
      return new Date(a.dateObj) - new Date(b.dateObj);
    });
  }, [stats]);

  if (clickData.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg h-64 flex items-center justify-center">
        <p className="text-gray-500">No click data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Daily Clicks</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={clickData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="clicks" fill="black" />
          {/* If you have unique visitors data: */}
           <Bar dataKey="uniqueVisitors" fill="red" /> 
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-4 text-sm text-gray-600">
        <div>
          <span className="inline-block w-3 h-3 bg-black mr-2"></span>
          Total Clicks
        </div>
        {/* If you add unique visitors: */}
         <div>
          <span className="inline-block w-3 h-3 bg-red-500 mr-2"></span>
          Unique Visitors
        </div> 
      </div>
    </div>
  );
};

export default ClicksChart;