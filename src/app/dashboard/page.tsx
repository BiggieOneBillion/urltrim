"use client";

import { FormEvent, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import SlidePanel from "./slidder";
import DashboardNav from "./dashboardNav";
import { SuspendUrlModal } from "@/app/component/ui/SuspendUrlModal";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  BarChart2,
  Share2,
  Wand,
  Copy,
  QrCode,
  ExternalLink,
  PauseCircle,
  TrendingUp,
  Link as LinkIcon,
  MousePointer2,
  Calendar,
  X
} from "lucide-react";
import { useAuth } from "@/app/context/authContext";
import { ModernButton } from "@/app/component/ui/ModernButton";
import { ModernInput } from "@/app/component/ui/ModernInput";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | undefined>();
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeSize, setQrCodeSize] = useState("svg");
  const [userUrls, setUserUrls] = useState<any[]>([]);
  const [isLoadingData, setIsLoadindData] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelContent, setPanelContent] = useState<React.ReactNode | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [urlToSuspend, setUrlToSuspend] = useState<{
    id: string;
    url: string;
    isSuspended: boolean;
  } | null>(null);

  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  const openPanel = (path: string, content: React.ReactNode) => {
    setPanelContent(content);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const fetchUserUrls = async () => {
    try {
      setIsLoadindData(true);
      const response = await fetch("/api/urls/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserUrls(data.urls || []);
      }
    } catch (error) {
      console.error("Error fetching URLs:", error);
    } finally {
      setIsLoadindData(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserUrls();
    }
  }, [user]);

  const handleQrCodeClick = (size = "svg") => {
    setQrCodeSize(size);
    setShowQrCode(true);
  };

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
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const svgUrl = URL.createObjectURL(svgBlob);
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, width);
        URL.revokeObjectURL(svgUrl);
        const pngUrl = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.href = pngUrl;
        downloadLink.download = `qrcode-${qrCodeSize}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      };
      img.src = svgUrl;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          url,
          customId: customId || undefined,
          expiresIn: expiresIn || undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setShortenedUrl(data.shortUrl);
      fetchUserUrls();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortenedUrl) return;
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError("Copy failed. Please manually copy the URL.");
    }
  };

  const handleShare = async () => {
    if (!shortenedUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: "Shortened URL", url: shortenedUrl });
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setError("Couldn't share the URL.");
        }
      }
    } else {
      handleCopy();
      setError("Web Share API not supported. Copied to clipboard.");
    }
  };

  const handleSuspendClick = (shortId: string, shortUrl: string, isSuspended: boolean) => {
    setUrlToSuspend({ id: shortId, url: shortUrl, isSuspended });
    setShowSuspendModal(true);
  };

  const handleSuspendSuccess = () => {
    setShowSuspendModal(false);
    fetchUserUrls();
  };

  const totalClicks = userUrls.reduce((total, u) => total + (u.totalClicks || 0), 0);

  const stats = [
    { label: "Total URLs", value: userUrls.length, icon: LinkIcon, color: "from-blue-500 to-cyan-500" },
    { label: "Total Clicks", value: totalClicks, icon: MousePointer2, color: "from-purple-500 to-pink-500" },
    { label: "Growth", value: "+12%", icon: TrendingUp, color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="min-h-screen relative pb-20 overflow-hidden">
      <div className="bg-mesh" />
      
      <DashboardNav
        isPanelOpen={isPanelOpen}
        openPanel={openPanel}
        closePanel={closePanel}
      />

      <main className="container mx-auto px-6 pt-32">
        {/* Hero / Welcome Section */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome back, <span className="text-blue-400">{user?.name || "User"}</span>!
          </h1>
          <p className="text-gray-400">Manage your links and track their performance.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Stats Cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {stats.map((stat, i) => (
              <div key={i} className="glass glass-hover p-6 rounded-3xl relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-4 shadow-lg`}>
                  <stat.icon size={24} />
                </div>
                <p className="text-sm font-medium text-gray-400 mb-1">{stat.label}</p>
                <h3 className="text-3xl font-black text-white">{stat.value}</h3>
              </div>
            ))}
          </div>

          {/* Quick Shorten Card */}
          <div className="glass rounded-[2rem] p-8 relative overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-800">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Wand className="text-blue-400" size={20} />
              Quick Shorten
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ModernInput
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste a long link..."
                required
                type="url"
              />

              <button
                type="button"
                onClick={() => setShowCustomOptions(!showCustomOptions)}
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors px-2"
              >
                <ChevronDown className={`transition-transform duration-300 ${showCustomOptions ? "rotate-180" : ""}`} size={16} />
                Advanced Options
              </button>

              {showCustomOptions && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2">
                  <ModernInput
                    label="Custom Alias"
                    value={customId}
                    onChange={(e) => setCustomId(e.target.value)}
                    placeholder="e.g. my-cool-link"
                  />
                  <ModernInput
                    label="Expiration (days)"
                    type="number"
                    value={expiresIn || ""}
                    onChange={(e) => setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Never"
                  />
                </div>
              )}

              <ModernButton type="submit" isLoading={loading} className="w-full py-4">
                Shorten Link
              </ModernButton>
            </form>

            {error && (
              <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-xs">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Shortened URL Result - Floating/Pop-up style if just created */}
        {shortenedUrl && (
          <div className="mb-12 animate-in zoom-in-95 duration-500">
            <div className="glass bg-blue-500/5 border-blue-500/20 rounded-[2rem] p-8 md:p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px]" />
               <div className="relative z-10">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <h3 className="text-2xl font-bold text-white mb-2">URL Ready!</h3>
                     <p className="text-blue-200/60">Your shortened link is ready to be shared.</p>
                   </div>
                   <button onClick={() => setShortenedUrl(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                     <X size={20} className="text-gray-400" />
                   </button>
                 </div>

                 <div className="flex flex-col md:flex-row gap-4 mb-8">
                   <div className="flex-grow glass bg-white/5 border-white/10 px-6 py-4 rounded-2xl flex items-center justify-between group">
                     <span className="text-xl font-semibold text-white break-all">{shortenedUrl}</span>
                     <button onClick={handleCopy} className="p-2 hover:bg-blue-500/20 rounded-xl text-blue-400 transition-all active:scale-95">
                       {copySuccess ? "Copied!" : <Copy size={20} />}
                     </button>
                   </div>
                   <div className="flex gap-2">
                     <ModernButton onClick={handleShare} variant="secondary" className="px-6 py-4">
                       <Share2 size={20} />
                     </ModernButton>
                     <ModernButton onClick={() => handleQrCodeClick()} variant="secondary" className="px-6 py-4">
                       <QrCode size={20} />
                     </ModernButton>
                     <a href={shortenedUrl} target="_blank" rel="noopener noreferrer">
                        <ModernButton variant="secondary" className="px-6 py-4">
                          <ExternalLink size={20} />
                        </ModernButton>
                     </a>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* Recent Links Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Calendar className="text-purple-400" size={24} />
              Recent Links
            </h2>
            <button 
              onClick={() => openPanel("myurls", <MyURLs />)}
              className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isLoadingData ? (
               [1, 2, 3, 4].map((i) => (
                 <div key={i} className="glass h-32 rounded-3xl animate-pulse" />
               ))
            ) : userUrls.length > 0 ? (
              userUrls.slice(0, 4).map((url) => (
                <div key={url.shortId} className="glass glass-hover p-6 rounded-3xl flex items-center justify-between gap-4 group">
                  <div className="min-w-0 flex-grow">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                        {url.shortId}
                      </span>
                      {url.isSuspended && (
                        <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-red-500/20">
                          Suspended
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate mb-3">{url.originalUrl}</p>
                    <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                      <span className="flex items-center gap-1">
                        <MousePointer2 size={12} className="text-blue-400" />
                        {url.totalClicks || 0} clicks
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopy()} 
                      className="p-3 glass glass-hover rounded-xl text-gray-400 hover:text-white transition-all"
                    >
                      <Copy size={16} />
                    </button>
                    <Link 
                      href={`/dashboard/detailed-stats/${url.shortId}`}
                      className="p-3 glass glass-hover rounded-xl text-gray-400 hover:text-blue-400 transition-all"
                    >
                      <BarChart2 size={16} />
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full glass p-12 text-center rounded-3xl">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                  <LinkIcon size={32} className="text-gray-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">No links yet</h3>
                <p className="text-gray-500 mb-6">Start by shortening your first long URL above.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* QR Code Modal Rendering */}
      {showQrCode && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] p-6">
          <div className="glass rounded-[2rem] p-8 max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">QR Code</h3>
              <button onClick={() => setShowQrCode(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl mb-6 qr-code-container flex justify-center shadow-2xl">
              <QRCodeSVG value={shortenedUrl || selectedUrl || ""} size={200} level="H" includeMargin />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-6">
              {["svg", "png", "png1200"].map((size) => (
                <button
                  key={size}
                  onClick={() => setQrCodeSize(size)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all ${
                    qrCodeSize === size ? "bg-blue-500 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>

            <ModernButton onClick={downloadQrCode} className="w-full">
              Download Image
            </ModernButton>
          </div>
        </div>
      )}

      {showSuspendModal && urlToSuspend && (
        <SuspendUrlModal
          urlId={urlToSuspend.id}
          shortUrl={urlToSuspend.url}
          isSuspended={urlToSuspend.isSuspended}
          isOpen={showSuspendModal}
          onClose={() => setShowSuspendModal(false)}
          onSuccess={handleSuspendSuccess}
        />
      )}

      {/* Slide Panel */}
      <SlidePanel isOpen={isPanelOpen} onClose={closePanel}>
        {panelContent}
      </SlidePanel>
    </div>
  );
}
