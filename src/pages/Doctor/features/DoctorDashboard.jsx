import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axios from 'axios';

import { useSocket } from '../../../contexts/SocketContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useAppointment } from '../../../contexts/AppointmentContext';

import {
  Calendar,
  Users,
  Clock,
  Activity,
  Filter,
  FileText,
  Pill,
  TrendingUp,
  TrendingDown,
  Info,
} from 'lucide-react';

import { DEVELOPMENT_BASE_URL } from '../../../configs/CONST';

import AppointmentDetailModal from '../../../components/Modals/AppointmentDetailModal';

import { FilterPanel } from '../../../components/ui/filter-panel';
import { Button } from '../../../components/ui/button';
import StatsCard from '../../../components/ui/stat-card';
import Modal from '../../../components/ui/Modal';
import AppointmentList from '../../../components/shared/AppointmentList';
import DoctorConsultationModal from '../components/Appointment/consultation/DoctorConsultationModal';

const DoctorDashboard = () => {
  const { currentUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const {
    isLoading,
    appointments,
    setAppointments,
    pagination,
    getAppointmentsToday,
    updateAppointmentStatus,
  } = useAppointment();

  const navigate = useNavigate();
  const darkMode = document.documentElement.classList.contains('dark');
  const docFullName = `${currentUser?.person?.first_name} ${currentUser?.person?.last_name}`;

  // stats
  const [dashboardStats, setDashboardStats] = useState([]);

  const [isViewAppointModalOpen, setIsViewAppointModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [fetchingStats, setFetchingStats] = useState(false);

  // consultation
  const [isConsultationModalOpen, setIsConsultationModalOpen] = useState(false);

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
    v => v !== '',
  ).length;

  useEffect(() => {
    const fetch = () => {
      const apiFilter = {
        ...filters,
        limit,
        page: currentPage,
        doctor_uuid: currentUser?.staff?.staff_uuid,
      };

      getAppointmentsToday(apiFilter);
    };

    fetch();

    window.addEventListener('refresh-today-appointments', fetch);
    return () =>
      window.removeEventListener('refresh-today-appointments', fetch);
  }, [filters, limit, currentPage, currentUser]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingStats(true);
        const res = await axios.get(`${DEVELOPMENT_BASE_URL}/dashboard/stats`, {
          withCredentials: true,
        });
        setDashboardStats(res.data.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard statistics');
        console.error('Dashboard stats error:', error.message);
      } finally {
        setFetchingStats(false);
      }
    };

    if (currentUser?.staff?.staff_uuid) {
      fetchData();
    }
  }, [currentUser?.staff?.staff_uuid]);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const statusChangeHandler = data => {
      toast(`Patient: ${data.patientName} ${data.status}`, {
        icon: <Info />,
        duration: 3000,
      });
      setAppointments(prevAppointments =>
        prevAppointments.map(appt =>
          appt.appointment_id === data.appointmentId
            ? { ...appt, status: data.status }
            : appt,
        ),
      );
    };

    socket.on('patient-status_changed', statusChangeHandler);
    socket.on('patient-arrived', statusChangeHandler);

    return () => {
      socket.off('patient-status_changed', statusChangeHandler);
      socket.off('patient-arrived', statusChangeHandler);
    };
  }, [socket, isConnected]);

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

  // Get trend icon
  const getTrendIcon = value => {
    if (value > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (value < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <div className="h-4 w-4 text-gray-400">–</div>;
  };

  // Get trend color
  const getTrendColor = value => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Format next appointment time
  const formatNextAppointmentTime = minutesFromNow => {
    if (!minutesFromNow) return 'No upcoming appointments';
    if (minutesFromNow <= 0) return 'Starting now';
    if (minutesFromNow < 60) return `In ${minutesFromNow} minutes`;
    const hours = Math.floor(minutesFromNow / 60);
    const mins = minutesFromNow % 60;
    return `In ${hours}h ${mins}m`;
  };

  // Stats data for doctor based on new structure
  // In DoctorDashboard.jsx - Updated stats array
  const stats = dashboardStats
    ? [
        {
          label: 'Patients Under Care',
          value: (
            dashboardStats.patientPanel?.totalUnderCare || 0
          ).toLocaleString(),
          change: `↑ ${
            dashboardStats.patientPanel?.patientTrend || 0
          }% from last week`,
          trend:
            dashboardStats.patientPanel?.patientTrend > 0
              ? 'up'
              : dashboardStats.patientPanel?.patientTrend < 0
                ? 'down'
                : 'neutral',
          icon: Users,
          color: 'info',
          tooltip: `Total patients in your care: ${
            dashboardStats.patientPanel?.totalUnderCare || 0
          }\nTrend vs last week: ${
            dashboardStats.patientPanel?.patientTrend > 0 ? '+' : ''
          }${dashboardStats.patientPanel?.patientTrend || 0}%`,
        },
        {
          label: "Today's Appointments",
          value: (dashboardStats.todaysOverview?.total || 0).toLocaleString(),
          change: `${
            dashboardStats.todaysOverview?.appointmentTrend > 0 ? '↑' : '↓'
          } ${Math.abs(
            dashboardStats.todaysOverview?.appointmentTrend || 0,
          )}% vs yesterday`,
          trend:
            dashboardStats.todaysOverview?.appointmentTrend > 0
              ? 'up'
              : dashboardStats.todaysOverview?.appointmentTrend < 0
                ? 'down'
                : 'neutral',
          icon: Calendar,
          color: 'warning',
          tooltip: `Total today: ${
            dashboardStats.todaysOverview?.total || 0
          }\nChange vs yesterday: ${
            dashboardStats.todaysOverview?.appointmentTrend > 0 ? '+' : ''
          }${
            dashboardStats.todaysOverview?.appointmentTrend || 0
          }%\nRevenue today: ${formatCurrency(
            dashboardStats.todaysOverview?.revenue || 0,
          )}`,
        },
        {
          label: 'Avg. Duration',
          value: `${
            dashboardStats.performance?.avgConsultationDuration || 0
          } min`,
          change: `${
            dashboardStats.performance?.durationTrend > 0 ? '↑' : '↓'
          } ${Math.abs(
            dashboardStats.performance?.durationTrend || 0,
          )}% from last month`,
          trend:
            dashboardStats.performance?.durationTrend < 0
              ? 'up' // Lower duration is better
              : dashboardStats.performance?.durationTrend > 0
                ? 'down'
                : 'neutral',
          icon: Clock,
          color: 'success',
          tooltip: `Average consultation duration: ${
            dashboardStats.performance?.avgConsultationDuration || 0
          } min\nTrend vs last month: ${
            dashboardStats.performance?.durationTrend > 0 ? '+' : ''
          }${
            dashboardStats.performance?.durationTrend || 0
          }%\n(Lower is better)`,
        },
        {
          label: 'Monthly Completion',
          value: formatPercentage(
            dashboardStats.performance?.monthlyCompletionRate || 0,
          ),
          change: `${
            dashboardStats.performance?.monthlyCompletionTrend > 0 ? '↑' : '↓'
          } ${Math.abs(
            dashboardStats.performance?.monthlyCompletionTrend || 0,
          )}% from last month`,
          trend:
            dashboardStats.performance?.monthlyCompletionTrend > 0
              ? 'up'
              : dashboardStats.performance?.monthlyCompletionTrend < 0
                ? 'down'
                : 'neutral',
          icon: Activity,
          color: 'accent',
          tooltip: `Monthly completion rate: ${formatPercentage(
            dashboardStats.performance?.monthlyCompletionRate || 0,
          )}\nTrend vs last month: ${
            dashboardStats.performance?.monthlyCompletionTrend > 0 ? '+' : ''
          }${dashboardStats.performance?.monthlyCompletionTrend || 0}%`,
        },
      ]
    : [];

  // Current appointment info
  const currentAppointment = dashboardStats?.todaysOverview?.currentAppointment;
  const nextAppointment = dashboardStats?.todaysOverview?.nextAppointment;

  // Pending tasks
  const pendingTasks = dashboardStats?.pendingTasks;

  // Loading stats
  const loadingStats = [
    {
      label: 'Patients Under Care',
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
      label: 'Avg. Duration',
      value: '0 min',
      change: 'Loading...',
      trend: 'neutral',
      icon: Clock,
      color: 'success',
    },
    {
      label: 'Monthly Completion',
      value: '0%',
      change: 'Loading...',
      trend: 'neutral',
      icon: Activity,
      color: 'accent',
    },
  ];

  const quickActions = [
    {
      icon: Calendar,
      label: 'New Appointment',
      color: 'green',
      functions: () => navigate('/doctor/appointments/new'),
    },
    {
      icon: Users,
      label: 'My Patients',
      color: 'purple',
      functions: () => navigate('/doctor/my-patients'),
    },
    {
      icon: FileText,
      label: 'Lab Results',
      color: 'orange',
      functions: () => navigate('/doctor/lab-results'),
    },
    {
      icon: Pill,
      label: 'Prescriptions',
      color: 'blue',
      functions: () => navigate('/doctor/prescriptions'),
    },
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

  const handleStartConsultation = async appointment => {
    try {
      if (appointment.status === 'checked_in') {
        await updateAppointmentStatus(
          appointment.appointment_id,
          'in_progress',
        );

        toast.success('Appointment is in progress');
      }

      setIsConsultationModalOpen(true);
      setSelectedAppt(appointment);
    } catch (error) {
      console.log('Failed to start appointmetn: ', error.message);
      toast.error('Failed to start appointment');
    }
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

  const handleSaveRemarks = async data => {
    // await api.updateAppointmentRemarks(data);
    // Refresh appointments list
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

  // Handle start current consultation
  const handleStartCurrentConsultation = appt => {
    setIsConsultationModalOpen(true);
    setSelectedAppt(appt);
  };

  // Handle view next appointment
  const handleViewNextAppointment = () => {
    if (nextAppointment) {
      setIsViewAppointModalOpen(true);
      setSelectedAppt(nextAppointment.appointmentId);
    }
  };

  return (
    <div className="space-y-6 p-4">
      <DoctorConsultationModal
        isOpen={isConsultationModalOpen}
        onClose={() => setIsConsultationModalOpen(false)}
        appointment={selectedAppt}
      />

      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, Dr. {docFullName}
            </h1>
            <p className="mt-2 opacity-90">
              {fetchingStats
                ? 'Loading dashboard statistics...'
                : dashboardStats
                  ? `Today's summary: ${
                      dashboardStats.todaysOverview?.total || 0
                    } appointments, ${formatPercentage(
                      dashboardStats.todaysOverview?.completionRate || 0,
                    )} completion rate`
                  : 'Dashboard summary'}
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-4">
            {currentAppointment && (
              <Button
                onClick={handleStartCurrentConsultation}
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold"
              >
                Start Current Consultation
              </Button>
            )}
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
      {/* Current & Next Appointment Banner */}
      {(currentAppointment || nextAppointment) && (
        <div
          className={`${
            darkMode ? 'bg-gray-800' : 'bg-white'
          } rounded-xl border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          } shadow-sm p-6`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Appointment */}
            {currentAppointment && (
              <div
                className={`${
                  darkMode ? 'bg-gray-700' : 'bg-blue-50'
                } rounded-lg p-4 border ${
                  darkMode ? 'border-gray-600' : 'border-blue-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Current Consultation
                  </h3>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-semibold rounded-full">
                    IN PROGRESS
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {currentAppointment.patientName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {currentAppointment.type} • Started at{' '}
                  {new Date(currentAppointment.time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <Button
                  onClick={handleStartCurrentConsultation}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Continue Consultation
                </Button>
              </div>
            )}

            {/* Next Appointment */}
            {nextAppointment && (
              <div
                className={`${
                  darkMode ? 'bg-gray-700' : 'bg-green-50'
                } rounded-lg p-4 border ${
                  darkMode ? 'border-gray-600' : 'border-green-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Next Appointment
                  </h3>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
                    UPCOMING
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {nextAppointment.patientName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {nextAppointment.type} •{' '}
                  {new Date(nextAppointment.time).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-3">
                  {formatNextAppointmentTime(nextAppointment.minutesFromNow)}
                </p>
                <Button
                  onClick={handleViewNextAppointment}
                  variant="outline"
                  className="w-full border-green-300 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/30"
                >
                  View Details
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

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
                      Today's Appointments
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Manage your patient consultations for{' '}
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
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
              isLoading={isLoading}
              appointments={appointments}
              currentPage={currentPage}
              pagination={pagination}
              limit={limit}
              darkMode={darkMode}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              onViewAppointment={handleViewAppointment}
              onStartConsultation={handleStartConsultation}
              onCallPatient={handleCallPatient}
              onStartAppointment={handleStartConsultation}
              userRole={currentUser?.role}
              showPagination={true}
            />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Pending Tasks Card */}
          <div
            className={`${
              darkMode
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-200'
            } rounded-xl border shadow-sm p-6`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  } mb-1`}
                >
                  Pending Tasks
                </h3>
                <p
                  className={`text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-500'
                  }`}
                >
                  Require your attention
                </p>
              </div>
              {pendingTasks &&
                (pendingTasks.labResults > 0 ||
                  pendingTasks.prescriptions > 0) && (
                  <div className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-semibold rounded-full">
                    {pendingTasks.labResults + pendingTasks.prescriptions}{' '}
                    Urgent
                  </div>
                )}
            </div>

            <div className="space-y-3">
              {/* Lab Results */}
              <div
                className={`flex items-center justify-between p-3 rounded-lg ${
                  pendingTasks?.labResults > 0
                    ? 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      pendingTasks?.labResults > 0
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <FileText size={18} />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Lab Results
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pending review
                    </p>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    pendingTasks?.labResults > 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {pendingTasks?.labResults || 0}
                </div>
              </div>

              {/* Prescriptions */}
              <div
                className={`flex items-center justify-between p-3 rounded-lg ${
                  pendingTasks?.prescriptions > 0
                    ? 'bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500'
                    : 'bg-gray-50 dark:bg-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      pendingTasks?.prescriptions > 0
                        ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    <Pill size={18} />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}
                    >
                      Prescriptions
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pending approval
                    </p>
                  </div>
                </div>
                <div
                  className={`text-lg font-bold ${
                    pendingTasks?.prescriptions > 0
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {pendingTasks?.prescriptions || 0}
                </div>
              </div>
            </div>

            {(pendingTasks?.labResults > 0 ||
              pendingTasks?.prescriptions > 0) && (
              <button
                onClick={() => navigate('/doctor/tasks')}
                className={`w-full mt-4 py-2 text-sm font-medium rounded-lg ${
                  darkMode
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors`}
              >
                Review All Tasks
              </button>
            )}
          </div>

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
                        : action.color === 'purple'
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                          : action.color === 'orange'
                            ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                            : action.color === 'blue'
                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                              : 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
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

          {/* Performance Summary */}
          {dashboardStats && (
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
                } mb-4`}
              >
                Performance Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Monthly Completion Rate
                    </span>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(
                        dashboardStats.performance?.monthlyTrendPercentage || 0,
                      )}
                      <span
                        className={getTrendColor(
                          dashboardStats.performance?.monthlyTrendPercentage ||
                            0,
                        )}
                      >
                        {dashboardStats.performance?.monthlyTrendPercentage > 0
                          ? '+'
                          : ''}
                        {dashboardStats.performance?.monthlyTrendPercentage ||
                          0}
                        %
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{
                        width: `${
                          dashboardStats.performance?.monthlyCompletionRate || 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0%</span>
                    <span>
                      {formatPercentage(
                        dashboardStats.performance?.monthlyCompletionRate || 0,
                      )}
                    </span>
                    <span>100%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Avg. Duration
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dashboardStats.performance?.avgConsultationDuration || 0}{' '}
                      min
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-sm ${
                        darkMode ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      Patients This Week
                    </p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {dashboardStats.patientPanel?.seenThisWeek || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
