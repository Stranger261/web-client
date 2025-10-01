import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

const Pagination = ({ page, maxPage, onPageChange }) => {
  const maxVisible = 3; // show only 3 pages

  // Compute sliding window
  let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
  let endPage = startPage + maxVisible - 1;

  if (endPage > maxPage) {
    endPage = maxPage;
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      {/* Jump back 10 */}
      <button
        onClick={() => onPageChange(Math.max(1, page - 10))}
        disabled={page <= 10}
        className={`flex items-center px-2 py-1.5 rounded-xl border shadow-sm text-sm transition 
          ${
            page <= 10
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'hover:bg-gray-200 bg-white'
          }
        `}
      >
        <ChevronsLeft size={16} />
      </button>

      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border shadow-sm text-sm transition 
          ${
            page === 1
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'hover:bg-gray-200 bg-white'
          }
        `}
      >
        <ChevronLeft size={16} /> Prev
      </button>

      {/* Page numbers */}
      <div className="flex gap-1">
        {pages.map(p => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1.5 rounded-lg text-sm transition 
              ${
                page === p
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === maxPage}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-xl border shadow-sm text-sm transition 
          ${
            page === maxPage
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'hover:bg-gray-200 bg-white'
          }
        `}
      >
        Next <ChevronRight size={16} />
      </button>

      {/* Jump forward 10 */}
      <button
        onClick={() => onPageChange(Math.min(maxPage, page + 10))}
        disabled={page + 10 > maxPage}
        className={`flex items-center px-2 py-1.5 rounded-xl border shadow-sm text-sm transition 
          ${
            page + 10 > maxPage
              ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
              : 'hover:bg-gray-200 bg-white'
          }
        `}
      >
        <ChevronsRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
