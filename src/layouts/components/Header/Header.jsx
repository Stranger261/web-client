import { useState } from 'react';
import { Bell, Sun, Moon, Search, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '../../../components/ui/button';
import NotificationDropdown from '../Notifications/NotificationDropdown';
// import UserMenu from './UserMenu';
import { COLORS, GRADIENTS } from '../../../configs/CONST';

const Header = ({ darkMode, onToggleDarkMode, currentUser }) => {
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  return (
    <header
      className="flex items-center justify-between px-6 py-3 shadow-sm sticky top-0 z-20 border-b"
      style={{
        backgroundColor: darkMode ? COLORS.surface.dark : COLORS.surface.light,
        borderColor: darkMode ? '#374151' : '#e5e7eb',
      }}
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
            style={{ color: COLORS.text.secondary }}
          />
          <input
            type="text"
            placeholder="Search patients, appointments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            style={{
              backgroundColor: darkMode ? '#374151' : '#f9fafb',
              borderColor: darkMode ? '#4b5563' : '#e5e7eb',
              color: darkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          />
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-6">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="md"
          icon={darkMode ? Sun : Moon}
          iconOnly
          onClick={onToggleDarkMode}
          aria-label="Toggle dark mode"
        />

        {/* Settings */}
        <Button
          variant="ghost"
          size="md"
          icon={Settings}
          iconOnly
          onClick={handleSettingsClick}
          aria-label="Settings"
        />

        {/* Notifications */}
        <div className="relative">
          <NotificationDropdown
            isOpen={isNotifOpen}
            onToggle={() => setIsNotifOpen(!isNotifOpen)}
            darkMode={darkMode}
            currentUser={currentUser}
          />
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-opacity-50 transition-colors"
            style={{
              backgroundColor: isUserMenuOpen
                ? darkMode
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(59, 130, 246, 0.05)'
                : 'transparent',
            }}
          >
            <div
              className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm relative"
              style={{ background: GRADIENTS.primary }}
            >
              {currentUser?.person?.first_name?.charAt(0) || 'U'}
              <div
                className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2"
                style={{
                  backgroundColor: '#10b981',
                  borderColor: darkMode
                    ? COLORS.surface.dark
                    : COLORS.surface.light,
                }}
              />
            </div>
            <div className="text-left">
              <div
                className="font-semibold text-sm"
                style={{
                  color: darkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {currentUser?.person?.first_name}{' '}
                {currentUser?.person?.last_name}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                {currentUser?.role === 'doctor' ? 'Staff' : currentUser?.role}
              </div>
            </div>
            <ChevronDown
              className="h-4 w-4"
              style={{ color: COLORS.text.secondary }}
            />
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <UserMenu
              currentUser={currentUser}
              darkMode={darkMode}
              onClose={() => setIsUserMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
