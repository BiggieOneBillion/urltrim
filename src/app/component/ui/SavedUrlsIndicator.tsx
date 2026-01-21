"use client";

import { useState, useEffect } from "react";

interface SavedUrlsIndicatorProps {
  isLoggedIn: boolean;
  shortenedUrl: string | null;
  navigateTo: (path: string) => void;
}

export const SavedUrlsIndicator = ({
  isLoggedIn,
  shortenedUrl,
  navigateTo,
}: SavedUrlsIndicatorProps) => {
  const [hasSavedUrls, setHasSavedUrls] = useState(false);
  
  useEffect(() => {
    const savedUrls = JSON.parse(localStorage.getItem('savedUrls') || '[]');
    setHasSavedUrls(savedUrls.length > 0);
  }, [shortenedUrl]);
  
  if (!hasSavedUrls || isLoggedIn) return null;
  
  return (
    <div style={{marginTop:"20px"}} className="mt-4 p-4 text-red-400 animate-fadeIn">
      <p className="text-sm flex items-center gap-1 mt-4">
        <span className="font-bold">Note:</span> You have shortened URLs saved locally. 
        <button 
          onClick={() => navigateTo('login')} 
          className="text-primary cursor-pointer hover:text-primary-hover font-semibold underline"
        >
          Log in
        </button> to save them to your account.
      </p>
    </div>
  );
};
