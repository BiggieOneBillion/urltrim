// app/components/ManageReferralRequestsModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Check, X as Reject } from 'lucide-react';
import axios from 'axios';

interface ReferralRequest {
  _id: string;
  url: {
    originalUrl: string;
    shortUrl: string;
    shortId: string;
  };
  requester: {
    name: string;
    email: string;
  };
  status: string;
  customAlias?: string;
  createdAt: string;
}

interface ManageReferralRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ManageReferralRequestsModal: React.FC<ManageReferralRequestsModalProps> = ({ isOpen, onClose }) => {
  const [requests, setRequests] = useState<ReferralRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/referrals/pending',{
         method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
      });
       // Parse the JSON response first
      const data = await response.json();
        setRequests(data.requests || []);
      
    } catch (err: any) {
      setError('Failed to load referral requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const handleUpdateStatus = async (requestId: string, status: 'approved' | 'declined') => {
    try {
      await axios.patch(`/api/referrals/status/${requestId}`, { status },  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
      // Refresh the list
      fetchRequests();
    } catch (err) {
      setError('Failed to update request status');
      console.error(err);
    }
  };

  const dismissError = () => {
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div style={{padding: "24px"}} className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={24} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-center">
           Referral Requests
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block">{error}</span>
            <button
              onClick={dismissError}
              className="absolute top-0 right-0 mt-2 mr-2 text-red-700 hover:text-red-900"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-red-500">
            No pending referral requests
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-3 px-4 text-left font-semibold">Requester</th>
                  <th className="py-3 px-4 text-left font-semibold">Original URL</th>
                  <th className="py-3 px-4 text-left font-semibold">Custom Alias</th>
                  <th className="py-3 px-4 text-left font-semibold">Date</th>
                  <th className="py-3 px-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium">{request.requester?.name}</div>
                      <div className="text-sm text-gray-500">{request.requester?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="truncate max-w-xs">{request.url?.originalUrl}</div>
                      <div className="text-sm text-gray-500 truncate">{request.url?.shortUrl}</div>
                    </td>
                    <td className="py-3 px-4">
                      {request.customAlias || 'Auto-generated'}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'approved')}
                          className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-full"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(request._id, 'declined')}
                          className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-full"
                          title="Decline"
                        >
                          <Reject size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
