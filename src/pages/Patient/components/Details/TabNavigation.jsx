import { User, Phone, Heart } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';

const TAB_ICONS = {
  basic: User,
  contact: Phone,
  medical: Heart,
};

export const TabNavigation = ({
  tabs,
  activeTab,
  onTabChange,
  isDarkMode = false,
}) => {
  return (
    <div
      className={`flex flex-col sm:flex-row border-b transition-colors duration-200 ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      {tabs.map(tab => {
        const Icon = TAB_ICONS[tab.id];
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all relative ${
              isActive
                ? isDarkMode
                  ? 'bg-blue-900/30'
                  : 'bg-blue-50'
                : 'transparent'
            } ${
              isDarkMode && !isActive ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
            }`}
            style={{
              borderBottom: isActive
                ? `3px solid ${COLORS.primary}`
                : '3px solid transparent',
            }}
          >
            <Icon
              size={20}
              style={{
                color: isActive
                  ? COLORS.primary
                  : isDarkMode
                    ? '#9CA3AF'
                    : '#6B7280',
              }}
            />
            <div className="text-left">
              <div
                className={`font-semibold text-sm ${
                  isActive
                    ? 'text-blue-600'
                    : isDarkMode
                      ? 'text-gray-300'
                      : 'text-gray-700'
                }`}
              >
                {tab.label}
              </div>
              <div
                className={`text-xs ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {tab.badge}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
