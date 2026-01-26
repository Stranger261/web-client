import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Calendar,
  AlertCircle,
  FileText,
  Pill,
  Download,
  User,
  Phone,
  Mail,
  Activity,
  Heart,
  Weight,
  Droplets,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Video,
  CheckCircle,
  DollarSign,
  Info,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { useAuth } from '../../../contexts/AuthContext';
import { useAppointment } from '../../../contexts/AppointmentContext';
import { useSchedule } from '../../../contexts/ScheduleContext';
import { toast } from 'react-hot-toast';

// Import reusable components
import { Button } from '../../../components/ui/button';
import StatsCard from '../../../components/ui/stat-card';
import Card, { CardHeader, CardBody } from '../../../components/ui/card';
import Badge from '../../../components/ui/badge';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';

import AppointmentList from '../../../components/shared/AppointmentList';

import AppointmentDetailModal from '../../../components/Modals/AppointmentDetailModal';

import CreateAppointment from '../../../components/Forms/Appointments/CreateAppointment';
import Modal from '../../../components/ui/Modal';

import { DEVELOPMENT_BASE_URL } from '../../../configs/CONST';
import { useSocket } from '../../../contexts/SocketContext';

const PatientDashboard = () => {
  const darkMode = document.documentElement.classList.contains('dark');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { getAppointmentsToday, isBooking, bookUserAppointment } =
    useAppointment();
  const { socket, isConnected } = useSocket();

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

  // create appt modal
  const [isCreateAppointmentModalOpen, setIsCreateAppointmentModalOpen] =
    useState(false);
  const modalRef = useRef(null);

  const [appointments, setAppointments] = useState([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingStats, setFetchingStats] = useState(false);

  // stats
  const [dashboardStats, setDashboardStats] = useState([]);

  // Fetch dashboard stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchingStats(true);
        const res = await axios.get(`${DEVELOPMENT_BASE_URL}/dashboard/stats`, {
          withCredentials: true,
          params: {
            role: 'patient',
            user_uuid: currentUser.patient_uuid,
          },
        });
        setDashboardStats(res.data.data);
      } catch (error) {
        toast.error('Failed to fetch dashboard statistics');
        console.error('Dashboard stats error:', error);
      } finally {
        setFetchingStats(false);
      }
    };

    // initialize
    fetchData();
    {
      currentUser?.patient?.patient_uuid && getPatientAppointments();
    }
  }, [currentUser]);

  const getPatientAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${DEVELOPMENT_BASE_URL}/dashboard/upcoming`,
        { withCredentials: true },
      );

      setAppointments(res.data.data.todaysAppointments);
      setUpcomingAppointments(res.data.data.upcomingAppointments);
    } catch (error) {
      toast.error('Failed to fetch upcoming appointments');
      console.error('Upcoming appointments error error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const statusChangeHandler = data => {
      if (currentUser?.user_uuid !== data.userUuid) return;
      toast('Marked as arrived', {
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

  // Initialize schedule data
  useEffect(() => {
    if (isCreateAppointmentModalOpen) {
      getDepartments();
      getAllDoctors();
    }
  }, [isCreateAppointmentModalOpen]);

  // Format currency
  const formatCurrency = amount => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Patient Stats Data
  const stats = dashboardStats
    ? [
        {
          label: 'Upcoming Appointments',
          value: (dashboardStats.appointments || 0).toString(),
          change: 'Next appointment in schedule',
          trend: 'neutral',
          icon: Calendar,
          color: 'info',
          tooltip: `Total upcoming appointments: ${
            dashboardStats.appointments || 0
          }`,
        },
        {
          label: 'Active Prescriptions',
          value: (dashboardStats.pendingPrescriptions || 0).toString(),
          change: 'Requiring attention',
          trend: dashboardStats.pendingPrescriptions > 0 ? 'down' : 'neutral',
          icon: Pill,
          color: 'warning',
          tooltip: `Active prescriptions: ${
            dashboardStats.pendingPrescriptions || 0
          }\nNext refill due soon`,
        },
        {
          label: 'Recent Lab Results',
          value: (dashboardStats.recentLabResults || 0).toString(),
          change: 'Last 30 days',
          trend: dashboardStats.recentLabResults > 0 ? 'up' : 'neutral',
          icon: FileCheck,
          color: 'success',
          tooltip: `Lab results from last 30 days: ${
            dashboardStats.recentLabResults || 0
          }\nAvailable for review`,
        },
        {
          label: 'Outstanding Balance',
          value: formatCurrency(dashboardStats.outstandingBills || 0),
          change: 'Total unpaid',
          trend: dashboardStats.outstandingBills > 0 ? 'down' : 'neutral',
          icon: DollarSign,
          color: 'danger',
          tooltip: `Outstanding balance: ${formatCurrency(
            dashboardStats.outstandingBills || 0,
          )}\nPayment due soon`,
        },
      ]
    : [];

  const loadingStats = [
    {
      label: 'Upcoming Appointments',
      value: '0',
      change: 'Loading...',
      trend: 'neutral',
      icon: Calendar,
      color: 'info',
    },
    {
      label: 'Active Prescriptions',
      value: '0',
      change: 'Loading...',
      trend: 'neutral',
      icon: Pill,
      color: 'warning',
    },
    {
      label: 'Recent Lab Results',
      value: '0',
      change: 'Loading...',
      trend: 'neutral',
      icon: FileCheck,
      color: 'success',
    },
    {
      label: 'Outstanding Balance',
      value: 'PHP 0',
      change: 'Loading...',
      trend: 'neutral',
      icon: DollarSign,
      color: 'danger',
    },
  ];

  // Mock data (you can replace these with actual data from your backend)
  const [announcements, setAnnouncements] = useState([
    {
      id: '1',
      title: 'Telemedicine Now Available',
      message: 'Schedule virtual consultations with your doctor from home.',
      date: '2024-01-10',
      type: 'success',
    },
    {
      id: '2',
      title: 'Flu Shot Reminder',
      message: 'Your annual flu shot is due. Schedule an appointment.',
      date: '2024-01-08',
      type: 'warning',
    },
    {
      id: '3',
      title: 'Prescription Ready',
      message: 'Your prescription refill is ready for pickup.',
      date: '2024-01-05',
      type: 'success',
    },
  ]);

  const [healthMetrics, setHealthMetrics] = useState([
    {
      title: 'Blood Pressure',
      value: '120/80',
      status: 'normal',
      icon: <Activity className="h-5 w-5" />,
      color: 'green',
      trend: 'stable',
      lastCheck: '2 days ago',
    },
    {
      title: 'Heart Rate',
      value: '72 bpm',
      status: 'normal',
      icon: <Heart className="h-5 w-5" />,
      color: 'green',
      trend: 'improving',
      lastCheck: '1 day ago',
    },
    {
      title: 'Weight',
      value: '75 kg',
      status: 'healthy',
      icon: <Weight className="h-5 w-5" />,
      color: 'blue',
      trend: 'stable',
      lastCheck: '1 week ago',
    },
    {
      title: 'Blood Sugar',
      value: '98 mg/dL',
      status: 'normal',
      icon: <Droplets className="h-5 w-5" />,
      color: 'green',
      trend: 'improving',
      lastCheck: '3 days ago',
    },
  ]);

  const [prescriptions, setPrescriptions] = useState([
    {
      id: '1',
      name: 'Atorvastatin',
      dosage: '20mg',
      frequency: 'Once daily',
      remaining: '15 days',
      status: 'active',
      refills: 2,
    },
    {
      id: '2',
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      remaining: '7 days',
      status: 'active',
      refills: 1,
    },
    {
      id: '3',
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      remaining: '30 days',
      status: 'active',
      refills: 3,
    },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: '1',
      type: 'lab_result',
      title: 'Blood Test Results',
      date: 'Today, 9:30 AM',
      status: 'available',
      action: 'view',
    },
    {
      id: '2',
      type: 'prescription',
      title: 'Prescription Refilled',
      date: 'Yesterday, 2:15 PM',
      status: 'completed',
      action: 'details',
    },
    {
      id: '3',
      type: 'appointment',
      title: 'Cardiology Follow-up',
      date: 'Jan 5, 10:00 AM',
      status: 'completed',
      action: 'summary',
    },
  ]);

  const quickActions = [
    {
      icon: Calendar,
      label: 'Book Appointment',
      color: 'blue',
      method: () => setIsCreateAppointmentModalOpen(true),
    },
    {
      icon: Video,
      label: 'Video Consult',
      color: 'purple',
      method: () => navigate('/patient/video-call', { replace: true }),
    },
    {
      icon: Pill,
      label: 'Refill Prescription',
      color: 'green',
      method: () => navigate('/patient/prescriptions'),
    },
    {
      icon: FileText,
      label: 'View Records',
      color: 'orange',
      method: () => navigate('/patient/my-medical-history', { replace: true }),
    },
    {
      icon: FileCheck,
      label: 'Lab Results',
      color: 'red',
      method: () => navigate('/patient/lab-results'),
    },
    {
      icon: Download,
      label: 'Health Summary',
      color: 'blue',
      method: () => navigate('/patient/health-summary'),
    },
  ];

  const getStatusVariant = status => {
    const variants = {
      confirmed: 'success',
      pending: 'warning',
      cancelled: 'danger',
      normal: 'success',
      healthy: 'success',
      active: 'success',
      available: 'success',
      completed: 'success',
    };
    return variants[status] || 'default';
  };

  const handleViewRecords = appt => {
    setIsViewModalOpen(true);
    setSelectedAppt(appt);
  };

  const handleCloseModal = () => {
    setIsViewModalOpen(false);
    setSelectedAppt(null);
  };

  const handleCreateAppointment = async payload => {
    try {
      const patientUuid = currentUser?.patient?.patient_uuid;
      if (!patientUuid) return;
      // Use the same booking function but with receptionist context
      const response = await bookUserAppointment({
        ...payload,
        created_by: currentUser?.id,
        created_by_type: 'staff',
      });

      // Refresh appointments list
      getAppointmentsToday({
        patient_uuid: patientUuid,
      });

      getPatientAppointments();

      toast.success('Appointment created successfully!');
      return response;
    } catch (error) {
      const errMsg = error?.response?.data?.message;
      throw new Error(errMsg || 'Failed to create appointment');
    }
  };

  return (
    <>
      <div className="space-y-6 p-4">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {currentUser?.person?.first_name}!
              </h1>
              <p className="text-blue-100 mt-2">
                Manage your health and upcoming appointments
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    Patient ID: {currentUser?.patient?.patient_uuid || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <Phone className="h-4 w-4" />
                  <span className="text-sm">
                    {currentUser?.phone || 'No phone'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">
                    {currentUser?.email || 'No email'}
                  </span>
                </div>
              </div>
            </div>
            {dashboardStats?.outstandingBills > 0 && (
              <div className="mt-4 md:mt-0">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/patient/billing')}
                  className="bg-white text-red-600 hover:bg-red-50 font-semibold"
                >
                  Pay Outstanding Balance
                </Button>
              </div>
            )}
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader
                title="Upcoming Appointments"
                subtitle="Your scheduled visits"
                action={
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      navigate(`/${currentUser?.role}/my-appointments`)
                    }
                  >
                    View All
                  </Button>
                }
              />
              <CardBody>
                {isLoading ? (
                  <div className="flex justify-center items-center p-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : (
                  <AppointmentList
                    isLoading={isLoading}
                    appointments={appointments}
                    upcomingAppointments={upcomingAppointments}
                    darkMode={darkMode}
                    onViewAppointment={handleViewRecords}
                    userRole={currentUser?.role}
                    showPagination={false}
                  />
                )}

                {isViewModalOpen && (
                  <AppointmentDetailModal
                    isOpen={isViewModalOpen}
                    onClose={handleCloseModal}
                    appointment={selectedAppt}
                    currentUser={currentUser}
                  />
                )}
              </CardBody>
            </Card>

            {/* Health Metrics */}
            <Card>
              <CardHeader
                title="Health Metrics"
                subtitle="Your latest vital signs"
                action={
                  <Button variant="ghost" size="sm">
                    View History
                  </Button>
                }
              />
              <CardBody>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {healthMetrics.map((metric, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`p-3 rounded-lg ${
                            metric.color === 'green'
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : metric.color === 'blue'
                                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                : 'bg-gray-50 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {metric.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold">{metric.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-2xl font-bold">
                              {metric.value}
                            </span>
                            <Badge
                              variant={getStatusVariant(metric.status)}
                              size="sm"
                            >
                              {metric.status}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 mt-2">
                            {metric.trend === 'improving' ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : metric.trend === 'stable' ? (
                              <Activity className="h-4 w-4 text-blue-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {metric.trend} • {metric.lastCheck}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader title="Quick Actions" subtitle="Common tasks" />
              <CardBody>
                <div className="grid grid-cols-2 gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={action.method}
                    >
                      <div
                        className={`p-3 rounded-lg mb-3 ${
                          action.color === 'blue'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                            : action.color === 'green'
                              ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                              : action.color === 'purple'
                                ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : action.color === 'orange'
                                  ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                                  : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}
                      >
                        <action.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium text-center">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Health Announcements */}
            <Card>
              <CardHeader
                title="Health Updates"
                subtitle="Important notices for you"
              />
              <CardBody>
                <div className="space-y-4">
                  {announcements.map(announcement => (
                    <div
                      key={announcement.id}
                      className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="mt-1">
                          {announcement.type === 'success' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-500" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-sm">
                              {announcement.title}
                            </h3>
                            <span className="text-xs text-gray-500">
                              {announcement.date}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {announcement.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader
                title="Recent Activity"
                subtitle="Your latest interactions"
              />
              <CardBody>
                <div className="space-y-3">
                  {recentActivity.map(activity => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                          {activity.type === 'lab_result' ? (
                            <FileCheck className="h-4 w-4 text-blue-600" />
                          ) : activity.type === 'prescription' ? (
                            <Pill className="h-4 w-4 text-green-600" />
                          ) : (
                            <Calendar className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">
                            {activity.title}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {activity.date}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={getStatusVariant(activity.status)}
                          size="sm"
                        >
                          {activity.status}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          {activity.action}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isCreateAppointmentModalOpen}
        onClose={() => setIsCreateAppointmentModalOpen(false)}
        title="Create Appointment"
        modalRef={modalRef}
      >
        <CreateAppointment
          userRole="patient"
          departments={departments}
          allDoctors={allDoctors}
          isLoading={scheduleLoading}
          isSubmitting={isBooking}
          onSubmit={handleCreateAppointment}
          onClose={() => setIsCreateAppointmentModalOpen(false)}
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
    </>
  );
};

export default PatientDashboard;
