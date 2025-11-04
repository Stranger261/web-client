// src/components/ui/loading-overlay.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingOverlay = ({
  isLoading,
  message = 'Loading...',
  type = 'fullscreen', // 'fullscreen' | 'inline' | 'button'
}) => {
  if (!isLoading) return null;

  const overlayStyles = {
    fullscreen:
      'fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center',
    inline:
      'absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg z-10',
    button:
      'absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-md z-10',
  };

  return (
    <div className={overlayStyles[type]}>
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-gray-600 text-sm">{message}</p>
      </div>
    </div>
  );
};

// Hook for page transitions
export const usePageLoader = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  const startLoading = (message = 'Loading...') => {
    setIsLoading(true);
    return () => setIsLoading(false);
  };

  const stopLoading = () => {
    setIsLoading(false);
  };

  return {
    isLoading,
    startLoading,
    stopLoading,
    LoadingComponent: ({ message }) => (
      <LoadingOverlay
        isLoading={isLoading}
        message={message}
        type="fullscreen"
      />
    ),
  };
};
