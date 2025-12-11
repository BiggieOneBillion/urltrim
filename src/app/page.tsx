"use client";

import { FormEvent, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import  {ReferralAuthModal} from "@/app/component/ui/ReferralAuthModal"
import Link from "next/link";
//import { useAuth } from "@/app/context/authContext";

import { useRouter } from "next/navigation";
import {
  ChevronDown,
  BarChart2,
  Globe,
  Layers,
  Share2,
  Wand,
  Copy,
  Menu, X,
  QrCode,
  ExternalLink
} from "lucide-react";
import { Righteous } from "next/font/google";
import { Poppins } from "next/font/google";

const righteousFont = Righteous({
  weight: ["400"],
  subsets: ["latin"]
});

const PoppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["400"]
});

//Add auth state management

 const useAuth = () => {
  // This is a mock implementation - replace with your actual auth logic
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Check if user is logged in by looking for auth token in localStorage, cookies, etc.
    // This is just a placeholder - implement your actual auth check here
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        setIsLoggedIn(true);
        // Get user ID from token or separate storage
const userId = localStorage.getItem('userId');
if (userId) {
setUserId(userId as any);
}
      }
    };
    
    checkAuth();
    
    // Listen for auth changes (optional)
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




// Function to save/retrieve URLs from localStorage
const useUrlStorage = () => {
  // Save a shortened URL to localStorage
  const saveUrlToLocalStorage = (urlData: {
    originalUrl: string;
    shortUrl: string;
    shortId: string;
    customId?: string;
    expiresIn?: number;
  }) => {
    try {
      // Get existing saved URLs or initialize empty array
      const savedUrls = JSON.parse(localStorage.getItem('savedUrls') || '[]');
      
      // Add timestamp to track when URL was created
      const urlWithTimestamp = {
        ...urlData,
        savedAt: new Date().toISOString(),
      };
      
      // Add new URL to array
      savedUrls.push(urlWithTimestamp);
      
      // Save back to localStorage
      localStorage.setItem('savedUrls', JSON.stringify(savedUrls));
      
      return true;
    } catch (error) {
      console.error('Error saving URL to localStorage:', error);
      return false;
    }
  };

  // Get all saved URLs from localStorage
  const getSavedUrls = () => {
    try {
      return JSON.parse(localStorage.getItem('savedUrls') || '[]');
    } catch (error) {
      console.error('Error retrieving URLs from localStorage:', error);
      return [];
    }
  };

  // Clear all or specific saved URLs
  const clearSavedUrls = (urlId = null) => {
    if (urlId) {
      // Remove specific URL
      const savedUrls = getSavedUrls();
      const filteredUrls = savedUrls.filter((url: { shortId: string }) => url.shortId !== urlId);
      localStorage.setItem('savedUrls', JSON.stringify(filteredUrls));
    } else {
      // Clear all saved URLs
      localStorage.removeItem('savedUrls');
    }
  };

  return { saveUrlToLocalStorage, getSavedUrls, clearSavedUrls };
};

