import { useState, useEffect } from 'react';

const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;
  const isLargeDesktop = windowSize.width >= 1280;

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
  };
};

export default useResponsive;
