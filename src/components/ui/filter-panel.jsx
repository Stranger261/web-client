import { Search, X, Calendar } from 'lucide-react';
import { Select } from './select';

// Reusable Filter Component
export const FilterPanel = ({
  filters,
  onFilterChange,
  onClearFilters,
  filterConfig,
  showFilters,
  onToggleFilters,
  searchPlaceholder = 'Search...',
  title = 'Filter Items',
  pageOnChangeFilter,
}) => {
  const activeFiltersCount = Object.values(filters).filter(
    v => v !== '',
  ).length;

  const handleFilterChange = e => {
    const { name, value } = e.target;
    !!pageOnChangeFilter && pageOnChangeFilter(1);
    console.log(name, value);
    onFilterChange({ ...filters, [name]: value });
  };

  const handleClearFilters = () => {
    const clearedFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = '';
      return acc;
    }, {});
    onClearFilters(clearedFilters);
  };

  if (!showFilters) return null;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Search className="text-blue-600" size={18} />
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
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
      {filterConfig.some(f => f.type === 'search') && (
        <div className="mb-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              name="search"
              value={filters.search || ''}
              onChange={handleFilterChange}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>
      )}

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        {/* DYNAMIC FILTER GRID */}
        {filterConfig.map(field => {
          if (field.type === 'search') return null;

          if (field.type === 'select') {
            return (
              <Select
                key={field.name}
                label={field.label}
                name={field.name}
                value={filters[field.name] || ''}
                onChange={handleFilterChange}
                options={field.options}
                loading={field.loading}
                disabled={field.disabled}
              />
            );
          }

          if (field.type === 'date') {
            return (
              <div key={field.name} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {field.label}
                </label>
                <input
                  type="date"
                  name={field.name}
                  value={filters[field.name] || ''}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                />
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Clear Button */}
      <div className="mt-4 flex justify-end">
        <button
          onClick={handleClearFilters}
          disabled={activeFiltersCount === 0}
          className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <X size={16} className="mr-1" />
          Clear All Filters
        </button>
      </div>

      {/* Active Filters Pills */}
      {activeFiltersCount > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Active Filters:
          </span>
          {Object.entries(filters).map(([key, value]) => {
            if (!value || key === 'search') return null;
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800"
              >
                {key.replace(/_/g, ' ')}: {value}
                <button
                  onClick={() =>
                    handleFilterChange({
                      target: { name: key, value: '' },
                    })
                  }
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
  );
};
