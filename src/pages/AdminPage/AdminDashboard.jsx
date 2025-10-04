import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  Clock,
  AlertCircle,
  Activity,
  FileText,
  Shield,
  Database,
  Settings,
  Bell,
} from 'lucide-react';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const AdminDashboard = () => {
  const [timeRange, setTimeRange] = useState('month');

  // High-level system metrics
  const systemMetrics = [
    {
      title: 'Total System Users',
      value: '156',
      change: '+5 this month',
      icon: Users,
      color: 'bg-blue-500',
      subtitle: '24 Doctors, 45 Nurses, 87 Staff',
    },
    {
      title: 'Monthly Revenue',
      value: '$284,650',
      change: '+18% vs last month',
      icon: DollarSign,
      color: 'bg-green-500',
      subtitle: 'Target: $300K',
    },
    {
      title: 'Total Appointments',
      value: '1,247',
      change: '+12% vs last month',
      icon: Calendar,
      color: 'bg-purple-500',
      subtitle: '89% completion rate',
    },
    {
      title: 'System Health',
      value: '98.5%',
      change: 'Uptime',
      icon: Activity,
      color: 'bg-orange-500',
      subtitle: '0 critical alerts',
    },
  ];

  // Appointment trends over time (monitoring)
  const appointmentTrends = [
    { month: 'Apr', total: 1050, completed: 920, cancelled: 85, noShows: 45 },
    { month: 'May', total: 1120, completed: 995, cancelled: 78, noShows: 47 },
    { month: 'Jun', total: 1180, completed: 1040, cancelled: 92, noShows: 48 },
    { month: 'Jul', total: 1205, completed: 1070, cancelled: 88, noShows: 47 },
    { month: 'Aug', total: 1247, completed: 1105, cancelled: 95, noShows: 47 },
  ];

  // Revenue trends
  const revenueTrends = [
    { month: 'Apr', revenue: 245000, expenses: 180000, profit: 65000 },
    { month: 'May', revenue: 258000, expenses: 185000, profit: 73000 },
    { month: 'Jun', revenue: 272000, expenses: 190000, profit: 82000 },
    { month: 'Jul', revenue: 265000, expenses: 188000, profit: 77000 },
    { month: 'Aug', revenue: 284650, expenses: 195000, profit: 89650 },
  ];

  // User role distribution
  const userDistribution = [
    { name: 'Doctors', value: 24, color: '#3b82f6' },
    { name: 'Nurses', value: 45, color: '#10b981' },
    { name: 'Receptionists', value: 18, color: '#f59e0b' },
    { name: 'Lab Staff', value: 12, color: '#8b5cf6' },
    { name: 'Admin Staff', value: 32, color: '#ec4899' },
    { name: 'Other', value: 25, color: '#6b7280' },
  ];

  // Department performance
  const departmentPerformance = [
    {
      dept: 'Cardiology',
      appointments: 245,
      revenue: 68500,
      satisfaction: 4.7,
    },
    {
      dept: 'Pediatrics',
      appointments: 312,
      revenue: 52400,
      satisfaction: 4.8,
    },
    {
      dept: 'Orthopedics',
      appointments: 189,
      revenue: 71200,
      satisfaction: 4.6,
    },
    { dept: 'Neurology', appointments: 167, revenue: 58900, satisfaction: 4.5 },
    { dept: 'General', appointments: 334, revenue: 33650, satisfaction: 4.6 },
  ];

  // System alerts and notifications
  const systemAlerts = [
    {
      type: 'warning',
      message: 'Database backup scheduled in 2 hours',
      time: '10 min ago',
      priority: 'medium',
    },
    {
      type: 'info',
      message: '5 new user accounts pending approval',
      time: '1 hour ago',
      priority: 'medium',
    },
    {
      type: 'success',
      message: 'System update completed successfully',
      time: '3 hours ago',
      priority: 'low',
    },
    {
      type: 'warning',
      message: 'Storage usage at 78% capacity',
      time: '5 hours ago',
      priority: 'high',
    },
    {
      type: 'info',
      message: 'Monthly report generation scheduled',
      time: '1 day ago',
      priority: 'low',
    },
  ];

  // Key operational metrics
  const operationalMetrics = [
    {
      metric: 'Avg. Appointment Duration',
      value: '28 min',
      status: 'good',
      trend: 'stable',
    },
    {
      metric: 'Patient No-Show Rate',
      value: '3.8%',
      status: 'warning',
      trend: 'up',
    },
    { metric: 'Staff Utilization', value: '82%', status: 'good', trend: 'up' },
    {
      metric: 'System Response Time',
      value: '1.2s',
      status: 'good',
      trend: 'down',
    },
  ];

  // Recent system activities (audit trail)
  const systemActivities = [
    {
      user: 'Dr. Smith',
      action: 'Accessed medical records',
      module: 'Records',
      time: '5 min ago',
    },
    {
      user: 'Admin Johnson',
      action: 'Updated user role permissions',
      module: 'Settings',
      time: '15 min ago',
    },
    {
      user: 'Nurse Williams',
      action: 'Generated patient report',
      module: 'Reports',
      time: '32 min ago',
    },
    {
      user: 'System',
      action: 'Automated backup completed',
      module: 'System',
      time: '1 hour ago',
    },
    {
      user: 'Receptionist Lee',
      action: 'Bulk appointment export',
      module: 'Appointments',
      time: '2 hours ago',
    },
  ];

  const getAlertColor = type => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-100 border-yellow-400 text-yellow-800';
      case 'success':
        return 'bg-green-100 border-green-400 text-green-800';
      case 'info':
        return 'bg-blue-100 border-blue-400 text-blue-800';
      case 'error':
        return 'bg-red-100 border-red-400 text-red-800';
      default:
        return 'bg-gray-100 border-gray-400 text-gray-800';
    }
  };

  const getStatusColor = status => {
    switch (status) {
      case 'good':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="w-8 h-8 text-blue-600" />
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                System overview and management console
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button className="p-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow relative">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <select
                value={timeRange}
                onChange={e => setTimeRange(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* System Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`${stat.color} p-3 rounded-xl`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <p className="text-gray-600 text-sm font-medium">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                <p className="text-green-600 text-xs mt-2 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </p>
              </div>
            );
          })}
        </div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Appointment Monitoring (Trends) */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Appointment Trends Monitoring
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                View Report
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={appointmentTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="cancelled"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="noShows"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">89%</p>
                <p className="text-xs text-gray-600">Completion Rate</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">7.6%</p>
                <p className="text-xs text-gray-600">Cancellation Rate</p>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-600">3.8%</p>
                <p className="text-xs text-gray-600">No-Show Rate</p>
              </div>
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              User Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-3xl font-bold text-gray-900">156</p>
              <p className="text-sm text-gray-600">Total Active Users</p>
            </div>
          </div>
        </div>

        {/* Revenue Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Revenue Overview
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                Financial Report
              </button>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={value => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="revenue" fill="#3b82f6" />
                <Bar dataKey="expenses" fill="#ef4444" />
                <Bar dataKey="profit" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Department Performance */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Department Performance
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                Full Report
              </button>
            </div>
            <div className="space-y-3">
              {departmentPerformance.map((dept, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-gray-900">
                      {dept.dept}
                    </span>
                    <span className="text-sm text-gray-600">
                      ⭐ {dept.satisfaction}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Appointments</p>
                      <p className="font-semibold text-gray-900">
                        {dept.appointments}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Revenue</p>
                      <p className="font-semibold text-green-600">
                        ${dept.revenue.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* System Activity Audit Trail */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                System Activity Log
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:underline">
                View Full Log
              </button>
            </div>
            <div className="space-y-3">
              {systemActivities.map((activity, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Module: {activity.module}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* System Alerts */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  System Alerts
                </h2>
                <AlertCircle className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-3">
                {systemAlerts.map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-3 border-l-4 rounded ${getAlertColor(
                      alert.type
                    )}`}
                  >
                    <p className="font-medium text-sm">{alert.message}</p>
                    <p className="text-xs mt-1">{alert.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Key Metrics
              </h2>
              <div className="space-y-4">
                {operationalMetrics.map((metric, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{metric.metric}</p>
                      <p
                        className={`text-lg font-bold ${getStatusColor(
                          metric.status
                        )}`}
                      >
                        {metric.value}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs ${
                          metric.trend === 'up'
                            ? 'text-green-600'
                            : metric.trend === 'down'
                            ? 'text-red-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {metric.trend === 'up'
                          ? '↑'
                          : metric.trend === 'down'
                          ? '↓'
                          : '→'}{' '}
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
