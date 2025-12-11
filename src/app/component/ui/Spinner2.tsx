// components/ui/Spinner2.tsx
import React from 'react';

interface Spinner2Props {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  className?: string;
}

export const Spinner2: React.FC<Spinner2Props> = ({
    size = 'medium',
    color = 'border-black-600',
    className = ''
}) => {
    const sizeClasses = {
        small: 'w-4 h-4',
        medium: 'w-8 h-8',
        large: 'w-12 h-12'
    };

    return (
        <div className={`inline-block ${className}`}>
        <div className="flex justify-center items-center h-64">
          <div className={`animate-spin rounded-full ${sizeClasses[size]} border-t-2 border-b-2 border-${color}`} />
        </div>
        </div>
    );
};