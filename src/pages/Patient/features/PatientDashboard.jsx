import { useState } from 'react';
import {
  Calendar,
  Clock,
  Stethoscope,
  AlertCircle,
  FileText,
  Pill,
  Download,
  Filter,
  User,
  Phone,
  Mail,
  Activity,
  Heart,
  Thermometer,
  Weight,
  Droplets,
  Bell,
  TrendingUp,
  TrendingDown,
  FileCheck,
  Video,
  Shield,
  CheckCircle,
  XCircle,
  ChevronRight,
  MapPin,
  Trash2Icon,
  Eye,
} from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
// Import reusable components
import { Button } from '../../../components/ui/button';
import StatsCard from '../../../components/ui/stat-card';
import AppointmentsList from '../components/Dashboard/AppointmentCard';
import AnnouncementsList from '../components/Dashboard/AnnouncementCard';
import QuickActionsCard from '../components/Dashboard/QuickActionCard';
import Card, { CardHeader, CardBody } from '../../../components/ui/card';
import Badge from '../../../components/ui/badge';
const PatientDashboard = () => {
  const { currentUser } = useAuth();
  console.log(currentUser);
  const [upcomingAppointments, setUpcomingAppointments] = useState([
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: 'Today',
      time: '10:30 AM',
      status: 'confirmed',
      location: 'Main Building, Floor 3',
      type: 'follow-up',
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Neurology',
      date: 'Tomorrow',
      time: '2:00 PM',
      status: 'pending',
      location: 'East Wing, Floor 2',
      type: 'consultation',
    },
    {
      id: '3',
      doctorName: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      date: 'Jan 18',
      time: '11:00 AM',
      status: 'confirmed',
      location: 'West Wing, Floor 1',
      type: 'check-up',
    },
  ]);

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
    { icon: Calendar, label: 'Book Appointment', color: 'blue' },
    { icon: Video, label: 'Video Consult', color: 'purple' },
    { icon: Pill, label: 'Refill Prescription', color: 'green' },
    { icon: FileText, label: 'View Records', color: 'orange' },
    { icon: FileCheck, label: 'Lab Results', color: 'red' },
    { icon: Download, label: 'Health Summary', color: 'blue' },
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

  const getTrendIcon = trend => {
    if (trend === 'improving')
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'stable')
      return <Activity className="h-4 w-4 text-blue-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const handleDownloadSummary = () => {
    console.log('Downloading health summary...');
  };

  const handleBookAppointment = () => {
    console.log('Booking appointment...');
  };

  const handleViewRecords = () => {
    console.log('Viewing medical records...');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              Welcome back, {currentUser?.person?.first_name}!
            </h1>
            <p className="text-blue-100 mt-2">
              Manage your health and appointments
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-4">
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <User className="h-4 w-4" />
                <span className="text-sm">
                  Patient ID: {currentUser?.person?.patient?.patient_uuid}
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <Phone className="h-4 w-4" />
                <span className="text-sm">{currentUser?.phone}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 px-3 py-1 rounded-full">
                <Mail className="h-4 w-4" />
                <span className="text-sm">{currentUser?.email}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <Button
              variant="secondary"
              icon={Download}
              onClick={handleDownloadSummary}
              className="bg-white text-blue-600 hover:bg-blue-50"
            >
              Health Summary
            </Button>
          </div>
        </div>
      </div>

      {/* Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {healthMetrics.map((metric, index) => (
          <Card key={index}>
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`p-2 rounded-lg ${
                        metric.color === 'green'
                          ? 'bg-green-50 text-green-600'
                          : metric.color === 'blue'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {metric.icon}
                    </div>
                    <Badge variant={getStatusVariant(metric.status)} size="sm">
                      {metric.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    {metric.title}
                  </p>
                  <p className="text-2xl font-bold mt-1">{metric.value}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getTrendIcon(metric.trend)}
                    <span className="text-sm text-gray-500">
                      {metric.lastCheck}
                    </span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
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
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-4">
                {upcomingAppointments.map(appointment => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                        <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {appointment.doctorName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {appointment.specialty}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1" />
                            {appointment.date}
                          </span>
                          <span className="flex items-center text-sm">
                            <Clock className="h-3 w-3 mr-1" />
                            {appointment.time}
                          </span>
                          <span className="flex items-center text-sm">
                            <MapPin className="h-3 w-3 mr-1" />
                            {appointment.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={getStatusVariant(appointment.status)}>
                        {appointment.status.charAt(0).toUpperCase() +
                          appointment.status.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          {/* Current Prescriptions */}
          <Card>
            <CardHeader
              title="Current Prescriptions"
              subtitle="Your active medications"
              action={
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              }
            />
            <CardBody>
              <div className="space-y-4">
                {prescriptions.map(prescription => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg border border-gray-200 dark:border-gray-700 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded-lg">
                        <Pill className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{prescription.name}</h3>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {prescription.dosage} • {prescription.frequency}
                          </span>
                          <Badge variant="info" size="sm">
                            {prescription.remaining} left
                          </Badge>
                          <Badge variant="success" size="sm">
                            {prescription.refills} refills
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Refill
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
                    onClick={() => {
                      if (action.label === 'Book Appointment')
                        handleBookAppointment();
                      if (action.label === 'View Records') handleViewRecords();
                    }}
                  >
                    <div
                      className={`p-3 rounded-lg mb-3 ${
                        action.color === 'blue'
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600'
                          : action.color === 'green'
                          ? 'bg-green-50 dark:bg-green-900/30 text-green-600'
                          : action.color === 'purple'
                          ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600'
                          : action.color === 'orange'
                          ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'
                          : 'bg-red-50 dark:bg-red-900/30 text-red-600'
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
                        <p className="text-xs text-gray-500">{activity.date}</p>
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
  );
};

export default PatientDashboard;
