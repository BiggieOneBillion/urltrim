"use client";

interface DashboardStatsProps {
  totalUrls: number;
  totalClicks: number;
  isLoading?: boolean;
}

export const DashboardStats = ({ totalUrls, totalClicks, isLoading = false }: DashboardStatsProps) => {
  return (
    <div style={{ padding: "24px", marginBottom: "24px" }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800">
      <h3 style={{ marginBottom: "16px" }} className="text-xl font-bold text-gray-900 dark:text-white">
        Quick Stats
      </h3>

      {isLoading ? (
        // Skeleton loading state
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          <div style={{ padding: "16px" }} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse">
            <div style={{ marginBottom: "8px" }} className="h-4 bg-gray-300 dark:bg-gray-700 w-1/2 rounded"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 w-3/4 rounded"></div>
          </div>
          <div style={{ padding: "16px" }} className="bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse">
            <div style={{ marginBottom: "8px" }} className="h-4 bg-gray-300 dark:bg-gray-700 w-1/2 rounded"></div>
            <div className="h-8 bg-gray-300 dark:bg-gray-700 w-3/4 rounded"></div>
          </div>
        </div>
      ) : (
        // Actual data state
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
          <div style={{ padding: "16px" }} className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total URLs</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalUrls}</p>
          </div>
          <div style={{ padding: "16px" }} className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Total Clicks</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{totalClicks}</p>
          </div>
        </div>
      )}
    </div>
  );
};
