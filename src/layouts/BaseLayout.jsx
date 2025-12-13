import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Menu as MenuIcon,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronDown,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../components/shared/LoadingOverlay';
import Sidebar from '../components/shared/Sidebar';
import { COLORS, GRADIENTS } from '../configs/CONST';
import { normalizedWord } from '../utils/normalizedWord';

const BaseLayout = () => {
  const navigate = useNavigate();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3);

  const { isLoading, currentUser, logout } = useAuth();
  const uuidDisplay =
    currentUser?.staff?.staff_uuid ||
    currentUser?.person?.patient?.patient_uuid;

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(prev => !prev);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const logoutHandler = async () => {
    setLoggingOut(true);
    try {
      await new Promise(res => setTimeout(res, 800));
      await logout();
      toast.success('Logged out successfully.');
      navigate('/login');
    } catch (error) {
      console.log(error);
      toast.error('Failed to log out. Please try again.');
    } finally {
      setLoggingOut(false);
    }
  };

  if (isLoading || loggingOut) {
    return <LoadingOverlay />;
  }

  if (!currentUser && !isLoading) {
    console.log('no user in BaseLayout');
    return null;
  }

  return (
    <div
      className="flex min-h-screen"
      style={{
        backgroundColor: darkMode
          ? COLORS.background.dark
          : COLORS.background.main,
      }}
    >
      {/* --- Desktop Sidebar --- */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-30">
        <Sidebar
          isOpen={isDesktopSidebarOpen}
          toggleSidebar={toggleDesktopSidebar}
          onLogout={logoutHandler}
          currentUser={currentUser}
        />
      </div>

      {/* --- Mobile Sidebar (overlay) --- */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar
              isOpen={true}
              toggleSidebar={() => setIsMobileSidebarOpen(false)}
              onLogout={logoutHandler}
              currentUser={currentUser}
            />
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
        }`}
      >
        {/* Desktop Header */}
        <header
          className="hidden lg:flex items-center justify-between px-6 py-4 shadow-sm sticky top-0 z-20"
          style={{
            backgroundColor: darkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            color: darkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <div className="flex items-center space-x-4">
            <div
              className="text-2xl font-bold"
              style={{ color: darkMode ? COLORS.text.white : COLORS.primary }}
            >
              {normalizedWord(currentUser.role)} Dashboard
            </div>
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Welcome back, {currentUser?.person.first_name || 'Patient'}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full transition-colors"
              style={{
                backgroundColor: darkMode
                  ? COLORS.surface.darkHover
                  : COLORS.button.hover,
              }}
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun
                  className="h-5 w-5"
                  style={{ color: COLORS.status.yellow }}
                />
              ) : (
                <Moon
                  className="h-5 w-5"
                  style={{ color: COLORS.text.primary }}
                />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                className="p-2 rounded-full transition-colors relative"
                style={{
                  backgroundColor: darkMode
                    ? COLORS.surface.darkHover
                    : COLORS.button.hover,
                }}
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                    style={{ backgroundColor: COLORS.status.red }}
                  >
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div
                className="h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold"
                style={{
                  background: GRADIENTS.primary,
                }}
              >
                {currentUser?.person.first_name?.charAt(0) || 'P'}
              </div>
              <div className="hidden md:block">
                <div className="font-medium">
                  {currentUser?.person.first_name || 'Patient'}{' '}
                  {currentUser?.person.last_name || ''}
                </div>
                <div
                  className="text-xs truncate"
                  style={{ color: COLORS.text.secondary, maxWidth: '200px' }}
                >
                  {normalizedWord(
                    currentUser.role === 'doctor' ? 'Staff' : currentUser.role
                  )}{' '}
                  UUID: {uuidDisplay || 'N/A'}
                </div>
              </div>
              <ChevronDown
                className="h-5 w-5"
                style={{ color: COLORS.text.secondary }}
              />
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header
          className="flex items-center justify-between p-4 shadow-md lg:hidden sticky top-0 z-20"
          style={{
            backgroundColor: darkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            color: darkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="h-8 w-8 rounded-full grid place-items-center"
              style={{
                borderWidth: '2px',
                borderColor: COLORS.accent,
                backgroundColor: COLORS.primary,
              }}
            >
              <img
                src="../images/logo.png"
                alt="HVill Hospital Logo"
                className="h-5 w-5 object-contain"
              />
            </div>
            <h1 className="font-bold text-lg">H VILL</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full"
              style={{
                backgroundColor: darkMode
                  ? COLORS.surface.darkHover
                  : 'transparent',
              }}
            >
              {darkMode ? (
                <Sun
                  className="h-5 w-5"
                  style={{ color: COLORS.status.yellow }}
                />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button className="p-2 relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span
                  className="absolute top-1 right-1 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center"
                  style={{ backgroundColor: COLORS.status.red }}
                >
                  {notifications}
                </span>
              )}
            </button>

            <button
              className="p-2 rounded-md"
              onClick={() => setIsMobileSidebarOpen(true)}
              style={{
                backgroundColor: darkMode
                  ? COLORS.surface.darkHover
                  : 'transparent',
              }}
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </header>

        <main
          className="flex-1 p-4 md:p-6"
          style={{
            backgroundColor: darkMode
              ? COLORS.background.dark
              : COLORS.background.light,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
