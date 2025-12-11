"use client"
import React, { useEffect, useState } from 'react';
import Image from "next/image";
// Add this import at the top
import { ExtendUrlModal } from "@/app/component/ui/ExtendUrlModal";


import DeviceStatisticsTable from "@/app/component/ui/deviceStatisticTable";
import ReferralsSection from "@/app/component/ui/referralSection";
import { SuspendUrlModal } from "@/app/component/ui/SuspendUrlModal";
import { PauseCircle, PlayCircle } from 'lucide-react';
import ClicksChart from "@/app/component/ui/clickChart"
import { Spinner2, Alert } from "@/app/component/ui"
import { useParams, useRouter } from 'next/navigation';
import GeographicalDistribution from "@/app/component/ui/geographicDistribution"
import { RenameUrlModal } from "@/app/component/ui/renameUrlModal";
import { EditOriginalName } from "@/app/component/ui/editOriginalName"
import { QRCodeSVG } from "qrcode.react"; // Make sure this package is installed
import { DeleteUrlModal } from "@/app/component/ui/DeleteUrlModal";
import { handleCopy, handleShare } from "@/app/utilityFunctions";

import {
  ArrowLeft,
  Link,
 
  Plane,
  BarChart2,
  Map,
  Smartphone,
  Globe,
  Clock,
  TrendingUp,
  X, Trash2, Copy, QrCode, Share2, RefreshCw, ExternalLink, FilePenLine, FolderPen
} from 'lucide-react';

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
        console.log(stats)
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
    console.log(originalUrl)
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
      // Less than a day ago
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
      // Less than a week ago
      return `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`;
    } else {
      // More than a week ago
      return date.toLocaleDateString();
    }
  };

  const handleQrCodeClick = (size: string) => {
    setQrCodeSize(size);
    setShowQrCode(true);
  };

  const downloadQrCode = () => {
    const svg = document.querySelector(".qr-code-container svg");
    if (!svg) return;

    if (qrCodeSize === "svg") {
      // Download as SVG
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8"
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const downloadLink = document.createElement("a");
      downloadLink.href = svgUrl;
      downloadLink.download = "qrcode.svg";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(svgUrl);
    } else {
      // For PNG, we need to convert SVG to canvas first
      const canvas = document.createElement("canvas");
      const width = qrCodeSize === "png1200" ? 1200 : 300;
      canvas.width = width;
      canvas.height = width;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        console.error("Could not get canvas context");
        return;
      }
      const img = document.createElement("img");
      img.width = width;
      img.height = width;
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8"
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, width);
        URL.revokeObjectURL(svgUrl);

        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode${qrCodeSize === "png1200"
          ? "-1200"
          : ""}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };

      img.src = svgUrl;
    }
  };

  const handleUrlCopy = async (url: string) => {
    try {
      // Now we handle the state here after calling the utility function
      const success = await handleCopy(url);
      if (success) {
        setCopySuccess(url);
        setTimeout(() => setCopySuccess(null), 2000);
      } else {
        setError("Copy failed. Please select and copy the URL manually.");
      }
    } catch (err) {
      console.error("Copy failed:", err);
      setError("Copy failed. Please select and copy the URL manually.");
    }
  };

  const handleUrlShare = async (url: string) => {
    try {
      const success = await handleShare(url);
      if (success === false) {
        setAlertMessage("Sharing failed. URL copied to clipboard instead.");
        // Fall back to copy
        handleUrlCopy(url);
      }
    } catch (err) {
      console.error("Share failed:", err);
      // Fallback to copy
      handleUrlCopy(url);
    }
  };

  const handleUrlQrCode = (url: string) => {
    setSelectedUrl(url);
    setShowQrCode(true);
  };
  const clearError = () => {
    setError(null);
  };
  const truncateUrl = (url: string, maxLength = 40) => {
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };
  return (
    <div className="min-h-screen bg-gray-100 p-6 px-2 text-black">
      {/* Navigation */}
      <nav className="bg-black p-4 fixed top-0 left-0 w-full z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1
            onClick={() => router.push("/dashboard")}
            className="text-3xl font-bold tracking-wide text-white emblema-one-regular cursor-pointer">

            URLTRIM
          </h1>
        </div>
      </nav>

      {/* Back Button */}
      <div
        onClick={() => router.push("/dashboard")}
        className="fixed top-20 left-6 flex items-center cursor-pointer hover:text-blue-600"
      >
        <ArrowLeft className="mr-2" /> Back
      </div>

      {loading && <div className="flex justify-center items-center h-64">
        <Spinner2 color="black" />
      </div>}
      {error && <div className="text-red-500 text-center mt-20">{error}</div>}


      {/* Main Content */}
      {stats && <div className="container montserrat mx-auto mt-32 space-y-8">
        {/* URL Information */}
        <div className='flex  flex-col  justify-center, align-center w-full'>
          <h2 className="font-bold md:text-2xl text-xl">YOUR URL PERFORMANCE</h2>
          <div className="flex flex-wrap mt-3 gap-1">
            <button
              onClick={() => handleEditOriginalUrlClick(stats.originalUrl)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              <FilePenLine size={18} />
            </button>

            <button
              onClick={() => handleRenameClick(stats.shortId)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
            <FolderPen size={18} />
            </button>

            <button
              onClick={() => handleUrlQrCode(stats.shortUrl)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              <QrCode size={18}/>
            </button>
            <button
              onClick={() => handleUrlShare(stats.shortUrl)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              <Share2 size={18}/>
            </button>
            <button
              onClick={() => handleUrlCopy(stats.shortUrl)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              {copySuccess === stats.shortUrl
                ? "Copied!"
                : <Copy size={18}/>}
            </button>
            <button
              onClick={() =>
                handleDeleteClick(stats.shortId, stats.shortUrl)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
            >
              <Trash2 size={18} />
            </button>
            <button
  onClick={() => handleSuspendClick(stats.shortId, stats.shortUrl, stats.isSuspended || false)}
  className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
>
  {stats.isSuspended ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
</button>
<button
  onClick={handleExtendClick}
  className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
>
  <Clock size={18} />
</button>

          </div>
        </div>
        <div className="  px-0 py-3">
          <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center justify-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
  <Link className="mr-3" /> {stats?.shortId}
  {stats.isReferral ? (
    <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
      Referral URL
    </span>
  ) : (
    <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
      Original URL
    </span>
  )}
</h2>
              <p className="text-gray-600">{truncateUrl(stats.originalUrl)}</p>
               {stats.isReferral && stats.originalUrlId && (
        <p className="text-sm text-blue-600 mt-1">
          This is a referral link for another URL
        </p>
      )}
            </div>
            <div className="text-right mt-3">
               <p>
    Expires: {stats.expiresAt === "No Expire" ? "Never" : 
      new Date(stats.expiresAt) < new Date() ? 
        <span className="text-red-500">Expired on {new Date(stats.expiresAt).toLocaleDateString()}</span> : 
        new Date(stats.expiresAt).toLocaleDateString()
    }
    {stats.isSuspended && <span className="ml-2 text-red-500">(Suspended)</span>}
  </p>
            </div>
          </div>
        </div>

        {/* Overview Statistics */}
           <h2 className="mt-4  text-xl font-bold">Overview</h2>
        <div className="grid md:grid-cols-4 md:gap-6 gap-3">
       
          <StatCard
            icon={<BarChart2 color="black" />}
            title="Direct Clicks"
            value={stats.stats.totalClicks.toString()}
          />
          <StatCard
            icon={<BarChart2 color="black" />}
            title="Referral Clicks"
            value={stats.stats.totalReferralClicks.toString()}
          />
          <StatCard
            icon={<BarChart2 color="black" />}
            title="Total Clicks"
            value={stats.stats.totalOverallClicks.toString()}
          />
          <StatCard
            icon={<Globe color="black" />}
            title="Unique Visitors"
            value={stats.stats.uniqueVisitors.toString()}
          />
          <StatCard
            icon={<TrendingUp color="black" />}
            title="Avg Daily Clicks"
            value={stats.stats.avgDailyClicks.toFixed(1)}
          />
           <StatCard
            icon={<Plane color="black" />}
            title="Countries"
            value={stats.stats.totalCountries.toString() || "0"}
          />
          <StatCard
            icon={<Clock color="black" />}
            title="CreatedAt"
            value={formatTimeAgo(stats.createdAt)}
          />
        </div>

     {/* Update the existing Click Analytics section in DetailedStats.tsx */}
<h2 className="text-xl font-bold mt-4">Click Analytics</h2>
<div className="grid md:grid-cols-2 md:gap-6 gap-3">
  <ClicksChart stats={stats} />
  <div className="bg-white shadow-md rounded-lg p-6">
    <h3 className="text-xl font-bold mb-4">Click Insights</h3>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h5 className="text-gray-600">Peak Day</h5>
        <span className="font-semibold">{stats.stats.peakDay || "No data"}</span>
      </div>
      <div>
        <h5 className="text-gray-600">Last Clicked</h5>
        <span className="font-semibold">
          {stats.stats.lastClicked 
            ? formatTimeAgo(stats.stats.lastClicked)
            : "Never"}
        </span>
      </div>
      <div>
        <h5 className="text-gray-600">Avg Daily Clicks</h5>
        <span className="font-semibold">{stats.stats.avgDailyClicks.toFixed(1)}</span>
      </div>
      <div>
        <h5 className="text-gray-600">Most Active IP</h5>
        <span className="font-semibold">{stats.stats.mostClickedIp || "None"}</span>
      </div>
    </div>
    
    <div className="mt-6">
      <h4 className="font-medium text-gray-700 mb-2">Top Locations</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <h5 className="text-gray-600">Top Country</h5>
          <span className="font-semibold">{stats.stats.mostClickedCountry || "Unknown"}</span>
        </div>
        <div>
          <h5 className="text-gray-600">Top City</h5>
          <span className="font-semibold">{stats.stats.mostClickedCity || "Unknown"}</span>
        </div>
      </div>
    </div>
    
    <div className="mt-6">
      <h4 className="font-medium text-gray-700 mb-2">Top Devices</h4>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <h5 className="text-gray-600">Device</h5>
          <span className="font-semibold">{stats.stats.mostClickedDevice || "Unknown"}</span>
        </div>
        <div>
          <h5 className="text-gray-600">Browser</h5>
          <span className="font-semibold">{stats.stats.mostClickedBrowser || "Unknown"}</span>
        </div>
        <div>
          <h5 className="text-gray-600">OS</h5>
          <span className="font-semibold">{stats.stats.mostClickedOs || "Unknown"}</span>
        </div>
      </div>
    </div>
  </div>
</div>

{/* Place this right after your "Detailed Breakdowns" section */}
<h2 className="text-xl font-bold mt-8">Geographical Distribution</h2>
<GeographicalDistribution 
  stats={{
    ...stats,
    stats: {
      ...stats.stats,
      continentDistribution: (typeof stats.stats.continentDistribution === 'object' ? stats.stats.continentDistribution : {}) as Record<string, number>,
      countryDetails: stats.stats.topCountries.map(country => ({
        country: country.name,
        count: country.count,
        percentage: ((country.count / stats.stats.totalClicks) * 100).toFixed(1) + '%'
      }))
    }
  }} 
/>

<h2 className="text-xl font-bold mt-8">Devices</h2>
<div className="mb-6">
  <DeviceStatisticsTable deviceDistribution={stats.stats.deviceDistribution} />
</div>
       {/* Add the new Referrals Section */}
{stats.referrals && stats.referrals.length > 0 ?
<ReferralsSection 
  stats={{
    
    referrersDistribution: stats.stats.referrersDistribution || {},
    totalReferrerCount: stats.stats.totalReferrerCount || 0
  }}
  allReferrals={Array.isArray(stats.referrals) ? stats.referrals : []} 
/>:null}
      
      </div>}
      {showQrCode &&
        selectedUrl &&
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">QR Code for your URL</h3>
              <button
                onClick={() => setShowQrCode(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center mb-4 qr-code-container">
              <QRCodeSVG
                value={selectedUrl || ""}
                size={250}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <button
                onClick={() => handleQrCodeClick("svg")}
                className={`p-2 rounded ${qrCodeSize === "svg"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"}`}
              >
                SVG
              </button>
              <button
                onClick={() => handleQrCodeClick("png")}
                className={`p-2 rounded ${qrCodeSize === "png"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"}`}
              >
                PNG
              </button>
              <button
                onClick={() => handleQrCodeClick("png1200")}
                className={`p-2 rounded ${qrCodeSize === "png1200"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"}`}
              >
                PNG 1200
              </button>
            </div>

            <div className="flex justify-between">
              <button
                onClick={downloadQrCode}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Download
              </button>
              <button
                onClick={() => setShowQrCode(false)}
                className="bg-gray-300 py-2 px-4 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>}
      {/* Delete URL Modal */}
      {showDeleteModal &&
        urlToDelete &&
        <DeleteUrlModal
          urlId={urlToDelete.id}
          shortUrl={urlToDelete.url}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUrlToDelete(null);
          }}
          onSuccess={handleDeleteSuccess}
        />}
      {showSuspendModal &&
  urlToSuspend &&
  <SuspendUrlModal
    urlId={urlToSuspend.id}
    shortUrl={urlToSuspend.url}
    isSuspended={urlToSuspend.isSuspended}
    isOpen={showSuspendModal}
    onClose={() => {
      setShowSuspendModal(false);
      setUrlToSuspend(null);
    }}
    onSuccess={handleSuspendSuccess}
  />}
      {/* Rename URL Modal */}
      {showRenameModal &&
        urlToRename &&
        <RenameUrlModal
          urlId={urlToRename.id}
          currentShortId={urlToRename.shortId}
          isOpen={showRenameModal}
          onClose={() => {
            setShowRenameModal(false);
            setUrlToRename(null);
          }}
          onSuccess={() => handleOperationSuccess("URL renamed successfully")}
        />}
      {showEditOriginalUrl &&
        originalUrlToEdit &&
        <EditOriginalName
          urlId={originalUrlToEdit.id}
          currentOriginalName={originalUrlToEdit.originalUrl}
          isOpen={showEditOriginalUrl}
          onClose={() => {
            setShowEditOriginalUrl(false);
            setOriginalUrlToEdit(null);
          }}
          onSuccess={() => handleOperationSuccess("Original Url Changed  successfully")}
        />}
        {showExtendModal && (
  <ExtendUrlModal
    urlId={stats.shortId}
    currentExpiry={stats.expiresAt}
    onClose={() => setShowExtendModal(false)}
    onSuccess={handleOperationSuccess}
  />
)}

    </div>

  );
}

// Utility Components
const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <div className="bg-white shadow-md rounded-lg p-6 flex items-center">
    <div className="mr-4 text-blue-500">{icon}</div>
    <div>
      <p className="text-gray-600">{title}</p>
      <h3 className="text-2xl font-bold">{value}</h3>
    </div>
  </div>
);

const DistributionCard = ({ title, icon, distribution }: { title: string, icon: React.ReactNode, distribution: Record<string, number> }) => (
  <div className="bg-white shadow-md rounded-lg p-6">
    <div className="flex items-center mb-4">
      <div className="mr-4 text-blue-500">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <div>
      {Object.entries(distribution).map(([name, count]) => (
        <div key={name} className="flex justify-between mb-2">
          <span>{name}</span>
          <span className="font-bold">{count}</span>
        </div>
      ))}
    </div>
  </div>
);

const TopListCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: Array<{ name: string; count: number }>;
}> = ({ title, icon, items }) => (
  <div className="bg-white shadow-md rounded-lg p-6">
    <div className="flex items-center mb-4">
      <div className="mr-4 text-blue-500">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
    <div>
      {items.map((item, index) => (
        <div key={index} className="flex justify-between mb-2">
          <span>{item.name}</span>
          <span className="font-bold">{item.count}</span>
        </div>
      ))}
    </div>
  </div>
);
