import { COLORS } from '../../configs/CONST';
import { Bell, MenuIcon, Moon, Sun } from 'lucide-react';
import { Button } from '../ui/button';

const MobileHeader = ({
  darkMode,
  toggleNotifications,
  toggleDarkMode,
  unreadCount,
  setIsMobileSidebarOpen,
}) => {
  return (
    <header
      className="flex items-center justify-between p-4 shadow-md lg:hidden sticky top-0 z-20"
      style={{
        backgroundColor: darkMode ? COLORS.surface.dark : COLORS.surface.light,
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
        <Button
          variant="ghost"
          size="md"
          icon={darkMode ? Sun : Moon}
          iconOnly
          onClick={toggleDarkMode}
        />

        <div className="relative">
          <Button
            variant="ghost"
            size="md"
            icon={Bell}
            iconOnly
            onClick={toggleNotifications}
            className="relative"
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
          icon={MenuIcon}
          iconOnly
          onClick={() => setIsMobileSidebarOpen(true)}
        />
      </div>
    </header>
  );
};

export default MobileHeader;
