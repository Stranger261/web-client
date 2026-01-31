export const getDateRangeText = filters => {
  if (filters.startDate && filters.endDate) {
    return `${new Date(filters.startDate).toLocaleDateString()} - ${new Date(filters.endDate).toLocaleDateString()}`;
  } else if (filters.startDate) {
    return `From ${new Date(filters.startDate).toLocaleDateString()}`;
  } else if (filters.endDate) {
    return `Until ${new Date(filters.endDate).toLocaleDateString()}`;
  }
  return 'All dates';
};
