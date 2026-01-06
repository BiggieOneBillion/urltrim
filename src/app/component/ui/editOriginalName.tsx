// app/component/ui/editOriginalName.tsx
"use client";

import React, { useState } from "react";
import { Spinner2 } from "@/app/component/ui";
import { X, Globe, Link2 } from "lucide-react";
import { ModernButton } from "./ModernButton";
import { ModernInput } from "./ModernInput";

interface EditOriginalNameProps {
  urlId: string;
  currentOriginalName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditOriginalName: React.FC<EditOriginalNameProps> = ({
  urlId,
  currentOriginalName,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [newOriginalName, setNewOriginalName] = useState(currentOriginalName);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const validIdPattern = /^((https?|ftp):\/\/|[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+)[^\s]*$/;
    if (!validIdPattern.test(newOriginalName)) {
      setError("Please enter a valid URL (e.g., https://example.com)");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/urls/editOriginalName", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          urlId,
          newOriginalName,
          currentUrl: currentOriginalName
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to update destination");
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
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Globe size={20} className="text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Destination</h3>
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
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Current Destination</p>
            <p className="text-sm text-gray-300 font-medium break-all">
              {currentOriginalName}
            </p>
          </div>
          <p className="text-xs text-gray-500 font-medium italic px-1">
            Updating the destination will redirect all existing short link visitors to the new URL immediately.
          </p>
        </div>

        <form onSubmit={handleEdit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">
              New Destination URL
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 transition-colors group-focus-within:text-purple-400">
                <Link2 size={18} />
              </div>
              <ModernInput
                type="url"
                placeholder="https://new-destination.com"
                value={newOriginalName}
                onChange={(e) => setNewOriginalName(e.target.value)}
                className="pl-12"
                required
              />
            </div>
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
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner2 color="white" /> : "Update URL"}
            </ModernButton>
          </div>
        </form>
      </div>
    </div>
  );
};
