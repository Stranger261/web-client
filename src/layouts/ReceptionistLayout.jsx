import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Menu as MenuIcon } from 'lucide-react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

import Sidebar from '../components/generic/Sidebar';
import { useAuth } from '../context/AuthContext';
import LoadingOverlay from '../components/generic/LoadingOverlay';

const ReceptionistLayout = () => {
  const navigate = useNavigate();
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { isLoading, currentUser, logout } = useAuth();

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarOpen(prev => !prev);
  };

  const logoutHandler = async () => {
    setLoggingOut(true);
    try {
      await new Promise(res => setTimeout(res, 800));
      logout();

      toast.success('Logout successfully.');
      navigate('/login');
    } catch (error) {
      console.log(error);
    } finally {
      setLoggingOut(false);
    }
  };

  if (isLoading || loggingOut) {
    return <LoadingOverlay />;
  }

  if (!currentUser) {
    <Navigate to="/login" />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* --- Desktop Sidebar --- */}
      <div className="hidden lg:block fixed left-0 top-0 h-full z-30">
        <Sidebar
          isOpen={isDesktopSidebarOpen}
          toggleSidebar={toggleDesktopSidebar}
          onLogout={logoutHandler}
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
            {/* For mobile, the sidebar is always visually open; this toggle just closes the overlay */}
            <Sidebar
              isOpen={true}
              toggleSidebar={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isDesktopSidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        }`}
      >
        {/* Mobile Header */}
        <header className="flex items-center justify-between bg-white text-gray-800 p-4 shadow-md lg:hidden sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full grid place-items-center border-2 border-[#d4af37] bg-[#0b1b3b]">
              <span className="text-xs font-extrabold text-white">HM</span>
            </div>
            <h1 className="font-bold text-lg">H VILL</h1>
          </div>
          <button
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <MenuIcon size={24} />
          </button>
        </header>

        <main className="flex-1 dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionistLayout;
