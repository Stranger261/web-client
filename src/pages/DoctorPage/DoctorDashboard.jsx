import React, { useState } from 'react';
import {
  Calendar,
  Users,
  Clock,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  FileText,
  Pill,
  Bell,
} from 'lucide-react';

const DoctorDashboard = () => {
  const todayDate = 'Saturday, October 04, 2025';
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Today's appointments
  const upcomingAppointments = [
    {
      id: 1,
      time: '09:00 AM',
      patient: 'Sarah Johnson',
      type: 'Follow-up',
      status: 'next',
    },
    {
      id: 2,
      time: '10:00 AM',
      patient: 'Michael Chen',
      type: 'Check-up',
      status: 'scheduled',
    },
    {
      id: 3,
      time: '11:30 AM',
      patient: 'Emily Rodriguez',
      type: 'Consultation',
      status: 'scheduled',
    },
    {
      id: 4,
      time: '02:00 PM',
      patient: 'James Wilson',
      type: 'Follow-up',
      status: 'scheduled',
    },
    {
      id: 5,
      time: '03:30 PM',
      patient: 'Lisa Anderson',
      type: 'Treatment',
      status: 'scheduled',
    },
  ];

  // All week appointments for modal
  const allAppointments = [
    ...upcomingAppointments,
    {
      id: 6,
      time: '09:30 AM',
      patient: 'Anna Park',
      type: 'Check-up',
      status: 'scheduled',
      date: 'Mon, Oct 7',
    },
    {
      id: 7,
      time: '11:00 AM',
      patient: 'David Kim',
      type: 'Follow-up',
      status: 'scheduled',
      date: 'Mon, Oct 7',
    },
    {
      id: 8,
      time: '02:00 PM',
      patient: 'Maria Garcia',
      type: 'Consultation',
      status: 'scheduled',
      date: 'Tue, Oct 8',
    },
    {
      id: 9,
      time: '10:00 AM',
      patient: 'John Smith',
      type: 'New Patient',
      status: 'scheduled',
      date: 'Wed, Oct 9',
    },
    {
      id: 10,
      time: '03:00 PM',
      patient: 'Emma Wilson',
      type: 'Follow-up',
      status: 'scheduled',
      date: 'Wed, Oct 9',
    },
  ];

  // Patients needing attention
  const criticalPatients = [
    {
      name: 'James Wilson',
      issue: 'High BP reading (160/95)',
      time: '2 hours ago',
      priority: 'high',
    },
    {
      name: 'Robert Martinez',
      issue: 'Lab results pending review',
      time: '5 hours ago',
      priority: 'medium',
    },
    {
      name: 'Linda Chen',
      issue: 'Missed last appointment',
      time: '1 day ago',
      priority: 'low',
    },
  ];

  // All alerts for modal
  const allAlerts = [
    ...criticalPatients,
    {
      name: 'Patricia Brown',
      issue: 'Follow-up overdue by 3 days',
      time: '2 days ago',
      priority: 'medium',
    },
    {
      name: 'Thomas Lee',
      issue: 'Prescription refill needed',
      time: '3 days ago',
      priority: 'low',
    },
    {
      name: 'Jennifer White',
      issue: 'Test results abnormal',
      time: '4 hours ago',
      priority: 'high',
    },
  ];

  // Patient details data
  const patientDetails = {
    'James Wilson': {
      age: 52,
      condition: 'High Cholesterol',
      lastVisit: '2025-09-28',
      vitals: { bp: '160/95', hr: '85 bpm', cholesterol: '245 mg/dL' },
    },
    'Robert Martinez': {
      age: 38,
      condition: 'GERD',
      lastVisit: '2025-09-22',
      vitals: { bp: '122/80', hr: '72 bpm', weight: '185 lbs' },
    },
    'Linda Chen': {
      age: 45,
      condition: 'Diabetes Type 2',
      lastVisit: '2025-09-28',
      vitals: { glucose: '142 mg/dL', bp: '135/88', hr: '78 bpm' },
    },
    'Patricia Brown': {
      age: 62,
      condition: 'Hypertension',
      lastVisit: '2025-09-20',
      vitals: { bp: '145/92', hr: '76 bpm', temp: '98.4°F' },
    },
    'Thomas Lee': {
      age: 41,
      condition: 'Chronic Pain',
      lastVisit: '2025-09-25',
      vitals: { bp: '128/82', hr: '70 bpm', pain: '6/10' },
    },
    'Jennifer White': {
      age: 35,
      condition: 'Thyroid Disorder',
      lastVisit: '2025-10-03',
      vitals: { tsh: '8.2 mIU/L', bp: '118/76', hr: '68 bpm' },
    },
  };

  const handleReviewPatient = patientName => {
    setSelectedPatient(patientName);
    setShowAlertsModal(false);
  };

  // Recent activity
  const recentActivity = [
    {
      action: 'Completed consultation',
      patient: 'Anna Park',
      time: 'Yesterday, 4:30 PM',
    },
    {
      action: 'Updated prescription',
      patient: 'David Kim',
      time: 'Yesterday, 3:15 PM',
    },
    {
      action: 'Reviewed lab results',
      patient: 'Maria Garcia',
      time: 'Yesterday, 2:00 PM',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Good morning, Dr. Foster
              </h1>
              <p className="text-sm text-gray-600 mt-1">{todayDate}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 hover:bg-gray-100 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  AF
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  Today's Appointments
                </p>
                <p className="text-3xl font-bold text-gray-900">5</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-blue-600 mt-3 font-medium">
              Next: 9:00 AM
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Patients</p>
                <p className="text-3xl font-bold text-gray-900">47</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">Active cases</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Needs Attention</p>
                <p className="text-3xl font-bold text-gray-900">3</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-red-600 mt-3 font-medium">
              Requires review
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed Today</p>
                <p className="text-3xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-3">Out of 5 scheduled</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Schedule - Takes 2 columns */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Today's Schedule
              </h2>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="text-blue-600 text-sm font-medium hover:text-blue-700"
              >
                View All
              </button>
            </div>
            <div className="space-y-3">
              {upcomingAppointments.map(apt => (
                <div
                  key={apt.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    apt.status === 'next'
                      ? 'bg-blue-50 border-2 border-blue-200'
                      : 'bg-gray-50 border border-gray-200 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center ${
                        apt.status === 'next'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border-2 border-gray-300 text-gray-700'
                      }`}
                    >
                      <span className="text-lg font-bold">
                        {apt.time.split(':')[0]}
                      </span>
                      <span className="text-xs">{apt.time.split(' ')[1]}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {apt.patient}
                      </h3>
                      <p className="text-sm text-gray-600">{apt.type}</p>
                    </div>
                  </div>
                  {apt.status === 'next' && (
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Start Visit
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Alerts and Activity */}
          <div className="space-y-6">
            {/* Patients Needing Attention */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-gray-900">Needs Attention</h3>
              </div>
              <div className="space-y-3">
                {criticalPatients.map((patient, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border-l-4 ${
                      patient.priority === 'high'
                        ? 'bg-red-50 border-red-500'
                        : patient.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <p className="font-medium text-gray-900 text-sm">
                      {patient.name}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {patient.issue}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{patient.time}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowAlertsModal(true)}
                className="w-full mt-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All Alerts
              </button>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold">This Week</h3>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Patients Seen</span>
                  <span className="text-2xl font-bold">18</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Prescriptions</span>
                  <span className="text-2xl font-bold">24</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-blue-100 text-sm">Avg. Time</span>
                  <span className="text-2xl font-bold">28m</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{activity.action}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {activity.patient}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <button className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
            <FileText className="w-6 h-6 text-blue-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Medical Records</p>
          </button>
          <button className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
            <Pill className="w-6 h-6 text-green-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Prescriptions</p>
          </button>
          <button className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
            <Activity className="w-6 h-6 text-purple-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">Lab Results</p>
          </button>
          <button className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
            <Users className="w-6 h-6 text-orange-600 mb-2" />
            <p className="font-medium text-gray-900 text-sm">My Patients</p>
          </button>
        </div>
      </main>

      {/* All Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                All Appointments
              </h2>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-6">
                {/* Today's Appointments */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Today - Saturday, Oct 4
                  </h3>
                  <div className="space-y-2">
                    {upcomingAppointments.map(apt => (
                      <div
                        key={apt.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-14 h-14 bg-blue-600 text-white rounded-lg flex flex-col items-center justify-center">
                            <span className="font-bold">
                              {apt.time.split(':')[0]}
                            </span>
                            <span className="text-xs">
                              {apt.time.split(' ')[1]}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {apt.patient}
                            </h4>
                            <p className="text-sm text-gray-600">{apt.type}</p>
                          </div>
                        </div>
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                          Start
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Week */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    This Week
                  </h3>
                  <div className="space-y-2">
                    {allAppointments
                      .filter(apt => apt.date)
                      .map(apt => (
                        <div
                          key={apt.id}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-white border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center">
                              <span className="font-bold text-gray-700">
                                {apt.time.split(':')[0]}
                              </span>
                              <span className="text-xs text-gray-600">
                                {apt.time.split(' ')[1]}
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {apt.patient}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {apt.type} • {apt.date}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* All Alerts Modal */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">All Alerts</h2>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="text-2xl text-gray-600">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="space-y-3">
                {allAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.priority === 'high'
                        ? 'bg-red-50 border-red-500'
                        : alert.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {alert.name}
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-medium ${
                              alert.priority === 'high'
                                ? 'bg-red-100 text-red-800'
                                : alert.priority === 'medium'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {alert.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {alert.issue}
                        </p>
                        <p className="text-xs text-gray-500">{alert.time}</p>
                      </div>
                      <button
                        onClick={() => handleReviewPatient(alert.name)}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Review Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div>
                <h2 className="text-2xl font-bold">{selectedPatient}</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {patientDetails[selectedPatient]?.age} years old •{' '}
                  {patientDetails[selectedPatient]?.condition}
                </p>
              </div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="w-8 h-8 flex items-center justify-center hover:bg-blue-800 rounded-lg transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Vitals */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Latest Vitals
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    {Object.entries(
                      patientDetails[selectedPatient]?.vitals || {}
                    ).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="font-semibold text-gray-900">
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Visit History
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">
                            Last Visit
                          </span>
                          <span className="text-sm text-gray-600">
                            {patientDetails[selectedPatient]?.lastVisit}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Regular check-up completed. Condition stable.
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium text-gray-900">
                            Previous Visit
                          </span>
                          <span className="text-sm text-gray-600">
                            2025-09-15
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Medication adjustment recommended.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Actions */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-3">
                    <button className="w-full flex items-center space-x-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          Update Medical Record
                        </p>
                        <p className="text-sm text-gray-600">
                          Add notes and diagnosis
                        </p>
                      </div>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                      <Pill className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          Prescribe Medication
                        </p>
                        <p className="text-sm text-gray-600">
                          Create new prescription
                        </p>
                      </div>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors">
                      <Activity className="w-5 h-5 text-purple-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          View Lab Results
                        </p>
                        <p className="text-sm text-gray-600">
                          Check recent tests
                        </p>
                      </div>
                    </button>
                    <button className="w-full flex items-center space-x-3 p-4 bg-orange-50 border-2 border-orange-200 rounded-lg hover:bg-orange-100 transition-colors">
                      <Calendar className="w-5 h-5 text-orange-600" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">
                          Schedule Follow-up
                        </p>
                        <p className="text-sm text-gray-600">
                          Book next appointment
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      Current Medications
                    </h3>
                    <div className="space-y-2">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900 text-sm">
                          Lisinopril 10mg
                        </p>
                        <p className="text-xs text-gray-600">
                          Once daily, morning
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-medium text-gray-900 text-sm">
                          Atorvastatin 20mg
                        </p>
                        <p className="text-xs text-gray-600">
                          Once daily, evening
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <button className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                  Save & Close
                </button>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;
