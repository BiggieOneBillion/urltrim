// app/component/ui/referralSection.tsx
"use client";

import React from 'react';
import { Link as LinkIcon, ExternalLink, Share2, TrendingUp, Users } from 'lucide-react';

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
  const referralStats = stats?.referrersDistribution || {};
  
  const isValidReferralStats = typeof referralStats === 'object' && 
                              !Array.isArray(referralStats) && 
                              !(referralStats instanceof Promise);
  
  const totalReferralClicks = isValidReferralStats 
    ? Object.values(referralStats).reduce((sum: number, count) => sum + (typeof count === 'number' ? count : 0), 0)
    : stats?.totalReferrerCount || 0;
  
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
        .slice(0, 10)
    : [];

  return (
    <div className="space-y-12 pb-12">
      <div className="flex flex-col gap-2 mt-12">
        <h2 className="text-3xl font-black text-white tracking-tighter">Acquisition</h2>
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Referral & Traffic Analysis</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Summary Card */}
        <div className="xl:col-span-2 glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Share2 size={20} className="text-blue-500" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Overview</h3>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 group hover:border-blue-500/30 transition-all">
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Referral Clicks</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white tracking-tighter">{totalReferralClicks}</span>
                <TrendingUp size={16} className="text-blue-400 mb-2" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Active Referrers</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-white tracking-tighter">{Object.keys(referralStats).length || 0}</span>
                  <Users size={14} className="text-purple-400" />
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Leading Source</p>
                <span className="text-lg font-black text-white tracking-tight truncate block">
                  {sortedReferrals.length > 0 ? sortedReferrals[0].name : 'Direct'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Top Referrals List */}
        <div className="xl:col-span-3 glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white tracking-tight">Top Sources</h3>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-gray-400 uppercase tracking-widest">Global Top 10</span>
          </div>
          
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {sortedReferrals.map((item, index) => (
              <div key={index} className="group">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-colors">
                      <span className="text-[10px] font-black text-gray-500">0{index + 1}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors truncate max-w-[120px]">{item.name}</span>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-sm font-black text-white">{item.count}</span>
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest w-12">{item.percentage}%</span>
                  </div>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
            
            {sortedReferrals.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-center gap-3 opacity-50">
                <ExternalLink size={32} className="text-gray-600" />
                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">No traversal data recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* All Referrals Panel */}
      <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-black text-white tracking-tight">Managed Referral Links</h3>
            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">
              {allReferrals.length} Active
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Identifier</th>
                <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">Redirection Point</th>
                <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-center">Engagement</th>
                <th className="pb-4 text-[10px] font-black text-gray-500 uppercase tracking-widest text-right pr-4">Commands</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {allReferrals.map((referral, index) => (
                <tr key={index} className="group hover:bg-white/[0.01] transition-colors">
                  <td className="py-5">
                    <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{referral.name || 'Anonymous'}</span>
                  </td>
                  <td className="py-5">
                    <a href={referral.shortUrl} target="_blank" rel="noopener noreferrer" 
                       className="group/link inline-flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors">
                      <span className="truncate max-w-[200px] block">{referral.shortUrl}</span>
                      <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  </td>
                  <td className="py-5 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 group-hover:border-blue-500/20 transition-all">
                      <TrendingUp size={10} className="text-blue-400" />
                      <span className="text-xs font-black text-white tracking-tighter">{referral.clicks}</span>
                    </div>
                  </td>
                  <td className="py-5 text-right">
                    <div className="flex justify-end gap-2 pr-4">
                      <button 
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all active:scale-90"
                        title="Sync to clipboard"
                        onClick={() => navigator.clipboard.writeText(referral.shortUrl)}>
                        <LinkIcon size={14} />
                      </button>
                      <a 
                        href={`/dashboard/detailed-stats/${referral.shortId}`}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all active:scale-90"
                        title="View analytics">
                        <Share2 size={14} />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              
              {allReferrals.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-16 text-center">
                    <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">Catalog is empty</p>
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

export default ReferralsSection;