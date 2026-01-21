"use client";

import { FormEvent } from "react";
import { Wand } from "lucide-react";

interface UrlShortenerFormProps {
  url: string;
  setUrl: (url: string) => void;
  handleSubmit: (e: FormEvent) => void;
  loading: boolean;
  error: string | null;
  setShowCustomModal: (show: boolean) => void;
}

export const UrlShortenerForm = ({
  url,
  setUrl,
  handleSubmit,
  loading,
  error,
  setShowCustomModal,
}: UrlShortenerFormProps) => {
  return (
    <div className="card bg-gray-300">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <div>
          <label htmlFor="url" className="text-base font-semibold flex items-center gap-2 text-text-primary mb-2">
            Shorten a long URL
          </label>
          <input 
            type="url" 
            id="url" 
            value={url} 
            onChange={e => setUrl(e.target.value)} 
            placeholder="Enter long link here" 
            className="input text-text-primary" 
            required 
          />
        </div>

        <div className="w-full flex items-center justify-end">
          <button 
            type="button" 
            onClick={() => setShowCustomModal(true)} 
            className="flex items-center gap-2 font-medium text-text-primary hover:text-primary transition-colors"
          >
            <Wand className="w-5 h-5" />
            Customize your link with more options
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary w-full text-lg">
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
      </form>

      {error && (
        <div className="mt-4 p-4 rounded-lg border border-error bg-error-light text-error animate-fadeIn">
          <p className="font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};
