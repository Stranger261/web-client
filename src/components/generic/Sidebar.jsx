import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LogOut as LogOutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { sidebarConfig } from '../../config/sidebarConfig';

const Sidebar = ({ isOpen, toggleSidebar, onLogout }) => {
  const { currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.role) {
      setMenuItems(sidebarConfig[currentUser.role] || []);
    } else {
      setMenuItems([]);
    }
  }, [currentUser]);

  if (!currentUser) {
    return null;
  }

  return (
    <aside
      className={`relative flex flex-col h-full bg-[#0b1b3b] text-white transition-all duration-300 ease-in-out ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Toggle button */}
      <button
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-[#d4af37] text-[#0b1b3b] h-7 w-7 rounded-full grid place-items-center cursor-pointer hover:bg-yellow-300 transition-colors"
      >
        {isOpen ? (
          <ChevronLeftIcon size={18} />
        ) : (
          <ChevronRightIcon size={18} />
        )}
      </button>

      {/* Logo section */}
      <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-[#0b1b3b] to-[#102650] overflow-hidden">
        <div
          className={`flex items-center gap-3 transition-opacity duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
          }`}
        >
          <div className="h-10 w-10 flex-shrink-0 rounded-full grid place-items-center border-2">
            <img
              src="../public/images/logo.png"
              alt="HVill Hospital Logo"
              className="transition-transform duration-300 ease-in-out transform hover:scale-110"
            />
          </div>
          <p
            className={`font-semibold whitespace-nowrap transition-all duration-300 ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            H VILL
          </p>
        </div>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-3 py-4 space-y-2 text-sm">
        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-md group
      ${
        isActive
          ? 'bg-white/10 text-[#d4af37] font-semibold'
          : 'text-white hover:bg-white/10 hover:text-[#d4af37]'
      }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className="flex-shrink-0" />
                <span
                  className={`whitespace-nowrap transition-opacity duration-200 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {name}
                </span>

                {/* Tooltip when collapsed */}
                {!isOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-[#0b1b3b] text-white text-xs rounded-md invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
                    {name}
                  </div>
                )}

                {/* Left indicator for active state */}
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#d4af37] rounded-r"></span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 py-4 border-t border-white/20">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-500 hover:bg-red-500/10 rounded-lg transition-all group relative"
        >
          <LogOutIcon size={18} className="flex-shrink-0" />
          <span
            className={`whitespace-nowrap transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            Logout
          </span>
          {!isOpen && (
            <div className="absolute left-full ml-4 px-2 py-1 bg-[#0b1b3b] text-white text-xs rounded-md invisible opacity-20 -translate-x-3 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0">
              Logout
            </div>
          )}
        </button>
        <p
          className={`text-[10px] text-white/50 mt-2 text-center transition-opacity duration-200 ${
            isOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          © 1999–2025 HMVH
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
