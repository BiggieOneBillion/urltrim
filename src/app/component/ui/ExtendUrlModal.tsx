// app/component/ui/ExtendUrlModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ExtendUrlModalProps {
  urlId: string;
  currentExpiry: string | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

// ... existing code ...
export function ExtendUrlModal({ urlId, currentExpiry, onClose, onSuccess }: ExtendUrlModalProps) {
  const [extensionDays, setExtensionDays] = useState<number>(90);
  const [customDays, setCustomDays] = useState<string>("");
  const [useCustomDays, setUseCustomDays] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Determine the days to extend
    let daysToExtend = extensionDays;
    if (useCustomDays) {
      const parsedDays = parseInt(customDays);
      if (isNaN(parsedDays)) {
        setError("Please enter a valid number of days");
        setLoading(false);
        return;
      }
      daysToExtend = parsedDays;
    }

    try {
      const response = await fetch('/api/urls/extend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          urlId,
          extensionDays: daysToExtend
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extend URL expiration');
      }

      onSuccess(`URL expiration ${daysToExtend >= 0 ? 'extended' : 'reduced'} successfully to ${new Date(data.url.expireAt).toLocaleDateString()}`);
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Modify URL Expiration</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              Current Expiration:
            </label>
            <p className="text-gray-600">
              {currentExpiry === "No Expire" 
                ? "No expiration date set" 
                : new Date(currentExpiry || '').toLocaleDateString()}
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">
              <input
                type="radio"
                checked={!useCustomDays}
                onChange={() => setUseCustomDays(false)}
                className="mr-2"
              />
              Choose from preset options:
            </label>
            <select
              value={extensionDays}
              onChange={(e) => setExtensionDays(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded"
              disabled={useCustomDays}
            >
              <option value={-30}>Reduce by 30 days</option>
              <option value={-15}>Reduce by 15 days</option>
              <option value={-7}>Reduce by 7 days</option>
              <option value={7}>Extend by 7 days</option>
              <option value={30}>Extend by 30 days</option>
              <option value={90}>Extend by 90 days</option>
              <option value={180}>Extend by 180 days</option>
              <option value={365}>Extend by 365 days</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">
              <input
                type="radio"
                checked={useCustomDays}
                onChange={() => setUseCustomDays(true)}
                className="mr-2"
              />
              Enter custom days:
            </label>
            <div className="flex items-center">
              <input
                type="number"
                value={customDays}
                onChange={(e) => setCustomDays(e.target.value)}
                placeholder="e.g. 10 or -5"
                className="w-full p-2 border border-gray-300 rounded"
                disabled={!useCustomDays}
              />
              <span className="ml-2">days</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Use positive numbers to extend, negative to reduce. Cannot set expiration in the past.
            </p>
          </div>

          <div className="flex justify-between">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Processing...' : 'Update Expiration'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}