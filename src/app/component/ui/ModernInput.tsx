import React from 'react';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
}

export const ModernInput: React.FC<ModernInputProps> = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className="w-full space-y-2">
      {label && <label className="block text-sm font-medium text-gray-400 ml-1">{label}</label>}
      <input 
        className={`w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all duration-200 text-white placeholder:text-gray-500 ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
};
