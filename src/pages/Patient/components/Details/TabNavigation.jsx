import { User, Phone, Heart } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';

const TAB_ICONS = {
  basic: User,
  contact: Phone,
  medical: Heart,
};

export const TabNavigation = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div
      className="flex flex-col sm:flex-row border-b"
      style={{ borderColor: COLORS.border.light }}
    >
      {tabs.map(tab => {
        const Icon = TAB_ICONS[tab.id];
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex-1 px-6 py-4 flex items-center justify-center gap-3 transition-all relative"
            style={{
              backgroundColor: isActive ? COLORS.primary + '10' : 'transparent',
              borderBottom: isActive
                ? `3px solid ${COLORS.primary}`
                : '3px solid transparent',
            }}
          >
            <Icon
              size={20}
              style={{
                color: isActive ? COLORS.primary : COLORS.text.secondary,
              }}
            />
            <div className="text-left">
              <div
                className="font-semibold text-sm"
                style={{
                  color: isActive ? COLORS.primary : COLORS.text.primary,
                }}
              >
                {tab.label}
              </div>
              <div className="text-xs" style={{ color: COLORS.text.secondary }}>
                {tab.badge}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
