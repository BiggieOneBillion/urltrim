// app/dashboard/referrals/referrals.tsx
import React, { useState, useEffect } from 'react';
import { Link, ExternalLink, Plus, RefreshCcw, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/app/context/authContext';
import { ReferralAuthModal } from '@/app/component/ui/ReferralAuthModal';
import { CreateReferralModal } from '@/app/component/ui/CreateReferralModal';
import { ManageReferralRequestsModal } from '@/app/component/ui/ManageReferralRequestModal';

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

  // Fetch user's referral links and pending requests
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
      console.log(`referralData: ${referralData.referrals.length} requestData: ${requestsData.requests.length}`)

      // Correct assignment of data to state variables
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

  const handleRefresh = () => {
    fetchReferrals();
  };

  // Render content based on authentication state
  const renderContent = () => {
    if (!user) {
      return (
        <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-8 space-y-4 text-center">
          <AlertCircle size={48} className="text-blue-500" />
          <h3 className="text-xl font-bold">Login Required</h3>
          <p className="text-gray-600">
            Please login or create an account to manage referral links
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Login / Sign Up
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold">My Referrals</h2>
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
            <button
              onClick={handleRefresh}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full w-full md:w-auto"
              title="Refresh data"
            >
              <RefreshCcw size={18} />
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-black text-white px-4 py-2 rounded flex items-center space-x-2 hover:bg-gray-800 transition w-full md:w-auto justify-center"
            >
              <Plus size={18} />
              <span>Request Referral</span>
            </button>
            <button
              onClick={() => setShowRequestsModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full md:w-auto"
            >
              Manage Pending Requests
            </button>
          </div>
        </div>

        {/* Pending requests section */}
        {pendingRequests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-medium text-yellow-800 mb-2">My Referral Requests</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-yellow-200">
                    <th className="py-2 px-2 text-left text-sm font-medium text-yellow-800">Original URL</th>
                    <th className="py-2 px-2 text-left text-sm font-medium text-yellow-800">Custom Alias</th>
                    <th className="py-2 px-2 text-left text-sm font-medium text-yellow-800">Requested</th>
                    <th className="py-2 px-2 text-left text-sm font-medium text-yellow-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingRequests.map((request) => (
                    <tr key={request._id} className="border-b border-yellow-100">
                      <td className="py-2 px-2 text-sm">
                        <div className="truncate max-w-xs">{request.url?.originalUrl}</div>
                      </td>
                      <td className="py-2 px-2 text-sm">
                        {request.url?.shortId || 'Auto-generated'}
                      </td>
                      <td className="py-2 px-2 text-sm">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2 px-2 text-sm">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          {request.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Referrals list */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            {error}
          </div>
        ) : referrals.length === 0 && pendingRequests.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="mb-4">
              <Link size={32} className="text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No referral links yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first referral link to start earning credit for your referrals
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-black text-white px-4 py-2 rounded inline-flex items-center space-x-2"
            >
              <Plus size={18} />
              <span>Request Referral</span>
            </button>
          </div>
        ) : referrals.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="mb-4">
              <Link size={32} className="text-gray-400 mx-auto" />
            </div>
            <h3 className="text-lg font-medium mb-2">No referrals to manage right now</h3>
            <p className="text-gray-500 mb-4">
              Share your link with friends to create referral connections you’ll be able to track here!
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-left font-medium">Original URL</th>
                    <th className="py-3 px-4 text-left font-medium">Referral Link</th>
                    <th className="py-3 px-4 text-right font-medium">Clicks</th>
                    <th className="py-3 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="truncate max-w-xs" title={ref.originalUrl}>
                          {ref.originalUrl}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <a
                            href={ref.shortUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline truncate max-w-xs flex items-center"
                          >
                            {ref.shortUrl}
                            <ExternalLink size={14} className="ml-1 flex-shrink-0" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {ref.clicks}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleCopy(ref.shortUrl)}
                          className={`px-3 py-1 rounded text-sm ${
                            copySuccess === ref.shortUrl
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                          }`}
                        >
                          {copySuccess === ref.shortUrl ? 'Copied!' : 'Copy'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4 md:px-8">
        {renderContent()}
      </div>

      {/* Modals */}
      <ReferralAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <CreateReferralModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => fetchReferrals()}
      />

      <ManageReferralRequestsModal
        isOpen={showRequestsModal}
        onClose={() => setShowRequestsModal(false)}
      />
    </>
  );
};

export default Referrals;
