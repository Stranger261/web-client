import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { COLORS } from '../../configs/CONST';
import { Button } from './button';

const Pagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  className = '',
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  console.log(currentPage);

  // Calculate item range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = window.innerWidth < 640 ? 3 : 5; // Fewer pages on mobile

    if (totalPages <= maxVisible) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      className={`flex flex-col items-center gap-3 px-2 sm:px-4 py-3 ${className}`}
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.dark
          : COLORS.surface.light,
        borderTop: `1px solid ${
          isDarkMode ? COLORS.border.dark : COLORS.border.light
        }`,
      }}
    >
      {/* Items info - Full width on mobile */}
      <div
        className="text-xs sm:text-sm text-center sm:text-left w-full sm:w-auto order-2 sm:order-1"
        style={{
          color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
        }}
      >
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls - Centered layout */}
      <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto order-1 sm:order-2">
        {/* Items per page selector */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
          <span
            className="text-xs sm:text-sm whitespace-nowrap"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Per page:
          </span>
          <select
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 text-xs sm:text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.input.backgroundDark
                : COLORS.input.background,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            {/* <option value={1}>1</option> */}
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Navigation buttons - Compact on mobile */}
        <div className="flex items-center gap-1">
          {/* First page button */}
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronsLeft}
            iconOnly
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
          />

          {/* Previous page button */}
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronLeft}
            iconOnly
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          />

          {/* Page numbers - Scrollable on very small screens */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
            {pageNumbers.map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="px-1 sm:px-2 text-xs sm:text-sm flex-shrink-0"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.secondary,
                    }}
                  >
                    ...
                  </span>
                );
              }

              const isActive = page === currentPage;

              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className="px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-lg transition-colors flex-shrink-0 min-w-[28px] sm:min-w-[32px]"
                  style={{
                    backgroundColor: isActive ? COLORS.info : 'transparent',
                    color: isActive
                      ? '#ffffff'
                      : isDarkMode
                      ? COLORS.text.white
                      : COLORS.text.primary,
                    fontWeight: isActive ? '600' : '400',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = isDarkMode
                        ? COLORS.surface.darkHover
                        : COLORS.surface.lightHover;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Next page button */}
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronRight}
            iconOnly
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          />

          {/* Last page button */}
          <Button
            variant="ghost"
            size="sm"
            icon={ChevronsRight}
            iconOnly
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
