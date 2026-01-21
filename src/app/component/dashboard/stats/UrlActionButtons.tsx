"use client";

import React from 'react';
import { 
  FilePenLine, 
  FolderPen, 
  QrCode, 
  Share2, 
  Copy, 
  Trash2, 
  PlayCircle, 
  PauseCircle, 
  Clock,
  Check
} from 'lucide-react';

interface UrlStats {
  shortId: string;
  shortUrl: string;
  originalUrl: string;
  isSuspended?: boolean;
}

interface UrlActionButtonsProps {
  stats: UrlStats;
  copySuccess: string | null;
  onEditOriginal: () => void;
  onRename: () => void;
  onQrCode: () => void;
  onShare: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onSuspend: () => void;
  onExtend: () => void;
}

export const UrlActionButtons = ({
  stats,
  copySuccess,
  onEditOriginal,
  onRename,
  onQrCode,
  onShare,
  onCopy,
  onDelete,
  onSuspend,
  onExtend
}: UrlActionButtonsProps) => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
      <ActionButton onClick={onEditOriginal} title="Edit Original URL" icon={<FilePenLine size={18} />} />
      <ActionButton onClick={onRename} title="Rename Alias" icon={<FolderPen size={18} />} />
      <ActionButton onClick={onQrCode} title="QR Code" icon={<QrCode size={18} />} />
      <ActionButton onClick={onShare} title="Share" icon={<Share2 size={18} />} />
      
      <ActionButton 
        onClick={onCopy} 
        title="Copy" 
        icon={copySuccess === stats.shortUrl ? <Check size={18} className="text-green-600" /> : <Copy size={18} />} 
        active={copySuccess === stats.shortUrl}
      />
      
      <ActionButton onClick={onDelete} title="Delete" icon={<Trash2 size={18} />} dangerous />
      
      <ActionButton onClick={onSuspend} title={stats.isSuspended ? "Reactivate" : "Suspend"} icon={stats.isSuspended ? <PlayCircle size={18} /> : <PauseCircle size={18} />} />
      
      <ActionButton onClick={onExtend} title="Extend Expiry" icon={<Clock size={18} />} />
    </div>
  );
};

const ActionButton = ({ 
  onClick, 
  icon, 
  title, 
  dangerous = false, 
  active = false 
}: { 
  onClick: () => void; 
  icon: React.ReactNode; 
  title?: string;
  dangerous?: boolean;
  active?: boolean;
}) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      padding: '8px 12px',
      borderRadius: '8px',
      border: '1px solid',
      borderColor: active ? '#22c55e' : dangerous ? '#fee2e2' : '#f3f4f6', // green-500, red-100, gray-100
      backgroundColor: active ? '#ecfdf5' : dangerous ? '#fef2f2' : '#f9fafb', // green-50, red-50, gray-50
      color: active ? '#15803d' : dangerous ? '#dc2626' : '#374151', // green-700, red-600, gray-700
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.2s ease',
    }}
    onMouseOver={(e) => {
      e.currentTarget.style.backgroundColor = active ? '#dcfce7' : dangerous ? '#fee2e2' : '#f3f4f6';
    }}
    onMouseOut={(e) => {
      e.currentTarget.style.backgroundColor = active ? '#ecfdf5' : dangerous ? '#fef2f2' : '#f9fafb';
    }}
  >
    {icon}
  </button>
);