// Function to sync localStorage URLs with database
const syncUrlsWithDatabase = async (userId: string | null) => {
  const { getSavedUrls, clearSavedUrls } = useUrlStorage();
  const savedUrls = getSavedUrls();
  
  if (savedUrls.length === 0) return;
  
  try {
    // Send saved URLs to your API endpoint
    const response = await fetch("/api/sync-urls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        urls: savedUrls
      })
    });

    if (response.ok) {
      // If successfully synced, clear local storage
      clearSavedUrls();
    } else {
      console.error("Failed to sync URLs with database");
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
  const [qrCodeSize, setQrCodeSize] = useState("svg"); // Options: "svg", "png", "png1200"
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();
  const { isLoggedIn, userId } = useAuth();
  const { saveUrlToLocalStorage } = useUrlStorage();

  // Check for saved URLs when user logs in
  useEffect(() => {
    if (isLoggedIn && userId) {
      syncUrlsWithDatabase(userId);
    }
  }, [isLoggedIn, userId]);

  // Add a function to handle QR code button click
  const handleQrCodeClick = (size = "svg") => {
    setQrCodeSize(size);
    setShowQrCode(true);
  };
  
  const navigateTo = (path: string) => {
    router.push(path);
  };
 

  // Add this function to handle downloads
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
      const img = new Image();
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/shorten", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          url,
          customId: customId || undefined,
          expiresIn: expiresIn || undefined,
          userId: isLoggedIn ? userId : undefined // Only include userId if logged in
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to shorten URL");
      }

      setShortenedUrl(data.shortUrl);
      
      // If user is not logged in, save URL to localStorage
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
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shortenedUrl) return;

    try {
      // Try the Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shortenedUrl);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } else {
        // Fallback for mobile browsers that don't support Clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = shortenedUrl;
        textArea.style.position = "fixed"; // Make it invisible
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        } else {
          throw new Error("Copy failed");
        }
      }
    } catch (err) {
      console.error("Copy failed:", err);
      // Inform user that copy failed
      setError("Copy failed. Please select and copy the URL manually.");
    }
  };

  const handleShare = async () => {
    if (!shortenedUrl) return;

    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Shortened URL",
          text: "Check out this shortened URL!",
          url: shortenedUrl
        });
        // Optionally show success message
        // setShareSuccess(true);
        // setTimeout(() => setShareSuccess(false), 2000);
      } catch (error) {
        console.error("Error sharing:", error);
        // Only show error if it's not an AbortError (user canceled)
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setError("Couldn't share the URL. Please try copying it instead.");
        }
      }
    } else {
      // Fallback for devices/browsers that don't support Web Share API
      // You could either show an error message or automatically fall back to copy
      handleCopy();
      setError(
        "Direct sharing not supported on this device. URL copied to clipboard instead."
      );
    }
  };

  // QR Code Modal component
  const QrCodeModal = () => {
    if (!showQrCode) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">QR Code for your URL</h3>
            <button
              onClick={() => setShowQrCode(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="flex justify-center mb-4 qr-code-container">
            <QRCodeSVG
              value={shortenedUrl || ""}
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
      </div>
    );
  };

  // Display indicator if there are saved URLs in localStorage
  const SavedUrlsIndicator = () => {
    const [hasSavedUrls, setHasSavedUrls] = useState(false);
    
    useEffect(() => {
      const savedUrls = JSON.parse(localStorage.getItem('savedUrls') || '[]');
      setHasSavedUrls(savedUrls.length > 0);
    }, [shortenedUrl]); // Re-check when a new URL is shortened
    
    if (!hasSavedUrls || isLoggedIn) return null;
    
    return (
      <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
        <p className="text-sm">
          <span className="font-bold">Note:</span> You have shortened URLs saved locally. 
          <button 
            onClick={() => navigateTo('login')} 
            className="text-blue-600 hover:underline ml-1"
          >
            Log in
          </button> to save them to your account.
        </p>
      </div>
    );
  };

  return <div className="min-h-screen text-black background">
      <nav className="bg-black p-4 fixed top-0 left-0 w-full z-50 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
           <div className="flex items-center">
            {/* Mobile menu button */}
            <button
              className="md:hidden text-white mr-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <h1 className="md:text-3xl text-xl font-bold tracking-wide text-white emblema-one-regular">
              URLTRIM
            </h1>
          </div>
          
         

          <div className="hidden md:flex space-x-6 text-white">
            <button className="px-2 py-1 cursor-pointer rounded hover:bg-white hover:text-black  transition doto font-bold">
              My URLs
            </button>
            <button onClick={()=>setShowAuthModal(true)} className="px-2 py-1 cursor-pointer rounded hover:bg-white hover:text-black  transition doto font-bold">
              Referral
            </button>
            <button className="px-2 py-1 cursor-pointer rounded hover:bg-white hover:text-black  transition doto font-bold">
              Blog
            </button>
            {/* <div className="relative group">
              <button className="px-3 cursor-pointer py-1 rounded hover:bg-white hover:text-black transition flex items-center doto font-bold">
                Features <ChevronDown className="h-4 w-4 ml-1" />
              </button>
            </div> */}
          </div>
 <div
            className={`md:hidden absolute top-full left-0 w-full bg-black transition-all duration-300 ease-in-out ${
              mobileMenuOpen ? "block" : "hidden"
            }`}
          >
            <div className="flex flex-col space-y-4 p-4">
              <button className="px-2 py-1 cursor-pointer text-white rounded hover:bg-white hover:text-black transition doto font-bold">
                My URLs
              </button>
              <button 
                onClick={() => {
                  setShowAuthModal(true);
                  setMobileMenuOpen(false);
                }} 
                className="px-2 py-1 cursor-pointer text-white rounded hover:bg-white hover:text-black transition doto font-bold"
              >
                Referral
              </button>
              <button className="px-2 py-1 cursor-pointer text-white rounded hover:bg-white hover:text-black transition doto font-bold">
                Blog
              </button>
              {/* Login/Signup or Logout buttons
              {!isLoggedIn ? (
                <>
                  <button 
                    onClick={() => {
                      navigateTo("login");
                      setMobileMenuOpen(false);
                    }} 
                    className="cursor-pointer text-white  bg-black px-1 py-1 rounded hover:bg-white hover:text-black transition"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => {
                      navigateTo("register");
                      setMobileMenuOpen(false);
                    }} 
                    className="cursor-pointer text-white text-sm rock-salt-regular bg-black px-1 py-1 rounded hover:bg-white hover:text-black transition"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('userId');
                    window.location.reload();
                  }} 
                  className="cursor-pointer text-white bg-black px-3 py-1 rounded hover:bg-white hover:text-black transition"
                >
                  Logout
                </button>
              )} */}
            </div>
          </div>
          <div className="rock-salt-regular flex items-center text-white space-x-1">
            {!isLoggedIn ? (
              <>
                <button onClick={() => navigateTo("login")} className="cursor-pointer text-sm bg-black px-1 py-1 rounded hover:bg-white hover:text-black transition">
                  Login
                </button>
                <button onClick={() => navigateTo("register")} className="cursor-pointer text-sm rock-salt-regular bg-black px-1 py-1 rounded hover:bg-white hover:text-black transition">
                  Sign Up
                </button>
              </>
            ) : (
              <button onClick={() => {
                // Implementation of logout function
                localStorage.removeItem('authToken');
                localStorage.removeItem('userId');
                window.location.reload();
              }} className="cursor-pointer bg-black px-3 py-1 rounded hover:bg-white hover:text-black transition">
                Logout
              </button>
            )}
          </div>
        </div>
      </nav>

      <div className="container pt-24 mx-auto px-4 py-10 flex flex-col md:flex-row gap-8">
        {/* Left Column - URL Shortener Form */}

        <div className="md:w-1/3 montserrat">
          <div className="bg-black text-white rounded-lg shadow-lg p-6 ">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="url" className="text-lg font-medium flex items-center gap-2">
                  <span className="text-white">Shorten a long URL</span>
                </label>
                <input type="url" id="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter long link here" className="w-full p-3 border border-gray-300 rounded-md mt-2 text-lg" required />
              </div>

              <div>
                <button type="button" onClick={() => setShowCustomOptions(!showCustomOptions)} className="flex items-center gap-2 text-white font-medium">
                  <span className="text-lg text-white">
                    <Wand />
                  </span> Customize your link
                  <ChevronDown className={`h-4 w-4 text-white transition-transform ${showCustomOptions ? "rotate-180" : ""}`} />
                </button>
              </div>

              {showCustomOptions && <div className="space-y-4 pt-2 pb-4 border-b border-gray-200">
                  <div className="flex flex-col md:flex-row gap-2 ">
                    <div className="md:w-1/2">
                      <div className="w-full p-3 outline-none rounded-md md:rounded-l-md bg-white text-black">
                        <option value="shorturl.com" className="bg-white text-black font-extrabold">
                          shorturl.com/
                        </option>
                      </div>
                    </div>
                    <div className="md:w-1/2">
                      <input type="text" id="customId" value={customId} onChange={e => setCustomId(e.target.value)} placeholder="Enter alias" className="w-full p-3 border border-white text-white rounded-md md:rounded-l-md" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="expiresIn" className="block text-sm font-medium text-white mb-1">
                      Expires In (days)
                    </label>
                    <input type="number" id="expiresIn" value={expiresIn || ""} onChange={e => setExpiresIn(e.target.value ? parseInt(e.target.value) : undefined)} placeholder="30" min="1" className="w-full p-3 border border-gray-300 rounded-md" />
                  </div>
                </div>}

              <button type="submit" disabled={loading} className="w-full bg-white hover:bg-black hover:text-white cursor-pointer text-black font-bold p-3 rounded-md transition text-lg flex items-center justify-center rock-salt-regular">
                {loading ? <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-0" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-100" fill="black" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Shortening...
                    </div> : "Shorten URL"}
              </button>
            </form>

            {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>}

            {/* Saved URLs indicator */}
            <SavedUrlsIndicator />

            {shortenedUrl && <div className="mt-6 p-4 bg-white text-black rounded-md">
                <h3 className="text-lg font-medium mb-2">
                  URL Shortened Successfully!
                </h3>
                <div className="flex items-center mb-4">
                  <input type="text" value={shortenedUrl} readOnly className="flex-1 p-3 border border-black rounded-l-md bg-white" />
                </div>

                {/* New action buttons similar to the image */}
                <div className="grid grid-cols-4 gap-2">
                  <button onClick={handleShare} className="flex flex-col items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition" title="Share">
                    <Share2 className="h-6 w-6 text-black mb-1" />
                    <span className="text-xs">Share</span>
                  </button>

                  <button onClick={handleCopy} className="flex flex-col items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition" title="Copy to clipboard">
                    <Copy className="h-6 w-6 text-black mb-1" />
                    <span className="text-xs">
                      {copySuccess ? "Copied!" : "Copy"}
                    </span>
                  </button>

                  <button onClick={() => handleQrCodeClick()} className="flex flex-col items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition" title="Get QR Code">
                    <QrCode className="h-6 w-6 text-black mb-1" />
                    <span className="text-xs">QR Code</span>
                  </button>

                  <a href={shortenedUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition" title="Visit URL">
                    <ExternalLink className="h-6 w-6 text-black mb-1" />
                    <span className="text-xs">Visit</span>
                  </a>
                </div>
{isLoggedIn && <div className="mt-4 flex flex-wrap gap-4">
                  <Link href={`/stats/${shortenedUrl
                      .split("/")
                      .pop()}`} className="text-black hover:text-cyan-800 flex items-center gap-1">
                    <BarChart2 className="h-4 w-4 text-black" /> View Statistics
                  </Link>
                 
                  <Link 
  href={`/referral/${shortenedUrl.split("/").pop()}`} 
  className="text-black underline hover:text-cyan-800 flex items-center gap-1"
 
>
  <Share2 className="h-4 w-4" color="black" /> Allow Referrals
</Link>
                </div>}
                

                <div className="mt-4">
                  <button className="bg-black hover:bg-white text-white hover:text-black rock-salt-regular font-medium py-2 px-4 rounded w-full" onClick={() => {
                      setUrl("");
                      setCustomId("");
                      setExpiresIn(undefined);
                      setShortenedUrl(null);
                      setError(null);
                      setShowCustomOptions(false);
                    }}>
                    Shorten another
                  </button>
                </div>
              </div>}
          </div>

          {/* Render QR Code Modal */}
          {shortenedUrl && <QrCodeModal />}
        </div>

        {/* Right Column - Features Info */}
        <div className="md:w-1/3 montserrat">
          <div className="text-black">
            <h2 className="text-3xl font-bold mb-4">
              Beyond URL Shortening: Track, Analyze, Convert
            </h2>
            <p className="text-lg mb-6 font-semibold">
              {" "}"Create cool URLs with URLTRIM".
            </p>

            <p className="mb-6 font-medium text-base/6">
              Create compact links that do more than redirect. Get detailed
              click analytics, monitor referral performance, and boost your
              marketing campaigns with our powerful link management platform.
            </p>

            <button className="bg-black text-white hover:bg-white hover:text-black font-stretch-extra-expanded w-full italic px-6 py-3 rounded font-medium  transition mb-8">
              Create free Account
            </button>

            {/* <h3 className="text-xl font-bold mb-4">
              ShortURL plans include:
            </h3>

            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <BarChart2 className="h-5 w-5 text-cyan-300" />
                <span>Detailed Link Analytics</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-cyan-300" />
                <span>Fully Branded Domains</span>
              </li>
              <li className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-cyan-300" />
                <span>Bulk Short URLs</span>
              </li>
              <li className="flex items-center gap-3">
                <Share2 className="h-5 w-5 text-cyan-300" />
                <span>Link Management Features</span>
              </li>
            </ul> */}
          </div>
        </div>
      </div>
        <ReferralAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
       
      />
    </div>;
}