// app/component/ui/DeleteUrlModal.tsx
"use client";

import React, { useState } from "react";
import { X, AlertTriangle, ShieldAlert } from "lucide-react";
import { ModernButton } from "./ModernButton";
import { ModernInput } from "./ModernInput";

interface DeleteUrlModalProps {
  urlId: string;
  shortUrl: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DeleteUrlModal: React.FC<DeleteUrlModalProps> = ({
  urlId,
  shortUrl,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/urls/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          urlId,
          password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to delete URL");
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
            <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
              <ShieldAlert size={20} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Delete Link</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/10 rounded-full text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-8 space-y-4">
          <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
            <p className="text-sm text-gray-300 leading-relaxed">
              Are you sure you want to delete <span className="font-bold text-white break-all">{shortUrl}</span>?
            </p>
          </div>
          
          <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-2xl border border-amber-500/10">
            <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-gray-400 leading-relaxed font-medium italic">
              This action cannot be undone. The URL will be archived for 6 months before permanent deletion.
            </p>
          </div>
        </div>

        <form onSubmit={handleDelete} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
              Confirm with Password
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

          <div className="flex gap-3">
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
              className="flex-1 !bg-red-600 hover:!bg-red-500 shadow-lg shadow-red-500/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Deleting..." : "Delete Permanently"}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
};
