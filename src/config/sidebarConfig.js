import {
  Calendar,
  LayoutDashboardIcon,
  SettingsIcon,
  User,
  UsersIcon,
  CalendarIcon,
  ClipboardIcon,
  CreditCardIcon,
  FileTextIcon,
  BarChartIcon,
  ShieldIcon,
  UserPlusIcon,
  StethoscopeIcon,
} from 'lucide-react';

export const sidebarConfig = {
  patient: [
    {
      name: 'Dashboard',
      path: '/patient/my-dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      name: 'Appointments',
      path: '/patient/create-appointments',
      icon: Calendar,
    },
    { name: 'My Details', path: '/patient/my-details', icon: User },
    { name: 'Settings', path: '/patient/my-settings/', icon: SettingsIcon },
  ],

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
    {
      name: 'Reports',
      path: '/receptionist/reports',
      icon: FileTextIcon,
    },
    {
      name: 'Settings',
      path: '/receptionist/settings/',
      icon: SettingsIcon,
    },
  ],

  doctor: [
    {
      name: 'Dashboard',
      path: '/doctor/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      name: 'Appointments',
      path: '/doctor/appointments',
      icon: CalendarIcon,
    },
    {
      name: 'My Patients',
      path: '/doctor/my-patients',
      icon: UsersIcon,
    },
    {
      name: 'Medical Records',
      path: '/doctor/medical-records',
      icon: FileTextIcon,
    },
    {
      name: 'Reports',
      path: '/doctor/reports',
      icon: BarChartIcon,
    },
    {
      name: 'Settings',
      path: '/doctor/settings',
      icon: SettingsIcon,
    },
  ],

  nurse: [
    {
      name: 'Dashboard',
      path: '/nurse/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      name: 'Appointments',
      path: '/nurse/appointments',
      icon: CalendarIcon,
    },
    {
      name: 'Patient Records',
      path: '/nurse/patient-records',
      icon: UsersIcon,
    },
    {
      name: 'Medical Records',
      path: '/nurse/medical-records',
      icon: FileTextIcon,
    },
    {
      name: 'Assistance',
      path: '/nurse/assistance',
      icon: StethoscopeIcon,
    },
    {
      name: 'Reports',
      path: '/nurse/reports',
      icon: BarChartIcon,
    },
    { name: 'Settings', path: '/nurse/settings/', icon: SettingsIcon },
  ],

  admin: [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      name: 'User Management',
      path: '/admin/users',
      icon: UserPlusIcon,
    },
    {
      name: 'Appointments',
      path: '/admin/appointments',
      icon: CalendarIcon,
    },
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
    {
      name: 'Reports',
      path: '/admin/reports',
      icon: BarChartIcon,
    },
    {
      name: 'System Settings',
      path: '/admin/system-settings',
      icon: ShieldIcon,
    },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ],
};
