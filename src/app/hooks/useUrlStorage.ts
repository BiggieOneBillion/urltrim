"use client";

// Function to save/retrieve URLs from localStorage
export const useUrlStorage = () => {
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
  const clearSavedUrls = (urlId: string | null = null) => {
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
export const syncUrlsWithDatabase = async (userId: string | null) => {
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
