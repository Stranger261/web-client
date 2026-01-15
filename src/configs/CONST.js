// LANDING PAGE
export const LEAFLET = {
  HOSPITALADDRESS: '82 J. P. Rizal St., Manggahan 1860 Rodriguez, Philippines',
  HOSPITAL_COORDS: [14.72414951530476, 121.14176532431448],
  ZOOM_LEVEL: 15,
};
export const GOOGLEMAPSURL = `https://google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  LEAFLET.HOSPITALADDRESS
)}`;

// URLs
export const DEVELOPMENT_BASE_URL = 'http://localhost:56741/api/v1';
export const SOCKET_URL = 'http://localhost:56741';

// export const DEVELOPMENT_BASE_URL =
//   'https://auth.health-ease-hospital.com/api/v1';
// export const SOCKET_URL = 'https://auth.health-ease-hospital.com';

// Other constants
export const DEFAULT_TIMEOUT = 30000; // 30 seconds
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const INTERNAL_API_KEY =
  import.meta.env.VITE_INTERNAL_API_KEY || 'core-1-secret-key';

// Date formats
export const DATE_FORMAT = 'yyyy-MM-dd';
export const TIME_FORMAT = 'HH:mm:ss';
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss';

// Appointment constants
export const APPOINTMENT_SLOT_DURATION = 30; // minutes
export const APPOINTMENT_ADVANCE_BOOKING_MONTHS = 3;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const CIVIL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// COLORS
export const COLORS = {
  // Primary Brand Colors
  primary: '#0b1b3b',
  primaryLight: '#1a2d5a',
  accent: '#d4af37',

  // Semantic Colors (Actions)
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Background Colors
  background: {
    light: '#f9fafb', // gray-50
    main: '#f3f4f6', // gray-100
    dark: '#111827', // gray-900
  },

  // Surface Colors
  surface: {
    light: '#ffffff',
    lightHover: '#f9fafb', // gray-50
    dark: '#1f2937', // gray-800
    darkHover: '#374151', // gray-700
  },

  // Text Colors
  text: {
    primary: '#1f2937', // gray-800
    secondary: '#6b7280', // gray-500
    light: '#9ca3af', // gray-400
    white: '#ffffff',
  },

  // Border Colors
  border: {
    light: '#e5e7eb', // gray-200
    dark: '#4b5563', // gray-600
  },

  // Input Colors
  input: {
    background: '#f9fafb', // gray-50
    backgroundDark: '#374151', // gray-700
    border: '#e5e7eb', // gray-200
    borderDark: '#4b5563', // gray-600
    focus: '#3b82f6', // blue-500
  },

  // Gradient Colors
  gradient: {
    from: '#3b82f6', // blue-500
    to: '#9333ea', // purple-600
  },

  // Status Colors
  status: {
    yellow: '#eab308', // yellow-500
    red: '#ef4444', // red-500
  },

  badge: {
    default: {
      bg: '#f3f4f6', // gray-100
      bgDark: '#374151', // gray-700
      text: '#1f2937', // gray-800
      textDark: '#d1d5db', // gray-300
    },
    primary: {
      bg: '#dbeafe', // blue-100
      bgDark: '#1e3a8a', // blue-900
      text: '#1e40af', // blue-800
      textDark: '#bfdbfe', // blue-200
    },
    success: {
      bg: '#dcfce7', // green-100
      bgDark: '#14532d', // green-900
      text: '#166534', // green-800
      textDark: '#bbf7d0', // green-200
    },
    warning: {
      bg: '#fef3c7', // yellow-100
      bgDark: '#713f12', // yellow-900
      text: '#854d0e', // yellow-800
      textDark: '#fef08a', // yellow-200
    },
    danger: {
      bg: '#fee2e2', // red-100
      bgDark: '#7f1d1d', // red-900
      text: '#991b1b', // red-800
      textDark: '#fecaca', // red-200
    },
    info: {
      bg: '#dbeafe', // blue-100
      bgDark: '#1e3a8a', // blue-900
      text: '#1e40af', // blue-800
      textDark: '#bfdbfe', // blue-200
    },
  },

  button: {
    // Action-based buttons
    create: {
      bg: '#10b981', // green-500
      bgHover: '#059669', // green-600
      text: '#ffffff',
      icon: '#10b981', // green for icon-only
    },
    edit: {
      bg: '#3b82f6', // blue-500
      bgHover: '#2563eb', // blue-600
      text: '#ffffff',
      icon: '#3b82f6', // blue for icon-only
    },
    delete: {
      bg: '#ef4444', // red-500
      bgHover: '#dc2626', // red-600
      text: '#ffffff',
      icon: '#ef4444', // red for icon-only
    },
    view: {
      bg: '#6b7280', // gray-500
      bgHover: '#4b5563', // gray-600
      text: '#ffffff',
      icon: '#6b7280', // gray for icon-only
    },

    // Style variants
    primary: {
      bg: '#3b82f6', // blue-600
      bgHover: '#2563eb', // blue-700
      text: '#ffffff',
    },
    secondary: {
      bg: '#6b7280', // gray-600
      bgHover: '#4b5563', // gray-700
      text: '#ffffff',
    },
    outline: {
      bg: 'transparent',
      bgHover: '#f3f4f6', // gray-100
      bgHoverDark: '#374151', // gray-700
      text: '#374151', // gray-700
      textDark: '#ffffff',
      border: '#d1d5db', // gray-300
      borderDark: '#4b5563', // gray-600
    },
    ghost: {
      bg: 'transparent',
      bgHover: '#f3f4f6', // gray-100
      bgHoverDark: '#374151', // gray-700
      text: '#374151', // gray-700
      textDark: '#ffffff',
    },
  },
  card: {
    background: {
      light: '#ffffff',
      dark: '#1f2937', // gray-800
    },
    border: {
      light: '#e5e7eb', // gray-200
      dark: '#374151', // gray-700
    },
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
  },
};

export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #3b82f6 0%, #9333ea 100%)',
  success: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  danger: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
};

// pagination
export const ITEMS_PER_PAGE = 10;

// notification
export const ITEMS_PER_NOTIF = 3;
