"use client";

import Link from "next/link";
import { Share2, Copy, QrCode, ExternalLink, BarChart2, X, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import QRCodeLib from "qrcode";

interface ShortenedUrlResultProps {
  isOpen: boolean;
  onClose: () => void;
  shortenedUrl: string;
  handleShare: () => void;
  handleCopy: () => void;
  copySuccess: boolean;
  handleQrCodeClick: () => void;
  isLoggedIn: boolean;
  resetForm: () => void;
}

export const ShortenedUrlResult = ({
  isOpen,
  onClose,
  shortenedUrl,
  handleShare,
  handleCopy,
  copySuccess,
  handleQrCodeClick,
  isLoggedIn,
  resetForm,
}: ShortenedUrlResultProps) => {
  if (!isOpen) return null;

  const handleResetAndClose = () => {
    resetForm();
    onClose();
  };

  const handleQrCodeDownload = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm("Download QR code for this shortened URL?");
    
    if (!confirmed) return;

    try {
      // Extract the short ID from the URL for the filename
      const shortId = shortenedUrl.split("/").pop() || "qrcode";
      
      // Generate QR code as data URL
      const qrDataUrl = await QRCodeLib.toDataURL(shortenedUrl, {
        width: 1000,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      // Create download link
      const downloadLink = document.createElement("a");
      downloadLink.href = qrDataUrl;
      downloadLink.download = `${shortId}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      alert("Failed to generate QR code. Please try again.");
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn" 
      style={{zIndex: 'var(--z-modal)'}}
      onClick={onClose}
    >
      <div 
        style={{padding:"20px"}}
        className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-2xl max-w-xl w-full overflow-hidden border border-gray-100 dark:border-gray-800 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{padding:"10px"}} className="relative p-6 px-8 text-center border-b border-gray-100 dark:border-gray-800 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
          <button
            onClick={onClose}
            className="absolute top-2 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          
          {/* <div className="mx-auto w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
            <Check className="text-green-600 dark:text-green-400" size={24} strokeWidth={3} />
          </div> */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            Link ready!
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Your shortened URL has been created
          </p>
        </div>

        {/* Content */}
        <div style={{paddingBlock:"20px", display:"flex", flexDirection:"column", justifyContent:"center", gap:"20px"}}>
          
          {/* Main URL Display */}
          <div className="relative group">
            <div style={{padding:"10px"}} className="flex items-center bg-gray-50 dark:bg-gray-800 border-2 border-transparent group-hover:border-blue-500/20 rounded-xl transition-all overflow-hidden p-1">
              <div className="flex-1 px-3 py-2 overflow-hidden">
                <p className="text-xs text-gray-400 font-medium mb-0.5 uppercase tracking-wider">Short Link</p>
                <p className="text-base font-mono font-medium text-gray-800 dark:text-gray-200 truncate select-all selection:bg-blue-100 selection:text-blue-900">
                  {shortenedUrl}
                </p>
              </div>
              <button 
                onClick={handleCopy}
                className={`flex items-center justify-center p-3 rounded-lg transition-all duration-200 ${
                  copySuccess 
                    ? "bg-green-500 text-white shadow-lg shadow-green-500/30" 
                    : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-600"
                }`}
                title="Copy to clipboard"
              >
                {copySuccess ? <Check size={20} /> : <Copy size={20} />}
              </button>
            </div>
            {copySuccess && (
              <span className="absolute -top-8 right-0 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded shadow-sm animate-fadeIn">
                Copied!
              </span>
            )}
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-3 gap-3">
            <ActionButton 
              icon={<QrCode size={18} />} 
              label="QR Code" 
              onClick={handleQrCodeDownload} 
            />
            <ActionButton 
              icon={<Share2 size={18} />} 
              label="Share" 
              onClick={handleShare} 
            />
            <a 
              href={shortenedUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-100 dark:border-gray-700 group"
            >
              <ExternalLink className="mb-2 group-hover:scale-110 transition-transform" size={20} />
              <span className="text-xs font-medium">Visit</span>
            </a>
          </div>

          {/* Pro Features (Logged In) */}
          {isLoggedIn && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-2">
              <Link 
                href={`/stats/${shortenedUrl.split("/").pop()}`} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-md text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                    <BarChart2 size={16} />
                  </div>
                  <span className="text-sm font-medium">View Analytics</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
              
              <Link 
                href={`/referral/${shortenedUrl.split("/").pop()}`} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-md text-orange-600 dark:text-orange-400 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-colors">
                    <Share2 size={16} />
                  </div>
                  <span className="text-sm font-medium">Setup Referrals</span>
                </div>
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
              </Link>
            </div>
          )}

          {/* Primary Action */}
          <button 
            className="w-full btn btn-primary py-3.5 text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40" 
            onClick={handleResetAndClose}
          >
            Shorten Another Link
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for uniform action buttons
const ActionButton = ({ icon, label, onClick }: { icon: React.ReactNode, label: string, onClick: () => void }) => (
  <button 
    style={{padding:"5px"}}
    onClick={onClick} 
    className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-100 dark:border-gray-700 group"
  >
    <div className="mb-2 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);
