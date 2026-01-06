"use client";

import { FormEvent, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { ReferralAuthModal } from "@/app/component/ui/ReferralAuthModal";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  BarChart2,
  Globe,
  Layers,
  Share2,
  Wand,
  Copy,
  Menu,
  X,
  QrCode,
  ExternalLink,
  Zap,
  Shield,
  MousePointer2
} from "lucide-react";
import { ModernButton } from "@/app/component/ui/ModernButton";
import { ModernInput } from "@/app/component/ui/ModernInput";

// Auth logic (preserved)
const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsLoggedIn(true);
        const userId = localStorage.getItem('userId');
        if (userId) {
          setUserId(userId as any);
        }
      }
    };
    checkAuth();
    window.addEventListener('storage', (event) => {
      if (event.key === 'authToken') {
        checkAuth();
      }
    });
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  return { isLoggedIn, userId };
};

// Storage logic (preserved)
const useUrlStorage = () => {
  const saveUrlToLocalStorage = (urlData: {
    originalUrl: string;
    shortUrl: string;
    shortId: string;
    customId?: string;
    expiresIn?: number;
  }) => {
    try {
      const savedUrls = JSON.parse(localStorage.getItem('savedUrls') || '[]');
      const urlWithTimestamp = {
        ...urlData,
        savedAt: new Date().toISOString(),
      };
      savedUrls.push(urlWithTimestamp);
      localStorage.setItem('savedUrls', JSON.stringify(savedUrls));
      return true;
    } catch (error) {
      console.error('Error saving URL to localStorage:', error);
      return false;
    }
  };

  const getSavedUrls = () => {
    try {
      return JSON.parse(localStorage.getItem('savedUrls') || '[]');
    } catch (error) {
      console.error('Error retrieving URLs from localStorage:', error);
      return [];
    }
  };

  const clearSavedUrls = (urlId = null) => {
    if (urlId) {
      const savedUrls = getSavedUrls();
      const filteredUrls = savedUrls.filter((url: { shortId: string }) => url.shortId !== urlId);
      localStorage.setItem('savedUrls', JSON.stringify(filteredUrls));
    } else {
      localStorage.removeItem('savedUrls');
    }
  };

  return { saveUrlToLocalStorage, getSavedUrls, clearSavedUrls };
};

