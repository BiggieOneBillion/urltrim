"use client";

import Link from "next/link";
import { 
  Share2, 
  Copy, 
  QrCode, 
  ExternalLink, 
  PauseCircle, 
  BarChart2,
  CheckCircle2
} from "lucide-react";

interface DashboardUrlResultProps {
  shortenedUrl: string;
  copySuccess: boolean;
  loading: boolean;
  showAllowedReferral: boolean;
  onShare: () => void;
  onCopy: () => void;
  onQrCode: () => void;
  onSuspend: () => void;
  onAllowReferrals: (shortId: string) => void;
  onReset: () => void;
}

export const DashboardUrlResult = ({
  shortenedUrl,
  copySuccess,
  loading,
  showAllowedReferral,
  onShare,
  onCopy,
  onQrCode,
  onSuspend,
  onAllowReferrals,
  onReset
}: DashboardUrlResultProps) => {
  const shortId = shortenedUrl.split("/").pop();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    }}>
      <div style={{ 
        width: '100%',
        maxWidth: '500px',
        backgroundColor: 'black',
        borderRadius: '24px',
        padding: '32px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }} className="animate-fadeIn dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
        
        <button 
          onClick={onReset}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            backgroundColor: '#f3f4f6',
            border: 'none'
          }}
          className="hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500 dark:text-gray-400">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div style={{ marginBottom: "24px", textAlign: 'center' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            backgroundColor: '#dcfce7', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }} className="dark:bg-green-900/30">
            <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          
          <h3 style={{ marginBottom: "8px", fontSize: '24px' }} className="font-bold text-gray-900 dark:text-white">
            Success!
          </h3>
          <p className="text-gray-500 dark:text-gray-400">Your URL has been shortened and is ready to share.</p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }} className="group">
          <input
            type="text"
            value={shortenedUrl}
            readOnly
            style={{ padding: "16px", width: '100%', textAlign: 'center', fontSize: '16px' }}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-800 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* Action Buttons Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}>
          <ActionButton 
            icon={<Share2 className="w-5 h-5" />} 
            label="Share" 
            onClick={onShare} 
          />
          <ActionButton 
            icon={copySuccess ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />} 
            label={copySuccess ? "Copied!" : "Copy"} 
            onClick={onCopy} 
            active={copySuccess}
          />
          <ActionButton 
            icon={<QrCode className="w-5 h-5" />} 
            label="QR Code" 
            onClick={onQrCode} 
          />
          <a
            href={shortenedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all border border-gray-100 dark:border-gray-700 group"
          >
            <div className="mb-2 group-hover:scale-110 transition-transform">
              <ExternalLink className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Visit</span>
          </a>
        </div>

        <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: "24px", display: 'flex', flexDirection: 'column', gap: '16px' }} className="dark:border-gray-800">
          <div style={{ display: "flex", gap: "12px", justifyContent: 'center' }}>
            <Link
              href={`/dashboard/detailed-stats/${shortId}`}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors py-2"
            >
              <BarChart2 className="w-4 h-4" />
              View Statistics
            </Link>

            <span className="text-gray-300 dark:text-gray-700 py-2">|</span>
            
            <button
              onClick={() => shortId && onAllowReferrals(shortId)}
              className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline transition-colors py-2"
            >
              <Share2 className="w-4 h-4" />
              Allow Referrals
              {loading && (
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin ml-2"></div>
              )}
            </button>
          </div>

          {showAllowedReferral && (
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              Referrals allowed for this URL
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '8px' }}>
            <button
              onClick={onReset}
              style={{ padding: "14px" }}
              className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-bold rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              Done
            </button>
            <button
            
            onClick={onSuspend}
            style={{ padding: "14px", border: '1px solid red', background: 'transparent', borderRadius: '24px' }}
            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-700 dark:text-red-400 font-medium transition-colors text-sm"
            >
            <PauseCircle className="w-4 h-4" />
            Suspend this URL
          </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick: () => void, active?: boolean }) => (
  <button 
    style={{padding:"5px 16px"}}
    onClick={onClick} 
    className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all border group ${
      active 
        ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800" 
        : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-200"
    }`}
  >
    <div className="mb-2 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <span className="text-xs font-medium">{label}</span>
  </button>
);
