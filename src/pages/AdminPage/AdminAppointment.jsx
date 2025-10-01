import { useState } from 'react';
import {
  Calendar,
  TrendingUp,
  Clock,
  AlertCircle,
  BarChart3,
  Download,
  Activity,
} from 'lucide-react';

const AdminAppointment = () => {
  const [dateRange, setDateRange] = useState('today');
  const [viewType, setViewType] = useState('overview');

  // Mock data for high-level statistics
  const stats = [
    {
      label: 'Total Appointments',
      value: '248',
      change: '+12%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      label: 'Attendance Rate',
      value: '92.4%',
      change: '+2.1%',
      trend: 'up',
      icon: Activity,
      color: 'bg-green-500',
    },
    {
      label: 'No-Show Rate',
      value: '6.8%',
      change: '+0.5%',
      trend: 'down',
      icon: AlertCircle,
      color: 'bg-red-500',
    },
    {
      label: 'Avg Wait Time',
      value: '18 min',
      change: '-3 min',
      trend: 'up',
      icon: Clock,
      color: 'bg-yellow-500',
    },
  ];

  // Mock department performance data
  const departmentPerformance = [
    {
      dept: 'Cardiology',
      total: 45,
      attendanceRate: 88.9,
      noShowRate: 8.9,
      avgWaitTime: 22,
      utilizationRate: 84.4,
      trend: 'stable',
    },
    {
      dept: 'Pediatrics',
      total: 52,
      attendanceRate: 94.2,
      noShowRate: 3.8,
      avgWaitTime: 15,
      utilizationRate: 91.2,
      trend: 'up',
    },
    {
      dept: 'Orthopedics',
      total: 38,
      attendanceRate: 89.5,
      noShowRate: 7.9,
      avgWaitTime: 25,
      utilizationRate: 78.3,
      trend: 'down',
    },
    {
      dept: 'General Medicine',
      total: 68,
      attendanceRate: 95.6,
      noShowRate: 5.9,
      avgWaitTime: 12,
      utilizationRate: 95.8,
      trend: 'up',
    },
    {
      dept: 'Neurology',
      total: 28,
      attendanceRate: 85.7,
      noShowRate: 10.7,
      avgWaitTime: 28,
      utilizationRate: 68.2,
      trend: 'down',
    },
  ];

  // Time slot distribution (hourly breakdown)
  const timeSlotData = [
    { time: '08:00-09:00', booked: 24, attended: 22, capacity: 30 },
    { time: '09:00-10:00', booked: 28, attended: 26, capacity: 30 },
    { time: '10:00-11:00', booked: 30, attended: 27, capacity: 30 },
    { time: '11:00-12:00', booked: 26, attended: 24, capacity: 30 },
    { time: '13:00-14:00', booked: 22, attended: 21, capacity: 30 },
    { time: '14:00-15:00', booked: 25, attended: 23, capacity: 30 },
    { time: '15:00-16:00', booked: 29, attended: 28, capacity: 30 },
    { time: '16:00-17:00', booked: 24, attended: 23, capacity: 30 },
  ];

  const getTrendIcon = trend => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = trend => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Appointments Analytics
        </h1>
        <p className="text-gray-600">
          System performance and capacity monitoring
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              View
            </label>
            <select
              value={viewType}
              onChange={e => setViewType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Overview</option>
              <option value="trends">Trends</option>
              <option value="capacity">Capacity Analysis</option>
            </select>
          </div>
          <div className="ml-auto">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download size={18} />
              Export Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span
                className={`text-sm font-medium ${
                  stat.change.startsWith('+') && stat.trend === 'up'
                    ? 'text-green-600'
                    : stat.change.startsWith('-')
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Department Performance */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Department Performance
          </h2>
          <BarChart3 className="text-gray-400" size={20} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Department
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Daily Volume
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Attendance Rate
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  No-Show Rate
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Avg Wait
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Utilization
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentPerformance.map((dept, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {dept.dept}
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700 font-medium">
                    {dept.total}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`font-medium ${
                        dept.attendanceRate >= 90
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {dept.attendanceRate}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`font-medium ${
                        dept.noShowRate <= 5 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {dept.noShowRate}%
                    </span>
                  </td>
                  <td className="text-center py-3 px-4 text-gray-700">
                    {dept.avgWaitTime} min
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dept.utilizationRate >= 85
                              ? 'bg-green-600'
                              : dept.utilizationRate >= 70
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${dept.utilizationRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {dept.utilizationRate}%
                      </span>
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <span
                      className={`text-xl font-bold ${getTrendColor(
                        dept.trend
                      )}`}
                    >
                      {getTrendIcon(dept.trend)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time Slot Capacity */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Hourly Capacity Distribution
          </h2>
          <TrendingUp className="text-gray-400" size={20} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Time Slot
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Booked
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Attended
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Capacity
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Utilization
                </th>
              </tr>
            </thead>
            <tbody>
              {timeSlotData.map((slot, index) => {
                const utilization = Math.round(
                  (slot.attended / slot.capacity) * 100
                );
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {slot.time}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-700">
                      {slot.booked}
                    </td>
                    <td className="text-center py-3 px-4 text-green-600 font-medium">
                      {slot.attended}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-700">
                      {slot.capacity}
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              utilization >= 85
                                ? 'bg-green-600'
                                : utilization >= 70
                                ? 'bg-yellow-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {utilization}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Alerts & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">
                Attention Required
              </h3>
              <ul className="text-sm text-red-800 space-y-1">
                <li>• Neurology: No-show rate increased to 10.7% (+3.2%)</li>
                <li>• Orthopedics: Utilization dropped to 78.3% (-5.1%)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Activity className="text-green-600 mt-1" size={20} />
            <div>
              <h3 className="font-semibold text-green-900 mb-2">
                Performance Insights
              </h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• General Medicine: 95.8% utilization (Excellent)</li>
                <li>• Overall attendance improved by 2.1% this week</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAppointment;
