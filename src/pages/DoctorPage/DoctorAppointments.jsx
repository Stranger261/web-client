import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Activity,
  Settings,
  ChevronRight,
  Phone,
  Mail,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Bell,
  Home,
} from 'lucide-react';

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState('appointments');
  const [selectedDate, setSelectedDate] = useState('2025-10-04');
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      patientName: 'John Smith',
      age: 45,
      time: '09:00 AM',
      duration: 30,
      type: 'Follow-up',
      status: 'confirmed',
      phone: '+63 917 123 4567',
      email: 'john.smith@email.com',
      reason: 'Hypertension follow-up',
      lastVisit: '2025-09-20',
    },
    {
      id: 2,
      patientName: 'Maria Santos',
      age: 32,
      time: '09:30 AM',
      duration: 45,
      type: 'Consultation',
      status: 'in-progress',
      phone: '+63 918 234 5678',
      email: 'maria.santos@email.com',
      reason: 'Chest pain and shortness of breath',
      lastVisit: 'New Patient',
    },
    {
      id: 3,
      patientName: 'Robert Chen',
      age: 58,
      time: '10:30 AM',
      duration: 30,
      type: 'Follow-up',
      status: 'confirmed',
      phone: '+63 919 345 6789',
      email: 'robert.chen@email.com',
      reason: 'Diabetes management',
      lastVisit: '2025-09-15',
    },
    {
      id: 4,
      patientName: 'Anna Garcia',
      age: 28,
      time: '11:00 AM',
      duration: 30,
      type: 'Check-up',
      status: 'confirmed',
      phone: '+63 920 456 7890',
      email: 'anna.garcia@email.com',
      reason: 'Annual physical examination',
      lastVisit: '2024-10-05',
    },
    {
      id: 5,
      patientName: 'David Lee',
      age: 51,
      time: '02:00 PM',
      duration: 30,
      type: 'Follow-up',
      status: 'pending',
      phone: '+63 921 567 8901',
      email: 'david.lee@email.com',
      reason: 'Post-surgery checkup',
      lastVisit: '2025-09-28',
    },
    {
      id: 6,
      patientName: 'Sofia Rodriguez',
      age: 39,
      time: '02:30 PM',
      duration: 45,
      type: 'Consultation',
      status: 'confirmed',
      phone: '+63 922 678 9012',
      email: 'sofia.rod@email.com',
      reason: 'Migraine treatment',
      lastVisit: '2025-08-12',
    },
    {
      id: 7,
      patientName: 'Michael Torres',
      age: 44,
      time: '03:30 PM',
      duration: 30,
      type: 'Follow-up',
      status: 'completed',
      phone: '+63 923 789 0123',
      email: 'michael.t@email.com',
      reason: 'Blood pressure monitoring',
      lastVisit: '2025-09-25',
    },
  ]);

  const [myPatients, setMyPatients] = useState([
    {
      id: 1,
      name: 'John Smith',
      age: 45,
      gender: 'Male',
      phone: '+63 917 123 4567',
      email: 'john.smith@email.com',
      condition: 'Hypertension',
      lastVisit: '2025-09-20',
      nextAppointment: '2025-10-04',
      status: 'active',
    },
    {
      id: 2,
      name: 'Robert Chen',
      age: 58,
      gender: 'Male',
      phone: '+63 919 345 6789',
      email: 'robert.chen@email.com',
      condition: 'Type 2 Diabetes',
      lastVisit: '2025-09-15',
      nextAppointment: '2025-10-04',
      status: 'active',
    },
    {
      id: 3,
      name: 'Anna Garcia',
      age: 28,
      gender: 'Female',
      phone: '+63 920 456 7890',
      email: 'anna.garcia@email.com',
      condition: 'Healthy',
      lastVisit: '2024-10-05',
      nextAppointment: '2025-10-04',
      status: 'active',
    },
    {
      id: 4,
      name: 'Sofia Rodriguez',
      age: 39,
      gender: 'Female',
      phone: '+63 922 678 9012',
      email: 'sofia.rod@email.com',
      condition: 'Chronic Migraine',
      lastVisit: '2025-08-12',
      nextAppointment: '2025-10-04',
      status: 'active',
    },
    {
      id: 5,
      name: 'Michael Torres',
      age: 44,
      gender: 'Male',
      phone: '+63 923 789 0123',
      email: 'michael.t@email.com',
      condition: 'Hypertension',
      lastVisit: '2025-09-25',
      nextAppointment: '2025-10-18',
      status: 'active',
    },
  ]);

  const [medicalRecord, setMedicalRecord] = useState({
    diagnosis: '',
    prescription: '',
    notes: '',
    followUpDate: '',
  });

  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments(
      appointments.map(a => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  const saveMedicalRecord = () => {
    console.log('Saving medical record:', medicalRecord);
    setShowRecordModal(false);
    setMedicalRecord({
      diagnosis: '',
      prescription: '',
      notes: '',
      followUpDate: '',
    });
  };

  const getStatusColor = status => {
    switch (status) {
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in-progress':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = apt.patientName
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || apt.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredPatients = myPatients.filter(
    p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const todayStats = {
    total: appointments.length,
    completed: appointments.filter(a => a.status === 'completed').length,
    pending: appointments.filter(
      a => a.status === 'confirmed' || a.status === 'pending'
    ).length,
    inProgress: appointments.filter(a => a.status === 'in-progress').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Dr. Sarah Anderson
                </h1>
                <p className="text-sm text-gray-600">
                  Internal Medicine Specialist
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {[
              { id: 'appointments', label: 'Appointments', icon: Calendar },
              { id: 'patients', label: 'My Patients', icon: User },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Total Today
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {todayStats.total}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Calendar className="text-blue-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Pending</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {todayStats.pending}
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Clock className="text-yellow-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      In Progress
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {todayStats.inProgress}
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Activity className="text-green-600" size={20} />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Completed
                    </p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      {todayStats.completed}
                    </p>
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <CheckCircle className="text-gray-600" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search patients..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={18} className="text-gray-600" />
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Appointments List */}
            <div className="space-y-3">
              {filteredAppointments.map(apt => (
                <div
                  key={apt.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <Clock className="text-blue-600" size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-gray-800">
                            {apt.patientName}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              apt.status
                            )}`}
                          >
                            {apt.status.toUpperCase().replace('-', ' ')}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {apt.time} ({apt.duration} min)
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            {apt.type}
                          </span>
                          <span>{apt.age} years old</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {apt.reason}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {apt.status === 'confirmed' && (
                        <button
                          onClick={() =>
                            updateAppointmentStatus(apt.id, 'in-progress')
                          }
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {apt.status === 'in-progress' && (
                        <button
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setShowRecordModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                        >
                          Add Record
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAppointment(apt);
                          setShowAppointmentModal(true);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} className="text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Patients Tab */}
        {activeTab === 'patients' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Patients</h2>
              <div className="relative w-96">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search patients by name or condition..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPatients.map(patient => (
                <div
                  key={patient.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-3 rounded-full">
                        <User className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                          {patient.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {patient.age} years • {patient.gender}
                        </p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-200">
                      {patient.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <AlertCircle size={16} className="text-gray-400" />
                      <span className="text-gray-600">Condition:</span>
                      <span className="font-medium text-gray-800">
                        {patient.condition}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-600">Last Visit:</span>
                      <span className="font-medium text-gray-800">
                        {patient.lastVisit}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className="text-gray-400" />
                      <span className="text-gray-600">Next Appointment:</span>
                      <span className="font-medium text-gray-800">
                        {patient.nextAppointment}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedPatient(patient);
                      setShowPatientModal(true);
                    }}
                    className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    View Full Record
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Clinical Reports
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Activity className="text-blue-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Treatment Success Rate
                  </h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-5xl font-bold text-blue-600">94.2%</p>
                  <p className="text-gray-600 mt-2">This Month</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <User className="text-green-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Total Patients
                  </h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-5xl font-bold text-green-600">127</p>
                  <p className="text-gray-600 mt-2">Active Patients</p>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Case Summaries
                </h3>
                <div className="space-y-3">
                  {[
                    'Follow-up Treatment Report - Hypertension',
                    'Consultation Summary - Diabetes Management',
                    'Post-Surgery Recovery Assessment',
                  ].map((report, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-600" />
                        <span className="font-medium text-gray-800">
                          {report}
                        </span>
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Personal Settings
            </h2>
            <div className="max-w-2xl space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Availability Schedule
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Working Days
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(
                        day => (
                          <button
                            key={day}
                            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium hover:bg-blue-200 transition-colors"
                          >
                            {day}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        defaultValue="09:00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        defaultValue="17:00"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  {[
                    'New Appointment Bookings',
                    'Patient Appointment Reminders',
                    'Medical Record Updates',
                    'System Notifications',
                  ].map((pref, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-700">{pref}</span>
                      <label className="relative inline-block w-12 h-6">
                        <input
                          type="checkbox"
                          defaultChecked={i < 3}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Modal */}
      {showAppointmentModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Appointment Details
              </h3>
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Patient Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.patientName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.age} years
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Appointment Details
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.duration} minutes
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-800">
                      {selectedAppointment.type}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                        selectedAppointment.status
                      )}`}
                    >
                      {selectedAppointment.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">
                  Reason for Visit
                </h4>
                <p className="text-gray-700">{selectedAppointment.reason}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Last Visit</h4>
                <p className="text-gray-700">{selectedAppointment.lastVisit}</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAppointmentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              {selectedAppointment.status === 'confirmed' && (
                <button
                  onClick={() => {
                    updateAppointmentStatus(
                      selectedAppointment.id,
                      'in-progress'
                    );
                    setShowAppointmentModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                >
                  Start Consultation
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Patient Details Modal */}
      {showPatientModal && selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Patient Medical Record
              </h3>
              <button
                onClick={() => setShowPatientModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Personal Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age / Gender</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.age} years • {selectedPatient.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.phone}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Medical History
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="text-sm text-gray-600">Current Condition</p>
                    <p className="font-medium text-gray-800">
                      {selectedPatient.condition}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Last Visit</p>
                      <p className="font-medium text-gray-800">
                        {selectedPatient.lastVisit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Next Appointment</p>
                      <p className="font-medium text-gray-800">
                        {selectedPatient.nextAppointment}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-3">
                  Recent Medical Records
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800">
                        Follow-up Consultation
                      </p>
                      <span className="text-xs text-gray-600">
                        {selectedPatient.lastVisit}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Diagnosis: Blood pressure under control. Continue current
                      medication.
                    </p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-medium text-gray-800">
                        Regular Check-up
                      </p>
                      <span className="text-xs text-gray-600">2025-08-15</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Diagnosis: Routine examination. All vitals normal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPatientModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowPatientModal(false);
                  setShowRecordModal(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Add New Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Medical Record Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Add Medical Record
              </h3>
              <button
                onClick={() => setShowRecordModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {selectedAppointment && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Patient</p>
                  <p className="font-semibold text-gray-800 text-lg">
                    {selectedAppointment.patientName}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Diagnosis
                </label>
                <textarea
                  value={medicalRecord.diagnosis}
                  onChange={e =>
                    setMedicalRecord({
                      ...medicalRecord,
                      diagnosis: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter diagnosis details..."
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Prescription
                </label>
                <textarea
                  value={medicalRecord.prescription}
                  onChange={e =>
                    setMedicalRecord({
                      ...medicalRecord,
                      prescription: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter prescription details (medications, dosage, instructions)..."
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Medical Notes
                </label>
                <textarea
                  value={medicalRecord.notes}
                  onChange={e =>
                    setMedicalRecord({
                      ...medicalRecord,
                      notes: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Additional observations, recommendations, or notes..."
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  value={medicalRecord.followUpDate}
                  onChange={e =>
                    setMedicalRecord({
                      ...medicalRecord,
                      followUpDate: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRecordModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  saveMedicalRecord();
                  if (selectedAppointment) {
                    updateAppointmentStatus(
                      selectedAppointment.id,
                      'completed'
                    );
                  }
                }}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