const syncUrlsWithDatabase = async (userId: string | null) => {
  try {
    const savedUrls = JSON.parse(localStorage.getItem('savedUrls') || '[]');
    if (savedUrls.length === 0) return;
    
    const response = await fetch("/api/sync-urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, urls: savedUrls })
    });

    if (response.ok) {
      localStorage.removeItem('savedUrls');
    }
  } catch (error) {
    console.error("Error syncing URLs with database:", error);
  }
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [customId, setCustomId] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | undefined>();
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeSize, setQrCodeSize] = useState("svg");
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  const router = useRouter();
  const { isLoggedIn, userId } = useAuth();
  const { saveUrlToLocalStorage } = useUrlStorage();

  useEffect(() => {
    if (isLoggedIn && userId) {
      syncUrlsWithDatabase(userId);
    }
  }, [isLoggedIn, userId]);

  const handleQrCodeClick = (size = "svg") => {
    setQrCodeSize(size);
    setShowQrCode(true);
  };
  
  const navigateTo = (path: string) => {
    router.push(path);
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
        downloadLink.download = `qrcode${qrCodeSize === "png1200" ? "-1200" : ""}.png`;
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          customId: customId || undefined,
          expiresIn: expiresIn || undefined,
          userId: isLoggedIn ? userId : undefined
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to shorten URL");

      setShortenedUrl(data.shortUrl);
      if (!isLoggedIn) {
        saveUrlToLocalStorage({
          originalUrl: url,
          shortUrl: data.shortUrl,
          shortId: data.shortUrl.split('/').pop(),
          customId: customId || undefined,
          expiresIn: expiresIn || undefined
        });
      }
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
      setError("Copy failed. Please select and copy the URL manually.");
    }
  };

  const handleShare = async () => {
    if (!shortenedUrl || !navigator.share) return;
    try {
      await navigator.share({
        title: "Shortened URL",
        text: "Check out this shortened URL!",
        url: shortenedUrl
      });
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        setError("Couldn't share the URL.");
      }
    }
  };

  const QrCodeModal = () => {
    if (!showQrCode) return null;
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
        <div className="glass rounded-3xl p-8 max-w-md w-full animate-in zoom-in-95 duration-200">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-white">QR Code</h3>
            <button onClick={() => setShowQrCode(false)} className="text-gray-400 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="flex justify-center mb-8 p-4 bg-white rounded-2xl qr-code-container">
            <QRCodeSVG value={shortenedUrl || ""} size={200} level={"H"} includeMargin={true} />
          </div>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {["svg", "png", "png1200"].map((size) => (
              <button
                key={size}
                onClick={() => setQrCodeSize(size)}
                className={`py-2 text-xs font-medium rounded-xl transition-all ${
                  qrCodeSize === size ? "bg-blue-600 text-white" : "bg-white/5 text-gray-400 hover:bg-white/10"
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex gap-4">
            <ModernButton onClick={downloadQrCode} className="flex-1">Download</ModernButton>
            <ModernButton variant="secondary" onClick={() => setShowQrCode(false)} className="flex-1">Close</ModernButton>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="bg-mesh" />
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 w-full z-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto glass rounded-2xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-2xl font-black tracking-tighter text-white emblema-one-regular">
              URLTRIM
            </h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">My URLs</Link>
            <button onClick={() => setShowAuthModal(true)} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Referral</button>
            <Link href="#" className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Blog</Link>
          </div>

          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <ModernButton variant="ghost" onClick={() => navigateTo("login")} className="hidden sm:flex">Login</ModernButton>
                <ModernButton onClick={() => navigateTo("register")}>Sign Up</ModernButton>
              </>
            ) : (
              <ModernButton variant="secondary" onClick={() => {
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                window.location.reload();
              }}>Logout</ModernButton>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 glass rounded-2xl p-6 animate-in slide-in-from-top-4 duration-300">
            <div className="flex flex-col gap-4">
              <Link href="#" className="text-gray-400 font-medium">My URLs</Link>
              <button onClick={() => { setShowAuthModal(true); setMobileMenuOpen(false); }} className="text-left text-gray-400 font-medium">Referral</button>
              <Link href="#" className="text-gray-400 font-medium">Blog</Link>
              {!isLoggedIn && <Link href="/login" className="text-gray-400 font-medium">Login</Link>}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20 text-center relative z-10">
        {/* Hero Section */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
            Make every link <span className="text-gradient">matter.</span>
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Shorten, customize, and track your links with the most beautiful URL management platform built for creators and brands.
          </p>
        </div>

        {/* Shortener Card */}
        <div className="glass rounded-[2rem] p-8 md:p-12 mb-16 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
              <ModernInput 
                value={url} 
                onChange={e => setUrl(e.target.value)} 
                placeholder="Paste your long link here..." 
                className="text-lg py-5 px-6"
                required
              />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              <button 
                type="button" 
                onClick={() => setShowCustomOptions(!showCustomOptions)} 
                className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
              >
                <Wand size={16} />
                Customize link settings
                <ChevronDown className={`transition-transform duration-300 ${showCustomOptions ? "rotate-180" : ""}`} />
              </button>

              <ModernButton 
                type="submit" 
                isLoading={loading} 
                className="w-full md:w-auto md:ml-auto min-w-[180px]"
              >
                {loading ? "Shortening..." : "Shorten URL"}
              </ModernButton>
            </div>

            {showCustomOptions && (
              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-white/5 animate-in fade-in slide-in-from-top-4 duration-300">
                <ModernInput 
                  label="Custom Alias" 
                  value={customId} 
                  onChange={e => setCustomId(e.target.value)} 
                  placeholder="e.g. my-awesome-link" 
                />
                <ModernInput 
                  label="Expires in (days)" 
                  type="number" 
                  value={expiresIn || ""} 
                  onChange={e => setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)} 
                  placeholder="30" 
                />
              </div>
            )}
          </form>

          {error && (
            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Result Card */}
          {shortenedUrl && (
            <div className="mt-12 p-8 bg-blue-600/5 border border-blue-500/20 rounded-3xl animate-in zoom-in-95 duration-500">
              <h3 className="text-xl font-bold text-white mb-6">Your link is ready!</h3>
              <div className="flex items-center gap-2 mb-8 glass bg-white/5 p-2 rounded-2xl">
                <input 
                  type="text" 
                  value={shortenedUrl} 
                  readOnly 
                  className="bg-transparent flex-1 px-4 text-gray-200 outline-none text-sm md:text-base font-medium"
                />
                <ModernButton onClick={handleCopy} className="min-w-[100px] py-2 h-10 text-xs">
                  {copySuccess ? "Copied!" : "Copy"}
                </ModernButton>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <button onClick={handleShare} className="glass glass-hover p-4 rounded-2xl flex flex-col items-center gap-2">
                  <Share2 size={20} className="text-blue-400" />
                  <span className="text-xs text-gray-400">Share</span>
                </button>
                <button onClick={() => handleQrCodeClick()} className="glass glass-hover p-4 rounded-2xl flex flex-col items-center gap-2">
                  <QrCode size={20} className="text-blue-400" />
                  <span className="text-xs text-gray-400">QR Code</span>
                </button>
                <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="glass glass-hover p-4 rounded-2xl flex flex-col items-center gap-2">
                  <ExternalLink size={20} className="text-blue-400" />
                  <span className="text-xs text-gray-400">Visit</span>
                </a>
                {isLoggedIn && (
                  <Link href={`/stats/${shortenedUrl.split("/").pop()}`} className="glass glass-hover p-4 rounded-2xl flex flex-col items-center gap-2">
                    <BarChart2 size={20} className="text-blue-400" />
                    <span className="text-xs text-gray-400">Stats</span>
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Features Preview */}
        <div className="grid md:grid-cols-3 gap-8 text-left animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
          {[
            { icon: <Zap />, title: "Lightning Fast", desc: "Redirection in under 100ms globally." },
            { icon: <Shield />, title: "Secure & Private", desc: "Enterprise-grade encryption for every link." },
            { icon: <MousePointer2 />, title: "Smart Analytics", desc: "Track clicks, sources, and demographics." }
          ].map((feature, i) => (
            <div key={i} className="glass p-6 rounded-2xl border-white/5">
              <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h4 className="text-white font-bold mb-2">{feature.title}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* QR Modal */}
      <QrCodeModal />
      
      <ReferralAuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}