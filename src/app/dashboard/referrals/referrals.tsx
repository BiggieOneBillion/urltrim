// app/dashboard/referrals/referrals.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { 
  Link as LinkIcon, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  AlertCircle,
  Clock,
  CheckCircle2,
  MousePointer2,
  Copy,
  Users,
  Search,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/app/context/authContext';
import { ReferralAuthModal } from '@/app/component/ui/ReferralAuthModal';
import { CreateReferralModal } from '@/app/component/ui/CreateReferralModal';
import { ManageReferralRequestsModal } from '@/app/component/ui/ManageReferralRequestModal';
import { ModernButton } from '@/app/component/ui/ModernButton';

interface ReferralItem {
  _id: string;
  name: string;
  shortUrl: string;
  shortId: string;
  clicks: number;
  originalUrl: string;
}

interface PendingRequest {
  _id: string;
  status: string;
  createdAt: string;
  url: {
    originalUrl: string;
    shortUrl: string;
    shortId: string;
  };
}

export const Referrals: React.FC = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<ReferralItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReferrals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [referralResponse, requestsResponse] = await Promise.all([
        fetch('/api/referrals/my', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/referrals/myRequests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (!referralResponse.ok || !requestsResponse.ok) {
        throw new Error('Failed to fetch referral data');
      }

      const referralData = await referralResponse.json();
      const requestsData = await requestsResponse.json();
      
      setReferrals(referralData.referrals || []);
      setPendingRequests(requestsData.requests || []);
    } catch (err) {
      console.error('Error fetching referral data:', err);
      setError('Failed to load referral data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReferrals();
    }
  }, [user]);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopySuccess(url);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const filteredReferrals = referrals.filter(r => 
    r.shortId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    r.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
        <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center border border-blue-500/20">
          <AlertCircle size={40} className="text-blue-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white">Login Required</h3>
          <p className="text-gray-500 max-w-xs mx-auto">
            Please login or create an account to manage your referral links and track earnings.
          </p>
        </div>
        <ModernButton onClick={() => setShowAuthModal(true)} className="px-8">
          Login / Sign Up
        </ModernButton>
        <ReferralAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <h2 className="text-2xl font-black text-white tracking-tight">Referral Program</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowRequestsModal(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 glass glass-hover rounded-xl text-gray-400 hover:text-white font-bold text-sm transition-all"
          >
            Manage Requests
          </button>
          <ModernButton
            onClick={() => setShowCreateModal(true)}
            className="flex-1 sm:flex-none"
          >
            <Plus size={18} className="mr-2" />
            Request Link
          </ModernButton>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="glass p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <Users size={16} className="text-blue-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-gray-500">Active</span>
          </div>
          <div className="text-2xl font-black text-white">{referrals.length}</div>
        </div>
        <div className="glass p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <Clock size={16} className="text-amber-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-gray-500">Pending</span>
          </div>
          <div className="text-2xl font-black text-white">{pendingRequests.length}</div>
        </div>
        <div className="hidden sm:block glass p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <MousePointer2 size={16} className="text-purple-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-gray-500">Total Clicks</span>
          </div>
          <div className="text-2xl font-black text-white">
            {referrals.reduce((acc, curr) => acc + curr.clicks, 0)}
          </div>
        </div>
      </div>

      {/* Pending requests section */}
      {pendingRequests.length > 0 && (
        <div className="glass bg-amber-500/5 border border-amber-500/10 rounded-3xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-amber-400" />
            <h3 className="font-bold text-amber-500 uppercase tracking-wider text-xs">Awaiting Approval</h3>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between bg-black/20 rounded-xl p-4 border border-white/5">
                <div className="min-w-0 pr-4">
                  <div className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
                    {request.url?.originalUrl}
                  </div>
                  <div className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-widest">
                    Requested {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="shrink-0">
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Search referral links..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium"
        />
      </div>

      {/* Referrals list */}
      <div className="space-y-4 pb-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <RefreshCw className="animate-spin text-blue-500" size={32} />
            <p className="text-gray-500 font-medium tracking-wide">Syncing referral data...</p>
          </div>
        ) : error ? (
          <div className="glass bg-red-500/5 border border-red-500/10 rounded-2xl p-4 text-red-500 flex items-center gap-3">
            <AlertCircle size={20} />
            <span className="font-bold text-sm">{error}</span>
          </div>
        ) : filteredReferrals.length === 0 ? (
          <div className="glass p-12 text-center rounded-[2.5rem] border border-white/5">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/10 text-gray-400">
              <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Level Up Your Links</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Request referral status for your links to start tracking secondary interactions and earning credit.
            </p>
            <ModernButton
              onClick={() => setShowCreateModal(true)}
              className="px-8"
            >
              Request Referral Link
            </ModernButton>
          </div>
        ) : (
          filteredReferrals.map((ref) => (
            <div 
              key={ref._id} 
              className="glass glass-hover p-6 rounded-[2rem] border border-white/5 flex flex-col sm:flex-row items-start sm:items-center gap-6"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <a
                    href={ref.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-lg font-bold text-white hover:text-blue-400 transition-colors flex items-center gap-2 truncate"
                  >
                    {ref.shortUrl}
                    <ExternalLink size={14} className="opacity-50" />
                  </a>
                </div>
                <div className="text-sm text-gray-500 font-medium truncate mb-4">
                  Points to: {ref.originalUrl}
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MousePointer2 size={14} className="text-blue-400" />
                    <span className="text-sm font-bold text-white">{ref.clicks}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clicks</span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => handleCopy(ref.shortUrl)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${
                  copySuccess === ref.shortUrl 
                    ? "bg-green-500 text-white" 
                    : "glass glass-hover text-gray-400 hover:text-white"
                }`}
              >
                {copySuccess === ref.shortUrl ? "Copied!" : <><Copy size={16} /> Copy Link</>}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <CreateReferralModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => fetchReferrals()}
      />

      <ManageReferralRequestsModal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
      />
    </div>
  );
};

export default Referrals;
