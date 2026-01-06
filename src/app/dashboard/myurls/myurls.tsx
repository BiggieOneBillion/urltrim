// app/dashboard/myurls.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { 
  PauseCircle, 
  PlayCircle,
  Wand,
  ChevronDown,
  BarChart2,
  ExternalLink,
  Copy,
  QrCode,
  Share2,
  X,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  MousePointer2,
  Edit2,
  MoreVertical
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/app/context/authContext";
import { handleCopy, handleShare } from "@/app/utilityFunctions";
import { Spinner2, Alert } from "@/app/component/ui";
import { RenameUrlModal } from "@/app/component/ui/renameUrlModal";
import { EditOriginalName } from "@/app/component/ui/editOriginalName";
import { DeleteUrlModal } from "@/app/component/ui/DeleteUrlModal";
import { SuspendUrlModal } from "@/app/component/ui/SuspendUrlModal";
import { QRCodeSVG } from "qrcode.react";
import { ModernButton } from "@/app/component/ui/ModernButton";
import { ModernInput } from "@/app/component/ui/ModernInput";

export function MyURLs() {
  const [userUrls, setUserUrls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showQrCode, setShowQrCode] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [qrCodeSize, setQrCodeSize] = useState("svg");
  const [alertMessage, setAlertMessage] = useState("");
  const [refreshConst, setRefreshConst] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<{ id: string; url: string } | null>(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [urlToRename, setUrlToRename] = useState<{ id: string; shortId: string } | null>(null);

  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [expiresIn, setExpiresIn] = useState("");
  const [shortenedUrl, setShortenedUrl] = useState("");
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [showEditOriginalUrl, setShowEditOriginalUrl] = useState(false);
  const [originalUrlToEdit, setOriginalUrlToEdit] = useState<{ id: string; originalUrl: string } | null>(null);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [urlToSuspend, setUrlToSuspend] = useState<{ id: string; url: string; isSuspended: boolean } | null>(null);
  
  const router = useRouter();
  const { user } = useAuth();

  const fetchUserUrls = async () => {
    try {
      setLoadingUrls(true);
      const response = await fetch("/api/urls/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserUrls(data.urls || []);
      } else {
        setError("Failed to fetch your URLs");
      }
    } catch (error) {
      setError("Error loading URLs. Please try again.");
    } finally {
      setLoading(false);
      setLoadingUrls(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserUrls();
    } else if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [user, router, refreshConst]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
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
      setUrl("");
      setCustomId("");
      fetchUserUrls();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setRefreshConst(prev => prev + 1);
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

  const handleUrlCopy = async (url: string) => {
    const success = await handleCopy(url);
    if (success) {
      setCopySuccess(url);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleUrlShare = async (url: string) => {
    const success = await handleShare(url);
    if (success === false) {
      setAlertMessage("Social sharing limited. URL copied to clipboard.");
      handleUrlCopy(url);
    }
  };

  const handleUrlQrCode = (url: string) => {
    setSelectedUrl(url);
    setShowQrCode(true);
  };

  const handleDeleteClick = (shortId: string, shortUrl: string) => {
    setUrlToDelete({ id: shortId, url: shortUrl });
    setShowDeleteModal(true);
  };

  const handleRenameClick = (shortId: string) => {
    setUrlToRename({ id: shortId, shortId });
    setShowRenameModal(true);
  };

  const handleEditOriginalUrlClick = (id: string, originalUrl: string) => {
    setOriginalUrlToEdit({ id, originalUrl });
    setShowEditOriginalUrl(true);
  };

  const handleSuspendClick = (shortId: string, shortUrl: string, isSuspended: boolean) => {
    setUrlToSuspend({ id: shortId, url: shortUrl, isSuspended });
    setShowSuspendModal(true);
  };

  const filteredUrls = userUrls.filter(u => 
    u.shortId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.originalUrl.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function getFaviconUrl(originalUrl: string) {
    try {
      const domain = new URL(originalUrl).hostname;
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
      return null;
    }
  }

  return (
    <div className="flex flex-col gap-6 ">
      {alertMessage && (
        <Alert
          variant="warning"
          message={alertMessage}
          onClose={() => setAlertMessage("")}
          autoClose
        />
      )}

      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-2">
        <h2 className="text-2xl font-black text-white tracking-tight">Your Link Library</h2>
        <div className="flex gap-2">
          <button 
            onClick={handleRefresh}
            className="p-3 glass rounded-xl text-gray-400 hover:text-white transition-all active:scale-90"
          >
            <RefreshCw size={18} className={loadingUrls ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
        <input 
          type="text"
          placeholder="Search by keyword or alias..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all font-medium"
        />
      </div>

      {/* Link List */}
      <div className="space-y-4 pb-12">
        {loading && userUrls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Spinner2 color="white" />
            <p className="text-gray-500 font-medium">Fetching your links...</p>
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="glass p-12 text-center rounded-3xl">
            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
              <RefreshCw size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No matching links</h3>
            <p className="text-gray-500 mb-6">Try checking for typos or shorten a new link!</p>
          </div>
        ) : (
          filteredUrls.map((url, index) => (
            <div 
              key={url.shortId} 
              className="glass glass-hover p-6 rounded-[2rem] flex flex-col gap-6 relative group border border-white/5"
            >
              {/* Top Row: Icon + URLs */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/10 p-3 shrink-0">
                  <img 
                    src={getFaviconUrl(url.originalUrl) || ""} 
                    alt="Favicon" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src = `https://www.google.com/s2/favicons?domain=${new URL(url.originalUrl).hostname}&sz=32`;
                    }}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <a 
                      href={url.shortUrl} 
                      target="_blank" 
                      className="text-lg font-bold text-white hover:text-blue-400 transition-colors break-all flex items-center gap-2"
                    >
                      {url.shortId}
                      <ExternalLink size={14} className="opacity-50" />
                    </a>
                    {url.isSuspended && (
                      <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded-md border border-red-500/20">
                        Suspended
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate font-medium">{url.originalUrl}</p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap gap-6 px-1">
                <div className="flex items-center gap-2 text-gray-400">
                  <MousePointer2 size={16} className="text-blue-400" />
                  <span className="text-sm font-bold text-white">{url.totalClicks || 0}</span>
                  <span className="text-xs uppercase tracking-wider font-bold opacity-50">Clicks</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={16} className="text-purple-400" />
                  <span className="text-sm font-bold text-white">{formatTimeAgo(url.createdAt || new Date().toISOString())}</span>
                  <span className="text-xs uppercase tracking-wider font-bold opacity-50">Age</span>
                </div>
                <Link 
                  href={`/dashboard/detailed-stats/${url.shortId}`}
                  className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors ml-auto group/stats"
                >
                  <BarChart2 size={16} className="group-hover/stats:scale-110 transition-transform" />
                  <span className="text-sm font-bold">Analytics</span>
                </Link>
              </div>

              {/* Action Toolbar */}
              <div className="grid grid-cols-4 sm:flex gap-2 pt-4 border-t border-white/5">
                <button 
                  onClick={() => handleUrlCopy(url.shortUrl)}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    copySuccess === url.shortUrl ? "bg-green-500 text-white" : "glass glass-hover text-gray-400 hover:text-white"
                  }`}
                >
                  {copySuccess === url.shortUrl ? "Copied" : <><Copy size={16} /> <span className="hidden sm:inline">Copy</span></>}
                </button>
                <button 
                  onClick={() => handleUrlQrCode(url.shortUrl)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 glass glass-hover rounded-xl text-gray-400 hover:text-white font-bold text-sm transition-all"
                >
                  <QrCode size={16} /> <span className="hidden sm:inline">QR</span>
                </button>
                <button 
                  onClick={() => handleUrlShare(url.shortUrl)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 glass glass-hover rounded-xl text-gray-400 hover:text-white font-bold text-sm transition-all"
                >
                  <Share2 size={16} /> <span className="hidden sm:inline">Share</span>
                </button>
                
                <div className="flex-1 sm:flex-none flex sm:ml-auto gap-2">
                  <button 
                    onClick={() => handleEditOriginalUrlClick(url._id || url.shortId, url.originalUrl)}
                    className="flex-1 sm:flex-none flex items-center justify-center p-2.5 glass glass-hover rounded-xl text-gray-400 hover:text-blue-400 transition-all"
                    title="Edit Original URL"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => handleSuspendClick(url.shortId, url.shortUrl, url.isSuspended || false)}
                    className={`flex-1 sm:flex-none flex items-center justify-center p-2.5 glass glass-hover rounded-xl transition-all ${
                      url.isSuspended ? "text-green-500" : "text-amber-500"
                    }`}
                    title={url.isSuspended ? "Activate URL" : "Suspend URL"}
                  >
                    {url.isSuspended ? <PlayCircle size={18} /> : <PauseCircle size={18} />}
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(url.shortId, url.shortUrl)}
                    className="flex-1 sm:flex-none flex items-center justify-center p-2.5 glass glass-hover rounded-xl text-gray-400 hover:text-red-500 transition-all"
                    title="Delete URL"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showQrCode && selectedUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[200] p-6">
          <div className="glass rounded-[2rem] p-8 max-w-sm w-full animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">QR Image</h3>
              <button onClick={() => setShowQrCode(false)} className="p-2 hover:bg-white/10 rounded-full text-gray-400">
                <X size={20} />
              </button>
            </div>
            
            <div className="bg-white p-6 rounded-2xl mb-6 flex justify-center shadow-2xl">
              <QRCodeSVG value={selectedUrl} size={200} level="H" includeMargin />
            </div>

            <ModernButton onClick={() => setShowQrCode(false)} className="w-full">
              Done
            </ModernButton>
          </div>
        </div>
      )}

      {showDeleteModal && urlToDelete && (
        <DeleteUrlModal
          urlId={urlToDelete.id}
          shortUrl={urlToDelete.url}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleRefresh}
        />
      )}

      {showRenameModal && urlToRename && (
        <RenameUrlModal
          urlId={urlToRename.id}
          currentShortId={urlToRename.shortId}
          isOpen={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          onSuccess={handleRefresh}
        />
      )}

      {showEditOriginalUrl && originalUrlToEdit && (
        <EditOriginalName
          urlId={originalUrlToEdit.id}
          currentOriginalName={originalUrlToEdit.originalUrl}
          isOpen={showEditOriginalUrl}
          onClose={() => setShowEditOriginalUrl(false)}
          onSuccess={handleRefresh}
        />
      )}

      {showSuspendModal && urlToSuspend && (
        <SuspendUrlModal
          urlId={urlToSuspend.id}
          shortUrl={urlToSuspend.url}
          isSuspended={urlToSuspend.isSuspended}
          isOpen={showSuspendModal}
          onClose={() => setShowSuspendModal(false)}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
