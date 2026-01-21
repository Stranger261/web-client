// components/ui/tooltip.jsx
import { useState } from 'react';

const Tooltip = ({ children, content, position = 'top', delay = 200 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const showTooltip = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hideTooltip = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-t-black dark:border-t-white border-l-transparent border-r-transparent border-b-transparent',
    bottom:
      'bottom-full left-1/2 transform -translate-x-1/2 translate-y-1/2 border-b-black dark:border-b-white border-l-transparent border-r-transparent border-t-transparent',
    left: 'left-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-l-black dark:border-l-white border-t-transparent border-r-transparent border-b-transparent',
    right:
      'right-full top-1/2 transform -translate-x-1/2 -translate-y-1/2 border-r-black dark:border-r-white border-t-transparent border-l-transparent border-b-transparent',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && content && (
        <div
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
        >
          <div
            className={`absolute w-2 h-2 ${arrowClasses[position]} border-2`}
          />
          <div className="bg-black dark:bg-gray-800 text-white dark:text-gray-200 text-xs font-medium px-3 py-2 rounded-lg shadow-lg whitespace-nowrap max-w-xs">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
