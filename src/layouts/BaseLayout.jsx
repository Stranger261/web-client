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
  User,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../components/shared/LoadingOverlay';
import Sidebar from '../components/shared/Sidebar';

const BaseLayout = () => {
  const navigate = useNavigate();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count

  const { isLoading, currentUser, logout } = useAuth();

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
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
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
        <header className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-800 text-gray-800 dark:text-white px-6 py-4 shadow-sm sticky top-0 z-20">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold text-[#0b1b3b] dark:text-white">
              Patient Dashboard
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Welcome back, {currentUser?.firstName || 'Patient'}
            </div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search appointments, doctors..."
                className="pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
              />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors relative">
                <Bell className="h-5 w-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {currentUser?.firstName?.charAt(0) || 'P'}
              </div>
              <div className="hidden md:block">
                <div className="font-medium">
                  {currentUser?.firstName || 'Patient'}{' '}
                  {currentUser?.lastName || ''}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Patient ID: {currentUser?.id?.slice(0, 8) || 'N/A'}
                </div>
              </div>
              <ChevronDown className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="flex items-center justify-between bg-white dark:bg-gray-800 text-gray-800 dark:text-white p-4 shadow-md lg:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full grid place-items-center border-2 border-[#d4af37] bg-[#0b1b3b]">
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
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button className="p-2 relative">
              <Bell className="h-5 w-5" />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {notifications}
                </span>
              )}
            </button>

            <button
              className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsMobileSidebarOpen(true)}
            >
              <MenuIcon size={24} />
            </button>
          </div>
        </header>

        <main className="flex-1 dark:bg-gray-900 bg-gray-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default BaseLayout;
