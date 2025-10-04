import React, { useState } from 'react';
import { Calendar, Clock, User, FileText, Activity, Settings, ChevronRight, Phone, AlertCircle, CheckCircle, TrendingUp, TrendingDown, Bell, Download, Printer, Eye, Users, Bed, Pill, Thermometer, Heart, Droplet, BarChart3, PieChart, LineChart } from 'lucide-react';

const NurseReports = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const wardStats = {
    totalBeds: 50,
    occupied: 38,
    available: 12,
    critical: 5,
    stable: 28,
    recovering: 5,
    admissionsToday: 7,
    discharges: 4,
    pendingDischarge: 3
  };

  const vitalSignsStats = {
    completed: 152,
    pending: 8,
    overdue: 2,
    averageTime: '12 min',
    compliance: 95
  };

  const medicationStats = {
    administered: 234,
    pending: 18,
    missed: 2,
    prn: 15,
    compliance: 98
  };

  const patientCareStats = {
    totalPatients: 38,
    roundsCompleted: 4,
    incidentReports: 1,
    fallRisk: 8,
    pressureInjuryRisk: 6,
    isolationPrecautions: 3
  };

  const recentActivities = [
    { id: 1, time: '14:30', patient: 'John Smith', room: '201A', activity: 'Vital signs recorded', status: 'completed', bp: '128/82', hr: '74', temp: '36.7', priority: 'normal' },
    { id: 2, time: '14:15', patient: 'Maria Santos', room: '203B', activity: 'Medication administered', status: 'completed', medication: 'Amoxicillin 500mg', priority: 'normal' },
    { id: 3, time: '14:00', patient: 'Robert Chen', room: '205A', activity: 'Blood glucose check', status: 'completed', value: '145 mg/dL', priority: 'normal' },
    { id: 4, time: '13:45', patient: 'Anna Garcia', room: '202B', activity: 'IV fluid change', status: 'completed', priority: 'normal' },
    { id: 5, time: '13:30', patient: 'David Lee', room: '204A', activity: 'Wound dressing change', status: 'completed', priority: 'high' },
    { id: 6, time: '13:15', patient: 'Sofia Rodriguez', room: '201B', activity: 'Pain assessment', status: 'completed', painLevel: '3/10', priority: 'normal' },
    { id: 7, time: '13:00', patient: 'Michael Torres', room: '203A', activity: 'Patient repositioning', status: 'completed', priority: 'normal' },
    { id: 8, time: '12:45', patient: 'Emma Wilson', room: '205B', activity: 'Vital signs - URGENT', status: 'alert', bp: '160/95', hr: '102', priority: 'urgent' }
  ];

  const upcomingTasks = [
    { id: 1, time: '15:00', patient: 'John Smith', room: '201A', task: 'Medication due', medication: 'Losartan 50mg', priority: 'high' },
    { id: 2, time: '15:00', patient: 'Robert Chen', room: '205A', task: 'Blood glucose check', priority: 'high' },
    { id: 3, time: '15:30', patient: 'Maria Santos', room: '203B', task: 'Vital signs check', priority: 'normal' },
    { id: 4, time: '16:00', patient: 'Anna Garcia', room: '202B', task: 'IV assessment', priority: 'normal' },
    { id: 5, time: '16:00', patient: 'David Lee', room: '204A', task: 'Pain medication PRN available', priority: 'low' }
  ];

  const dailyReport = {
    date: '2025-10-04',
    shift: 'Day Shift (7:00 AM - 3:00 PM)',
    nurse: 'Jane Thompson, RN',
    summary: 'All patients stable. One urgent vital signs check for Emma Wilson (Room 205B) - high BP noted, doctor notified. Two medication administration delayed due to patient NPO status. All wound dressings changed as scheduled.',
    handoverNotes: [
      { patient: 'Emma Wilson', room: '205B', note: 'Monitor BP closely. Doctor ordered additional BP medication. Recheck in 2 hours.' },
      { patient: 'David Lee', room: '204A', note: 'Post-surgical day 2. Wound healing well. Pain controlled with current regimen.' },
      { patient: 'Maria Santos', room: '203B', note: 'Scheduled for discharge tomorrow. Patient education completed.' }
    ]
  };

  const incidentReports = [
    {
      id: 1,
      date: '2025-10-04',
      time: '11:30',
      type: 'Medication Delay',
      severity: 'Low',
      patient: 'Anna Garcia',
      room: '202B',
      description: 'Morning medication administered 45 minutes late due to patient being in radiology.',
      action: 'Coordinated with radiology for future scheduling. Doctor notified.',
      status: 'Resolved'
    }
  ];

  const trends = [
    { metric: 'Bed Occupancy', current: 76, previous: 72, change: 5.5, status: 'up' },
    { metric: 'Vital Signs Compliance', current: 95, previous: 92, change: 3.3, status: 'up' },
    { metric: 'Medication Compliance', current: 98, previous: 97, change: 1.0, status: 'up' },
    { metric: 'Average Response Time', current: 8, previous: 10, change: -20, status: 'down', unit: 'min' },
    { metric: 'Patient Satisfaction', current: 4.7, previous: 4.5, change: 4.4, status: 'up', unit: '/5' }
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'alert': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-teal-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="bg-teal-600 p-2 rounded-lg">
                <Activity className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Nurse Jane Thompson</h1>
                <p className="text-sm text-gray-600">Registered Nurse - Ward 2A</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg border border-teal-200">
                <Clock size={18} className="text-teal-600" />
                <span className="text-sm font-medium text-teal-800">Day Shift: 7:00 AM - 3:00 PM</span>
              </div>
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

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">Reports & Analytics</h2>
            <p className="text-gray-600">Ward performance metrics and nursing care statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
            <button className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2">
              <Download size={18} />
              Export Report
            </button>
          </div>
        </div>

        {/* Key Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Bed className="text-blue-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">{wardStats.occupied}/{wardStats.totalBeds}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Bed Occupancy</p>
            <p className="text-xs text-gray-500 mt-1">{Math.round((wardStats.occupied / wardStats.totalBeds) * 100)}% occupied</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 p-3 rounded-lg">
                <Heart className="text-green-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">{vitalSignsStats.compliance}%</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Vitals Compliance</p>
            <p className="text-xs text-gray-500 mt-1">{vitalSignsStats.completed} completed today</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Pill className="text-purple-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">{medicationStats.compliance}%</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Med Compliance</p>
            <p className="text-xs text-gray-500 mt-1">{medicationStats.administered} administered</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-100 p-3 rounded-lg">
                <AlertCircle className="text-orange-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">{wardStats.critical}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">Critical Patients</p>
            <p className="text-xs text-gray-500 mt-1">Require close monitoring</p>
          </div>
        </div>

        {/* Trends Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="text-teal-600" size={20} />
            Performance Trends
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {trends.map((trend, idx) => (
              <div key={idx} className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-2">{trend.metric}</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">
                      {trend.current}{trend.unit || '%'}
                    </p>
                    <div className={`flex items-center gap-1 text-xs mt-1 ${trend.status === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {trend.status === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{Math.abs(trend.change)}%</span>
                    </div>
                  </div>
                  {trend.status === 'up' ? (
                    <CheckCircle className="text-green-500" size={20} />
                  ) : (
                    <AlertCircle className="text-orange-500" size={20} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Ward Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users className="text-blue-600" size={20} />
              Ward Status Summary
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bed className="text-blue-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Total Beds</p>
                    <p className="text-xs text-gray-600">Capacity overview</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-800">{wardStats.totalBeds}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Occupied</p>
                    <p className="text-xs text-gray-600">Currently admitted</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-800">{wardStats.occupied}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bed className="text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Available</p>
                    <p className="text-xs text-gray-600">Ready for admission</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-800">{wardStats.available}</span>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-200">
                <div className="text-center">
                  <div className="bg-red-100 rounded-lg p-3 mb-2">
                    <p className="text-2xl font-bold text-red-800">{wardStats.critical}</p>
                  </div>
                  <p className="text-xs text-gray-600">Critical</p>
                </div>
                <div className="text-center">
                  <div className="bg-green-100 rounded-lg p-3 mb-2">
                    <p className="text-2xl font-bold text-green-800">{wardStats.stable}</p>
                  </div>
                  <p className="text-xs text-gray-600">Stable</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-lg p-3 mb-2">
                    <p className="text-2xl font-bold text-blue-800">{wardStats.recovering}</p>
                  </div>
                  <p className="text-xs text-gray-600">Recovering</p>
                </div>
              </div>
            </div>
          </div>

          {/* Patient Care Metrics */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Activity className="text-teal-600" size={20} />
              Patient Care Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Users className="text-teal-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Total Patients</p>
                    <p className="text-xs text-gray-600">Under care</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-800">{patientCareStats.totalPatients}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-purple-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Rounds Completed</p>
                    <p className="text-xs text-gray-600">Today</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-800">{patientCareStats.roundsCompleted}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-orange-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Fall Risk Patients</p>
                    <p className="text-xs text-gray-600">Special monitoring</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-800">{patientCareStats.fallRisk}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div className="bg-yellow-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-yellow-800">{patientCareStats.pressureInjuryRisk}</p>
                  <p className="text-xs text-gray-600 mt-1">Pressure Injury Risk</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-red-800">{patientCareStats.isolationPrecautions}</p>
                  <p className="text-xs text-gray-600 mt-1">Isolation Precautions</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="text-green-600" size={20} />
              Recent Activities
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentActivities.map(activity => (
                <div key={activity.id} className={`p-3 rounded-lg border ${activity.status === 'alert' ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-600">{activity.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(activity.priority)}`}>
                          {activity.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800">{activity.patient}</p>
                      <p className="text-xs text-gray-600">Room {activity.room}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(activity.status)}`}>
                      {activity.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{activity.activity}</p>
                  {activity.bp && (
                    <p className="text-xs text-gray-600 mt-1">BP: {activity.bp} | HR: {activity.hr} | Temp: {activity.temp}°C</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bell className="text-orange-600" size={20} />
              Upcoming Tasks
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {upcomingTasks.map(task => (
                <div key={task.id} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock size={14} className="text-orange-600" />
                        <span className="text-sm font-bold text-orange-800">{task.time}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getPriorityColor(task.priority)}`}>
                          {task.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-800">{task.patient}</p>
                      <p className="text-xs text-gray-600">Room {task.room}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 font-medium">{task.task}</p>
                  {task.medication && (
                    <p className="text-xs text-gray-600 mt-1">Medication: {task.medication}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Summary Report */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Daily Summary Report
            </h3>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Printer size={18} className="text-gray-600" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Date</p>
                <p className="font-medium text-gray-800">{dailyReport.date}</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Shift</p>
                <p className="font-medium text-gray-800">{dailyReport.shift}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Nurse on Duty</p>
                <p className="font-medium text-gray-800">{dailyReport.nurse}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Shift Summary</h4>
              <p className="text-sm text-gray-700">{dailyReport.summary}</p>
            </div>

            <div>
              <h4 className="font-semibold text-gray-800 mb-3">Handover Notes</h4>
              <div className="space-y-2">
                {dailyReport.handoverNotes.map((note, idx) => (
                  <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertCircle size={16} className="text-yellow-600" />
                      <span className="font-medium text-gray-800">{note.patient} - Room {note.room}</span>
                    </div>
                    <p className="text-sm text-gray-700">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Incident Reports */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            Incident Reports
          </h3>
          <div className="space-y-3">
            {incidentReports.map(incident => (
              <div key={incident.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 bg-red-200 text-red-800 text-xs font-semibold rounded-full">
                        {incident.type}
                      </span>
                      <span className="px-3 py-1 bg-orange-200 text-orange-800 text-xs font-semibold rounded-full">
                        Severity: {incident.severity}
                      </span>
                      <span className="px-3 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded-full">
                        {incident.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{incident.date} at {incident.time}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Patient & Location</p>
                    <p className="text-sm text-gray-800">{incident.patient} - Room {incident.room}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Description</p>
                    <p className="text-sm text-gray-800">{incident.description}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Action Taken</p>
                    <p className="text-sm text-gray-800">{incident.action}</p>
                  </div>
                </div>
              </div>
            ))}
            {incidentReports.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="mx-auto mb-2 text-green-500" size={48} />
                <p>No incidents reported today</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default NurseReports;