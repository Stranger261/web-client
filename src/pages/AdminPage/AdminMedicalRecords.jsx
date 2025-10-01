import React, { useState } from 'react';
import {
  FileText,
  Shield,
  Activity,
  AlertTriangle,
  Eye,
  Download,
  Search,
  Filter,
  Clock,
  Users,
} from 'lucide-react';

const AdminMedicalRecords = () => {
  const [dateRange, setDateRange] = useState('month');
  const [auditFilter, setAuditFilter] = useState('all');
  const [showRecordDetails, setShowRecordDetails] = useState(false);

  // System-level statistics
  const stats = [
    {
      label: 'Total Records',
      value: '12,458',
      change: '+234',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      label: 'Records Accessed',
      value: '1,847',
      change: 'Today',
      icon: Eye,
      color: 'bg-green-500',
    },
    {
      label: 'Pending Reviews',
      value: '23',
      change: 'Action needed',
      icon: AlertTriangle,
      color: 'bg-yellow-500',
    },
    {
      label: 'Compliance Rate',
      value: '98.7%',
      change: '+0.3%',
      icon: Shield,
      color: 'bg-purple-500',
    },
  ];

  // Access audit logs
  const accessLogs = [
    {
      timestamp: '2025-09-30 14:32',
      user: 'Dr. Sarah Chen',
      role: 'Doctor',
      action: 'Viewed Record',
      recordId: 'MR-2024-8734',
      department: 'Cardiology',
      duration: '8 min',
      authorized: true,
    },
    {
      timestamp: '2025-09-30 14:18',
      user: 'Nurse Maria Lopez',
      role: 'Nurse',
      action: 'Updated Vitals',
      recordId: 'MR-2024-8721',
      department: 'Emergency',
      duration: '3 min',
      authorized: true,
    },
    {
      timestamp: '2025-09-30 14:05',
      user: 'Dr. James Wilson',
      role: 'Doctor',
      action: 'Added Prescription',
      recordId: 'MR-2024-8698',
      department: 'Pediatrics',
      duration: '12 min',
      authorized: true,
    },
    {
      timestamp: '2025-09-30 13:52',
      user: 'Dr. Michael Lee',
      role: 'Doctor',
      action: 'Viewed Record',
      recordId: 'MR-2024-7453',
      department: 'Orthopedics',
      duration: '15 min',
      authorized: true,
    },
    {
      timestamp: '2025-09-30 13:40',
      user: 'Admin User',
      role: 'Admin',
      action: 'Audit Access',
      recordId: 'MR-2024-8012',
      department: 'System',
      duration: '2 min',
      authorized: true,
    },
    {
      timestamp: '2025-09-30 13:28',
      user: 'Receptionist Jane',
      role: 'Receptionist',
      action: 'Attempted Access',
      recordId: 'MR-2024-8501',
      department: 'General',
      duration: '0 min',
      authorized: false,
    },
  ];

  // Department record statistics
  const departmentStats = [
    {
      dept: 'Cardiology',
      totalRecords: 2340,
      accessed: 423,
      updated: 89,
      avgAccessTime: '7.2 min',
    },
    {
      dept: 'Pediatrics',
      totalRecords: 3120,
      accessed: 589,
      updated: 134,
      avgAccessTime: '5.8 min',
    },
    {
      dept: 'Orthopedics',
      totalRecords: 1890,
      accessed: 298,
      updated: 67,
      avgAccessTime: '9.1 min',
    },
    {
      dept: 'Emergency',
      totalRecords: 2567,
      accessed: 734,
      updated: 245,
      avgAccessTime: '4.3 min',
    },
    {
      dept: 'General',
      totalRecords: 2541,
      accessed: 456,
      updated: 98,
      avgAccessTime: '6.5 min',
    },
  ];

  // Compliance issues
  const complianceIssues = [
    {
      id: 'C-001',
      type: 'Missing Signature',
      recordId: 'MR-2024-8234',
      department: 'Cardiology',
      severity: 'Medium',
      daysOpen: 3,
    },
    {
      id: 'C-002',
      type: 'Incomplete Documentation',
      recordId: 'MR-2024-7956',
      department: 'Pediatrics',
      severity: 'High',
      daysOpen: 7,
    },
    {
      id: 'C-003',
      type: 'Delayed Entry',
      recordId: 'MR-2024-8101',
      department: 'Emergency',
      severity: 'Low',
      daysOpen: 1,
    },
  ];

  const getSeverityColor = severity => {
    switch (severity) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Medical Records Audit
        </h1>
        <p className="text-gray-600">
          System oversight and compliance monitoring
        </p>
      </div>

      {/* Admin Notice */}
      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="text-blue-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">
              Read-Only Access
            </h3>
            <p className="text-sm text-blue-800">
              You have audit-level access for compliance monitoring. Direct
              editing of medical records requires doctor/nurse credentials. All
              access is logged for security purposes.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex flex-wrap gap-4">
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
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Audit Filter
            </label>
            <select
              value={auditFilter}
              onChange={e => setAuditFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Activities</option>
              <option value="unauthorized">Unauthorized Attempts</option>
              <option value="compliance">Compliance Issues</option>
              <option value="high_access">High Access Frequency</option>
            </select>
          </div>
          <div className="ml-auto flex items-end gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
              <Download size={18} />
              Export Audit Report
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}
            </h3>
            <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
            <p className="text-xs text-gray-500">{stat.change}</p>
          </div>
        ))}
      </div>

      {/* Compliance Issues */}
      {complianceIssues.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="text-yellow-600" size={24} />
              Compliance Issues
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Issue ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Record ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Department
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Severity
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Days Open
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {complianceIssues.map(issue => (
                  <tr
                    key={issue.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-blue-600">
                      {issue.id}
                    </td>
                    <td className="py-3 px-4 text-gray-900">{issue.type}</td>
                    <td className="py-3 px-4 text-gray-700">
                      {issue.recordId}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {issue.department}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(
                          issue.severity
                        )}`}
                      >
                        {issue.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700">
                      {issue.daysOpen} days
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Notify Staff
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Department Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Department Record Activity
          </h2>
          <Activity className="text-gray-400" size={20} />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Department
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Total Records
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Accessed (30d)
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Updated (30d)
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Avg Access Time
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Activity Rate
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentStats.map((dept, index) => {
                const activityRate = Math.round(
                  (dept.accessed / dept.totalRecords) * 100
                );
                return (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4 font-medium text-gray-900">
                      {dept.dept}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-700">
                      {dept.totalRecords.toLocaleString()}
                    </td>
                    <td className="text-center py-3 px-4 text-blue-600 font-medium">
                      {dept.accessed}
                    </td>
                    <td className="text-center py-3 px-4 text-green-600 font-medium">
                      {dept.updated}
                    </td>
                    <td className="text-center py-3 px-4 text-gray-700">
                      {dept.avgAccessTime}
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${activityRate}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {activityRate}%
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

      {/* Access Audit Log */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Access Audit Log</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search logs..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  User
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Role
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Action
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Record ID
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Department
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Duration
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {accessLogs.map((log, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-gray-700 text-sm">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 text-gray-900">{log.user}</td>
                  <td className="py-3 px-4 text-gray-700">{log.role}</td>
                  <td className="py-3 px-4 text-gray-700">{log.action}</td>
                  <td className="py-3 px-4 font-medium text-blue-600">
                    {log.recordId}
                  </td>
                  <td className="py-3 px-4 text-gray-700">{log.department}</td>
                  <td className="py-3 px-4 text-center text-gray-700">
                    {log.duration}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {log.authorized ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Authorized
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Denied
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security Alert */}
      {accessLogs.some(log => !log.authorized) && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="text-red-600 mt-1" size={20} />
          <div>
            <h3 className="font-semibold text-red-900 mb-1">Security Alert</h3>
            <p className="text-sm text-red-800">
              Unauthorized access attempt detected. User "Receptionist Jane"
              attempted to access medical record without proper clearance.
              Review security protocols and user permissions.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMedicalRecords;
