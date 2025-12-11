// app/components/AllowReferralsToggle.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface AllowReferralsToggleProps {
  urlId: string;
  initialValue: boolean;
  onToggleSuccess: (newValue: boolean) => void;
}

const AllowReferralsToggle: React.FC<AllowReferralsToggleProps> = ({
  urlId,
  initialValue,
  onToggleSuccess
}) => {
  const [allowReferrals, setAllowReferrals] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleToggle = async () => {
    setLoading(true);
    setError('');
    
    try {
      const newValue = !allowReferrals;
      
      const response = await axios.post('/api/url/allowReferrals', {
        urlId,
        allowReferrals: newValue
      });
      
      setAllowReferrals(newValue);
      onToggleSuccess(newValue);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to update setting');
      console.error('Error toggling referrals:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-medium text-blue-800">Allow Referrals</h3>
          <p className="text-sm text-blue-600 mt-1">
            {allowReferrals 
              ? "Users can create referral links for this URL"
              : "Users cannot create referral links for this URL"}
          </p>
          {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
        </div>
        
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={allowReferrals}
            onChange={handleToggle}
            disabled={loading}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>
  );
};

export default AllowReferralsToggle;