// src/config/sidebarConfig.js
import {
  Calendar,
  LayoutDashboardIcon,
  SettingsIcon,
  User,
  UsersIcon,
  CalendarIcon,
  FileTextIcon,
  CreditCardIcon,
  BarChartIcon,
  StethoscopeIcon,
  BedIcon,
  ClipboardListIcon,
} from 'lucide-react';

export const sidebarConfig = {
  receptionist: [
    {
      name: 'Dashboard',
      path: '/receptionist/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      name: 'Patient Records',
      path: '/receptionist/patient-records',
      icon: UsersIcon,
    },
    {
      name: 'Appointments',
      path: '/receptionist/appointments',
      icon: CalendarIcon,
    },
    {
      name: 'Billing / Payments',
      path: '/receptionist/billing',
      icon: CreditCardIcon,
    },
    { name: 'Reports', path: '/receptionist/reports', icon: FileTextIcon },
    { name: 'Settings', path: '/receptionist/settings', icon: SettingsIcon },
  ],

  doctor: [
    { name: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboardIcon },
    // { name: 'Patient Queue', path: '/doctor/queue', icon: UsersIcon }, // NEW
    { name: 'Appointments', path: '/doctor/appointments', icon: CalendarIcon },
    { name: 'My Patients', path: '/doctor/my-patients', icon: UsersIcon },
    {
      name: 'Medical Records',
      path: '/doctor/medical-records',
      icon: FileTextIcon,
    },
    { name: 'Reports', path: '/doctor/reports', icon: BarChartIcon },
    { name: 'Settings', path: '/doctor/settings', icon: SettingsIcon },
  ],

  nurse: [
    { name: 'Dashboard', path: '/nurse/dashboard', icon: LayoutDashboardIcon },
    { name: 'Appointments', path: '/nurse/appointments', icon: CalendarIcon },
    {
      name: 'Patient Records',
      path: '/nurse/patient-records',
      icon: UsersIcon,
    },
    { name: 'Bed Management', path: '/nurse/beds', icon: BedIcon }, // NEW
    {
      name: 'Medical Records',
      path: '/nurse/medical-records',
      icon: FileTextIcon,
    },
    { name: 'Assistance', path: '/nurse/assistance', icon: StethoscopeIcon },
    { name: 'Reports', path: '/nurse/reports', icon: BarChartIcon },
    { name: 'Settings', path: '/nurse/settings', icon: SettingsIcon },
  ],

  admin: [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboardIcon },
    { name: 'User Management', path: '/admin/users', icon: UsersIcon },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarIcon },
    { name: 'Bed Management', path: '/admin/beds', icon: BedIcon }, // NEW
    {
      name: 'Medical Records',
      path: '/admin/medical-records',
      icon: FileTextIcon,
    },
    {
      name: 'Billing / Payments',
      path: '/admin/billing',
      icon: CreditCardIcon,
    },
    { name: 'Reports', path: '/admin/reports', icon: BarChartIcon },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ],

  patient: [
    {
      name: 'Dashboard',
      path: '/patient/my-dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      name: 'Appointments',
      path: '/patient/my-appointments',
      icon: Calendar,
    },
    {
      name: 'Medical History',
      path: '/patient/my-medical-history',
      icon: FileTextIcon,
    },
    { name: 'My Details', path: '/patient/my-details', icon: User },
    // NEW
    // {
    //   name: 'Billing History',
    //   path: '/patient/billing-history',
    //   icon: CreditCardIcon,
    // }, // NEW
    { name: 'Settings', path: '/patient/my-settings', icon: SettingsIcon },
  ],
};
