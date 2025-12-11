// src/components/ui/loading-overlay.jsx
import React from 'react';
import { Loader2 } from 'lucide-react';
import { COLORS } from '../../configs/CONST';

export const LoadingOverlay = ({
  isLoading,
  message = 'Loading...',
  type = 'fullscreen', // 'fullscreen' | 'inline' | 'button'
}) => {
  if (!isLoading) return null;

  const isDarkMode = document.documentElement.classList.contains('dark');

  const overlayStyles = {
    fullscreen: {
      position: 'fixed',
      inset: '0',
      zIndex: 50,
      backgroundColor: isDarkMode
        ? 'rgba(17, 24, 39, 0.9)' // dark background with 90% opacity
        : 'rgba(255, 255, 255, 0.9)', // white background with 90% opacity
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inline: {
      position: 'absolute',
      inset: '0',
      backgroundColor: isDarkMode
        ? 'rgba(31, 41, 55, 0.8)' // gray-800 with 80% opacity
        : 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.5rem',
      zIndex: 10,
    },
    button: {
      position: 'absolute',
      inset: '0',
      backgroundColor: isDarkMode
        ? 'rgba(31, 41, 55, 0.8)'
        : 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.375rem',
      zIndex: 10,
    },
  };

  const spinnerStyle = {
    color: COLORS.info,
    width: '2rem',
    height: '2rem',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginBottom: '0.5rem',
  };

  const messageStyle = {
    color: isDarkMode ? COLORS.text.white : COLORS.text.secondary,
    fontSize: '0.875rem',
    textAlign: 'center',
  };

  return (
    <div style={overlayStyles[type]}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 className="animate-spin" style={spinnerStyle} />
        <p style={messageStyle}>{message}</p>
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
