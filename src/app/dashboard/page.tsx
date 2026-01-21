"use client";

import { FormEvent, useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";
import SlidePanel from "./slidder";
import DashboardNav from "./dashboardNav";
import { Referrals } from "./referrals/referrals"
import { PauseCircle, PlayCircle } from "lucide-react";
import { SuspendUrlModal } from "@/app/component/ui/SuspendUrlModal";
import { useRouter } from "next/navigation";
import { DashboardWelcome } from "@/app/component/dashboard/DashboardWelcome";
import { DashboardStats } from "@/app/component/dashboard/DashboardStats";
import { UrlShortenerDashboardForm } from "@/app/component/dashboard/UrlShortenerDashboardForm";
import { DashboardUrlResult } from "@/app/component/dashboard/DashboardUrlResult";
//import {useRouter} from "next/router"
import {
  LogOut,
  User,
  Menu, // Added Menu icon
  X, // Added X icon for closing menu
  Trash2,
  Edit2,
  Search
} from "lucide-react";
import { Righteous } from "next/font/google";
import { Poppins } from "next/font/google";
import { useAuth } from "@/app/context/authContext"; // Import the auth context

const righteousFont = Righteous({
  weight: ["400"],
  subsets: ["latin"]
});

const PoppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["400"]
});

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | undefined>();
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAllowedReferral, setShowAllowedReferral] = useState(false);
  const [showCustomOptions, setShowCustomOptions] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeSize, setQrCodeSize] = useState("svg"); // Options: "svg", "png", "png1200"
  const [userUrls, setUserUrls] = useState<any[]>([]);
  const [loadingUrls, setLoadingUrls] = useState(true);
  const [isLoadingData, setISLoadindData] = useState(false);
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelContent, setPanelContent] = useState<React.ReactNode | null>(
    null
  );
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [urlToSuspend, setUrlToSuspend] = useState<{
    id: string;
    url: string;
    isSuspended: boolean;
  } | null>(null);
  // Get auth context
  const { user, logout } = useAuth();
  //const router = useRouter();
  const router = useRouter();

  const openPanel = (path: string, content: React.ReactNode) => {
    // router.replace(`/dashboard/${path}`); // Update URL without reload
    setPanelContent(content);
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    //  router.replace("/dashboard"); // Revert URL
    setIsPanelOpen(false);
  };
  // Load user's URLs on component mount
  useEffect(() => {
    const fetchUserUrls = async () => {
      try {
        setISLoadindData(true);
        const response = await fetch("/api/urls/user", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setUserUrls(data.urls || []);
          setISLoadindData(false);
        } else {
          console.error("Failed to fetch user URLs");
        }
      } catch (error) {
        console.error("Error fetching URLs:", error);
      } finally {
        setLoadingUrls(false);
      }
    };

    if (user) {
      fetchUserUrls();
    }
  }, [user]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when route changes or screen size increases
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Add a function to handle QR code button click
  const handleQrCodeClick = (size = "svg") => {
    setQrCodeSize(size);
    setShowQrCode(true);
  };

  const handleReferralClick = async (shortId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/urls/allowReferrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          urlId: shortId,
          allowReferrals: true
        })
      });

      const data = await response.json();
      setLoading(true);
      setShowAllowedReferral(true);
      if (!response.ok) {
        setLoading(false);
        throw new Error(data.error || "Failed to enable referrals");
      }

      // Handle successful response
      // You might want to update the UI or show a success message
      setError(null);
      setLoading(false)
      // Optionally refresh the URLs list to show the referral status
      const urlsResponse = await fetch("/api/urls/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (urlsResponse.ok) {
        const urlsData = await urlsResponse.json();
        setUserUrls(urlsData.urls || []);
      }
    } catch (error) {
      console.error("Error enabling referrals:", error);
      setError(
        error instanceof Error ? error.message : "Failed to enable referrals"
      );
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMobileMenuOpen(false); // Close mobile menu on logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
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
        downloadLink.download = `qrcode${
          qrCodeSize === "png1200" ? "-1200" : ""
        }.png`;
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
      setLoading(false);
      // Refresh user URLs after creating a new one
      setLoadingUrls(true);
      const urlsResponse = await fetch("/api/urls/user", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
        }
      });

      if (urlsResponse.ok) {
        const urlsData = await urlsResponse.json();
        setUserUrls(urlsData.urls || []);
      }
      setLoadingUrls(false);
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
      } catch (error) {
        console.error("Error sharing:", error);
        // Only show error if it's not an AbortError (user canceled)
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setError("Couldn't share the URL. Please try copying it instead.");
        }
      }
    } else {
      // Fallback for devices/browsers that don't support Web Share API
      handleCopy();
      setError(
        "Direct sharing not supported on this device. URL copied to clipboard instead."
      );
    }
  };

  // QR Code Modal component
  const QrCodeModal = () => {
    if (!showQrCode) return null;


  
  };
  // Add this success handler
  const handleSuspendSuccess = async () => {
    const action = urlToSuspend?.isSuspended ? 'reactivated' : 'suspended';
    setError(`URL ${action} successfully`);
    setTimeout(() => setError(null), 3000);
    
    // Refresh the URLs list
    setLoadingUrls(true);
    try {
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
      console.error("Error refreshing URLs:", error);
    } finally {
      setLoadingUrls(false);
    }
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
              className={`p-2 rounded ${
                qrCodeSize === "svg" ? "bg-green-600 text-white" : "bg-gray-200"
              }`}
            >
              SVG
            </button>
            <button
              onClick={() => handleQrCodeClick("png")}
              className={`p-2 rounded ${
                qrCodeSize === "png" ? "bg-green-600 text-white" : "bg-gray-200"
              }`}
            >
              PNG
            </button>
            <button
              onClick={() => handleQrCodeClick("png1200")}
              className={`p-2 rounded ${
                qrCodeSize === "png1200"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"
              }`}
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

 const handleSuspendClick = (shortId: string, shortUrl: string, isSuspended: boolean) => {
    setUrlToSuspend({
      id: shortId,
      url: shortUrl,
      isSuspended
    });
    setShowSuspendModal(true);
  };

  // Redirects to login if user is not authenticated
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      router.push("/login");
    }
  }, [router]);

  // Add this useEffect after your other useEffect hooks
  useEffect(() => {
    const syncLocalStorageUrls = async () => {
      // Check if user is logged in and localStorage has saved URLs
      if (user && localStorage.getItem("savedUrls")) {
        try {
          // Parse the saved URLs from localStorage
          const savedUrls = JSON.parse(
            localStorage.getItem("savedUrls") || "[]"
          );

          if (savedUrls.length > 0) {
            setLoading(true);

            // Call API to sync URLs with user account
            const response = await fetch("/api/urls/sync", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`
              },
              body: JSON.stringify({ urls: savedUrls })
            });

            if (response.ok) {
              // Clear saved URLs from localStorage after successful sync
              localStorage.removeItem("savedUrls");

              // Refresh user URLs list
              const urlsResponse = await fetch("/api/urls/user", {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`
                }
              });

              if (urlsResponse.ok) {
                const urlsData = await urlsResponse.json();
                setUserUrls(urlsData.urls || []);

                // Show success message
                setError(
                  "Your previously created URLs have been synced to your account!"
                );
                setTimeout(() => setError(null), 5000);
              }
            } else {
              const data = await response.json();
              throw new Error(data.error || "Failed to sync URLs");
            }
          }
        } catch (error) {
          console.error("Error syncing URLs:", error);
          setError(
            error instanceof Error ? error.message : "Failed to sync saved URLs"
          );
        } finally {
          setLoading(false);
        }
      }
    };

    syncLocalStorageUrls();
  }, [user]);
  
  return (
    <div className="min-h-screen text-black backgroundy bg-black/95">
      <DashboardNav
        isPanelOpen={isPanelOpen}
        openPanel={openPanel}
        closePanel={closePanel}
      />
      <div style={{paddingTop:"100px"}} className="container mt-12 md:mt-4 pt-24 mx-auto px-4 py-10 flex flex-col md:flex-col items-center gap-8">
        {/* Left Column - User Info */}
        <div className="md:w-1/3">
          <DashboardWelcome userName={user?.name} />
          
          <DashboardStats 
            totalUrls={userUrls.length}
            totalClicks={userUrls.reduce((total, url) => total + (url.totalClicks || 0), 0)}
            isLoading={isLoadingData}
          />
        </div>

        {/* Right Column - URL Shortener Form */}
        <div className="md:w-1/3">
          <UrlShortenerDashboardForm
            url={url}
            setUrl={setUrl}
            customId={customId}
            setCustomId={setCustomId}
            expiresIn={expiresIn}
            setExpiresIn={setExpiresIn}
            loading={loading}
            showCustomOptions={showCustomOptions}
            setShowCustomOptions={setShowCustomOptions}
            onSubmit={handleSubmit}
            error={error}
          />

          <div className="mt-8">
            {shortenedUrl && (
              <DashboardUrlResult
                shortenedUrl={shortenedUrl}
                copySuccess={copySuccess}
                loading={loading}
                showAllowedReferral={showAllowedReferral}
                onShare={handleShare}
                onCopy={handleCopy}
                onQrCode={() => handleQrCodeClick("svg")}
                onSuspend={() => {
                  const shortId = shortenedUrl.split("/").pop();
                  if (shortId) {
                    const urlObj = userUrls.find(u => u.shortId === shortId);
                    const isSuspended = urlObj?.isSuspended || false;
                    handleSuspendClick(shortId, shortenedUrl, isSuspended);
                  }
                }}
                onAllowReferrals={(shortId) => handleReferralClick(shortId)}
                onReset={() => {
                  setUrl("");
                  setCustomId("");
                  setExpiresIn(undefined);
                  setShortenedUrl(null);
                  setError(null);
                  setShowCustomOptions(false);
                }}
              />
            )}
          </div>

          {/* Render QR Code Modal */}
          {shortenedUrl && <QrCodeModal />}
          {showSuspendModal && urlToSuspend && (
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
    />
  )}
        </div>
      </div>
      {/* Slide Panel */}
      <SlidePanel isOpen={isPanelOpen} onClose={closePanel}>
        {panelContent}
      </SlidePanel>
      
    </div>
  );
}
