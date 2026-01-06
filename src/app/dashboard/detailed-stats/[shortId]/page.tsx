// app/dashboard/detailed-stats/[shortId]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { QRCodeSVG } from "qrcode.react";
import { 
  ArrowLeft, 
  BarChart2, 
  Globe, 
  TrendingUp, 
  Clock, 
  ExternalLink, 
  Trash2, 
  Copy, 
  QrCode, 
  Share2, 
  FilePenLine, 
  FolderPen, 
  PauseCircle, 
  PlayCircle,
  MousePointer2,
  Calendar,
  Layers,
  Activity,
  Navigation,
  X,
  Users
} from 'lucide-react';

import ClicksChart from "@/app/component/ui/clickChart";
import DeviceStatisticsTable from "@/app/component/ui/deviceStatisticTable";
import GeographicalDistribution from "@/app/component/ui/geographicDistribution";
import ReferralsSection from "@/app/component/ui/referralSection";
import { ExtendUrlModal } from "@/app/component/ui/ExtendUrlModal";
import { RenameUrlModal } from "@/app/component/ui/renameUrlModal";
import { EditOriginalName } from "@/app/component/ui/editOriginalName";
import { DeleteUrlModal } from "@/app/component/ui/DeleteUrlModal";
import { SuspendUrlModal } from "@/app/component/ui/SuspendUrlModal";
import { Spinner2 } from "@/app/component/ui";
import { ModernButton } from "@/app/component/ui/ModernButton";
import { handleCopy, handleShare } from "@/app/utilityFunctions";

interface UrlStats {
  shortId: string;
  shortUrl: string;
  originalUrl: string;
  createdAt: string;
  expiresAt: string | "No Expire";
  isSuspended?: boolean;
  isReferral?: boolean;
  originalUrlId?: string;
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
    mostClickedCity: string;
    continentDistribution: Record<string, number>;
    referrersDistribution: Record<string, number>;
    totalReferrerCount: number;
    totalReferralClicks: number;
    totalOverallClicks: number;
    topCountries: Array<{ name: string, count: number }>;
    topCities: Array<{ name: string, count: number }>;
    deviceDistribution: Record<string, number>;
    browserDistribution: Record<string, number>;
    osDistribution: Record<string, number>;
  }
}

