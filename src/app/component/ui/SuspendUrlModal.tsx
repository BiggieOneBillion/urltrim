// app/component/ui/SuspendUrlModal.tsx
"use client";

import React, { useState } from "react";
import { X, PlayCircle, PauseCircle, ShieldCheck } from "lucide-react";
import { ModernButton } from "./ModernButton";
import { ModernInput } from "./ModernInput";

interface SuspendUrlModalProps {
  urlId: string;
  shortUrl: string;
  isOpen: boolean;
  isSuspended: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SuspendUrlModal: React.FC<SuspendUrlModalProps> = ({
  urlId,
  shortUrl,
  isOpen,
  isSuspended,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const action = isSuspended ? 'unsuspend' : 'suspend';

  if (!isOpen) return null;

  const handleSuspend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/urls/suspend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          urlId,
          password,
          action
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || `Failed to ${action} URL`);
        setIsSubmitting(false);
        return;
      }

      onSuccess();
      onClose();
    } catch (error) {
      setError("An unexpected error occurred");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-6 animate-in fade-in duration-300">
      <div className="glass rounded-[2rem] p-8 max-w-md w-full border border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${isSuspended ? 'bg-green-500/10' : 'bg-amber-500/10'} rounded-xl flex items-center justify-center border ${isSuspended ? 'border-green-500/20' : 'border-amber-500/20'}`}>
              {isSuspended ? <PlayCircle size={20} className="text-green-500" /> : <PauseCircle size={20} className="text-amber-500" />}
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isSuspended ? 'Reactivate Link' : 'Suspend Link'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-8 space-y-4">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-sm text-gray-300 leading-relaxed font-medium">
              {isSuspended 
                ? 'Ready to bring this link back online?' 
                : 'This will temporarily pause traffic to this URL.'}
            </p>
            <p className="text-xs text-gray-500 mt-2 break-all opacity-80">{shortUrl}</p>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
            <ShieldCheck size={16} className="text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed font-medium">
              {isSuspended 
                ? 'Submitting your password will immediately reactivate the redirects for this link.' 
                : 'While suspended, visitors will see a standard hold page instead of being redirected.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSuspend} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
              Verify Identity
            </label>
            <ModernInput
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="text-red-500 text-xs font-bold mt-1 ml-1 animate-in slide-in-from-left-2">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 glass glass-hover rounded-2xl text-white font-bold text-sm transition-all active:scale-95"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <ModernButton
              type="submit"
              className={`flex-1 ${isSuspended ? '!bg-green-600 hover:!bg-green-500 shadow-xl shadow-green-500/10' : '!bg-amber-600 hover:!bg-amber-500 shadow-xl shadow-amber-500/10'}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Syncing..." : (isSuspended ? "Reactivate" : "Suspend")}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
};