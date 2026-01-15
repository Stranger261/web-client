import { useCallback, useState } from 'react';
import {
  Calendar,
  CalendarX,
  Users,
  Clock,
  Activity,
  TrendingUp,
  AlertCircle,
  Bell,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Video,
  MapPin,
  User,
  Stethoscope,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import Badge from '../../../components/ui/badge';

import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';

import { COLORS } from '../../../configs/CONST';
import { useEffect } from 'react';
import Modal from '../../../components/ui/Modal';
import AppointmentDetailModal from '../../../components/Modals/AppointmentDetailModal';
import { useAppointment } from '../../../contexts/AppointmentContext';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import { calculateAge } from '../../Patient/components/Details/utils/patientHelpers';
import { FilterPanel } from '../../../components/ui/filter-panel';
import Pagination from '../../../components/ui/pagination';
import { Button } from '../../../components/ui/button';
import StatsCard from '../../../components/ui/stat-card';

const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const {
    isLoading,
    appointments,
    pagination,
    getAppointmentsToday,
    totalTodaysAppointment,
  } = useAppointment();

  const darkMode = document.documentElement.classList.contains('dark');
  const navigate = useNavigate();
  const docFullName = `${currentUser?.person?.first_name} ${currentUser?.person?.last_name}`;

  const [isViewAppointModalOpen, setIsViewAppointModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);

  // filter
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState({
    status: '',
    appointment_type: '',
    priority: '',
    search: '',
    appointment_mode: '',
  });

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== ''
  ).length;

  useEffect(() => {
    const apiFilter = {
      ...filters,
      limit,
      page: currentPage,
      doctorUuid: currentUser?.staff?.staff_uuid,
    };

    getAppointmentsToday(apiFilter);
  }, [filters, limit, currentPage, currentUser]);

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
      value: totalTodaysAppointment,
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
    {
      icon: Calendar,
      label: 'New Appointment',
      color: 'green',
    },
    {
      icon: Users,
      label: 'View Patients',
      color: 'purple',
      functions: () => navigate(`/${currentUser?.role}/my-patients`),
    },
    { icon: Activity, label: 'Lab Results', color: 'orange' },
  ];

  const appointmentFilterConfig = [
    {
      type: 'search',
      name: 'search',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In-progress' },
        { value: 'checked-in', label: 'Checked In' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no-show', label: 'No Show' },
      ],
    },
    {
      type: 'select',
      name: 'appointment_mode',
      label: 'Appointment Mode',
      options: [
        { value: 'in-person', label: 'In-person' },
        { value: 'online', label: 'Online' },
      ],
    },
    {
      type: 'select',
      name: 'appointment_type',
      label: 'Appointment Type',
      options: [
        { value: 'consultation', label: 'Consultation' },
        { value: 'followup', label: 'Follow-up' },
        { value: 'procedure', label: 'Procedure' },
        { value: 'checkup', label: 'Check-up' },
      ],
    },
    {
      type: 'select',
      name: 'priority',
      label: 'Priority',
      options: [
        { value: 'high', label: 'High' },
        { value: 'normal', label: 'Normal' },
        { value: 'low', label: 'Low' },
      ],
    },
  ];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <CalendarX size={40} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold mb-2 text-gray-900">
        No Appointments Today
      </h3>
      <p className="text-sm text-center mb-6 max-w-sm text-gray-500">
        You don't have any appointments scheduled for today. Enjoy your free
        time!
      </p>
      <button
        onClick={() =>
          navigate(`/${currentUser.role}/appointments`, { replace: true })
        }
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
      >
        <Calendar size={16} />
        View All Appointments
      </button>
    </div>
  );

  const getStatusVariant = status => {
    const statusMap = {
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'primary',
      rescheduled: 'info',
      scheduled: 'warning',
      'checked-in': 'success',
      'no-show': 'danger',
      arrived: 'success',
      'in-progress': 'info',
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

  const handleStartConsultation = appointmentId => {
    console.log('Starting consultation for appointment:', appointmentId);
    alert(`Starting consultation for appointment ${appointmentId}`);
  };

  const handleCallPatient = appointmentId => {
    console.log('Initiating call for appointment:', appointmentId);
    alert(`Initiating video call for appointment ${appointmentId}`);
  };

  const handleViewAppointment = appointmentId => {
    setIsViewAppointModalOpen(true);
    setSelectedAppt(appointmentId);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      from_date: '',
      to_date: '',
      appointment_type: '',
      priority: '',
      search: '',
      appointment_mode: '',
    });
    setCurrentPage(1);
    setLimit(20);
  };

  // ===== Pagination handlers =====
  const handlePageChange = newPage => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = useCallback(newLimit => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const showFilterToggle = () => setShowFilters(!showFilters);

  return (
    <div className="space-y-6 p-4">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, Dr. {docFullName}
            </h1>
            <p className="text-blue-100 mt-2">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <StatsCard
              key={idx}
              title={stat.label}
              value={stat.value}
              change={stat.change}
              icon={<Icon className="h-6 w-6" />}
              color={stat.color}
            />
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
              <header className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg mb-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
                  <div className="min-w-0 flex-shrink">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      My Appointments
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Manage your patient consultations and schedules
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 w-full sm:w-auto flex-shrink-0">
                    <Button
                      variant="outline"
                      icon={Filter}
                      onClick={() => setShowFilters(!showFilters)}
                      className="flex-1 sm:flex-none"
                    >
                      <span className="hidden sm:inline">Filters</span>
                      <span className="sm:hidden">Filter</span>
                      {activeFiltersCount > 0 && (
                        <span className="ml-1 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                          {activeFiltersCount}
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
                {showFilters && (
                  <FilterPanel
                    filters={filters}
                    onFilterChange={setFilters}
                    onClearFilters={handleClearFilters}
                    filterConfig={appointmentFilterConfig}
                    showFilters={showFilters}
                    onToggleFilters={showFilterToggle}
                    searchPlaceholder="Search by patient name, MRN, or reason..."
                    title="Filter Appointments"
                  />
                )}
              </header>
            </div>

            {/* Appointments List */}
            {isLoading ? (
              <LoadingSpinner />
            ) : appointments.length !== 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {appointments.map(apt => {
                  const priorityBadge = getPriorityBadge(apt.priority);
                  const patient = apt?.patient?.person;
                  const fullname = `${patient?.first_name} ${patient?.last_name}`;
                  const age = calculateAge(patient?.date_of_birth);

                  return (
                    <div
                      key={apt.appointment_id}
                      // className={}
                    >
                      <div className="flex items-center justify-between gap-4 flex-wrap p-6">
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
                                {fullname}
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
                              {apt?.patient?.mrn} • {age} years •{' '}
                              {apt.is_online_consultation
                                ? 'Online'
                                : 'In-Person'}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <span
                                className={`flex items-center text-sm ${
                                  darkMode ? 'text-gray-400' : 'text-gray-600'
                                }`}
                              >
                                <Clock size={14} className="mr-1" />
                                {apt.appointment_time}
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
                            {/* Show Start button for in-person appointments with "arrived" status */}
                            {apt.mode === 'in-person' &&
                              apt.status === 'arrived' && (
                                <button
                                  onClick={() =>
                                    handleStartConsultation(apt.appointment_id)
                                  }
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                  <Stethoscope size={16} />
                                  Start
                                </button>
                              )}

                            {/* Show Call button for online appointments with "arrived" status */}
                            {apt.mode === 'online' &&
                              apt.status === 'arrived' && (
                                <button
                                  onClick={() =>
                                    handleCallPatient(apt.appointment_id)
                                  }
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
                                >
                                  <Video size={16} />
                                  Call
                                </button>
                              )}

                            {/* Show mode icon for other statuses */}
                            {apt.status !== 'arrived' &&
                              apt.mode === 'online' && (
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                                  <Video size={16} />
                                </div>
                              )}
                            {apt.status !== 'arrived' &&
                              apt.mode === 'in-person' && (
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                                  <MapPin size={16} />
                                </div>
                              )}

                            <button
                              onClick={() => handleViewAppointment(apt)}
                              className={`p-2 ${
                                darkMode
                                  ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                              } rounded-lg transition-colors`}
                            >
                              <Eye size={16} />
                            </button>
                            {/* <button
                              className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
                            >
                              <MoreVertical
                                size={16}
                                className={
                                  darkMode ? 'text-gray-400' : 'text-gray-500'
                                }
                              />
                            </button> */}
                          </div>
                        </div>
                      </div>

                      <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.totalPages}
                        totalItems={pagination.total}
                        itemsPerPage={limit}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                        className={`p-6 ${
                          darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                        } transition-colors bg-red-400`}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState />
            )}
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
                  onClick={action.functions}
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
      <Modal
        isOpen={isViewAppointModalOpen}
        onClose={() => setIsViewAppointModalOpen(false)}
        title="Appointment Details"
      >
        <AppointmentDetailModal
          isOpen={isViewAppointModalOpen}
          onClose={() => setIsViewAppointModalOpen(false)}
          appointment={selectedAppt}
          currentUser={currentUser}
        />
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
