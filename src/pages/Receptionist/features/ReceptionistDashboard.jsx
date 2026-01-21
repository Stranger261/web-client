import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useAppointment } from '../../../contexts/AppointmentContext';
import { useSchedule } from '../../../contexts/ScheduleContext';
import {
  Activity,
  Calendar,
  DollarSign,
  Filter,
  Users,
  AlertCircle,
  Clock,
  UserPlus,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';
import { COLORS, DEVELOPMENT_BASE_URL } from '../../../configs/CONST';
import StatsCard from '../../../components/ui/stat-card';
import { Button } from '../../../components/ui/button';
import Modal from '../../../components/ui/Modal';
import { FilterPanel } from '../../../components/ui/filter-panel';

import AppointmentDetailModal from '../../../components/Modals/AppointmentDetailModal';
import CreateAppointment from '../../../components/Forms/Appointments/CreateAppointment';
import AppointmentList from '../../../components/shared/AppointmentList';

const ReceptionistDashboard = () => {
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const {
    appointments,
    setAppointments,
    pagination,
    getAppointmentsToday,
    bookUserAppointment,
    isBooking,
  } = useAppointment();

  const {
    departments,
    allDoctors,
    getDepartments,
    getAllDoctors,
    getDoctorAvailability,
    getCombinedSchedule,
    clearSchedules,
    isLoading: scheduleLoading,
  } = useSchedule();

  const [dashboardStats, setDashboardStats] = useState(null);
  const [fetchingStats, setFetchingStats] = useState(false);
  const [patients, setPatients] = useState([]);
  const [searchingPatients, setSearchingPatients] = useState(false);

  const darkMode = document.documentElement.classList.contains('dark');
  const navigate = useNavigate();

  const [isViewAppointModalOpen, setIsViewAppointModalOpen] = useState(false);
  const [isCreateAppointmentModalOpen, setIsCreateAppointmentModalOpen] =
    useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const modalRef = useRef(null);

  // Filter state
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
        { value: 'checked_in', label: 'Checked In' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no_show', label: 'No Show' },
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
        { value: 'urgent', label: 'Urgent' },
        { value: 'normal', label: 'Normal' },
        { value: 'emergency', label: 'Emergency' },
      ],
    },
  ];

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== '',
  ).length;

  // Fetch appointments
  useEffect(() => {
    const fetch = () => {
      const apiFilter = {
        ...filters,
        limit,
        page: currentPage,
      };
      getAppointmentsToday(apiFilter);
    };
    fetch();
    window.addEventListener('refresh-today-appointments', fetch);
    return () =>
      window.removeEventListener('refresh-today-appointments', fetch);
  }, [filters, limit, currentPage]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingStats(true);
        const res = await axios.get(`${DEVELOPMENT_BASE_URL}/dashboard/stats`, {
          withCredentials: true,
          params: {
            role: 'receptionist',
          },
        });

        setDashboardStats(res.data.data);
      } catch (error) {
        console.error('Dashboard stats error:', error);
        toast.error('Failed to fetch dashboard statistics');
        // Set fallback stats
        setDashboardStats({
          totalPatients: 0,
          activePatients: 0,
          newPatientsToday: 0,
          todaysOverview: {
            appointments: 0,
            revenue: 0,
            waitingPatients: 0,
          },
          financial: {
            weeklyRevenue: 0,
          },
          breakdown: {
            appointmentTypes: {},
          },
        });
      } finally {
        setFetchingStats(false);
      }
    };

    fetchData();
  }, []);

  // live update and notif on patient arrive
  useEffect(() => {
    if (!socket || !isConnected) return;

    const statusChangeHandler = data => {
      toast(`Patient: ${data.patientName} ${data.status}`, { icon: <Info /> });
      setAppointments(prevAppointments =>
        prevAppointments.map(appt =>
          appt.appointment_id === data.appointmentId
            ? { ...appt, status: data.status }
            : appt,
        ),
      );
    };
    socket.on('patient-arrived', statusChangeHandler);
    socket.on('patient-status_changed', statusChangeHandler);

    return () => {
      socket.off('patient-status_changed', statusChangeHandler);
      socket.off('patient-arrived', statusChangeHandler);
    };
  }, [socket, isConnected]);

  // Initialize schedule data
  useEffect(() => {
    if (isCreateAppointmentModalOpen) {
      getDepartments();
      getAllDoctors();
    }
  }, [isCreateAppointmentModalOpen]);

  // Search patients function for CreateAppointment component
  const handleSearchPatients = async searchTerm => {
    try {
      setSearchingPatients(true);
      const response = await axios.get(
        `${DEVELOPMENT_BASE_URL}/patients/search`,
        {
          withCredentials: true,
          params: { search: searchTerm },
        },
      );
      setPatients(response.data.data || []);
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Failed to search patients');
    } finally {
      setSearchingPatients(false);
    }
  };

  // Handle appointment creation for receptionist
  const handleCreateAppointment = async payload => {
    try {
      // Use the same booking function but with receptionist context
      const response = await bookUserAppointment({
        ...payload,
        created_by: currentUser?.id,
        created_by_type: 'staff',
      });

      // Refresh appointments list
      getAppointmentsToday({
        ...filters,
        limit,
        page: currentPage,
      });

      toast.success('Appointment created successfully!');
      return response;
    } catch (error) {
      throw new Error(error.message || 'Failed to create appointment');
    }
  };

  // Format currency
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Format percentage
  const formatPercentage = value => {
    return `${Math.round(value || 0)}%`;
  };

  // Calculate completion rate
  const calculateCompletionRate = () => {
    if (!dashboardStats?.todaysOverview?.appointments) return 0;

    const waiting = dashboardStats.todaysOverview?.waitingPatients || 0;
    const total = dashboardStats.todaysOverview?.appointments || 0;

    if (total === 0) return 0;
    const completed = total - waiting;
    return (completed / total) * 100;
  };

  // Calculate appointment trend
  const calculateAppointmentTrend = () => {
    const todayAppointments = dashboardStats?.todaysOverview?.appointments || 0;
    return todayAppointments > 10 ? 15 : todayAppointments > 5 ? 5 : 0;
  };

  // Stats data
  const stats = dashboardStats
    ? [
        {
          label: 'Total Patients',
          value: (dashboardStats.totalPatients || 0).toLocaleString(),
          change: `+${dashboardStats.newPatientsToday || 0} new today`,
          trend: dashboardStats.newPatientsToday > 0 ? 'up' : 'neutral',
          icon: Users,
          color: 'info',
          tooltip: `Total registered patients: ${
            dashboardStats.totalPatients || 0
          }\nActive patients: ${
            dashboardStats.activePatients || 0
          }\nNew today: ${dashboardStats.newPatientsToday || 0}`,
        },
        {
          label: "Today's Appointments",
          value: (
            dashboardStats.todaysOverview?.appointments || 0
          ).toLocaleString(),
          change: `${
            dashboardStats.todaysOverview?.waitingPatients || 0
          } waiting`,
          trend:
            calculateAppointmentTrend() > 0
              ? 'up'
              : calculateAppointmentTrend() < 0
                ? 'down'
                : 'neutral',
          icon: Calendar,
          color: 'warning',
          tooltip: `Total appointments today: ${
            dashboardStats.todaysOverview?.appointments || 0
          }\nPatients waiting: ${
            dashboardStats.todaysOverview?.waitingPatients || 0
          }`,
        },
        {
          label: "Today's Revenue",
          value: formatCurrency(dashboardStats.todaysOverview?.revenue || 0),
          change: `Weekly: ${formatCurrency(
            dashboardStats.financial?.weeklyRevenue || 0,
          )}`,
          trend: dashboardStats.todaysOverview?.revenue > 0 ? 'up' : 'neutral',
          icon: DollarSign,
          color: 'success',
          tooltip: `Revenue today: ${formatCurrency(
            dashboardStats.todaysOverview?.revenue || 0,
          )}\nWeekly revenue: ${formatCurrency(
            dashboardStats.financial?.weeklyRevenue || 0,
          )}`,
        },
        {
          label: 'Completion Rate',
          value: formatPercentage(calculateCompletionRate()),
          change: `Processing efficiency`,
          trend:
            calculateCompletionRate() > 70
              ? 'up'
              : calculateCompletionRate() > 50
                ? 'neutral'
                : 'down',
          icon: Activity,
          color: 'accent',
          tooltip: `Today's completion rate: ${formatPercentage(
            calculateCompletionRate(),
          )}\nBased on ${
            dashboardStats.todaysOverview?.appointments || 0
          } total appointments`,
        },
      ]
    : [];

  // Loading stats
  const loadingStats = [
    {
      label: 'Total Patients',
      value: '0',
      change: 'Loading...',
      trend: 'neutral',
      icon: Users,
      color: 'info',
    },
    {
      label: "Today's Appointments",
      value: '0',
      change: 'Loading...',
      trend: 'neutral',
      icon: Calendar,
      color: 'warning',
    },
    {
      label: "Today's Revenue",
      value: '₱0',
      change: 'Loading...',
      trend: 'neutral',
      icon: DollarSign,
      color: 'success',
    },
    {
      label: 'Completion Rate',
      value: '0%',
      change: 'Loading...',
      trend: 'neutral',
      icon: Activity,
      color: 'accent',
    },
  ];

  // Appointment type breakdown for chart
  const appointmentTypes = dashboardStats?.breakdown?.appointmentTypes || {};

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
      functions: () => {
        setIsCreateAppointmentModalOpen(true);
      },
    },
    {
      icon: Users,
      label: 'Patient Registry',
      color: 'purple',
      functions: () => navigate('/receptionist/patients'),
    },
    {
      icon: Clock,
      label: 'Check-in Queue',
      color: 'orange',
      functions: () => navigate('/receptionist/checkin'),
    },
    {
      icon: DollarSign,
      label: 'Billing & Payments',
      color: 'blue',
      functions: () => navigate('/receptionist/billing'),
    },
    {
      icon: UserPlus,
      label: 'Register Patient',
      color: 'red',
      functions: () => navigate('/receptionist/patients/new'),
    },
    {
      icon: AlertCircle,
      label: 'Pending Tasks',
      color: 'yellow',
      functions: () => navigate('/receptionist/tasks'),
    },
  ];

  // MODALS
  const handleViewAppointment = appointmentId => {
    setIsViewAppointModalOpen(true);
    setSelectedAppt(appointmentId);
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

  // filters
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

  return (
    <div className="space-y-6 p-4">
      {/* Appointment Detail Modal */}
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

      {/* Create Appointment Modal */}
      <Modal
        isOpen={isCreateAppointmentModalOpen}
        onClose={() => setIsCreateAppointmentModalOpen(false)}
        title="Create Appointment"
        modalRef={modalRef}
      >
        <CreateAppointment
          userRole="receptionist"
          departments={departments}
          allDoctors={allDoctors}
          patients={patients}
          isLoading={scheduleLoading}
          isSubmitting={isBooking}
          onSubmit={handleCreateAppointment}
          onClose={() => setIsCreateAppointmentModalOpen(false)}
          onSearchPatients={handleSearchPatients}
          onGetDepartments={getDepartments}
          onGetAllDoctors={getAllDoctors}
          onGetDoctorAvailability={getDoctorAvailability}
          onGetCombinedSchedule={getCombinedSchedule}
          onClearSchedules={clearSchedules}
          socket={socket}
          isConnected={isConnected}
          modalRef={modalRef}
        />
      </Modal>

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {currentUser?.person?.first_name}{' '}
              {currentUser?.person?.last_name}
            </h1>
            <p className="mt-2 opacity-90">
              {fetchingStats
                ? 'Loading dashboard statistics...'
                : dashboardStats
                  ? `Today's summary: ${
                      dashboardStats.todaysOverview?.appointments || 0
                    } appointments, ${formatCurrency(
                      dashboardStats.todaysOverview?.revenue || 0,
                    )} revenue`
                  : 'Dashboard summary'}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-sm">
              <div
                className={`h-2 w-2 rounded-full ${
                  isConnected ? 'bg-green-400' : 'bg-red-400'
                }`}
              />
              <span>
                {isConnected ? 'Live updates connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {fetchingStats
          ? loadingStats.map((stat, idx) => (
              <StatsCard
                key={idx}
                title={stat.label}
                value={stat.value}
                change={stat.change}
                icon={<stat.icon className="h-6 w-6" />}
                color={stat.color}
                loading={true}
              />
            ))
          : stats.map((stat, idx) => (
              <StatsCard
                key={idx}
                title={stat.label}
                value={stat.value}
                change={stat.change}
                icon={<stat.icon className="h-6 w-6" />}
                color={stat.color}
                tooltip={stat.tooltip}
              />
            ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <header className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg mb-4 overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
                  <div className="min-w-0 flex-shrink">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      Today's Appointments
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Manage patient consultations and schedules for{' '}
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                      })}
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
            <AppointmentList
              isLoading={searchingPatients}
              appointments={appointments}
              currentPage={currentPage}
              pagination={pagination}
              limit={limit}
              darkMode={darkMode}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onViewAppointment={handleViewAppointment}
              userRole={currentUser?.role}
              showPagination={true}
            />
          </div>

          {/* Appointment Type Breakdown */}
          {Object.keys(appointmentTypes).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Today's Appointment Types
              </h3>
              <div className="space-y-3">
                {Object.entries(appointmentTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-gray-700 dark:text-gray-300 capitalize">
                        {type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {count}
                      </span>
                      <span className="text-sm text-gray-500">
                        (
                        {Math.round(
                          (count /
                            dashboardStats.todaysOverview?.appointments) *
                            100,
                        )}
                        %)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Quick Actions
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Common tasks
            </p>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.functions}
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                >
                  <div
                    className={`p-3 rounded-lg mb-2 ${
                      action.color === 'green'
                        ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : action.color === 'purple'
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : action.color === 'orange'
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            : action.color === 'blue'
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : action.color === 'red'
                                ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                : 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    }`}
                  >
                    <action.icon size={20} />
                  </div>
                  <span className="text-sm font-medium text-center text-gray-700 dark:text-gray-300">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Alerts Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Alerts & Notifications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Important notices
                </p>
              </div>
              <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                3 New
              </div>
            </div>
            <div className="space-y-3">
              {alerts.map(alert => {
                const alertColors = {
                  critical: {
                    bg: darkMode ? '#7f1d1d' : '#fee2e2',
                    text: darkMode ? '#fca5a5' : '#dc2626',
                    icon: COLORS.danger,
                  },
                  warning: {
                    bg: darkMode ? '#713f12' : '#fef3c7',
                    text: darkMode ? '#fbbf24' : '#d97706',
                    icon: COLORS.warning,
                  },
                  info: {
                    bg: darkMode ? '#1e3a8a' : '#dbeafe',
                    text: darkMode ? '#93c5fd' : '#2563eb',
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
                        color={alertColor.text}
                        className="flex-shrink-0 mt-0.5"
                      />
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{ color: alertColor.text }}
                        >
                          {alert.message}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {alert.time}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button className="w-full mt-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors">
              View All Alerts
            </button>
          </div>

          {/* Daily Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Daily Summary
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Patient Flow
                  </span>
                  <div className="flex items-center gap-1">
                    {dashboardStats?.newPatientsToday > 0 ? (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 dark:text-green-400 text-sm">
                          +{dashboardStats.newPatientsToday}
                        </span>
                      </>
                    ) : (
                      <>
                        <TrendingDown className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          No new
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        (dashboardStats?.newPatientsToday || 0) * 10,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Patients
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.activePatients || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Waiting Now
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {dashboardStats?.todaysOverview?.waitingPatients || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
