// app/utilityFunctions.js
export const handleCopy = async (shortenedUrl: string) => {
  if (!shortenedUrl) return false;

  try {
    // Try the Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shortenedUrl);
      return true;
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
        return true;
      } else {
        throw new Error("Copy failed");
      }
    }
  } catch (err) {
    console.error("Copy failed:", err);
    return false;
  }
};

export const handleShare = async (shortenedUrl: string) => {
  if (!shortenedUrl) return false;

  // Check if Web Share API is available
  if (navigator.share) {
    try {
      await navigator.share({
        title: "Shortened URL",
        text: "Check out this shortened URL!",
        url: shortenedUrl
      });
      return true;
    } catch (error) {
      console.error("Error sharing:", error);
      // Only show error if it's not an AbortError (user canceled)
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        return false;
      }
      return null; // User canceled
    }
  } else {
    // Return false for browsers that don't support Web Share API
    return false;
  }
};

// QR Code Modal component is removed since it should be part of the component that uses it
// This is because it needs access to component state and props