// components/ui/ResponsiveTabs.jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ResponsiveTabs = ({
  tabs,
  activeTab,
  onTabChange,
  isDarkMode,
  colors,
  variant = 'default', // 'default' | 'compact' | 'scrollable'
}) => {
  const containerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (containerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = containerRef.current;
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    containerRef.current?.addEventListener('scroll', checkScroll);

    return () => {
      window.removeEventListener('resize', checkScroll);
      containerRef.current?.removeEventListener('scroll', checkScroll);
    };
  }, [tabs]);

  const scroll = direction => {
    if (containerRef.current) {
      const scrollAmount = 200;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return 'px-3 py-2 text-sm';
      case 'scrollable':
        return 'px-3 py-2 text-sm whitespace-nowrap';
      default:
        return 'px-4 py-2.5 text-sm sm:text-base';
    }
  };

  return (
    <div className="relative">
      {/* Scroll Arrows for Desktop */}
      {variant === 'scrollable' && !isMobile && (
        <>
          {showLeftArrow && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gradient-to-r from-white to-transparent dark:from-gray-800 rounded-r-lg"
              style={{
                color: isDarkMode ? colors.text.white : colors.text.primary,
              }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-gradient-to-l from-white to-transparent dark:from-gray-800 rounded-l-lg"
              style={{
                color: isDarkMode ? colors.text.white : colors.text.primary,
              }}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </>
      )}

      {/* Mobile Dropdown for many tabs */}
      {isMobile && tabs.length > 3 && variant !== 'scrollable' ? (
        <select
          value={activeTab}
          onChange={e => onTabChange(e.target.value)}
          className="w-full p-3 rounded-lg border text-sm"
          style={{
            backgroundColor: isDarkMode
              ? colors.surface.dark
              : colors.surface.light,
            borderColor: isDarkMode ? colors.border.dark : colors.border.light,
            color: isDarkMode ? colors.text.white : colors.text.primary,
          }}
        >
          {tabs.map(tab => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
            </option>
          ))}
        </select>
      ) : (
        <div
          ref={containerRef}
          className={`flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide ${
            variant === 'scrollable' ? 'scroll-smooth' : ''
          }`}
        >
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-lg transition-all font-medium flex-shrink-0 ${getVariantClasses()}`}
                style={{
                  backgroundColor: isActive
                    ? colors.primary
                    : isDarkMode
                      ? colors.surface.darkHover
                      : colors.surface.lightHover,
                  color: isActive
                    ? colors.text.white
                    : isDarkMode
                      ? colors.text.light
                      : colors.text.secondary,
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-white/20' : 'bg-black/10 dark:bg-white/10'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResponsiveTabs;
