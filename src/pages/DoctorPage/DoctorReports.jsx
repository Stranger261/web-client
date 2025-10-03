import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
  Search,
  Eye,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';

const DoctorReports = () => {
  const [selectedReport, setSelectedReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [searchTerm, setSearchTerm] = useState('');

  // Sample data
  const summaryStats = {
    totalPatients: 156,
    activeCases: 23,
    completedTreatments: 89,
    successRate: 94.5,
  };

  const treatmentReports = [
    {
      id: 1,
      patientName: 'Maria Santos',
      diagnosis: 'Acute Bronchitis',
      startDate: '2025-09-15',
      endDate: '2025-09-28',
      outcome: 'Successful',
      notes: 'Patient responded well to antibiotics. Full recovery achieved.',
    },
    {
      id: 2,
      patientName: 'Juan Dela Cruz',
      diagnosis: 'Type 2 Diabetes Management',
      startDate: '2025-08-01',
      endDate: 'Ongoing',
      outcome: 'In Progress',
      notes: 'Blood sugar levels improving. Continue current medication.',
    },
    {
      id: 3,
      patientName: 'Elena Rodriguez',
      diagnosis: 'Hypertension',
      startDate: '2025-09-01',
      endDate: '2025-09-25',
      outcome: 'Successful',
      notes: 'BP normalized. Patient advised on lifestyle modifications.',
    },
    {
      id: 4,
      patientName: 'Carlos Reyes',
      diagnosis: 'Gastroenteritis',
      startDate: '2025-09-20',
      endDate: '2025-09-24',
      outcome: 'Successful',
      notes: 'Symptoms resolved. Advised on dietary precautions.',
    },
  ];

  const caseSummaries = [
    {
      category: 'Respiratory Infections',
      count: 34,
      percentage: 28,
      trend: 'up',
    },
    {
      category: 'Chronic Disease Management',
      count: 45,
      percentage: 37,
      trend: 'stable',
    },
    {
      category: 'Pediatric Cases',
      count: 28,
      percentage: 23,
      trend: 'down',
    },
    {
      category: 'General Consultation',
      count: 15,
      percentage: 12,
      trend: 'up',
    },
  ];

  const monthlyStats = [
    { month: 'Jun', patients: 42, success: 95 },
    { month: 'Jul', patients: 48, success: 93 },
    { month: 'Aug', patients: 52, success: 96 },
    { month: 'Sep', patients: 56, success: 94 },
  ];

  const filteredReports = treatmentReports.filter(
    report =>
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Clinical Reports
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track treatment outcomes and patient statistics
                </p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="w-4 h-4" />
                Export Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Patients</p>
                <p className="text-3xl font-bold text-gray-900">
                  {summaryStats.totalPatients}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-gray-500 ml-2">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Active Cases</p>
                <p className="text-3xl font-bold text-gray-900">
                  {summaryStats.activeCases}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-orange-600 font-medium">Ongoing</span>
              <span className="text-gray-500 ml-2">treatment</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">
                  {summaryStats.completedTreatments}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">This month</span>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900">
                  {summaryStats.successRate}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-purple-600 font-medium">Excellent</span>
              <span className="text-gray-500 ml-2">performance</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setSelectedReport('overview')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedReport === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setSelectedReport('treatment')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedReport === 'treatment'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Treatment Reports
                </div>
              </button>
              <button
                onClick={() => setSelectedReport('cases')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  selectedReport === 'cases'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4" />
                  Case Summaries
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {selectedReport === 'overview' && (
          <div className="space-y-6">
            {/* Monthly Performance Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Monthly Performance
              </h3>
              <div className="space-y-4">
                {monthlyStats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="w-16 text-sm font-medium text-gray-600">
                      {stat.month}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">
                          Patients: {stat.patients}
                        </span>
                        <span className="text-sm text-gray-600">
                          Success: {stat.success}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-blue-600 h-3 rounded-full transition-all"
                          style={{ width: `${(stat.patients / 60) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Distribution */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Case Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseSummaries.map((category, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">
                        {category.category}
                      </h4>
                      <span className="text-2xl font-bold text-blue-600">
                        {category.count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 whitespace-nowrap">
                        {category.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Treatment Reports Tab */}
        {selectedReport === 'treatment' && (
          <div className="space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search by patient name or diagnosis..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Filter className="w-4 h-4" />
                  More Filters
                </button>
              </div>
            </div>

            {/* Treatment Reports List */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnosis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outcome
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredReports.map(report => (
                      <tr
                        key={report.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.patientName}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {report.diagnosis}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {report.startDate} to {report.endDate}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              report.outcome === 'Successful'
                                ? 'bg-green-100 text-green-800'
                                : report.outcome === 'In Progress'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {report.outcome}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Case Summaries Tab */}
        {selectedReport === 'cases' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {caseSummaries.map((category, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.category}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Total cases handled
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">
                        {category.count}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        {category.trend === 'up' && (
                          <span className="text-green-600 text-sm">↑ +8%</span>
                        )}
                        {category.trend === 'down' && (
                          <span className="text-red-600 text-sm">↓ -5%</span>
                        )}
                        {category.trend === 'stable' && (
                          <span className="text-gray-600 text-sm">
                            → Stable
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Percentage of total cases</span>
                      <span className="font-medium">
                        {category.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                    View Detailed Report
                  </button>
                </div>
              ))}
            </div>

            {/* Recent Case Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Recent Case Notes
              </h3>
              <div className="space-y-4">
                {treatmentReports.slice(0, 3).map(report => (
                  <div
                    key={report.id}
                    className="border-l-4 border-blue-600 pl-4 py-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {report.patientName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {report.diagnosis}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          {report.notes}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-4">
                        {report.endDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorReports;
