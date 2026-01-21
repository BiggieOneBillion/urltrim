"use client";

import { FormEvent } from "react";
import { X } from "lucide-react";

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  setUrl: (url: string) => void;
  customId: string;
  setCustomId: (id: string) => void;
  expiresIn: number | undefined;
  setExpiresIn: (days: number | undefined) => void;
  handleSubmit: (e: FormEvent) => void;
  loading: boolean;
}

export const CustomizationModal = ({
  isOpen,
  onClose,
  url,
  setUrl,
  customId,
  setCustomId,
  expiresIn,
  setExpiresIn,
  handleSubmit,
  loading,
}: CustomizationModalProps) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
      style={{zIndex: 'var(--z-modal)'}}
      onClick={onClose}
    >
      <div 
        className="card bg-gray-50 max-w-lg w-full animate-fadeIn flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-text-primary">Customize Your Link</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-md hover:bg-surface-hover transition-colors text-text-secondary hover:text-text-primary"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <form 
          onSubmit={(e) => {
            handleSubmit(e);
            onClose();
          }} 
          className="flex flex-col gap-4"
        >
          {/* URL Input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="modal-url" className="block text-sm font-semibold text-text-primary mb-2">
              Long URL
            </label>
            <input 
              type="url" 
              id="modal-url" 
              value={url} 
              onChange={e => setUrl(e.target.value)} 
              placeholder="Enter long link here" 
              className="input text-text-primary" 
              required 
            />
          </div>

          {/* Custom Alias */}
          <div className="flex flex-col gap-1">
            <label htmlFor="modal-customId" className="block text-sm font-semibold text-text-primary mb-2">
              Custom Alias (Optional)
            </label>
            <div className="flex gap-2">
              <div className="flex-shrink-0">
                <div className="input flex items-center bg-surface-elevated text-text-secondary font-medium">
                  shorturl.com/
                </div>
              </div>
              <input 
                type="text" 
                id="modal-customId" 
                value={customId} 
                onChange={e => setCustomId(e.target.value)} 
                placeholder="your-custom-alias" 
                className="input flex-1" 
              />
            </div>
            <p className="text-xs text-text-muted mt-1">Leave empty for auto-generated short URL</p>
          </div>

          {/* Expiration */}
          <div className="flex flex-col gap-1">
            <label htmlFor="modal-expiresIn" className="block text-sm font-semibold text-text-primary mb-2">
              Expires In (days) - Optional
            </label>
            <input 
              type="number" 
              id="modal-expiresIn" 
              value={expiresIn || ""} 
              onChange={e => setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)} 
              placeholder="30" 
              min="1" 
              className="input" 
            />
            <p className="text-xs text-text-muted mt-1">Leave empty for permanent link</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Shortening...
                </div>
              ) : (
                "Shorten URL"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
