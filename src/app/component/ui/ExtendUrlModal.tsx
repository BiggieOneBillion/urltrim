// app/component/ui/ExtendUrlModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
import { ModernButton } from './ModernButton';
import { ModernInput } from './ModernInput';

interface ExtendUrlModalProps {
  urlId: string;
  currentExpiry: string | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
      <div className="glass rounded-[2rem] p-8 max-w-md w-full border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
              <Calendar size={20} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Modify Expiration</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-8 space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
            <Clock size={16} className="text-gray-500" />
            <div>
              <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Current Expiry</p>
              <p className="text-sm text-gray-300 font-bold">
                {currentExpiry === "No Expire" 
                  ? "No set expiration" 
                  : new Date(currentExpiry || '').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 animate-in slide-in-from-top-2">
            <AlertCircle size={18} />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div 
              onClick={() => setUseCustomDays(false)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group ${!useCustomDays ? 'bg-blue-500/5 border-blue-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${!useCustomDays ? 'border-blue-500' : 'border-gray-600'}`}>
                  {!useCustomDays && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <span className={`text-sm font-bold ${!useCustomDays ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>Preset Options</span>
              </div>
              <select
                value={extensionDays}
                onChange={(e) => setExtensionDays(Number(e.target.value))}
                className={`w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none transition-opacity ${useCustomDays ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
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

            <div 
              onClick={() => setUseCustomDays(true)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer group ${useCustomDays ? 'bg-blue-500/5 border-blue-500/30' : 'bg-white/5 border-white/10 hover:border-white/20'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${useCustomDays ? 'border-blue-500' : 'border-gray-600'}`}>
                  {useCustomDays && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <span className={`text-sm font-bold ${useCustomDays ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>Custom Extension</span>
              </div>
              <div className={`flex items-center gap-3 transition-opacity ${!useCustomDays ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                <ModernInput
                  type="number"
                  value={customDays}
                  onChange={(e) => setCustomDays(e.target.value)}
                  placeholder="e.g. 10"
                  className="flex-1"
                  disabled={!useCustomDays}
                />
                <span className="text-gray-500 font-bold text-sm pr-2">days</span>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-500 font-medium italic px-1 text-center">
            Use positive numbers to extend, negative to reduce duration.
          </p>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 glass glass-hover rounded-2xl text-white font-bold text-sm transition-all active:scale-95"
            >
              Cancel
            </button>
            <ModernButton
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Expiry"}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
}