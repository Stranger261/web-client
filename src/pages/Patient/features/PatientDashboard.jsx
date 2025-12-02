import { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Stethoscope, 
  AlertCircle,
  TrendingUp,
  FileText,
  Pill,
  ChevronRight,
  Download,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Activity
} from 'lucide-react';

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  location: string;
}

interface Announcement {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'success' | 'emergency';
}

interface Statistic {
  label: string;
  value: number;
  change: number;
  icon: React.ReactNode;
}

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      date: '2024-01-15',
      time: '10:30 AM',
      status: 'confirmed',
      location: 'Main Building, Floor 3'
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Neurology',
      date: '2024-01-16',
      time: '2:00 PM',
      status: 'pending',
      location: 'East Wing, Floor 2'
    },
    {
      id: '3',
      doctorName: 'Dr. Emily Rodriguez',
      specialty: 'Dermatology',
      date: '2024-01-12',
      time: '11:00 AM',
      status: 'cancelled',
      location: 'West Wing, Floor 1'
    }
  ]);

  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Hospital System Maintenance',
      message: 'System maintenance scheduled for Jan 20, 2024 from 2:00 AM to 4:00 AM. Online services will be temporarily unavailable.',
      date: '2024-01-10',
      type: 'warning'
    },
    {
      id: '2',
      title: 'New Telemedicine Feature',
      message: 'We have launched virtual consultations. Schedule your video appointments through the patient portal.',
      date: '2024-01-08',
      type: 'success'
    },
    {
      id: '3',
      title: 'Flu Season Alert',
      message: 'Increased flu cases reported in the area. Please wear masks in crowded areas and get your flu shot.',
      date: '2024-01-05',
      type: 'emergency'
    }
  ]);

  const [stats, setStats] = useState<Statistic[]>([
    { label: 'Total Appointments', value: 24, change: 12, icon: <Calendar className="h-5 w-5" /> },
    { label: 'Prescriptions', value: 8, change: 3, icon: <Pill className="h-5 w-5" /> },
    { label: 'Medical Records', value: 15, change: 5, icon: <FileText className="h-5 w-5" /> },
    { label: 'Consultation Hours', value: 18, change: -2, icon: <Clock className="h-5 w-5" /> }
  ]);

  const [weeklyData, setWeeklyData] = useState([
    { day: 'Mon', appointments: 4 },
    { day: 'Tue', appointments: 6 },
    { day: 'Wed', appointments: 3 },
    { day: 'Thu', appointments: 8 },
    { day: 'Fri', appointments: 5 },
    { day: 'Sat', appointments: 2 },
    { day: 'Sun', appointments: 1 }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      case 'emergency': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'emergency': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, John!</h1>
            <p className="text-blue-100 mt-2">Here's your health dashboard for today</p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Patient ID: PA-789012</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>(555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <span>john.doe@email.com</span>
              </div>
            </div>
          </div>
          <div className="mt-4 md:mt-0">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Download Health Summary</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className={`h-4 w-4 ${stat.change >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm ml-1 ${stat.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.change >= 0 ? '+' : ''}{stat.change}% from last month
                  </span>
                </div>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Appointments & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your scheduled visits</p>
              </div>
              <button className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700">
                <span>View All</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg mb-3 last:mb-0">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                      <Stethoscope className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{appointment.doctorName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{appointment.specialty}</p>
                      <div className="flex items-center space-x-4 mt-1">
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
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
                      {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                    </span>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Appointments Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold">Appointments Overview</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Weekly appointment statistics</p>
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </button>
            </div>
            <div className="h-64">
              {/* Chart would go here - using a simple bar representation for now */}
              <div className="flex items-end justify-between h-48 mt-4">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">{day.day}</div>
                    <div
                      className="w-10 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t-lg transition-all hover:opacity-80"
                      style={{ height: `${day.appointments * 20}px` }}
                    ></div>
                    <div className="text-sm font-semibold mt-2">{day.appointments}</div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center mt-6 space-x-6">
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-sm">Appointments This Week</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 bg-blue-300 rounded-full mr-2"></div>
                  <span className="text-sm">Last Week</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Announcements & Quick Actions */}
        <div className="space-y-6">
          {/* Hospital Announcements */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold">Hospital Announcements</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Latest updates and alerts</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {getAnnouncementIcon(announcement.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{announcement.title}</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{announcement.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{announcement.message}</p>
                        <div className={`inline-block h-1 w-8 rounded-full mt-3 ${getAnnouncementColor(announcement.type)}`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 text-center text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg font-medium">
                View All Announcements
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg mb-3">
                  <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-medium">Book Appointment</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg mb-3">
                  <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <span className="font-medium">View Records</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg mb-3">
                  <Pill className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="font-medium">Prescriptions</span>
              </button>
              
              <button className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg mb-3">
                  <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <span className="font-medium">Health Stats</span>
              </button>
            </div>
          </div>

          {/* Health Reminders */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
            <h2 className="text-lg font-semibold mb-4">Health Reminders</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Blood pressure check due in 2 days</span>
              </div>
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
                <span className="text-sm">Annual physical scheduled for Jan 30</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm">Prescription refill available</span>
              </div>
            </div>
            <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Set Reminder
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Your latest interactions with the hospital</p>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700">
            View Full History
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Date & Time</th>
                <th className="pb-3 font-medium">Activity</th>
                <th className="pb-3 font-medium">Department</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4">Jan 10, 2024 • 10:30 AM</td>
                <td className="py-4">Lab Test Results Uploaded</td>
                <td className="py-4">Laboratory</td>
                <td className="py-4">
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs">
                    Completed
                  </span>
                </td>
                <td className="py-4">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm">
                    View Report
                  </button>
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-4">Jan 9, 2024 • 2:15 PM</td>
                <td className="py-4">Telemedicine Consultation</td>
                <td className="py-4">General Medicine</td>
                <td className="py-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs">
                    In Progress
                  </span>
                </td>
                <td className="py-4">
                  <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 text-sm">
                    Join Call
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;