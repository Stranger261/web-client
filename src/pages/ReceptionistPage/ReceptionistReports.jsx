import { useState, useEffect } from 'react';
import {
  Printer,
  Save,
  Clock,
  Users,
  Calendar,
  DollarSign,
  FileText,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const ReceptionistReports = () => {
  const { currentUser } = useAuth();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [reportData, setReportData] = useState({
    date: new Date().toISOString().split('T')[0],
    shift: determineCurrentShift(),
    receptionistName: '',

    // Patient Registration
    newPatientsRegistered: 0,
    existingPatientsUpdated: 0,
    totalPatientsServed: 0,

    // Appointments
    appointmentsScheduled: 0,
    appointmentsRescheduled: 0,
    appointmentsCancelled: 0,
    walkInPatients: 0,
    noShows: 0,

    // Billing & Payments
    paymentsProcessed: 0,
    totalAmountCollected: 0,
    receiptsIssued: 0,
    pendingPayments: 0,

    // Communication
    phoneCallsReceived: 0,
    appointmentInquiries: 0,
    generalInquiries: 0,

    // Issues & Notes
    systemIssues: '',
    patientComplaints: '',
    notes: '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Automatic time update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-determine shift based on current time
  function determineCurrentShift() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'morning';
    if (hour >= 14 && hour < 22) return 'afternoon';
    return 'night';
  }

  // Simulated API call to fetch existing data
  useEffect(() => {
    // In real implementation, fetch data from API
    // fetchReportData();

    // Simulate getting receptionist name from auth session
    const loggedInUser = getLoggedInReceptionist();
    if (loggedInUser) {
      setReportData(prev => ({
        ...prev,
        receptionistName: loggedInUser,
      }));
    }
  }, []);

  // Simulated function to get logged-in user
  function getLoggedInReceptionist() {
    // In real implementation: return user from session/localStorage
    // return localStorage.getItem('receptionistName');
    return ''; // Empty for now, will be filled from actual auth
  }

  // Simulated API call to fetch real-time stats
  async function fetchLiveStats() {
    // In real implementation, call actual API endpoints
    // const stats = await fetch('/api/receptionist-reports/today').then(r => r.json());

    // Simulating API response
    setSaveMessage('Refreshing data...');
    setTimeout(() => {
      // Simulate fetched data
      setReportData(prev => ({
        ...prev,
        // In reality, update with API data
      }));
      setSaveMessage('Data refreshed!');
      setTimeout(() => setSaveMessage(''), 2000);
    }, 1000);
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setReportData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save report to database
  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('Saving report...');

    try {
      // In real implementation:
      // const response = await fetch('/api/receptionist-reports', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reportData)
      // });

      // Simulate API call
      setTimeout(() => {
        setIsSaving(false);
        setSaveMessage('Report saved successfully! ✓');
        setTimeout(() => setSaveMessage(''), 3000);
      }, 1000);
    } catch (error) {
      setIsSaving(false);
      setSaveMessage('Error saving report. Please try again.');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatTime = date => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = date => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-8">
        {/* Header with Live Time */}
        <div className="border-b-2 border-blue-600 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-blue-900 mb-2">
                Receptionist Daily Report
              </h1>
              <p className="text-gray-600">Front Desk Operations Summary</p>
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Clock size={16} className="text-blue-600" />
                <span className="font-mono text-blue-600">
                  {formatTime(currentTime)}
                </span>
                <span className="text-gray-500">|</span>
                <span className="text-gray-600">{formatDate(currentTime)}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchLiveStats}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <RefreshCw size={18} />
                Refresh Data
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
              >
                <Save size={18} />
                {isSaving ? 'Saving...' : 'Save Report'}
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Printer size={18} />
                Print
              </button>
            </div>
          </div>

          {/* Save Message */}
          {saveMessage && (
            <div
              className={`mt-3 p-3 rounded-lg text-sm font-medium ${
                saveMessage.includes('Error')
                  ? 'bg-red-100 text-red-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {saveMessage}
            </div>
          )}
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Report Date
            </label>
            <input
              type="date"
              name="date"
              value={reportData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Current Shift
            </label>
            <select
              name="shift"
              value={reportData.shift}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="morning">Morning Shift (6AM - 2PM)</option>
              <option value="afternoon">Afternoon Shift (2PM - 10PM)</option>
              <option value="night">Night Shift (10PM - 6AM)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Receptionist Name
            </label>
            <input
              type="text"
              name="receptionistName"
              value={currentUser.email}
              onChange={handleChange}
              placeholder="Auto-filled from login"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
            />
          </div>
        </div>

        {/* Patient Records Section */}
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-blue-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              Patient Records Management
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Patients Registered
              </label>
              <input
                type="number"
                name="newPatientsRegistered"
                value={reportData.newPatientsRegistered}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Info Updates
              </label>
              <input
                type="number"
                name="existingPatientsUpdated"
                value={reportData.existingPatientsUpdated}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Patients Served
              </label>
              <input
                type="number"
                name="totalPatientsServed"
                value={reportData.totalPatientsServed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Appointments Section */}
        <div className="mb-6 bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="text-green-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              Appointment Management
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scheduled
              </label>
              <input
                type="number"
                name="appointmentsScheduled"
                value={reportData.appointmentsScheduled}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rescheduled
              </label>
              <input
                type="number"
                name="appointmentsRescheduled"
                value={reportData.appointmentsRescheduled}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cancelled
              </label>
              <input
                type="number"
                name="appointmentsCancelled"
                value={reportData.appointmentsCancelled}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Walk-ins
              </label>
              <input
                type="number"
                name="walkInPatients"
                value={reportData.walkInPatients}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No-shows
              </label>
              <input
                type="number"
                name="noShows"
                value={reportData.noShows}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {/* Billing & Payments Section */}
        <div className="mb-6 bg-gradient-to-r from-purple-50 to-purple-100 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="text-purple-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              Billing & Payments
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payments Processed
              </label>
              <input
                type="number"
                name="paymentsProcessed"
                value={reportData.paymentsProcessed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount Collected (₱)
              </label>
              <input
                type="number"
                name="totalAmountCollected"
                value={reportData.totalAmountCollected}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receipts Issued
              </label>
              <input
                type="number"
                name="receiptsIssued"
                value={reportData.receiptsIssued}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pending Payments
              </label>
              <input
                type="number"
                name="pendingPayments"
                value={reportData.pendingPayments}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Communication Section */}
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-orange-600" size={24} />
            <h2 className="text-xl font-bold text-gray-800">
              Communication & Inquiries
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Calls Received
              </label>
              <input
                type="number"
                name="phoneCallsReceived"
                value={reportData.phoneCallsReceived}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Inquiries
              </label>
              <input
                type="number"
                name="appointmentInquiries"
                value={reportData.appointmentInquiries}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                General Inquiries
              </label>
              <input
                type="number"
                name="generalInquiries"
                value={reportData.generalInquiries}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Issues & Notes */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded">
              System Issues / Technical Problems
            </span>
          </h2>
          <textarea
            name="systemIssues"
            value={reportData.systemIssues}
            onChange={handleChange}
            placeholder="Report any system downtime, printer issues, payment system problems, etc."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded">
              Patient Complaints / Feedback
            </span>
          </h2>
          <textarea
            name="patientComplaints"
            value={reportData.patientComplaints}
            onChange={handleChange}
            placeholder="Record any patient complaints about wait times, service, etc."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Additional Notes
          </h2>
          <textarea
            name="notes"
            value={reportData.notes}
            onChange={handleChange}
            placeholder="Any other observations, reminders for next shift, or important information..."
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Summary Dashboard */}
        <div className="bg-gradient-to-r from-slate-100 to-slate-200 p-6 rounded-lg border-2 border-slate-300">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
            Daily Summary
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-blue-500">
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-blue-600">
                {reportData.totalPatientsServed}
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-green-500">
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">
                Appointments
              </p>
              <p className="text-3xl font-bold text-green-600">
                {reportData.appointmentsScheduled}
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-purple-500">
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">
                Payments
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {reportData.paymentsProcessed}
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow-md border-l-4 border-orange-500">
              <p className="text-xs text-gray-600 mb-1 uppercase font-semibold">
                Calls Received
              </p>
              <p className="text-3xl font-bold text-orange-600">
                {reportData.phoneCallsReceived}
              </p>
            </div>
          </div>

          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700">
                Total Collections:
              </span>
              <span className="text-2xl font-bold text-green-600">
                ₱{reportData.totalAmountCollected.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <p>
              Report generated: {formatDate(currentTime)} at{' '}
              {formatTime(currentTime)}
            </p>
            <p className="font-semibold">
              Receptionist: {reportData.receptionistName || '___________'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistReports;
