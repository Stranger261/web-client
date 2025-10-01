export const formatDate = dateString => {
  // First, create a new Date object from the input string
  const date = new Date(dateString);

  // Then, call toLocaleDateString on the new Date object
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatTime = time => {
  if (!time) return '';

  // If already a Date object
  if (time instanceof Date) {
    return time.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  // If it's a string like "13:00"
  if (typeof time === 'string' && /^\d{2}:\d{2}$/.test(time)) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  return String(time); // fallback
};

export const formatDateForInput = dateString => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0]; // Returns yyyy-MM-dd format
};
