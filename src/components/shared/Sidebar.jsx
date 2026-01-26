import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut as LogOutIcon, ChevronLeft, ChevronRight } from 'lucide-react';

import { useAuth } from '../../contexts/AuthContext';
import { sidebarConfig } from '../../configs/sidebarConfig';

const Sidebar = ({ isOpen, toggleSidebar, onLogout, currentUser }) => {
  const { patient } = useAuth();
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (currentUser?.role) {
      setMenuItems(sidebarConfig[currentUser.role] || []);
    } else {
      setMenuItems([]);
    }
  }, [currentUser]);

  return (
    <aside
      className={`relative flex flex-col h-full bg-[#0b1b3b] text-white shadow-lg transition-all duration-300 ease-in-out
      ${isOpen ? 'w-64' : 'w-20'}
      sm:${isOpen ? 'w-56' : 'w-16'}
      xs:${isOpen ? 'w-48' : 'w-14'}
      `}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        className="
    hidden lg:flex
    absolute -right-3 top-6 z-20
    h-7 w-7 rounded-full
    bg-[#d4af37] text-[#0b1b3b]
    hover:bg-yellow-300 shadow-md
    items-center justify-center
    transition-colors
  "
      >
        {isOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
      </button>

      {/* Logo Section */}
      <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-[#0b1b3b] to-[#102650]">
        <div
          className={`flex items-center gap-3 transition-all duration-300 ${
            isOpen ? 'opacity-100' : 'opacity-0 lg:opacity-100'
          }`}
        >
          <div className="h-10 w-10 rounded-full grid place-items-center border-2 border-[#d4af37] bg-white/10">
            <img
              src="../images/logo.png"
              alt="HVill Hospital Logo"
              className="h-8 w-8 object-contain"
            />
          </div>
          {isOpen && (
            <div>
              <h1 className="font-bold text-md">H VILL</h1>
              <p className="text-xs text-gray-300">Hospital</p>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="px-4 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#d4af37] to-[#b8941f] flex items-center justify-center border-2 border-white/20 shadow-lg">
            <span className="font-bold text-white text-sm">
              {currentUser?.person?.first_name?.[0] ||
                patient?.person?.first_name?.[0]}
              {currentUser?.person?.last_name?.[0] ||
                patient?.person?.last_name?.[0]}
            </span>
          </div>
          {isOpen && (
            <div>
              <p className="font-semibold text-sm">
                {currentUser?.person?.first_name}{' '}
                {currentUser?.person?.last_name}
              </p>
              <p className="text-xs text-gray-300 capitalize">
                {currentUser?.role}
                {currentUser.role === 'doctor' &&
                currentUser?.staff.specialization
                  ? `: ${currentUser?.staff.specialization}`
                  : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav
        className={`flex-1 px-3 py-4 space-y-2 transition-all duration-300 ${
          isOpen ? 'overflow-y-auto' : 'overflow-hidden'
        } no-scrollbar`}
      >
        {menuItems.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={name}
            to={path}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-md group
              ${
                isActive
                  ? 'bg-white/10 text-[#d4af37] font-semibold shadow-md'
                  : 'text-white hover:bg-white/10 hover:text-[#d4af37]'
              }`
            }
          >
            <Icon size={20} className="flex-shrink-0" />
            {isOpen && <span>{name}</span>}

            {/* Tooltip for collapsed */}
            {!isOpen && (
              <div className="absolute left-full ml-3 px-2 py-1 bg-[#0b1b3b] text-white text-xs rounded-md border border-[#d4af37]/30 invisible opacity-0 -translate-x-2 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50">
                {name}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="px-3 py-4 border-t border-white/20">
        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 group relative ${
            !isOpen ? 'justify-center' : ''
          }`}
        >
          <LogOutIcon size={20} className="flex-shrink-0" />
          {isOpen && <span>Logout</span>}

          {/* Tooltip */}
          {!isOpen && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-[#0b1b3b] text-white text-xs rounded-md border border-red-500/20 invisible opacity-0 -translate-x-2 transition-all group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 z-50">
              Logout
            </div>
          )}
        </button>

        {isOpen && (
          <p className="text-[10px] text-gray-400 mt-3 text-center">
            © 1999–2025 HMVH
          </p>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
