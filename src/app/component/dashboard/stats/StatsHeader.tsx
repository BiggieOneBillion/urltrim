"use client";

import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface StatsHeaderProps {
  onBack: () => void;
}

export const StatsHeader = ({ onBack }: StatsHeaderProps) => {
  return (
    <div style={{ marginBottom: '32px', marginTop: '50px' }}>
      <button 
        onClick={onBack}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          color: '#4b5563', 
          background: 'none', 
          border: 'none', 
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '16px',
          padding: 0
        }}
        className="hover:text-blue-600 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Dashboard
      </button>
      
      <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', letterSpacing: '-0.025em' }}>
        Detailed Analytics
      </h1>
      <p style={{ color: '#6b7280', fontSize: '16px', marginTop: '4px' }}>
        Deep dive into your link performance and audience data.
      </p>
    </div>
  );
};
