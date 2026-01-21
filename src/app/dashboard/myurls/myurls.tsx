// app/dashboard/myurls.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { PauseCircle, PlayCircle } from "lucide-react";
import { SuspendUrlModal } from "@/app/component/ui/SuspendUrlModal";
import {
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


} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/context/authContext";
import { handleCopy, handleShare } from "@/app/utilityFunctions";
import { Spinner2, Alert } from "@/app/component/ui";
import { RenameUrlModal } from "@/app/component/ui/renameUrlModal";
import {EditOriginalName} from "@/app/component/ui/editOriginalName"
import { QRCodeSVG } from "qrcode.react"; // Make sure this package is installed
import { DeleteUrlModal } from "@/app/component/ui/DeleteUrlModal";

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

  const [url, setUrl] = useState("");
const [customId, setCustomId] = useState("");
const [expiresIn, setExpiresIn] = useState("");
const [shortenedUrl, setShortenedUrl] = useState("");
const [showCustomOptions, setShowCustomOptions] = useState(false);
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
  const router = useRouter();
  const { user } = useAuth();
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
      
      // Refresh user URLs after creating a new one
      setLoading(true);
      const urlsResponse = await fetch("/api/urls/user", {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
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
  
  useEffect(
    () => {
      const fetchUserUrls = async () => {
        try {
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
        }
      };

      if (user) {
        fetchUserUrls();
      } else if (!localStorage.getItem("token")) {
        router.push("/login");
      }
    },
    [user, router, refreshConst]
  );

  const truncateUrl = (url: string, maxLength = 40) => {
    return url.length > maxLength ? url.substring(0, maxLength) + "..." : url;
  };

  const handleRefresh = () => {
    setRefreshConst(refreshConst + 1);
    setLoading(true);
  };
const handleCreateFirstUrl = () => {

  router.push("/dashboard")
}
  const clearError = () => {
    setError(null);
  };

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

  // Handle delete button click
  const handleDeleteClick = (shortId: string, shortUrl: string) => {
    setUrlToDelete({
      id: shortId,
      url: shortUrl
    });
    setShowDeleteModal(true);
  };

  // Handle successful deletion
  const handleDeleteSuccess = () => {
    handleRefresh(); // Refresh the URL list
    setAlertMessage("URL deleted successfully");
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
 // Add this new handler function
  const handleSuspendClick = (shortId: string, shortUrl: string, isSuspended: boolean) => {
    setUrlToSuspend({
      id: shortId,
      url: shortUrl,
      isSuspended
    });
    setShowSuspendModal(true);
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
  };

  return (
    <div className="p-2 sm:p-4 montserrat h-full w-full flex flex-col absolute">
      {alertMessage &&(
        <Alert
          variant="warning"
          message={alertMessage}
          position="top-right"
          className="shadow-lg"
          onClose={clearError}
          autoClose={true}
        />)}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base sm:text-xl font-semibold">Your recent ShortUrls</h2>
        {showQrCode &&
          <button
            onClick={() => setShowQrCode(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>}
      </div>

      {loading
        ? <div className="flex justify-center items-center h-64">
            <Spinner2 color="black" />
          </div>
        : error
          ? <div className=" ">
              {error &&
                <Alert
                  variant="error"
                  message={error}
                  position="top-right"
                  className="shadow-lg"
                  onClose={clearError}
                  autoClose={true}
                />}
              <span
                onClick={() => handleRefresh()}
                className="bg-gray-200 cursor-pointer text-gray-700 px-2 py-1 rounded-full text-sm"
              >
                Refresh
              </span>
            </div>
          : userUrls.length === 0
            ? <div style={{paddingBlock:"14px", gap:"14px"}} className="text-center py-10 flex flex-col">
                <div className="flex w-full justify-start cursor-pointer items-center mb-4">
                  <span
                   style={{padding:"7px 14px"}}
                    onClick={() => handleRefresh()}
                    className="bg-gray-200 text-gray-700 px-2 py-1 rounded-md justify-self-end text-sm"
                  >
                    Refresh
                  </span>
                </div>
                <p className="text-gray-500 mb-4">
                  You haven't created any URLs yet!!
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col items-center gap-1">
                <label htmlFor="url" className="text-lg font-medium flex items-center gap-2">
                  <span className="md:text-center text-black/80 text-base">Shorten your long URL :</span>
                </label>
                <input 
                  type="url" 
                  id="url" 
                  value={url} 
                  onChange={e => setUrl(e.target.value)} 
                  placeholder="Enter long link here" 
                  className="w-full md:w-1/2 py-3 border border-gray-300 rounded-md mt-2 text-lg text-black" 
                  required 
                  style={{padding:"5px"}}
                />
              </div>

              <div style={{marginBlock:"10px"}} className="flex items-center justify-center">
                <button 
                  type="button" 
                  onClick={() => setShowCustomOptions(!showCustomOptions)} 
                  className="flex items-center gap-2 text-base text-black/60 font-medium"
                >
                  <span className="">
                    <Wand size={16}/>
                  </span>
                    Customise Your Url
                 </button>
              </div>
              <div className="flex items-center justify-center">
              <button 
              style={{padding:"5px 15px"}}
                type="submit" 
                disabled={loading} 
                className="w-fully bg-black hover:bg-black/80 cursor-pointer text-white font-bold p-3 rounded-md transition text-lg flex items-center justify-center rock-salt-regular"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-0" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-100" fill="black" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Shortening...
                  </div>
                ) : (
                  "Shorten URL"
                )}
              </button>
              </div>
                </form>
              </div>
            : <div className="flex-1 flex flex-col min-h-0 max-h-full">
                <div style={{margin:"1rem 0rem"}} className="flex w-full cursor-pointer justify-start items-center mb-4">
                  <span
                    style={{padding: "4px 8px"}}
                    onClick={() => handleRefresh()}
                    className="bg-gray-200 text-gray-700 flex items-center gap-2 px-2 py-1 rounded-md text-sm"
                  >
                   <RefreshCw size={16}/> Refresh List
                  </span>
                </div>
                <div className="overflow-y-scroll flex-1 pr-1 space-y-6 w-full mb-15">
                  {userUrls.map((url, index) =>
                    <div
                      style={{borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "1rem"}}
                      key={index}
                      className="border-b border-gray-200 pb-6 last:border-b-0 w-full"
                    >
                      <div className="flex flex-col sm:flex-row items-start gap-4">
                        <div className="bg-blue-100 text-blue-800 p-2 rounded-md w-10 h-10 flex items-center justify-center">
                          <img
                            src={getFaviconUrl(url.originalUrl)}
                            alt="Website favicon"
                            width={16}
                            height={16}
                            className="w-4 h-4"
                            onError={e => {
                              // Fallback to Google's favicon service if DuckDuckGo fails
                              const googleUrl = `https://www.google.com/s2/favicons?domain=${new URL(
                                url.originalUrl
                              ).hostname}&sz=32`;
                              e.currentTarget.src = googleUrl;

                              // If Google's service also fails, fallback to the default favicon
                              e.currentTarget.onerror = () => {
                                e.currentTarget.src = "/default-favicon.png";
                              };
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <div style={{paddingBottom: ".5rem", marginBottom: ".5rem", gap: ".2rem"}} className="flex flex-col">
                            <a
                              href={url.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline font-medium"
                            >
                              {url.shortUrl}
                            </a>
                            <p className="text-gray-500 text-sm truncate">
                              {truncateUrl(url.originalUrl)}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                              <span>
                                {url.totalClicks || 0} clicks
                              </span>
                              <span>•</span>
                              <span>
                                {url.createdAt
                                  ? formatTimeAgo(url.createdAt)
                                  : "recently"}
                              </span>
                            </div>
                          </div>

                          <div style={{gap: ".5rem"}} className="flex flex-wrap mt-3 gap-1">
                            
                            <button
                              style={{padding:"2px 8px"}}
                              onClick={() => handleEditOriginalUrlClick(url.originalUrl)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              Edit
                            </button>

                            <button
                              style={{padding:"2px 8px"}}
                              onClick={() => handleRenameClick(url.shortId)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              Rename
                            </button>

                            <button
                             style={{padding:"2px 8px"}}
                              onClick={() => handleUrlQrCode(url.shortUrl)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              QR
                            </button>
                            <button
                             style={{padding:"2px 8px"}}
                              onClick={() => handleUrlShare(url.shortUrl)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              Share
                            </button>
                            <button
                             style={{padding:"2px 8px"}}
                              onClick={() => handleUrlCopy(url.shortUrl)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              {copySuccess === url.shortUrl
                                ? "Copied!"
                                : "Copy"}
                            </button>
                            <button
                             style={{padding:"2px 8px"}}
                              onClick={() =>
                                handleDeleteClick(url.shortId, url.shortUrl)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button
                             style={{padding:"2px 8px"}}
                              onClick={() => handleSuspendClick(url.shortId, url.shortUrl, url.isSuspended || false)}
                              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
                            >
                            {url.isSuspended ? (
                              <div style={{gap:"4px"}} className="flex items-center">
                                <PlayCircle size={18} className="mr-1" />
                                <span>Activate</span>
                              </div>
                            ) : (
                              <div style={{gap:"4px"}} className="flex items-center">
                                <PauseCircle size={18} className="mr-1" />
                                <span>Suspend</span>
                              </div>
                            )}
                          </button>
                          </div>
                          <div style={{marginTop:"1rem"}}>
                            <Link
                              href = {`/dashboard/detailed-stats/${url.shortId}`}
                              className="text-blue-600 mt-3 hover:underline"
                            >
                              Get Full Detailed Stats
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>}

      {showQrCode &&
        selectedUrl &&
        <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50">
          <div style={{paddingInline:"10px", paddingBlock:"10px"}} className="bg-white rounded-lg p-6 max-w-md w-full">
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
                style={{padding:"2px 8px"}}
                onClick={() => handleQrCodeClick("svg")}
                className={`p-2 rounded ${qrCodeSize === "svg"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"}`}
              >
                SVG
              </button>
              <button
                style={{padding:"2px 8px"}}
                onClick={() => handleQrCodeClick("png")}
                className={`p-2 rounded ${qrCodeSize === "png"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"}`}
              >
                PNG
              </button>
              <button
                style={{padding:"2px 8px"}}
                onClick={() => handleQrCodeClick("png1200")}
                className={`p-2 rounded ${qrCodeSize === "png1200"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200"}`}
              >
                PNG 1200
              </button>
            </div>

            <div style={{marginTop:"10px"}} className="flex justify-between">
              <button
                style={{padding:"2px 8px"}}
                onClick={downloadQrCode}
                className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
              >
                Download
              </button>
              <button
                style={{padding:"2px 8px"}}
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
  );
}
