"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";
import { useUrlStorage, syncUrlsWithDatabase } from "@/app/hooks/useUrlStorage";
import { ReferralAuthModal } from "@/app/component/ui/ReferralAuthModal";
import { Navigation } from "@/app/component/ui/Navigation";
import { CustomizationModal } from "@/app/component/ui/CustomizationModal";
import { QrCodeModal } from "@/app/component/ui/QrCodeModal";
import { SavedUrlsIndicator } from "@/app/component/ui/SavedUrlsIndicator";
import { UrlShortenerForm } from "@/app/component/ui/UrlShortenerForm";
import { ShortenedUrlResult } from "@/app/component/ui/ShortenedUrlResult";

export default function Home() {
  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [expiresIn, setExpiresIn] = useState<number | undefined>();
  const [shortenedUrl, setShortenedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [qrCodeSize, setQrCodeSize] = useState("svg"); // Options: "svg", "png", "png1200"
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  
  const router = useRouter();
  const { isLoggedIn, userId } = useAuth();
  const { saveUrlToLocalStorage } = useUrlStorage();

  // Check for saved URLs when user logs in
  useEffect(() => {
    if (isLoggedIn && userId) {
      syncUrlsWithDatabase(userId);
    }
  }, [isLoggedIn, userId]);

  // Show result modal when URL is shortened
  useEffect(() => {
    if (shortenedUrl) {
      setShowResultModal(true);
    }
  }, [shortenedUrl]);

  const navigateTo = (path: string) => {
    router.push(path);
  };

  const handleQrCodeClick = (size = "svg") => {
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

  const resetForm = () => {
    setUrl("");
    setCustomId("");
    setExpiresIn(undefined);
    setShortenedUrl(null);
    setError(null);
  };

  return (
    <div className="min-h-screen backgroundy flex flex-col justify-center items-center bg-black">
      <Navigation 
        isLoggedIn={isLoggedIn}
        setShowAuthModal={setShowAuthModal}
        navigateTo={navigateTo}
      />

      <div className="containery bg-red-900y mx-auto px-4 py-10 flex flex-col md:flex-col items-center gap-8 animate-fadeIn h-screeny">
        {/* Right Column - Features Info */}
        <div className="md:w-1/3">
          <div className="flex flex-col items-center gap-5">
            <h2 className="text-3xl md:text-4xl text-center md:w-xl font-bold font-mono text-text-primary leading-tight text-white/80">
              Beyond URL Shortening: <span className="gradient-texty">Track, Analyze, Convert</span>
            </h2>
            <div className="flex flex-col items-center">
              <p className="text-xl font-semibold text-text-secondaryy text-gray-300">
                Create cool URLs with URLTRIM
              </p>

              <p className="text-sm text-text-secondaryy text-gray-500 leading-relaxed md:w-xl text-center">
                Create compact links that do more than redirect. Get detailed
                click analytics, monitor referral performance, and boost your
                marketing campaigns with our powerful link management platform.
              </p>
            </div>

            <button 
              onClick={() => navigateTo("register")} 
              className="btn btn-primary w-full text-lg md:w-xl"
            >
              Create free Account
            </button>

            <div className="w-xl border border-t-white/30 relative">
              <p className="text-white/50 absolute top-[-13px] left-[50%] translate-x-[-50%] bg-black">OR</p>
            </div>
          </div>
        </div>

        {/* Left Column - URL Shortener Form */}
        <div className="">
          <UrlShortenerForm 
            url={url}
            setUrl={setUrl}
            handleSubmit={handleSubmit}
            loading={loading}
            error={error}
            setShowCustomModal={setShowCustomModal}
          />

          <SavedUrlsIndicator 
            isLoggedIn={isLoggedIn}
            shortenedUrl={shortenedUrl}
            navigateTo={navigateTo}
          />

          {/* Render Modals */}
          <CustomizationModal 
            isOpen={showCustomModal}
            onClose={() => setShowCustomModal(false)}
            url={url}
            setUrl={setUrl}
            customId={customId}
            setCustomId={setCustomId}
            expiresIn={expiresIn}
            setExpiresIn={setExpiresIn}
            handleSubmit={handleSubmit}
            loading={loading}
          />
          {shortenedUrl && (
            <>
              <QrCodeModal 
                isOpen={showQrCode}
                onClose={() => setShowQrCode(false)}
                shortenedUrl={shortenedUrl}
                qrCodeSize={qrCodeSize}
                setQrCodeSize={setQrCodeSize}
                downloadQrCode={downloadQrCode}
              />
              <ShortenedUrlResult 
                isOpen={showResultModal}
                onClose={() => setShowResultModal(false)}
                shortenedUrl={shortenedUrl}
                handleShare={handleShare}
                handleCopy={handleCopy}
                copySuccess={copySuccess}
                handleQrCodeClick={handleQrCodeClick}
                isLoggedIn={isLoggedIn}
                resetForm={resetForm}
              />
            </>
          )}
        </div>
      </div>

      <ReferralAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </div>
  );
}