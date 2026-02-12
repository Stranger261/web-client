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
import LoadingOverlay from '../../../components/shared/LoadingOverlay';

const PatientDashboard = () => {
  const darkMode = document.documentElement.classList.contains('dark');
  const navigate = useNavigate();
  const { currentUser, fetchCurrentUser } = useAuth();
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
      label: 'Outstanding Balance',
      value: 'PHP 0',
      change: 'Loading...',
      trend: 'neutral',
      icon: DollarSign,
      color: 'danger',
    },
  ];

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
      icon: FileText,
      label: 'View Records',
      color: 'orange',
      method: () => navigate('/patient/my-medical-history', { replace: true }),
    },
    // {
    //   icon: FileCheck,
    //   label: 'Lab Results',
    //   color: 'red',
    //   method: () => navigate('/patient/lab-results'),
    // },
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
  if (isLoading) {
    return <LoadingOverlay />;
  }

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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
