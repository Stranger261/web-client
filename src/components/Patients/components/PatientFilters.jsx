import { Search, Filter, X } from 'lucide-react';
import { Button } from '../../ui/button';
import { Select } from '../../ui/select';
import { useState, useEffect, useRef } from 'react';

const PatientFilters = ({
  filters,
  showFilters,
  activeFiltersCount,
  onFilterChange,
  onClearFilters,
  onToggleFilters,
}) => {
  // Local state for search query to debounce
  const [localSearchQuery, setLocalSearchQuery] = useState(
    filters.searchQuery || '',
  );
  const searchTimeoutRef = useRef(null);

  // Update local state when filters prop changes (e.g., when clearing all filters)
  useEffect(() => {
    setLocalSearchQuery(filters.searchQuery || '');
  }, [filters.searchQuery]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearchChange = e => {
    const newValue = e.target.value;
    setLocalSearchQuery(newValue);

    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for 500ms
    searchTimeoutRef.current = setTimeout(() => {
      onFilterChange({ target: { name: 'searchQuery', value: newValue } });
    }, 500); // 500ms delay
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');

    // Clear timeout if any
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Immediately update the filter
    onFilterChange({ target: { name: 'searchQuery', value: '' } });
  };

  const handleClearFilters = () => {
    // Clear the local search query when clearing all filters
    setLocalSearchQuery('');

    // Clear any pending timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Call the original clear filters function
    onClearFilters();
  };

  return (
    <header className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg mb-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
        <div className="min-w-0 flex-shrink">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
            Patient List
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Filter and search through your patients
          </p>
        </div>

        <Button
          variant="outline"
          icon={Filter}
          onClick={onToggleFilters}
          className="w-full sm:w-auto"
        >
          <span className="hidden sm:inline">Filters</span>
          <span className="sm:hidden">Filter</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="text-blue-600" size={18} />
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                Filter Patients
              </h3>
            </div>
            <button
              onClick={onToggleFilters}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                name="searchQuery"
                value={localSearchQuery}
                onChange={handleSearchChange}
                placeholder="Search by name or MRN..."
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {localSearchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
                  type="button"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            {localSearchQuery !== filters.searchQuery && (
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 animate-pulse"></div>
                Typing... (Press Enter or wait)
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Select
              label="Status"
              name="status"
              value={filters.status}
              onChange={onFilterChange}
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'deceased', label: 'Deceased' },
              ]}
            />

            <Select
              label="Gender"
              name="gender"
              value={filters.gender}
              onChange={onFilterChange}
              options={[
                { value: '', label: 'All Genders' },
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'others', label: 'Others' },
              ]}
            />
          </div>

          {/* Clear Button */}
          <div className="mt-4 flex justify-end">
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={activeFiltersCount === 0}
            >
              <X size={16} className="mr-1" />
              Clear All Filters
            </Button>
          </div>

          {/* Active Filters Pills */}
          {activeFiltersCount > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                Active Filters:
              </span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null;
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800"
                  >
                    {key.replace('_', ' ')}: {value}
                    <button
                      onClick={() => {
                        if (key === 'searchQuery') {
                          handleClearSearch();
                        } else {
                          onFilterChange({ target: { name: key, value: '' } });
                        }
                      }}
                      className="hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-sm p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default PatientFilters;
