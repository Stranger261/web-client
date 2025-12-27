import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Clock,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Eye,
  FileText,
  Video,
  Phone,
  Stethoscope,
  Pill,
  MapPin,
  User,
} from 'lucide-react';
import Badge from '../../../components/ui/badge';

import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';

import { COLORS } from '../../../configs/CONST';
import { useEffect } from 'react';

const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();

  const [darkMode, setDarkMode] = useState(false);

  // Mock data
  const stats = [
    {
      label: 'Total Patients',
      value: '248',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: COLORS.info,
    },
    {
      label: "Today's Appointments",
      value: '12',
      change: '3 pending',
      trend: 'neutral',
      icon: Calendar,
      color: COLORS.warning,
    },
    {
      label: 'Avg. Wait Time',
      value: '18 min',
      change: '-5 min',
      trend: 'up',
      icon: Clock,
      color: COLORS.success,
    },
    {
      label: 'Patient Satisfaction',
      value: '4.8/5',
      change: '+0.2',
      trend: 'up',
      icon: Activity,
      color: COLORS.accent,
    },
  ];

  const appointments = [
    {
      id: 1,
      time: '09:00 AM',
      patient: 'Sarah Johnson',
      age: 34,
      mrn: 'MRN-2024-001',
      reason: 'Annual Checkup',
      type: 'In-Person',
      status: 'completed',
      priority: 'normal',
    },
    {
      id: 2,
      time: '09:30 AM',
      patient: 'Michael Chen',
      age: 45,
      mrn: 'MRN-2024-002',
      reason: 'Follow-up Consultation',
      type: 'Video Call',
      status: 'in-progress',
      priority: 'normal',
    },
    {
      id: 3,
      time: '10:00 AM',
      patient: 'Emma Davis',
      age: 28,
      mrn: 'MRN-2024-003',
      reason: 'Lab Results Review',
      type: 'In-Person',
      status: 'waiting',
      priority: 'high',
    },
    {
      id: 4,
      time: '10:30 AM',
      patient: 'James Wilson',
      age: 52,
      mrn: 'MRN-2024-004',
      reason: 'Blood Pressure Check',
      type: 'In-Person',
      status: 'scheduled',
      priority: 'normal',
    },
    {
      id: 5,
      time: '11:00 AM',
      patient: 'Lisa Anderson',
      age: 41,
      mrn: 'MRN-2024-005',
      reason: 'Medication Review',
      type: 'Phone Call',
      status: 'scheduled',
      priority: 'normal',
    },
  ];

  const alerts = [
    {
      id: 1,
      type: 'critical',
      message:
        'Critical lab result for Emma Davis requires immediate attention',
      time: '10 min ago',
    },
    {
      id: 2,
      type: 'warning',
      message: 'Prescription refill request from 3 patients pending approval',
      time: '1 hour ago',
    },
    {
      id: 3,
      type: 'info',
      message: 'New patient registration: Robert Martinez',
      time: '2 hours ago',
    },
  ];

  const quickActions = [
    { icon: Calendar, label: 'New Appointment', color: 'green' },
    { icon: FileText, label: 'Write Note', color: 'blue' },
    { icon: Users, label: 'View Patients', color: 'purple' },
    { icon: Activity, label: 'Lab Results', color: 'orange' },
  ];

  const getStatusVariant = status => {
    const statusMap = {
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'primary',
      rescheduled: 'info',
      scheduled: 'warning',
      'checked-in': 'success',
      'no-show': 'danger',
    };
    return statusMap[status] || 'default';
  };

  const getPriorityBadge = priority => {
    if (priority === 'high') {
      return {
        bg: darkMode ? '#7f1d1d' : '#fee2e2',
        text: darkMode ? '#fecaca' : '#991b1b',
      };
    }
    return null;
  };


  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, Dr. Smith</h1>
            <p className="text-blue-100 mt-2">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
            >
              {darkMode ? '☀️ Light' : '🌙 Dark'}
            </button>
            <button className="relative p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-white border-gray-200'
              } p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p
                    className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } mb-1`}
                  >
                    {stat.label}
                  </p>
                  <p
                    className={`text-3xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    } mb-2`}
                  >
                    {stat.value}
                  </p>
                  <p
                    className={`text-sm ${
                      stat.trend === 'up'
                        ? 'text-green-500'
                        : darkMode
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    } flex items-center gap-1`}
                  >
                    {stat.trend === 'up' && <TrendingUp size={14} />}
                    {stat.change}
                  </p>
                </div>
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: stat.color + '20' }}
                >
                  <Icon size={24} color={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Appointments */}
        <div className="lg:col-span-2 space-y-6">
          <div
            className={`${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            } rounded-xl border shadow-sm overflow-hidden`}
          >
            {/* Header */}
            <div
              className={`p-6 ${
                darkMode ? 'border-gray-700' : 'border-gray-200'
              } border-b`}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2
                    className={`text-xl font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}
                  >
                    Today's Appointments
                  </h2>
                  <p
                    className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    } mt-1`}
                  >
                    Your scheduled visits
                  </p>
                </div>
                <button
                  className={`px-3 py-2 ${
                    darkMode
                      ? 'bg-gray-700 text-gray-300 border-gray-600'
                      : 'bg-white text-gray-700 border-gray-300'
                  } border rounded-lg text-sm font-medium hover:bg-opacity-80 transition-colors flex items-center gap-2`}
                >
                  <Filter size={16} />
                  Filter
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={18}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                />
                <input
                  type="text"
                  placeholder="Search appointments..."
                  className={`w-full pl-10 pr-4 py-2 ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                  } border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
              </div>
            </div>

            {/* Appointments List */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {appointments.map(apt => {
                const priorityBadge = getPriorityBadge(apt.priority);

                return (
                  <div
                    key={apt.id}
                    className={`p-6 ${
                      darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                    } transition-colors`}
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <User
                            className="text-blue-600 dark:text-blue-400"
                            size={24}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3
                              className={`font-semibold ${
                                darkMode ? 'text-white' : 'text-gray-900'
                              }`}
                            >
                              {apt.patient}
                            </h3>
                            {priorityBadge && (
                              <span
                                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                                style={{
                                  backgroundColor: priorityBadge.bg,
                                  color: priorityBadge.text,
                                }}
                              >
                                HIGH
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-600'
                            }`}
                          >
                            {apt.mrn} • {apt.age} years • {apt.type}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span
                              className={`flex items-center text-sm ${
                                darkMode ? 'text-gray-400' : 'text-gray-600'
                              }`}
                            >
                              <Clock size={14} className="mr-1" />
                              {apt.time}
                            </span>
                            <span
                              className={`text-sm ${
                                darkMode ? 'text-gray-300' : 'text-gray-900'
                              }`}
                            >
                              {apt.reason}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={getStatusVariant(apt.status)}>
                          {apt.status}
                        </Badge>

                        <div className="flex items-center gap-2">
                          {apt.type === 'Video Call' && (
                            <button className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                              <Video size={16} />
                            </button>
                          )}
                          {apt.type === 'Phone Call' && (
                            <button className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                              <Phone size={16} />
                            </button>
                          )}
                          <button
                            className={`p-2 ${
                              darkMode
                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            } rounded-lg transition-colors`}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
                          >
                            <MoreVertical
                              size={16}
                              className={
                                darkMode ? 'text-gray-400' : 'text-gray-500'
                              }
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div
            className={`${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            } rounded-xl border shadow-sm p-6`}
          >
            <h3
              className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              } mb-1`}
            >
              Quick Actions
            </h3>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } mb-4`}
            >
              Common tasks
            </p>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className={`flex flex-col items-center justify-center p-4 ${
                    darkMode
                      ? 'border-gray-700 hover:bg-gray-750'
                      : 'border-gray-200 hover:bg-gray-50'
                  } border rounded-lg transition-colors`}
                >
                  <div
                    className={`p-3 rounded-lg mb-2 ${
                      action.color === 'green'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : action.color === 'blue'
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : action.color === 'purple'
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                    }`}
                  >
                    <action.icon size={20} />
                  </div>
                  <span
                    className={`text-sm font-medium text-center ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}
                  >
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Alerts Card */}
          <div
            className={`${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            } rounded-xl border shadow-sm p-6`}
          >
            <h3
              className={`text-lg font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              } mb-1`}
            >
              Alerts & Notifications
            </h3>
            <p
              className={`text-sm ${
                darkMode ? 'text-gray-400' : 'text-gray-500'
              } mb-4`}
            >
              Important notices
            </p>
            <div className="space-y-3">
              {alerts.map(alert => {
                const alertColors = {
                  critical: {
                    bg: darkMode ? '#7f1d1d' : '#fee2e2',
                    icon: COLORS.danger,
                  },
                  warning: {
                    bg: darkMode ? '#713f12' : '#fef3c7',
                    icon: COLORS.warning,
                  },
                  info: {
                    bg: darkMode ? '#1e3a8a' : '#dbeafe',
                    icon: COLORS.info,
                  },
                };
                const alertColor = alertColors[alert.type];

                return (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: alertColor.bg,
                      borderLeft: `4px solid ${alertColor.icon}`,
                    }}
                  >
                    <div className="flex gap-3">
                      <AlertCircle
                        size={18}
                        color={alertColor.icon}
                        className="flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1">
                        <p
                          className={`text-sm ${
                            darkMode ? 'text-gray-200' : 'text-gray-900'
                          } leading-relaxed`}
                        >
                          {alert.message}
                        </p>
                        <p
                          className={`text-xs ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          } mt-1`}
                        >
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
