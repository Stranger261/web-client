import { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  User,
  Lock,
  Settings as SettingsIcon,
  LogOut,
} from 'lucide-react';

import { Button } from '../../../components/ui/button';
import { COLORS, GRADIENTS } from '../../../configs/CONST';
import { normalizedWord } from '../../../utils/normalizedWord';
// import NotificationDropdown from '../Notifications/NotificationDropdown';

const DesktopHeader = ({
  darkMode,
  toggleDarkMode,
  currentUser,
  unreadCount,
  isNotifOpen,
  setIsNotifOpen,
  onOpenPasswordModal,
  onLogout,
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const uuidDisplay =
    currentUser?.staff?.staff_uuid ||
    currentUser?.person?.patient?.patient_uuid;

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userMenuItems = [
    {
      icon: User,
      label: 'Profile',
      onClick: () => {
        setIsUserMenuOpen(false);
        // Navigate to profile
      },
    },
    {
      icon: Lock,
      label: 'Change Password',
      onClick: () => {
        setIsUserMenuOpen(false);
        onOpenPasswordModal();
      },
    },
    {
      icon: SettingsIcon,
      label: 'Settings',
      onClick: () => {
        setIsUserMenuOpen(false);
        // Navigate to settings
      },
    },
    {
      icon: LogOut,
      label: 'Logout',
      onClick: () => {
        setIsUserMenuOpen(false);
        onLogout();
      },
      danger: true,
    },
  ];

  return (
    <header
      className="hidden lg:flex items-center justify-end px-6 py-4 shadow-sm sticky top-0 z-20"
      style={{
        background: darkMode
          ? 'linear-gradient(90deg, #0a1929 0%, #0f1f3d 50%, #1a2d4d 100%)'
          : COLORS.surface.light,
        color: darkMode ? COLORS.text.white : COLORS.text.primary,
        borderBottom: darkMode
          ? '1px solid rgba(61, 90, 128, 0.3)'
          : '1px solid #e5e7eb',
      }}
    >
      <div className="flex items-center space-x-6">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="md"
          icon={darkMode ? Sun : Moon}
          iconOnly
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
          className="text-slate-300 hover:text-blue-400"
        />

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="md"
            icon={Bell}
            iconOnly
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative text-slate-300 hover:text-blue-400"
          />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold"
              style={{ backgroundColor: COLORS.status.red }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-5 transition-colors"
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
              style={{
                background: darkMode
                  ? 'linear-gradient(135deg, #3d5a80, #2d3e50)'
                  : GRADIENTS.primary,
              }}
            >
              {currentUser?.person.first_name?.charAt(0) || 'U'}
            </div>
            <div className="hidden md:block text-left">
              <div className="font-medium text-white">
                {currentUser?.person.first_name || ''}{' '}
                {currentUser?.person.last_name || ''}
              </div>
              <div
                className="text-xs truncate"
                style={{
                  color: darkMode ? '#94a3b8' : COLORS.text.secondary,
                  maxWidth: '200px',
                }}
              >
                {normalizedWord(
                  currentUser.role === 'doctor' ? 'Staff' : currentUser.role
                )}{' '}
                • {uuidDisplay?.slice(0, 8) || 'N/A'}
              </div>
            </div>
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                isUserMenuOpen ? 'rotate-180' : ''
              }`}
              style={{ color: darkMode ? '#94a3b8' : COLORS.text.secondary }}
            />
          </button>

          {/* User Dropdown Menu */}
          {isUserMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg overflow-hidden"
              style={{
                background: darkMode
                  ? 'linear-gradient(180deg, #0f1f3d 0%, #1a2d4d 100%)'
                  : COLORS.surface.light,
                border: `1px solid ${
                  darkMode ? 'rgba(61, 90, 128, 0.3)' : '#e5e7eb'
                }`,
              }}
            >
              {/* User Info Section */}
              <div
                className="px-4 py-3 border-b"
                style={{
                  borderColor: darkMode ? 'rgba(61, 90, 128, 0.3)' : '#e5e7eb',
                }}
              >
                <p className="font-medium text-white">
                  {currentUser?.person.first_name}{' '}
                  {currentUser?.person.last_name}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {currentUser?.person?.email || currentUser?.email}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {userMenuItems.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={index}
                      onClick={item.onClick}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors ${
                        item.danger
                          ? 'text-red-400 hover:bg-red-500 hover:bg-opacity-10'
                          : 'text-slate-300 hover:text-blue-400 hover:bg-white hover:bg-opacity-5'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DesktopHeader;
