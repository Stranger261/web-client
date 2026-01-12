import { Menu, Bell, Sun, Moon, Heart } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { COLORS } from '../../../configs/CONST';

const MobileHeader = ({
  darkMode,
  toggleDarkMode,
  unreadCount,
  toggleNotifications,
  toggleSidebar,
}) => {
  return (
    <header
      className="flex items-center justify-between p-4 shadow-md lg:hidden sticky top-0 z-20"
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
      <div className="flex items-center gap-2">
        <div
          className="h-10 w-10 rounded-lg grid place-items-center"
          style={{
            background: darkMode
              ? 'linear-gradient(135deg, #3d5a80, #2d3e50)'
              : COLORS.primary,
            border: darkMode ? '2px solid rgba(96, 165, 250, 0.3)' : 'none',
          }}
        >
          <Heart className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white">H VILL</h1>
          <p className="text-xs text-slate-400">Hospital</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="md"
          icon={darkMode ? Sun : Moon}
          iconOnly
          onClick={toggleDarkMode}
          className="text-slate-300 hover:text-blue-400"
        />

        <div className="relative">
          <Button
            variant="ghost"
            size="md"
            icon={Bell}
            iconOnly
            onClick={toggleNotifications}
            className="relative text-slate-300 hover:text-blue-400"
          />
          {unreadCount > 0 && (
            <span
              className="absolute top-1 right-1 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-semibold"
              style={{ backgroundColor: COLORS.status.red }}
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>

        <Button
          variant="ghost"
          size="md"
          icon={Menu}
          iconOnly
          onClick={toggleSidebar}
          className="text-slate-300 hover:text-blue-400"
        />
      </div>
    </header>
  );
};

export default MobileHeader;
