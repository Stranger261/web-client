import { useState, useMemo } from 'react';

const usePatientFilters = (userRole = 'receptionist') => {
  // Base filters for all roles
  const baseFilters = {
    searchQuery: '',
    status: '',
    gender: '',
  };

  // Role-specific additional filters
  const roleSpecificFilters = useMemo(() => {
    switch (userRole) {
      case 'receptionist':
      case 'admin':
        return {
          hasFace: '',
        };
      case 'doctor':
      case 'nurse':
        return {
          hasUpcomingAppointment: '',
          hasRecentRecord: '',
        };
      default:
        return {};
    }
  }, [userRole]);

  const [filters, setFilters] = useState({
    ...baseFilters,
    ...roleSpecificFilters,
  });

  const [showFilters, setShowFilters] = useState(false);

  // Count active filters (exclude empty values)
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== '' && v !== 'all').length;
  }, [filters]);

  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      ...baseFilters,
      ...roleSpecificFilters,
    });
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  return {
    filters,
    showFilters,
    activeFiltersCount,
    userRole,
    handleFilterChange,
    handleClearFilters,
    setShowFilters,
    toggleFilters,
  };
};

export default usePatientFilters;
