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

  // Calculate item range
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Max page numbers to show

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
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 ${className}`}
      style={{
        backgroundColor: isDarkMode
          ? COLORS.surface.dark
          : COLORS.surface.light,
        borderTop: `1px solid ${
          isDarkMode ? COLORS.border.dark : COLORS.border.light
        }`,
      }}
    >
      {/* Items info */}
      <div
        className="text-sm"
        style={{
          color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
        }}
      >
        Showing <span className="font-medium">{startItem}</span> to{' '}
        <span className="font-medium">{endItem}</span> of{' '}
        <span className="font-medium">{totalItems}</span> results
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Items per page selector */}
        <div className="flex items-center gap-2 mr-4">
          <span
            className="text-sm whitespace-nowrap"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Per page:
          </span>
          <select
            value={itemsPerPage}
            onChange={e => onItemsPerPageChange(Number(e.target.value))}
            className="px-2 py-1 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* First page button */}
        <Button
          variant="ghost"
          size="sm"
          icon={ChevronsLeft}
          iconOnly
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage, 'first')}
        />

        {/* Previous page button */}
        <Button
          variant="ghost"
          size="sm"
          icon={ChevronLeft}
          iconOnly
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage, 'prev')}
        />

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm"
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
                className="px-3 py-1 text-sm rounded-lg transition-colors"
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
          onClick={() => onPageChange(currentPage, 'next')}
        />

        {/* Last page button */}
        <Button
          variant="ghost"
          size="sm"
          icon={ChevronsRight}
          iconOnly
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage, 'last')}
        />
      </div>
    </div>
  );
};

export default Pagination;
