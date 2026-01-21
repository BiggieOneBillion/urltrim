"use client";

import React from 'react';
import { Link, ExternalLink } from 'lucide-react';

interface UrlStats {
  shortId: string;
  originalUrl: string;
  isReferral?: boolean;
  isSuspended?: boolean;
  originalUrlId?: string;
  expiresAt: string | "No Expire";
}

interface UrlInfoCardProps {
  stats: UrlStats;
  truncateUrl: (url: string, maxLength?: number) => string;
}

export const UrlInfoCard = ({ stats, truncateUrl }: UrlInfoCardProps) => {
  const isExpired = stats.expiresAt !== "No Expire" && new Date(stats.expiresAt) < new Date();

  return (
    <div style={{ 
      backgroundColor: '#fff', 
      borderRadius: '16px', 
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '800', display: 'flex', alignItems: 'center', color: '#111827', margin: 0 }}>
              <Link className="mr-3 text-blue-600" size={24} /> 
              /{stats.shortId}
              
              {stats.isReferral ? (
                <span style={{ marginLeft: '12px', backgroundColor: '#e0f2fe', color: '#0369a1', fontSize: '12px', fontWeight: '600', padding: '2px 10px', borderRadius: '9999px' }}>
                  Referral Linked
                </span>
              ) : (
                <span style={{ marginLeft: '12px', backgroundColor: '#dcfce7', color: '#15803d', fontSize: '12px', fontWeight: '600', padding: '2px 10px', borderRadius: '9999px' }}>
                  Original
                </span>
              )}
            </h2>

            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span style={{ color: '#6b7280', fontSize: '14px' }}>Target:</span>
               <a href={stats.originalUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#4b5563', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }} className="hover:text-blue-600 hover:underline">
                 {truncateUrl(stats.originalUrl, 50)}
                 <ExternalLink size={14} />
               </a>
            </div>

            {stats.isReferral && stats.originalUrlId && (
              <p style={{ fontSize: '14px', color: '#2563eb', marginTop: '4px' }}>
                ↳ Redirects to another shortened link
              </p>
            )}
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Expires on
            </div>
            <div style={{ fontWeight: '600', color: isExpired ? '#dc2626' : '#111827' }}>
              {stats.expiresAt === "No Expire" ? (
                <span style={{ color: '#059669' }}>Never</span>
              ) : (
                new Date(stats.expiresAt).toLocaleDateString()
              )}
            </div>
            {isExpired && <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600', marginTop: '4px' }}>Expired</div>}
            {stats.isSuspended && (
              <div style={{ marginTop: '4px', display: 'inline-block', backgroundColor: '#fef2f2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700' }}>
                SUSPENDED
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
