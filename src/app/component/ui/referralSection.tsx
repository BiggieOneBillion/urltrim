import React from 'react';
import { Link, ExternalLink } from 'lucide-react';

interface Stats {
    referrersDistribution?: Record<string, number>;
    totalReferrerCount?: number;
      totalClicks?: number;
    totalOverallClicks?: number;
    totalReferralClicks?: number;
}

interface ReferralItem {
  name: string;
  shortUrl: string;
  shortId: string;
  clicks: number;
  originalUrl: string;
  createdAt?: string;
}

const ReferralsSection = ({ stats, allReferrals = [] }: { stats?: Stats; allReferrals?: ReferralItem[] }) => {
  // Sample data structure for referrals - you'll need to populate this from your API
  // This would come from your backend, similar to how you get device distributions
  const referralStats = stats?.referrersDistribution || {};
  
  // Check if referralStats is actually an object and not a Promise
  const isValidReferralStats = typeof referralStats === 'object' && 
                              !Array.isArray(referralStats) && 
                              !(referralStats instanceof Promise);
  
  // Calculate total referral clicks
  const totalReferralClicks = isValidReferralStats 
    ? Object.values(referralStats).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0)
    : stats?.totalReferrerCount || 0;
  
  // Calculate percentages and sort by clicks (descending)
  const sortedReferrals = isValidReferralStats 
    ? Object.entries(referralStats)
        .map(([referrer, count]) => ({
          name: referrer || 'Direct',
          count: typeof count === 'number' ? count : 0,
          percentage: totalReferralClicks > 0 
            ? ((typeof count === 'number' ? count : 0) / totalReferralClicks * 100).toFixed(1) 
            : '0'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10) // Top 10 referrals
    : [];

  // Log the referrals data for debugging
  
   const directClicks = stats?.totalClicks || 0;
  const referralClicks = stats?.totalReferralClicks || totalReferralClicks;
  const overallClicks = stats?.totalOverallClicks || (directClicks + referralClicks);
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold mt-8">Referrals</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
        {/* Summary Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="mr-4 text-blue-500">
              <ExternalLink size={24} />
            </div>
            <h3 className="text-xl font-bold">Referral Overview</h3>
          </div>
          
          <div className="flex flex-col space-y-4">
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
              <span className="text-gray-700">Total Referral Clicks</span>
              <span className="text-2xl font-bold">{totalReferralClicks}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
              <span className="text-gray-700">Active Referrers</span>
              <span className="text-2xl font-bold">{Object.keys(referralStats).length || 0}</span>
            </div>
            
            <div className="flex justify-between items-center p-4 bg-gray-50 rounded-md">
              <span className="text-gray-700">Top Referrer</span>
              <span className="text-xl font-medium">
                {sortedReferrals.length > 0 ? sortedReferrals[0].name : 'None'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Top Referrals Table */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h3 className="text-xl font-bold mb-4">Top 10 Referrals</h3>
          
          {sortedReferrals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100 border-b">
                    <th className="py-3 px-4 text-left font-semibold">Source</th>
                    <th className="py-3 px-4 text-center font-semibold">Clicks</th>
                    <th className="py-3 px-4 text-center font-semibold">Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedReferrals.map((item, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="py-3 px-4 border-b truncate max-w-36">{item.name}</td>
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
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No referral data available
            </div>
          )}
        </div>
      </div>
      
      {/* All Referrals Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">All Referral Links ({allReferrals.length})</h3>
        
        {allReferrals && allReferrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-3 px-4 text-left font-semibold">Referral Name</th>
                  <th className="py-3 px-4 text-left font-semibold">Shortened URL</th>
                  <th className="py-3 px-4 text-center font-semibold">Total Clicks</th>
                  <th className="py-3 px-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allReferrals.map((referral, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="py-3 px-4 border-b">{referral.name || 'Unknown'}</td>
                    <td className="py-3 px-4 border-b truncate max-w-xs">
                      <a href={referral.shortUrl} target="_blank" rel="noopener noreferrer" 
                         className="text-black hover:underline flex items-center">
                        {referral.shortUrl}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    </td>
                    <td className="py-3 px-4 text-center border-b">{referral.clicks}</td>
                    <td className="py-3 px-4 text-center border-b">
                      <div className="flex justify-center space-x-2">
                        <button 
                          className="p-1 text-gray-500 hover:text-black"
                          title="Copy URL"
                          onClick={() => navigator.clipboard.writeText(referral.shortUrl)}>
                          <Link size={18} />
                        </button>
                        <a 
                          href={`/dashboard/detailed-stats/${referral.shortId}`}
                          className="p-1 text-gray-500 hover:text-black"
                          title="View Stats">
                          <ExternalLink size={18} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No referral links available
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralsSection;