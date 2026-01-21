"use client"
import React, { useEffect, useState } from 'react';
import { ExtendUrlModal } from "@/app/component/ui/ExtendUrlModal";

import ReferralsSection from "@/app/component/ui/referralSection";
import { SuspendUrlModal } from "@/app/component/ui/SuspendUrlModal";
import { Spinner2, Alert } from "@/app/component/ui"
import { useParams, useRouter } from 'next/navigation';
import { RenameUrlModal } from "@/app/component/ui/renameUrlModal";
import { EditOriginalName } from "@/app/component/ui/editOriginalName"
import { QRCodeSVG } from "qrcode.react";
import { DeleteUrlModal } from "@/app/component/ui/DeleteUrlModal";
import { handleCopy, handleShare } from "@/app/utilityFunctions";
import { X } from 'lucide-react';

// New Component Imports
import { UrlActionButtons } from "@/app/component/dashboard/stats/UrlActionButtons";
import { UrlInfoCard } from "@/app/component/dashboard/stats/UrlInfoCard";
import { OverviewStatsGrid } from "@/app/component/dashboard/stats/OverviewStatsGrid";
import { ClickAnalytics } from "@/app/component/dashboard/stats/ClickAnalytics";
import { DeviceGeoStats } from "@/app/component/dashboard/stats/DeviceGeoStats";
import { StatsHeader } from "@/app/component/dashboard/stats/StatsHeader";
import DashboardNav from "../../dashboardNav";

interface UrlStats {
  shortId: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | "No Expire";
  isSuspended?: boolean; // Add this property
  isReferral?: boolean;
  referrals: Array<{
    name: string;
    shortId: string;
    shortUrl: string;
    clicks: number;
    originalUrl: string;
    createdAt: string;
  }>;
  stats: {
    totalClicks: number;
    referrersDistribution: any;
    totalReferrerCount: any;
    uniqueVisitors: number;
    totalCountries: number;
    avgDailyClicks: number;
    peakDay: string;
    lastClicked: string;
    mostClickedIp: string;
    mostClickedDevice: string;
    mostClickedCountry: string;
    mostClickedBrowser: string;
    mostClickedOs: string;
    continentDistribution: any;
    mostClickedCity: string;
    totalReferralClicks: any;
    totalOverallClicks: any;
    topCountries: Array<{ name: string, count: number }>;
    topCities: Array<{ name: string, count: number }>;
    deviceDistribution: Record<string, number>;
    browserDistribution: Record<string, number>;
    osDistribution: Record<string, number>;
  }
}

export default function DetailedStats() {
  const router = useRouter();
  const [showExtendModal, setShowExtendModal] = useState(false);

  const { shortId } = useParams();
  const [stats, setStats] = useState<UrlStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [qrCodeSize, setQrCodeSize] = useState("svg");
  const [refreshConst, setRefreshConst] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<{
    id: string;
    url: string;
  } | null>(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [urlToRename, setUrlToRename] = useState<{
    id: string;
    shortId: string;
  } | null>(null);
  const [showEditOriginalUrl, setShowEditOriginalUrl] = useState(false);
  const [originalUrlToEdit, setOriginalUrlToEdit] = useState<{
    id: string;
    originalUrl: string;
  } | null>(null);
const [showSuspendModal, setShowSuspendModal] = useState(false);
const [urlToSuspend, setUrlToSuspend] = useState<{
  id: string;
  url: string;
  isSuspended: boolean;
} | null>(null);
 // Add this handler function
const handleSuspendClick = (shortId: string, shortUrl: string, isSuspended: boolean) => {
  setUrlToSuspend({
    id: shortId,
    url: shortUrl,
    isSuspended
  });
  setShowSuspendModal(true);
};
const handleExtendClick = () => {
  setShowExtendModal(true);
};
// Add this success handler
const handleSuspendSuccess = async() => {
  const action = urlToSuspend?.isSuspended ? 'reactivated' : 'suspended';
  setAlertMessage(`URL ${action} successfully`);
  if (stats && urlToSuspend) {
    setStats({
      ...stats,
      isSuspended: !urlToSuspend.isSuspended
    });
  }
  handleRefresh(); // Refresh the URL list
}; 
  useEffect(() => {
    if (!shortId) return;

    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/stats/${shortId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch URL stats');
        }
        setStats(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [shortId, refreshConst]);

  // Handle delete button click
  const handleDeleteClick = (shortId: string, shortUrl: string) => {
    setUrlToDelete({
      id: shortId,
      url: shortUrl
    });
    setShowDeleteModal(true);
  };

  const handleRefresh = () => {
    setRefreshConst(refreshConst + 1);
    setLoading(true);
  };

 

  // Handle successful deletion
  const handleDeleteSuccess = () => {
     setAlertMessage("URL deleted successfully");
    router.push("/dashboard")
    handleRefresh(); // Refresh the URL list
   
  };

  // Handle rename button click
  const handleRenameClick = (shortId: string) => {
    setUrlToRename({
      id: shortId,
      shortId: shortId
    });
    setShowRenameModal(true);
  };

  // Handle rename button click
  const handleEditOriginalUrlClick = (originalUrl: string) => {
    setOriginalUrlToEdit({
      id: originalUrl,
      originalUrl: originalUrl
    });
    setShowEditOriginalUrl(true);
  };

  // Handle successful operation
  const handleOperationSuccess = (message: string) => {
    handleRefresh(); // Refresh the URL list
    setAlertMessage(message);
  };

  function getFaviconUrl(originalUrl: string) {
    try {
      const urlObject = new URL(originalUrl);
      const domain = urlObject.hostname;

      // Try DuckDuckGo's favicon service first
      const duckDuckGoUrl = `https://icons.duckduckgo.com/ip3/${domain}.ico`;

      // Fallback to Google's favicon service if DuckDuckGo fails
      const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;

      // Return the DuckDuckGo URL, but handle errors in the component
      return duckDuckGoUrl;
    } catch (error) {
      console.error("Invalid URL:", originalUrl, error);
      return "/default-favicon.png"; // Return a default favicon from your public folder
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      if (diffInMinutes < 60) {
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
      } else {
        const diffInHours = Math.floor(diffInMinutes / 60);
        return `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`;
      }
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const truncateUrl = (url: string, maxLength = 50) => {
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };

  // Handlers for Action Buttons
  const handleQrCodeClick = (size: string) => {
    setQrCodeSize(size);
    setShowQrCode(true);
  };
  
  const onQrCode = () => handleQrCodeClick("svg");

  const downloadQrCode = () => {
    const svg = document.querySelector(".qr-code-container svg");
    if (!svg) return;

    if (qrCodeSize === "svg") {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "qrcode.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } else {
      const canvas = document.createElement("canvas");
      const width = qrCodeSize === "png1200" ? 1200 : 300;
      canvas.width = width;
      canvas.height = width;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = document.createElement("img");
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, width);
        URL.revokeObjectURL(svgUrl);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode${qrCodeSize === "png1200" ? "-1200" : ""}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      img.src = svgUrl;
    }
  };

  const handleUrlCopy = async () => {
    if (!stats) return;
    try {
      const success = await handleCopy(stats.shortUrl);
      if (success) {
        setCopySuccess(stats.shortUrl);
        setTimeout(() => setCopySuccess(null), 2000);
      } else {
        setError("Copy failed");
      }
    } catch (err) {
      setError("Copy failed");
    }
  };

  const handleUrlShare = async () => {
    if (!stats) return;
    try {
      const success = await handleShare(stats.shortUrl);
      if (success === false) handleUrlCopy();
    } catch {
      handleUrlCopy();
    }
  };

  if (loading && !stats) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f3f4f6' }}>
        <Spinner2 color="black" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#dc2626' }}>
        <p>{error}</p>
        <button onClick={() => router.push('/dashboard')} style={{ marginTop: '16px', textDecoration: 'underline' }}>Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div 
    style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', paddingBottom: '40px', overflow:"scroll" }}
    >
      {/* <DashboardNav isPanelOpen={false} closePanel={() => {}} openPanel={() => {}} /> */}
      
      <div 
      style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}
      >
        
        <StatsHeader onBack={() => router.push('/dashboard')} />

        {stats && (
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Top Section: Info & Actions */}
            <UrlInfoCard stats={stats} truncateUrl={truncateUrl} />
            
            <UrlActionButtons 
              stats={stats}
              copySuccess={copySuccess}
              onEditOriginal={() => handleEditOriginalUrlClick(stats.originalUrl)}
              onRename={() => handleRenameClick(stats.shortId)}
              onQrCode={() => setShowQrCode(true)}
              onShare={handleUrlShare}
              onCopy={handleUrlCopy}
              onDelete={() => handleDeleteClick(stats.shortId, stats.shortUrl)}
              onSuspend={() => handleSuspendClick(stats.shortId, stats.shortUrl, stats.isSuspended || false)}
              onExtend={handleExtendClick}
            />

            <div style={{ height: '32px' }}></div>

            {/* Overview Stats */}
            <OverviewStatsGrid stats={stats} formatTimeAgo={formatTimeAgo} />

            {/* Click Analytics */}
            <ClickAnalytics stats={stats} formatTimeAgo={formatTimeAgo} />

            {/* Geographical & Device Stats */}
            <DeviceGeoStats stats={stats} />

             {/* Referrals Section */}
            {stats.referrals && stats.referrals.length > 0 && (
              <div style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '0px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                <ReferralsSection 
                  stats={{
                    referrersDistribution: stats.stats.referrersDistribution || {},
                    totalReferrerCount: stats.stats.totalReferrerCount || 0
                  }}
                  allReferrals={Array.isArray(stats.referrals) ? stats.referrals : []} 
                />
              </div>
            )}

          </div>
        )}
      </div>

      {/* Modals */}
      {showQrCode && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', maxWidth: '400px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
               <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>QR Code</h3>
               <button onClick={() => setShowQrCode(false)}><X size={24} /></button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', padding: '20px', backgroundColor: '#f9fafb', borderRadius: '12px' }} className="qr-code-container">
              <QRCodeSVG value={stats?.shortUrl || ""} size={200} level={"H"} includeMargin={true} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
               {['svg', 'png', 'png1200'].map(size => (
                 <button 
                  key={size}
                  onClick={() => handleQrCodeClick(size)}
                  style={{ padding: '8px', borderRadius: '8px', fontSize: '14px', backgroundColor: qrCodeSize === size ? '#16a34a' : '#f3f4f6', color: qrCodeSize === size ? 'white' : 'black' }}
                 >
                   {size.toUpperCase().replace('1200', ' HD')}
                 </button>
               ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
               <button onClick={downloadQrCode} style={{ backgroundColor: '#16a34a', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: '600' }}>Download</button>
               <button onClick={() => setShowQrCode(false)} style={{ backgroundColor: '#e5e7eb', color: 'black', padding: '12px', borderRadius: '8px', fontWeight: '600' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && urlToDelete && (
        <DeleteUrlModal
          urlId={urlToDelete.id}
          shortUrl={urlToDelete.url}
          isOpen={showDeleteModal}
          onClose={() => { setShowDeleteModal(false); setUrlToDelete(null); }}
          onSuccess={handleDeleteSuccess}
        />
      )}
      
      {showSuspendModal && urlToSuspend && (
        <SuspendUrlModal
          urlId={urlToSuspend.id}
          shortUrl={urlToSuspend.url}
          isSuspended={urlToSuspend.isSuspended}
          isOpen={showSuspendModal}
          onClose={() => { setShowSuspendModal(false); setUrlToSuspend(null); }}
          onSuccess={handleSuspendSuccess}
        />
      )}
      
      {showRenameModal && urlToRename && (
        <RenameUrlModal
          urlId={urlToRename.id}
          currentShortId={urlToRename.shortId}
          isOpen={showRenameModal}
          onClose={() => { setShowRenameModal(false); setUrlToRename(null); }}
          onSuccess={() => handleOperationSuccess("URL renamed successfully")}
        />
      )}
      
      {showEditOriginalUrl && originalUrlToEdit && (
        <EditOriginalName
          urlId={originalUrlToEdit.id}
          currentOriginalName={originalUrlToEdit.originalUrl}
          isOpen={showEditOriginalUrl}
          onClose={() => { setShowEditOriginalUrl(false); setOriginalUrlToEdit(null); }}
          onSuccess={() => handleOperationSuccess("Original Url Changed successfully")}
        />
      )}
      
      {showExtendModal && stats && (
        <ExtendUrlModal
          urlId={stats.shortId}
          currentExpiry={stats.expiresAt}
          onClose={() => setShowExtendModal(false)}
          onSuccess={(msg) => handleOperationSuccess(msg)}
        />
      )}

       {alertMessage && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 100 }}>
             <Alert message={alertMessage} variant="success" onClose={() => setAlertMessage("")} autoClose={true} /> 
        </div>
      )}
    </div>
  );
}

