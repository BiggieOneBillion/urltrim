// components/ui/LoadingState.tsx
import React from 'react';
import { Spinner } from './Spinner';

interface LoadingStateProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  loadingText = 'Loading...',
  children
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <Spinner size="large" />
        <p className="mt-4 text-gray-600">{loadingText}</p>
      </div>
    );
  }

  return <>{children}</>;
};
