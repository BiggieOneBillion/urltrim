// app/components/CreateReferralModal.tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface CreateReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateReferralModal: React.FC<CreateReferralModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [shortUrl, setShortUrl] = useState('');
  const [customAlias, setCustomAlias] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
     
    try {
      const response = await fetch('/api/referrals/request', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body:JSON.stringify({
         shortUrl,
        customAlias: customAlias || undefined
      })})
      
      setMessage('Referral request submitted successfully! You will be notified when the owner takes action.');
      setShortUrl('');
      setCustomAlias('');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 3000);
    } catch (err: any) {
      setError(err.message|| err.message || 'Failed to submit referral request');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div style={{padding:"24px"}} className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black"
        >
          <X size={24} />
        </button>
        
        <h2 style={{paddingBottom:"20px"}} className="text-xl font-bold mb-6 text-center">
          Request Referral Link
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
            {message}
          </div>
        )}
        
        <form style={{gap:"20px"}} onSubmit={handleSubmit} className="flex flex-col">
          <div style={{gap:"5px"}} className='flex flex-col'>
            <label htmlFor="originalUrl" className="block text-sm font-medium text-gray-700 mb-1">
              URL to Create Referral For
            </label>
            <input
              style={{padding:"3px 10px"}}
              id="originalUrl"
              type="url"
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="https://example.com/long-url"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
            Enter the shortened URL you want to create a referral for
            </p>
          </div>
          
          <div style={{gap:"5px"}} className='flex flex-col'>
            <label htmlFor="customAlias" className="block text-sm font-medium text-gray-700 mb-1">
              Custom Alias (Optional)
            </label>
            <input
              style={{padding:"3px 10px"}}
              id="customAlias"
              type="text"
              value={customAlias}
              onChange={(e) => setCustomAlias(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md"
              placeholder="my-custom-alias"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for automatically generated alias
            </p>
          </div>
          
          <button
            style={{padding:"10px 10px"}}
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md font-medium hover:bg-gray-800 transition duration-200"
          >
            {loading ? 'Submitting...' : 'Request Referral'}
          </button>
        </form>
      </div>
    </div>
  );
};


