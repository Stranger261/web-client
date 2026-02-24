// pages/IBMS/IBMSDashboard.jsx
import { useEffect, useState } from 'react';
import { Building2, BedDouble, Activity, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import FloorView from '../components/FloorView';
import AdmissionsList from '../components/AdmissionList';
import MaintenancePanel from '../components/MaintenancePanel';
import Statistics from '../components/Statistics';
// import BedManagementPanel from './components/BedManagementPanel';

import { useAuth } from '../../../contexts/AuthContext';

const IBMSDashboard = () => {
  const { currentUser } = useAuth();
  const isDarkMode = document.documentElement.classList.contains('dark');
  const userRole = currentUser?.role; // 'receptionist', 'nurse', 'admin'
  const [activeView, setActiveView] = useState('floors'); // 'floors', 'admissions', 'maintenance', 'stats'

  const tabs = [
    {
      id: 'floors',
      label: 'Floor Management',
      shortLabel: 'Floors',
      icon: Building2,
      roles: ['receptionist', 'nurse', 'admin'],
    },
    {
      id: 'admissions',
      label: 'Active Admissions',
      shortLabel: 'Admissions',
      icon: BedDouble,
      roles: ['nurse', 'doctor', 'admin'],
    },
    {
      id: 'maintenance',
      label: 'Maintenance & Cleaning',
      shortLabel: 'Maintenance',
      icon: AlertCircle,
      roles: ['nurse', 'admin'],
    },
    // {
    //   id: 'stats',
    //   label: 'Statistics',
    //   shortLabel: 'Stats',
    //   icon: Activity,
    //   roles: ['admin'],
    // },
  ].filter(tab => tab.roles.includes(userRole));

  useEffect(() => {
    if (currentUser?.role === 'doctor') {
      setActiveView('admissions');
    } else if (currentUser?.role === 'receptionist') {
      setActiveView('floors');
    }
  }, [currentUser?.role]);

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: isDarkMode
          ? COLORS.background.dark
          : COLORS.background.light,
      }}
    >
      {/* Header */}
      <div
        className="sticky top-0 z-10 border-b"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
        }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              <Building2
                className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0"
                style={{ color: COLORS.primary }}
              />
              <div className="min-w-0 flex-1">
                <h1
                  className="text-base sm:text-xl md:text-2xl font-bold truncate"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Bed Management System
                </h1>
                <p
                  className="text-xs sm:text-sm truncate hidden sm:block"
                  style={{ color: COLORS.text.secondary }}
                >
                  Inpatient Bed & Admission Management
                </p>
              </div>
            </div>
          </div>

          {/* Tabs - Scrollable on mobile */}
          <div className="relative -mx-3 sm:mx-0">
            <div
              className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 px-3 sm:px-0 hide-scrollbar"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveView(tab.id)}
                    className="px-3 sm:px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-1.5 sm:gap-2 flex-shrink-0 text-xs sm:text-sm md:text-base"
                    style={{
                      backgroundColor: isActive
                        ? COLORS.primary
                        : isDarkMode
                          ? COLORS.surface.darkHover
                          : COLORS.surface.lightHover,
                      color: isActive
                        ? COLORS.text.white
                        : isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                    }}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden md:inline">{tab.label}</span>
                    <span className="md:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
            {/* Fade effect on the right edge for scroll indication on mobile */}
            <div
              className="absolute right-0 top-0 bottom-2 w-6 sm:w-8 pointer-events-none md:hidden"
              style={{
                background: `linear-gradient(to left, ${isDarkMode ? COLORS.surface.dark : COLORS.surface.light}, transparent)`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {activeView === 'floors' && (
          <FloorView isDarkMode={isDarkMode} userRole={userRole} />
        )}
        {activeView === 'admissions' && (
          <AdmissionsList isDarkMode={isDarkMode} userRole={userRole} />
        )}
        {activeView === 'maintenance' && (
          <MaintenancePanel isDarkMode={isDarkMode} userRole={userRole} />
        )}

        {/* {activeView === 'stats' && <Statistics isDarkMode={isDarkMode} />} */}
      </div>

      {/* Hide scrollbar CSS */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default IBMSDashboard;
