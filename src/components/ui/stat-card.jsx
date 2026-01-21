import { TrendingUp, TrendingDown, Info, Minus } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

const StatsCard = ({
  title,
  value,
  change,
  icon,
  color = 'blue',
  tooltip,
  loading = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState('top');
  const tooltipRef = useRef(null);
  const cardRef = useRef(null);
  const infoIconRef = useRef(null);

  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green:
      'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    purple:
      'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    orange:
      'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    accent:
      'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    info: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    success:
      'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    warning:
      'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
    danger: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
  };

  const changeColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-gray-600 dark:text-gray-400',
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4 text-green-500" />,
    down: <TrendingDown className="h-4 w-4 text-red-500" />,
    neutral: (
      <Minus className="mt-1 text-muted-foreground h-4 w-4 text-gray-500" />
    ),
  };

  // Determine trend type from change string
  const getTrend = (changeStr, valueStr = '') => {
    if (!changeStr) return 'neutral';
    const str = changeStr.toLowerCase();
    const value = valueStr.toLowerCase();

    // Extract numbers
    const changeNumbers = str.match(/[+-]?\d+/g);
    const firstChangeNumber = changeNumbers
      ? parseInt(changeNumbers[0], 10)
      : null;

    // Extract value number
    const valueNumbers = value.match(/\d+/g);
    const firstValueNumber = valueNumbers
      ? parseInt(valueNumbers[0], 10)
      : null;

    // Special cases based on stat type
    if (
      str.includes('0 new today') ||
      str.includes('0 pending') ||
      str.includes('0 completed')
    ) {
      return 'neutral';
    }

    // Check for explicit signs
    if (str.startsWith('+') && firstChangeNumber > 0) {
      return 'up';
    } else if (str.startsWith('-') && firstChangeNumber > 0) {
      return 'down';
    }

    // Check for keywords in context
    if (str.includes('new today') && firstChangeNumber > 0) {
      return 'up';
    } else if (str.includes('new today') && firstChangeNumber === 0) {
      return 'neutral';
    }

    if (str.includes('pending') && firstChangeNumber > 0) {
      return 'down';
    } else if (str.includes('pending') && firstChangeNumber === 0) {
      return 'neutral';
    }

    if (str.includes('completed') && firstChangeNumber > 0) {
      return 'up';
    } else if (str.includes('completed') && firstChangeNumber === 0) {
      return 'neutral';
    }

    // Quality indicators
    if (str.includes('excellent') || str.includes('good')) {
      return 'up';
    } else if (str.includes('needs attention')) {
      return 'down';
    }

    return 'neutral';
  };

  const trend =
    typeof change === 'string'
      ? getTrend(change, value)
      : change > 0
      ? 'up'
      : change < 0
      ? 'down'
      : 'neutral';

  // Calculate tooltip position based on viewport
  const calculateTooltipPosition = () => {
    if (!infoIconRef.current) return 'top';

    const rect = infoIconRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;

    // If near the right edge, show tooltip on left
    if (rect.right + 256 > viewportWidth) {
      return 'left';
    }
    // If near the left edge, show tooltip on right
    if (rect.left - 256 < 0) {
      return 'right';
    }
    // Default to top
    return 'top';
  };

  const handleTooltipToggle = () => {
    if (!showTooltip) {
      const position = calculateTooltipPosition();
      setTooltipPosition(position);
    }
    setShowTooltip(!showTooltip);
  };

  // Handle click outside to close tooltip
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target) &&
        cardRef.current &&
        !cardRef.current.contains(event.target)
      ) {
        setShowTooltip(false);
      }
    };

    if (showTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
      // Also close on escape key
      const handleEscape = e => {
        if (e.key === 'Escape') setShowTooltip(false);
      };
      document.addEventListener('keydown', handleEscape);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [showTooltip]);

  // Position classes for tooltip
  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-t-gray-900 dark:border-t-gray-700 border-l-transparent border-r-transparent border-b-transparent',
    bottom:
      'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 border-b-gray-900 dark:border-b-gray-700 border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-l-gray-900 dark:border-l-gray-700 border-t-transparent border-r-transparent border-b-transparent',
    right:
      'right-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-r-gray-900 dark:border-r-gray-700 border-t-transparent border-l-transparent border-b-transparent',
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
          <div className="p-3 rounded-lg bg-gray-200 dark:bg-gray-700">
            <div className="h-6 w-6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow relative"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            {tooltip && (
              <div className="relative inline-block">
                <button
                  ref={infoIconRef}
                  type="button"
                  className="outline-none focus:outline-none flex-shrink-0"
                  onMouseEnter={() => {
                    const position = calculateTooltipPosition();
                    setTooltipPosition(position);
                    setShowTooltip(true);
                  }}
                  onMouseLeave={() => setShowTooltip(false)}
                  onClick={handleTooltipToggle}
                  aria-label={`More information about ${title}`}
                >
                  <Info className="h-3.5 w-3.5 text-gray-400 cursor-help hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex-shrink-0" />
                </button>

                {showTooltip && (
                  <div
                    ref={tooltipRef}
                    className={`absolute z-50 ${positionClasses[tooltipPosition]} pointer-events-none`}
                    style={{
                      maxWidth: 'min(calc(100vw - 2rem), 20rem)',
                      minWidth: '12rem',
                    }}
                  >
                    <div className="relative">
                      {/* Arrow */}
                      <div
                        className={`absolute w-2 h-2 border-2 ${arrowClasses[tooltipPosition]}`}
                      />
                      {/* Tooltip content */}
                      <div className="bg-gray-900 dark:bg-gray-700 text-white dark:text-gray-100 text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-pre-line break-words overflow-hidden">
                        {tooltip}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
          {change && (
            <div className="flex items-center mt-3 gap-1">
              {trendIcons[trend]}
              <span
                className={`text-sm font-medium ml-1 ${changeColors[trend]}`}
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${
            colors[color] || colors.blue
          } ml-4 flex-shrink-0`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
