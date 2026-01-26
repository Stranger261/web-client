// pages/IBMS/IBMSDashboard.jsx
import { useState } from 'react';
import { Building2, BedDouble, Activity, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import FloorView from '../components/FloorView';
// import BedManagementPanel from './components/BedManagementPanel';
import AdmissionsList from '../components/AdmissionList';
import MaintenancePanel from '../components/MaintenancePanel';
// import Statistics from './components/Statistics';

import { useAuth } from '../../../../../contexts/AuthContext';

const IBMSDashboard = () => {
  const { currentUser } = useAuth();
  const isDarkMode = document.documentElement.classList.contains('dark');
  const userRole = currentUser?.role; // 'receptionist', 'nurse', 'admin'
  const [activeView, setActiveView] = useState('floors'); // 'floors', 'admissions', 'maintenance', 'stats'

  const tabs = [
    {
      id: 'floors',
      label: 'Floor Management',
      icon: Building2,
      roles: ['receptionist', 'nurse', 'admin'],
    },
    {
      id: 'admissions',
      label: 'Active Admissions',
      icon: BedDouble,
      roles: ['receptionist', 'nurse', 'admin'],
    },
    {
      id: 'maintenance',
      label: 'Maintenance & Cleaning',
      icon: AlertCircle,
      roles: ['nurse', 'admin'],
    },
    {
      id: 'stats',
      label: 'Statistics',
      icon: Activity,
      roles: ['admin'],
    },
  ].filter(tab => tab.roles.includes(userRole));

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Building2
                className="w-8 h-8"
                style={{ color: COLORS.primary }}
              />
              <div>
                <h1
                  className="text-2xl font-bold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Bed Management System
                </h1>
                <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                  Inpatient Bed & Admission Management
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeView === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2"
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
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeView === 'floors' && (
          <FloorView isDarkMode={isDarkMode} userRole={userRole} />
        )}
        {activeView === 'admissions' && (
          <AdmissionsList isDarkMode={isDarkMode} userRole={userRole} />
        )}
        {activeView === 'maintenance' && (
          <MaintenancePanel isDarkMode={isDarkMode} userRole={userRole} />
        )}
        {/*
        {activeView === 'stats' && <Statistics isDarkMode={isDarkMode} />} */}
      </div>
    </div>
  );
};

export default IBMSDashboard;
