import { useRef, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  Bed,
  DollarSign,
  Activity,
  Filter,
  Clock,
} from 'lucide-react';

const AdminReports = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: '2025-09-01',
    end: '2025-10-05',
  });
  const [selectedReport, setSelectedReport] = useState('overview');

  const reportRef = useRef(null);

  // Sample data
  const bedOccupancyData = [
    { month: 'Apr', occupied: 75, available: 25, maintenance: 5 },
    { month: 'May', occupied: 82, available: 18, maintenance: 5 },
    { month: 'Jun', occupied: 78, available: 20, maintenance: 7 },
    { month: 'Jul', occupied: 85, available: 15, maintenance: 5 },
    { month: 'Aug', occupied: 88, available: 12, maintenance: 5 },
    { month: 'Sep', occupied: 91, available: 9, maintenance: 5 },
  ];

  const patientAdmissionsData = [
    { date: 'Oct 1', admissions: 45, discharges: 38 },
    { date: 'Oct 2', admissions: 52, discharges: 41 },
    { date: 'Oct 3', admissions: 48, discharges: 45 },
    { date: 'Oct 4', admissions: 55, discharges: 42 },
    { date: 'Oct 5', admissions: 50, discharges: 47 },
  ];

  const departmentDistribution = [
    { name: 'ICU', value: 25, patients: 25 },
    { name: 'General', value: 35, patients: 52 },
    { name: 'Pediatrics', value: 15, patients: 18 },
    { name: 'Maternity', value: 12, patients: 15 },
    { name: 'Surgery', value: 8, patients: 10 },
    { name: 'Emergency', value: 5, patients: 8 },
  ];

  const revenueData = [
    { month: 'Apr', revenue: 450000, expenses: 320000 },
    { month: 'May', revenue: 480000, expenses: 335000 },
    { month: 'Jun', revenue: 520000, expenses: 340000 },
    { month: 'Jul', revenue: 550000, expenses: 360000 },
    { month: 'Aug', revenue: 580000, expenses: 370000 },
    { month: 'Sep', revenue: 610000, expenses: 385000 },
  ];

  const staffUtilizationData = [
    { department: 'Doctors', total: 45, active: 42, onLeave: 3 },
    { department: 'Nurses', total: 120, active: 115, onLeave: 5 },
    { department: 'Technicians', total: 35, active: 33, onLeave: 2 },
    { department: 'Admin', total: 25, active: 24, onLeave: 1 },
    { department: 'Support', total: 40, active: 38, onLeave: 2 },
  ];

  const avgStayByDepartment = [
    { department: 'ICU', avgDays: 7.5 },
    { department: 'General', avgDays: 4.2 },
    { department: 'Pediatrics', avgDays: 3.8 },
    { department: 'Maternity', avgDays: 2.5 },
    { department: 'Surgery', avgDays: 5.3 },
    { department: 'Emergency', avgDays: 1.2 },
  ];

  const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#ec4899',
  ];

  const summaryStats = [
    {
      label: 'Total Patients',
      value: '128',
      change: '+12%',
      icon: Users,
      color: 'blue',
    },
    {
      label: 'Bed Occupancy',
      value: '91%',
      change: '+3%',
      icon: Bed,
      color: 'green',
    },
    {
      label: 'Avg Stay Duration',
      value: '4.2 days',
      change: '-0.5d',
      icon: Clock,
      color: 'purple',
    },
    {
      label: 'Monthly Revenue',
      value: '$610K',
      change: '+5%',
      icon: DollarSign,
      color: 'emerald',
    },
  ];

  const loadScript = src => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const exportToPDF = async () => {
    setIsExporting(true);

    try {
      // Load libraries if not already loaded
      if (!window.html2canvas) {
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
        );
      }
      if (!window.jspdf) {
        await loadScript(
          'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
        );
      }

      const element = reportRef.current;

      // Capture the element as canvas
      const canvas = await window.html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if content is longer
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(
        `hospital-report-${selectedReport}-${
          new Date().toISOString().split('T')[0]
        }.pdf`
      );
      alert('PDF exported successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message + '. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    // Create CSV data
    let csvContent = `Hospital Admin Report - ${selectedReport}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Date Range: ${dateRange.start} to ${dateRange.end}\n\n`;

    // Summary Stats
    csvContent += `Summary Statistics\n`;
    csvContent += `Metric,Value,Change\n`;
    summaryStats.forEach(stat => {
      csvContent += `${stat.label},${stat.value},${stat.change}\n`;
    });

    csvContent += `\nBed Occupancy Data\n`;
    csvContent += `Month,Occupied,Available,Maintenance\n`;
    bedOccupancyData.forEach(row => {
      csvContent += `${row.month},${row.occupied},${row.available},${row.maintenance}\n`;
    });

    csvContent += `\nPatient Admissions & Discharges\n`;
    csvContent += `Date,Admissions,Discharges\n`;
    patientAdmissionsData.forEach(row => {
      csvContent += `${row.date},${row.admissions},${row.discharges}\n`;
    });

    csvContent += `\nDepartment Distribution\n`;
    csvContent += `Department,Percentage,Patients\n`;
    departmentDistribution.forEach(row => {
      csvContent += `${row.name},${row.value}%,${row.patients}\n`;
    });

    csvContent += `\nStaff Utilization\n`;
    csvContent += `Department,Total,Active,On Leave,Utilization Rate\n`;
    staffUtilizationData.forEach(row => {
      csvContent += `${row.department},${row.total},${row.active},${
        row.onLeave
      },${((row.active / row.total) * 100).toFixed(1)}%\n`;
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `hospital-report-${selectedReport}-${
        new Date().toISOString().split('T')[0]
      }.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportReport = format => {
    if (format === 'PDF') {
      exportToPDF();
    } else if (format === 'Excel') {
      exportToExcel();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div
        className="max-w-7xl mx-auto"
        style={{ colorScheme: 'light' }}
        ref={reportRef}
      >
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-600" />
                Admin Reports & Analytics
              </h1>
              <p className="text-gray-600 mt-1">
                Comprehensive insights and performance metrics
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => exportReport('PDF')}
                disabled={isExporting}
                className={`bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 flex items-center gap-2 hover:bg-gray-50 transition ${
                  isExporting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </button>
              <button
                onClick={() => exportReport('Excel')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
              >
                <Download className="w-4 h-4" />
                Export Excel
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">Date Range:</span>
              </div>
              <input
                type="date"
                value={dateRange.start}
                onChange={e =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={e =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={selectedReport}
                onChange={e => setSelectedReport(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="overview">Overview Report</option>
                <option value="financial">Financial Report</option>
                <option value="occupancy">Occupancy Report</option>
                <option value="staff">Staff Utilization</option>
                <option value="patient">Patient Analytics</option>
              </select>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {summaryStats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white p-5 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      stat.change.startsWith('+')
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Bed Occupancy Trend */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Bed Occupancy Trend (6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bedOccupancyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="occupied" fill="#3b82f6" name="Occupied" />
                <Bar dataKey="available" fill="#10b981" name="Available" />
                <Bar dataKey="maintenance" fill="#f59e0b" name="Maintenance" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Patient Admissions & Discharges */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-green-600" />
              Patient Admissions & Discharges
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={patientAdmissionsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="admissions"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Admissions"
                />
                <Line
                  type="monotone"
                  dataKey="discharges"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Discharges"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Department Distribution */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Patient Distribution by Department
            </h3>
            <div className="flex items-center">
              <ResponsiveContainer width="50%" height={280}>
                <PieChart>
                  <Pie
                    data={departmentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departmentDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {departmentDistribution.map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx] }}
                      ></div>
                      <span className="text-sm text-gray-700">{dept.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {dept.patients} patients
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue vs Expenses */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-600" />
              Revenue vs Expenses (6 Months)
            </h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={value => `$${(value / 1000).toFixed(0)}K`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Expenses"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Reports Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Staff Utilization */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Staff Utilization Report
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Department
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Active
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      On Leave
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Util. Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {staffUtilizationData.map((dept, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {dept.department}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {dept.total}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {dept.active}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {dept.onLeave}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          {((dept.active / dept.total) * 100).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Average Stay Duration */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Average Stay Duration by Department
            </h3>
            <div className="space-y-4">
              {avgStayByDepartment.map((dept, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {dept.department}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {dept.avgDays} days
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(dept.avgDays / 8) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-900">
                <strong>Hospital Average:</strong> 4.2 days
              </div>
              <div className="text-xs text-blue-700 mt-1">
                Based on last 30 days of patient data
              </div>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Key Insights & Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 mb-1">
                    High Occupancy Rate
                  </h4>
                  <p className="text-sm text-green-700">
                    Bed occupancy at 91% indicates strong demand. Consider
                    capacity expansion.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">
                    Revenue Growth
                  </h4>
                  <p className="text-sm text-blue-700">
                    5% month-over-month revenue increase shows positive
                    financial trajectory.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900 mb-1">
                    Staff Optimization
                  </h4>
                  <p className="text-sm text-yellow-700">
                    General ward has highest patient load. Review staffing
                    allocation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;
