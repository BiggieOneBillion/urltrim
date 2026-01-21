"use client";

import { Wand, ChevronDown, Loader2 } from "lucide-react";
import { FormEvent } from "react";

interface UrlShortenerDashboardFormProps {
  url: string;
  setUrl: (url: string) => void;
  customId: string;
  setCustomId: (id: string) => void;
  expiresIn: number | undefined;
  setExpiresIn: (days: number | undefined) => void;
  loading: boolean;
  showCustomOptions: boolean;
  setShowCustomOptions: (show: boolean) => void;
  onSubmit: (e: FormEvent) => void;
  error?: string | null;
}

export const UrlShortenerDashboardForm = ({
  url,
  setUrl,
  customId,
  setCustomId,
  expiresIn,
  setExpiresIn,
  loading,
  showCustomOptions,
  setShowCustomOptions,
  onSubmit,
  error
}: UrlShortenerDashboardFormProps) => {
  return (
    <div style={{ padding: "32px" }} className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800">
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            htmlFor="url"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            Shorten a long URL
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter long link here"
            style={{ padding: "12px" }}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowCustomOptions(!showCustomOptions)}
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
          >
            <span className="text-lg">
              <Wand className="w-5 h-5" />
            </span>{" "}
            Customize your link
            <ChevronDown
              className={`h-4 w-4 transition-transform ${
                showCustomOptions ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {showCustomOptions && (
          <div className="space-y-4 pt-2 pb-4 border-b border-gray-200 dark:border-gray-700 animate-fadeIn">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="md:w-1/2">
                <div className="w-full p-3 outline-none rounded-xl md:rounded-l-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
                  <span className="font-semibold">shorturl.com/</span>
                </div>
              </div>
              <div className="md:w-1/2">
                <input
                  type="text"
                  id="customId"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  placeholder="Enter alias"
                  style={{ padding: "12px" }}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="expiresIn"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Expires In (days)
              </label>
              <input
                type="number"
                id="expiresIn"
                value={expiresIn || ""}
                onChange={(e) =>
                  setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="30"
                min="1"
                style={{ padding: "12px" }}
                className="w-full border border-gray-300 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ padding: "14px", gap: "8px" }}
          className="w-full bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black font-bold rounded-xl transition-all text-lg flex items-center justify-center shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Shortening...
            </>
          ) : (
            "Shorten URL"
          )}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: "16px", padding: "16px" }} className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-800/50">
          {error}
        </div>
      )}
    </div>
  );
};
