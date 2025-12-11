// app/suspended/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const SuspendedPage = () => {
  const searchParams = useSearchParams();
  const shortId = searchParams.get('id');
  const [urlInfo, setUrlInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUrlInfo = async () => {
      if (!shortId) return;
      
      try {
        const response = await fetch(`/api/urls/info/${shortId}`);
        if (response.ok) {
          const data = await response.json();
          setUrlInfo(data);
        }
      } catch (error) {
        console.error('Error fetching URL info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUrlInfo();
  }, [shortId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-5">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-16 w-16 text-red-500 mx-auto"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-3">URL Suspended</h1>
        
        <p className="text-gray-600 mb-6">
          This link has been suspended by its owner and is currently unavailable.
        </p>
        
        {loading ? (
          <p className="text-sm text-gray-500">Loading URL information...</p>
        ) : urlInfo ? (
          <div className="text-left bg-gray-50 p-4 rounded mb-6">
            <p className="text-sm text-gray-500 mb-1">
              <span className="font-semibold">Owner:</span> {urlInfo.ownerName || 'Unknown'}
            </p>
            {urlInfo.ownerContact && (
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Contact:</span> {urlInfo.ownerContact}
              </p>
            )}
          </div>
        ) : null}
        
        <div className="mt-4">
          <Link 
            href="/"
            className="inline-block bg-black text-white px-5 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuspendedPage;