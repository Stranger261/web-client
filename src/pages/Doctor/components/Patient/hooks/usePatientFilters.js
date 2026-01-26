import { useState } from 'react';

const usePatientFilters = () => {
  const [filters, setFilters] = useState({
    searchQuery: '',
    status: '',
    gender: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== '',
  ).length;

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({ searchQuery: '', status: '', gender: '' });
  };

  return {
    filters,
    showFilters,
    activeFiltersCount,
    handleFilterChange,
    handleClearFilters,
    setShowFilters,
  };
};

export default usePatientFilters;
