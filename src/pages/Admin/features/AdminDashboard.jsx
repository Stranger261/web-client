import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Download,
  Users,
  Activity,
  Calendar,
  Stethoscope,
  Video,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { DEVELOPMENT_BASE_URL } from '../../../configs/CONST';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  });

  const [metrics, setMetrics] = useState({
    inbed: [],
    erTriage: [],
    registration: [],
    telehealth: [],
    appointments: [],
  });

  const [summary, setSummary] = useState({
    total_admissions: 0,
    total_er_visits: 0,
    total_appointments: 0,
  });

  const [loading, setLoading] = useState(false);

  // Fetch real data from analytics API
  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const axiosCall = axios.create({
        baseURL: DEVELOPMENT_BASE_URL,
        withCredentials: true,
        headers: {
          'x-internal-api-key': 'core-1-secret-key',
          'Content-Type': 'application/json',
        },
      });

      // Add query parameters here
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      };

      const [inbed, er, registration, telehealth, appointments, summaryData] =
        await Promise.all([
          axiosCall.get('/analytics/inbed-management', { params }),
          axiosCall.get('/analytics/er-triage', { params }),
          axiosCall.get('/analytics/patient-registration', { params }),
          axiosCall.get('/analytics/telehealth', { params }),
          axiosCall.get('/analytics/appointment-system', { params }),
          axiosCall.get('/analytics/summary', { params }), // Optional: if you want filtered summary
        ]);

      setMetrics({
        inbed: inbed.data.data.metrics || [],
        erTriage: er.data.data.metrics || [],
        registration: registration.data.data.metrics || [],
        telehealth: telehealth.data.data.metrics || [],
        appointments: appointments.data.data.metrics || [],
      });

      setSummary(summaryData.data.data || {});
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [dateRange]);

  const COLORS = ['#0891b2', '#7c3aed', '#059669', '#ea580c', '#dc2626'];

  const handleExport = async (endpoint, format) => {
    try {
      const exportBackend = axios.create({
        baseURL: DEVELOPMENT_BASE_URL,
        withCredentials: true,
        headers: {
          'x-internal-api-key': 'core-1-secret-key',
          'Content-Type': 'application/json',
        },
      });

      const response = await exportBackend.get(endpoint, {
        params: {
          format,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const filename =
        response.headers['content-disposition']
          ?.split('filename=')[1]
          ?.replace(/"/g, '') || `export_${Date.now()}.${format}`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent mb-2">
            Hospital Analytics Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Real-time metrics across all hospital systems
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={e =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                To Date
              </label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={e =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={fetchMetrics}
                disabled={loading}
                className="w-full px-6 py-2 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-semibold rounded-lg hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
                />
                {loading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  const today = new Date();
                  const thirtyDaysAgo = new Date(
                    today.setDate(today.getDate() - 30),
                  );
                  setDateRange({
                    startDate: thirtyDaysAgo.toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                  });
                }}
                className="w-full px-6 py-2 border-2 border-orange-600 text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all"
              >
                Last 30 Days
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Activity className="w-6 h-6" />}
            title="Total Admissions"
            value={summary.total_admissions || 0}
            subtitle={`${dateRange.startDate} to ${dateRange.endDate}`}
            color="from-blue-600 to-cyan-600"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            title="ER Visits"
            value={summary.total_er_visits || 0}
            subtitle="Emergency department"
            color="from-red-600 to-pink-600"
          />
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            title="Appointments"
            value={summary.total_appointments || 0}
            subtitle="Total scheduled"
            color="from-purple-600 to-indigo-600"
          />
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Inbed Management */}
          <ChartCard
            title="Inbed Management"
            subtitle="Bed occupancy and admission trends"
            icon={<Activity className="w-6 h-6" />}
            onExportCSV={() =>
              handleExport('/exports/admin/inbed-management', 'csv')
            }
            onExportPDF={() =>
              handleExport('/exports/admin/inbed-management', 'pdf')
            }
            color="from-blue-600 to-cyan-600"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.inbed}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="admissions"
                  stroke="#0891b2"
                  strokeWidth={2}
                  name="Admissions"
                />
                <Line
                  type="monotone"
                  dataKey="discharges"
                  stroke="#059669"
                  strokeWidth={2}
                  name="Discharges"
                />
                <Line
                  type="monotone"
                  dataKey="occupancy"
                  stroke="#ea580c"
                  strokeWidth={2}
                  name="Occupancy"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* ER & Triage */}
          <ChartCard
            title="ER & Triage"
            subtitle="Emergency department triage levels"
            icon={<Stethoscope className="w-6 h-6" />}
            onExportCSV={() => handleExport('/exports/admin/er-triage', 'csv')}
            onExportPDF={() => handleExport('/exports/admin/er-triage', 'pdf')}
            color="from-red-600 to-pink-600"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.erTriage}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="critical" fill="#dc2626" name="Critical" />
                <Bar dataKey="urgent" fill="#ea580c" name="Urgent" />
                <Bar dataKey="non_urgent" fill="#059669" name="Non-Urgent" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ChartCard
              title="Patient Registration"
              subtitle="Registration trends"
              icon={<Users className="w-5 h-5" />}
              onExportCSV={() =>
                handleExport('/exports/admin/patient-registration', 'csv')
              }
              onExportPDF={() =>
                handleExport('/exports/admin/patient-registration', 'pdf')
              }
              color="from-cyan-600 to-teal-600"
              small
            >
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={metrics.registration}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="online"
                    stroke="#0891b2"
                    strokeWidth={2}
                    name="Online"
                  />
                  <Line
                    type="monotone"
                    dataKey="walkin"
                    stroke="#7c3aed"
                    strokeWidth={2}
                    name="Walk-in"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Telehealth"
              subtitle="Virtual consultations"
              icon={<Video className="w-5 h-5" />}
              onExportCSV={() =>
                handleExport('/exports/admin/telehealth', 'csv')
              }
              onExportPDF={() =>
                handleExport('/exports/admin/telehealth', 'pdf')
              }
              color="from-green-600 to-emerald-600"
              small
            >
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={metrics.telehealth}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {metrics.telehealth.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* Appointments */}
          <ChartCard
            title="Smart Appointment System"
            subtitle="Booking and completion rates"
            icon={<Calendar className="w-6 h-6" />}
            onExportCSV={() =>
              handleExport('/exports/admin/appointment-system', 'csv')
            }
            onExportPDF={() =>
              handleExport('/exports/admin/appointment-system', 'pdf')
            }
            color="from-purple-600 to-indigo-600"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics.appointments}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="scheduled" fill="#7c3aed" name="Scheduled" />
                <Bar dataKey="completed" fill="#059669" name="Completed" />
                <Bar dataKey="cancelled" fill="#dc2626" name="Cancelled" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Bulk Export */}
        <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-lg p-6 border-2 border-orange-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Download className="w-6 h-6 text-orange-600" />
            Export All Reports
          </h2>
          <p className="text-gray-600 mb-6">
            Download comprehensive reports for the selected date range
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              {
                name: 'Inbed Mgmt',
                icon: Activity,
                endpoint: '/exports/admin/inbed-management',
                color: 'blue',
              },
              {
                name: 'ER & Triage',
                icon: Stethoscope,
                endpoint: '/exports/admin/er-triage',
                color: 'red',
              },
              {
                name: 'Registration',
                icon: Users,
                endpoint: '/exports/admin/patient-registration',
                color: 'cyan',
              },
              {
                name: 'Telehealth',
                icon: Video,
                endpoint: '/exports/admin/telehealth',
                color: 'green',
              },
              {
                name: 'Appointments',
                icon: Calendar,
                endpoint: '/exports/admin/appointment-system',
                color: 'purple',
              },
            ].map(({ name, icon: Icon, endpoint, color }) => (
              <button
                key={name}
                onClick={() => handleExport(endpoint, 'pdf')}
                className={`px-4 py-3 bg-white border-2 border-${color}-600 text-${color}-600 font-semibold rounded-lg hover:bg-${color}-50 transition-all flex flex-col items-center gap-2`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, subtitle, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div
        className={`w-12 h-12 rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-white`}
      >
        {icon}
      </div>
    </div>
    <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
    <p className="text-3xl font-bold text-gray-800 mb-1">
      {value.toLocaleString()}
    </p>
    <p className="text-xs text-gray-500">{subtitle}</p>
  </div>
);

const ChartCard = ({
  title,
  subtitle,
  icon,
  onExportCSV,
  onExportPDF,
  color,
  children,
  small = false,
}) => (
  <div className="bg-white rounded-2xl shadow-lg p-6">
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div
          className={`${small ? 'w-10 h-10' : 'w-12 h-12'} rounded-lg bg-gradient-to-r ${color} flex items-center justify-center text-white`}
        >
          {icon}
        </div>
        <div>
          <h3
            className={`${small ? 'text-lg' : 'text-xl'} font-bold text-gray-800`}
          >
            {title}
          </h3>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onExportCSV}
          className={`${small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2`}
        >
          <FileText className="w-4 h-4" />
          CSV
        </button>
        <button
          onClick={onExportPDF}
          className={`${small ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'} bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2`}
        >
          <Download className="w-4 h-4" />
          PDF
        </button>
      </div>
    </div>
    {children}
  </div>
);

export default AdminDashboard;
