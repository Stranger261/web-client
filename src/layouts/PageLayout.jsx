import { useCallback, useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Menu as MenuIcon } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../components/shared/LoadingOverlay';
import Sidebar from '../components/shared/Sidebar';

const PageLayout = () => {
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isLoading, logout, currentUser } = useAuth();

  const toggleDesktopSidebar = () => setIsDesktopSidebarOpen(prev => !prev);
  const toggleMobileSidebar = () => setIsMobileSidebarOpen(prev => !prev);

  const logoutHandler = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      await Promise.all([new Promise(res => setTimeout(res, 800)), logout()]);
      toast.success('Logged out successfully.');
    } catch (error) {
      console.log('Logout failed:', error.message);
      toast.error('Failed to logout. Please try again later.');
    } finally {
      setIsLoggingOut(false);
    }
  }, [logout]);

  // Responsive auto-collapse behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsDesktopSidebarOpen(false);
      else setIsDesktopSidebarOpen(true);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading || isLoggingOut) {
    return (
      <LoadingOverlay
        message="Loading..."
        size="xl"
        showLogo={true}
        variant="default"
      />
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* === Desktop Sidebar === */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-30">
        <Sidebar
          currentUser={currentUser}
          isOpen={isDesktopSidebarOpen}
          toggleSidebar={toggleDesktopSidebar}
          onLogout={logoutHandler}
        />
      </div>

      {/* === Mobile Sidebar (overlay) === */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={toggleMobileSidebar}
          />
          <div className="relative z-50 w-64">
            <Sidebar
              currentUser={currentUser}
              isOpen={true}
              toggleSidebar={toggleMobileSidebar}
              onLogout={logoutHandler}
            />
          </div>
        </div>
      )}

      {/* === Main Content === */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}
        `}
      >
        {/* Mobile Header */}
        <header className="flex items-center justify-between bg-[#0b1b3b] text-white p-4 shadow-md lg:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full grid place-items-center border-2 border-[#d4af37] bg-[#0b1b3b]">
              <span className="text-xs font-extrabold text-white">HM</span>
            </div>
            <h1 className="font-bold text-lg">H VILL</h1>
          </div>
          <button
            className="p-2 rounded-md hover:bg-white/10"
            onClick={toggleMobileSidebar}
          >
            <MenuIcon size={22} />
          </button>
        </header>

        <main className="flex-1 bg-gray-50 dark:bg-gray-900 overflow-y-auto no-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PageLayout;
