// File: /src/utils/FormatTime.js

/**
 * Format time from HH:MM:SS to 12-hour format
 * @param {string} timeStr - Time string in HH:MM:SS format
 * @returns {string} Formatted time like "8:32 PM"
 */
export const formatTime = timeStr => {
  if (!timeStr) return '';

  const [hour, minute] = timeStr.split(':');
  const hourNum = parseInt(hour, 10);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const formattedHour = hourNum % 12 || 12;

  const paddedHour = String(formattedHour).padStart(2, '0');
  const paddedMinute = String(minute).padStart(2, '0');

  return `${paddedHour}:${paddedMinute} ${ampm}`;
};

/**
 * Format full date + live time with seconds
 * e.g. "Jan 16, 2026 · 02:49:32 AM"
 */
export const formatLiveDateTime = date => {
  if (!date) return '';

  const datePart = date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });

  const timePart = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  return `${datePart} · ${timePart}`;
};

/**
 * Format ISO timestamp to relative time (e.g., "5 minutes ago", "2 hours ago")
 * @param {string} isoTimestamp - ISO 8601 timestamp
 * @returns {string} Relative time string
 */
export const formatRelativeTime = isoTimestamp => {
  if (!isoTimestamp) return '';

  const now = new Date();
  const timestamp = new Date(isoTimestamp);
  const diffMs = now - timestamp;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  } else {
    // Show full date if older than a week
    return formatNotificationDateTime(isoTimestamp);
  }
};

/**
 * Format ISO timestamp to readable date and time with proper timezone
 * @param {string} isoTimestamp - ISO 8601 timestamp (e.g., "2025-12-27T12:32:17.000Z")
 * @returns {string} Formatted date and time like "Dec 27, 2025 at 8:32 PM"
 */
export const formatNotificationDateTime = isoTimestamp => {
  if (!isoTimestamp) return '';

  const date = new Date(isoTimestamp);

  // Format date
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  return date.toLocaleString('en-US', options);
};

/**
 * Format ISO timestamp to short date and time
 * @param {string} isoTimestamp - ISO 8601 timestamp
 * @returns {string} Formatted like "Today at 8:32 PM" or "Yesterday at 8:32 PM" or "Dec 27 at 8:32 PM"
 */
export const formatNotificationTime = isoTimestamp => {
  if (!isoTimestamp) return '';

  const date = new Date(isoTimestamp);
  const now = new Date();

  // Get time part
  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };
  const timeStr = date.toLocaleString('en-US', timeOptions);

  // Check if today
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `Today at ${timeStr}`;
  }

  // Check if yesterday
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  if (isYesterday) {
    return `Yesterday at ${timeStr}`;
  }

  // Check if this year
  const isThisYear = date.getFullYear() === now.getFullYear();
  if (isThisYear) {
    const dateOptions = { month: 'short', day: 'numeric' };
    const dateStr = date.toLocaleDateString('en-US', dateOptions);
    return `${dateStr} at ${timeStr}`;
  }

  // Different year
  const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
  const dateStr = date.toLocaleDateString('en-US', dateOptions);
  return `${dateStr} at ${timeStr}`;
};
