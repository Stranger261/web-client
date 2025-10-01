export const formatTime = timeStr => {
  if (!timeStr) return '';
  const [hour, minute] = timeStr.split(':');
  const hourNum = parseInt(hour, 10);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const formattedHour = hourNum % 12 || 12; // Converts 0 to 12 for 12 AM
  return `${formattedHour}:${minute} ${ampm}`;
};