export default function DetailedStats() {
  const router = useRouter();
  const { shortId } = useParams();
  
  const [stats, setStats] = useState<UrlStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [refreshConst, setRefreshConst] = useState(0);
  const [alertMessage, setAlertMessage] = useState("");
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showEditOriginalUrl, setShowEditOriginalUrl] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [qrCodeSize, setQrCodeSize] = useState("svg");

  useEffect(() => {
    if (!shortId) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
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

  const handleRefresh = () => {
    setRefreshConst(prev => prev + 1);
  };

  const handleDeleteSuccess = () => {
    router.push("/dashboard");
  };

  const handleOperationSuccess = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(""), 3000);
    handleRefresh();
  };

  const handleCopyUrl = async (url: string) => {
    const success = await handleCopy(url);
    if (success) {
      setCopySuccess(url);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleDownloadQr = () => {
    const svg = document.querySelector(".qr-code-container svg");
    if (!svg) return;

    if (qrCodeSize === "svg") {
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement("a");
      link.href = svgUrl;
      link.download = `qrcode-${shortId}.svg`;
      link.click();
    } else {
      const canvas = document.createElement("canvas");
      const width = qrCodeSize === "png1200" ? 1200 : 300;
      canvas.width = width;
      canvas.height = width;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, width);
        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = pngUrl;
        link.download = `qrcode-${shortId}.png`;
        link.click();
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen relative flex items-center justify-center">
        <div className="bg-mesh" />
        <div className="flex flex-col items-center gap-4">
          <Spinner2 color="white" />
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Assembling Analytics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative pb-24 overflow-x-hidden">
      <div className="bg-mesh" />
      
      {/* Top Nav / Back */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 md:px-12 flex items-center justify-between">
         <ModernButton 
          variant="secondary" 
          onClick={() => router.push("/dashboard")}
          className="!px-4 !py-2.5 rounded-2xl group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back</span>
        </ModernButton>
        <div className="glass px-6 py-2 rounded-full border border-white/5 hidden md:block">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tracking Identity: <span className="text-blue-400">{shortId}</span></p>
        </div>
      </nav>

      {stats && (
        <main className="container mx-auto px-6 pt-32 space-y-12">
          {/* Header Section */}
          <div className="flex flex-col xl:flex-row gap-8 items-start justify-between">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter truncate max-w-[300px] md:max-w-none">
                  {stats.shortId}
                </h1>
                {stats.isReferral ? (
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400 uppercase tracking-widest">Referral Mode</span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 uppercase tracking-widest">Base Link</span>
                )}
              </div>
              <div className="group relative">
                <p className="text-lg text-gray-400 font-medium break-all max-w-xl group-hover:text-gray-200 transition-colors">
                  {stats.originalUrl}
                </p>
                <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <HeaderActionButton onClick={() => setShowEditOriginalUrl(true)} icon={<FilePenLine size={18} />} label="Source" />
              <HeaderActionButton onClick={() => setShowRenameModal(true)} icon={<FolderPen size={18} />} label="Alias" />
              <HeaderActionButton onClick={() => setShowQrCode(true)} icon={<QrCode size={18} />} label="QR" />
              <HeaderActionButton onClick={() => handleShare(stats.shortUrl)} icon={<Share2 size={18} />} label="Share" />
              <HeaderActionButton 
                onClick={() => handleCopyUrl(stats.shortUrl)} 
                icon={copySuccess === stats.shortUrl ? <span className="text-[10px] font-black text-green-400">Copied</span> : <Copy size={18} />} 
                label="Copy" 
              />
              <HeaderActionButton 
                onClick={() => setShowSuspendModal(true)} 
                icon={stats.isSuspended ? <PlayCircle size={18} className="text-emerald-400" /> : <PauseCircle size={18} className="text-amber-400" />} 
                label={stats.isSuspended ? "Start" : "Stop"} 
              />
              <HeaderActionButton onClick={() => setShowExtendModal(true)} icon={<Clock size={18} />} label="Time" />
              <HeaderActionButton onClick={() => setShowDeleteModal(true)} icon={<Trash2 size={18} className="text-red-400" />} label="Purge" className="!bg-red-500/5 hover:!bg-red-500/10 border-red-500/10" />
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            <MetricCard label="Global Volume" value={stats.stats.totalOverallClicks} icon={<Layers size={16} className="text-blue-500" />} />
            <MetricCard label="Direct Hits" value={stats.stats.totalClicks} icon={<MousePointer2 size={16} className="text-purple-500" />} />
            <MetricCard label="Acquisitions" value={stats.stats.totalReferralClicks} icon={<Share2 size={16} className="text-pink-500" />} />
            <MetricCard label="Unique Entities" value={stats.stats.uniqueVisitors} icon={<Users size={16} className="text-emerald-500" />} />
            <MetricCard label="Daily Pulse" value={stats.stats.avgDailyClicks.toFixed(1)} icon={<Activity size={16} className="text-amber-500" />} />
            <MetricCard label="Jurisdictions" value={stats.stats.totalCountries} icon={<Globe size={16} className="text-cyan-500" />} />
            <MetricCard label="Longevity" value={formatTimeAgo(stats.createdAt)} icon={<Calendar size={16} className="text-indigo-500" />} />
          </div>

          {/* Secondary Stats & Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <ClicksChart stats={stats} />
            </div>
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 flex flex-col gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <TrendingUp size={20} className="text-amber-500" />
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">Signal Analysis</h3>
              </div>
              
              <div className="space-y-6">
                <InsightItem label="Peak Velocity" value={stats.stats.peakDay || "Inert"} icon={<Activity size={14} />} />
                <InsightItem label="Last Transmission" value={stats.stats.lastClicked ? formatTimeAgo(stats.stats.lastClicked) : "Remote"} icon={<Clock size={14} />} />
                <InsightItem label="Dominant IP" value={stats.stats.mostClickedIp || "Hidden"} icon={<Navigation size={14} />} />
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Top Vectors</p>
                  <div className="grid grid-cols-2 gap-4">
                    <VectorBox label="Nation" value={stats.stats.mostClickedCountry} />
                    <VectorBox label="Metro" value={stats.stats.mostClickedCity} />
                    <VectorBox label="Client" value={stats.stats.mostClickedBrowser} />
                    <VectorBox label="Kernel" value={stats.stats.mostClickedOs} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Visualizations */}
          <GeographicalDistribution 
            stats={{
              ...stats,
              stats: {
                ...stats.stats,
                continentDistribution: stats.stats.continentDistribution || {},
                countryDetails: stats.stats.topCountries.map(c => ({
                  country: c.name,
                  count: c.count,
                  percentage: ((c.count / (stats.stats.totalOverallClicks || 1)) * 100).toFixed(1)
                }))
              }
            }} 
          />

          <div className="grid grid-cols-1 gap-12">
             <DeviceStatisticsTable deviceDistribution={stats.stats.deviceDistribution} />
             {stats.referrals && stats.referrals.length > 0 && (
               <ReferralsSection 
                stats={{
                  referrersDistribution: stats.stats.referrersDistribution || {},
                  totalReferrerCount: stats.stats.totalReferrerCount || 0,
                  totalClicks: stats.stats.totalClicks,
                  totalOverallClicks: stats.stats.totalOverallClicks,
                  totalReferralClicks: stats.stats.totalReferralClicks
                }}
                allReferrals={stats.referrals}
               />
             )}
          </div>
        </main>
      )}

      {/* Modals */}
      {showQrCode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-[100] p-6">
          <div className="glass rounded-[2.5rem] p-10 max-w-sm w-full animate-in zoom-in-95 duration-300 flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-8">
              <h3 className="text-xl font-black text-white">Identity Scan</h3>
              <button onClick={() => setShowQrCode(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400"><X size={20} /></button>
            </div>
            <div className="bg-white p-6 rounded-3xl mb-8 qr-code-container shadow-2xl">
              <QRCodeSVG value={stats?.shortUrl || ""} size={200} level="H" includeMargin />
            </div>
            <div className="grid grid-cols-3 gap-2 w-full mb-8">
              {['svg', 'png', 'png1200'].map(size => (
                <button 
                  key={size}
                  onClick={() => setQrCodeSize(size)}
                  className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${qrCodeSize === size ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"}`}
                >
                  {size}
                </button>
              ))}
            </div>
            <ModernButton onClick={handleDownloadQr} className="w-full">Download Identity</ModernButton>
          </div>
        </div>
      )}

      {showDeleteModal && stats && (
        <DeleteUrlModal urlId={stats.shortId} shortUrl={stats.shortUrl} isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} onSuccess={handleDeleteSuccess} />
      )}
      {showRenameModal && stats && (
        <RenameUrlModal urlId={stats.shortId} currentShortId={stats.shortId} isOpen={showRenameModal} onClose={() => setShowRenameModal(false)} onSuccess={() => handleOperationSuccess("Alias modified")} />
      )}
      {showEditOriginalUrl && stats && (
        <EditOriginalName urlId={stats.shortId} currentOriginalName={stats.originalUrl} isOpen={showEditOriginalUrl} onClose={() => setShowEditOriginalUrl(false)} onSuccess={() => handleOperationSuccess("Source re-routed")} />
      )}
      {showSuspendModal && stats && (
        <SuspendUrlModal urlId={stats.shortId} shortUrl={stats.shortUrl} isSuspended={!!stats.isSuspended} isOpen={showSuspendModal} onClose={() => setShowSuspendModal(false)} onSuccess={() => handleOperationSuccess(stats.isSuspended ? "Reactivated" : "Suspended")} />
      )}
      {showExtendModal && stats && (
        <ExtendUrlModal urlId={stats.shortId} currentExpiry={stats.expiresAt} onClose={() => setShowExtendModal(false)} onSuccess={() => handleOperationSuccess("TTL updated")} />
      )}
    </div>
  );
}

// Subcomponents
const HeaderActionButton = ({ onClick, icon, label, className = "" }: { onClick: () => void, icon: React.ReactNode, label: string, className?: string }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 p-3 px-4 glass glass-hover rounded-2xl transition-all active:scale-90 group ${className}`}
  >
    <div className="text-gray-400 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest group-hover:text-gray-300 transition-colors">{label}</span>
  </button>
);

const MetricCard = ({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) => (
  <div className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-4 group hover:border-white/10 transition-colors">
    <div className="flex items-center justify-between">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div>
      <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{label}</p>
      <h4 className="text-xl font-black text-white tracking-tighter group-hover:text-blue-400 transition-colors">{value}</h4>
    </div>
  </div>
);

const InsightItem = ({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) => (
  <div className="flex items-center justify-between group">
    <div className="flex items-center gap-3">
      <div className="text-gray-600 group-hover:text-blue-400 transition-colors">{icon}</div>
      <span className="text-xs font-bold text-gray-500 uppercase tracking-tight">{label}</span>
    </div>
    <span className="text-sm font-black text-white tracking-tight">{value}</span>
  </div>
);

const VectorBox = ({ label, value }: { label: string, value: string }) => (
  <div className="p-3 bg-white/5 rounded-2xl border border-white/5">
    <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-xs font-black text-gray-300 truncate">{value || 'N/A'}</p>
  </div>
);
