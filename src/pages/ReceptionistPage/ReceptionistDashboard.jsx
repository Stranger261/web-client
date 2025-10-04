import { useEffect, useState } from 'react';
import {
  CalendarCheck,
  UserCheck,
  Clock,
  CheckCircle,
  Bell,
  Plus,
  Search,
  X,
} from 'lucide-react';

import { LIMIT } from '../../config/CONST';

import Pagination from '../../components/generic/Pagination';
import AppointmentsTable from '../../components/appointments/AppointmentTables';

import { useAppointments } from '../../context/AppointmentContext';
import { useAuth } from '../../context/AuthContext';

const ReceptionistDashboard = () => {
  const { currentUser } = useAuth();
  const { allAppointments, getAllAppointments, quickCheckIn, isLoading } =
    useAppointments();

  const [activeTab, setActiveTab] = useState('today');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [page, setPage] = useState(1);

  // Filter appointments
  const todayString = new Date().toISOString().split('T')[0];

  const filteredAppointments = allAppointments
    .filter(apt => {
      if (activeTab === 'today') {
        const aptDateString = new Date(apt.appointmentDate)
          .toISOString()
          .split('T')[0];
        return aptDateString === todayString;
      }
      return true;
    })
    .filter(apt => statusFilter === 'all' || apt.status === statusFilter)
    .filter(apt => {
      if (!searchTerm) return true;
      const patient = apt.createdBy;
      const doctor = apt.doctor;
      if (!patient || !doctor) return false;
      const searchLower = searchTerm.toLowerCase();
      const patientName =
        `${patient.firstname} ${patient.lastname}`.toLowerCase();
      const doctorName = `${doctor.firstname} ${doctor.lastname}`.toLowerCase();
      return (
        patientName.includes(searchLower) || doctorName.includes(searchLower)
      );
    });

  // Pagination
  const maxPage = Math.ceil(filteredAppointments.length / LIMIT) || 1;
  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * LIMIT,
    page * LIMIT
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, activeTab]);

  // Calculate stats based on active tab
  const getStatsForPeriod = () => {
    let periodAppointments = [];

    if (activeTab === 'today') {
      periodAppointments = allAppointments.filter(apt => {
        const aptDateString = new Date(apt.appointmentDate)
          .toISOString()
          .split('T')[0];
        return aptDateString === todayString;
      });
    } else if (activeTab === 'week') {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start on Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End on Saturday

      periodAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.appointmentDate);
        return aptDate >= startOfWeek && aptDate <= endOfWeek;
      });
    } else {
      // 'all' tab
      periodAppointments = allAppointments;
    }

    return {
      totalAppointments: periodAppointments.length,
      checkedIn: periodAppointments.filter(apt => apt.status === 'check-in')
        .length,
      scheduled: periodAppointments.filter(apt => apt.status === 'scheduled')
        .length,
      completed: periodAppointments.filter(apt => apt.status === 'completed')
        .length,
    };
  };

  const stats = getStatsForPeriod();

  // Handlers
  const handleViewDetails = apt => {
    setSelectedAppointment(apt);
  };

  const handleEditAppointment = apt => {
    console.log('Edit appointment:', apt);
  };

  const handleCancelAppointment = apt => {
    console.log('Cancel appointment:', apt);
  };

  const handleCheckIn = async apt => {
    console.log('Checked In: ', apt);
    const res = await quickCheckIn(apt._id, 'checked-in');

    console.log(res);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              Good morning, {currentUser.firstname}! 👋
            </h1>
            <p className="text-gray-600">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 hover:bg-white rounded-lg transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus size={20} />
              New Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats - Dynamic based on selected period */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Total{' '}
                {activeTab === 'today'
                  ? 'Today'
                  : activeTab === 'week'
                  ? 'This Week'
                  : 'All'}
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.totalAppointments}
              </p>
            </div>
            <CalendarCheck className="text-blue-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Checked In</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.checkedIn}
              </p>
            </div>
            <UserCheck className="text-cyan-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.scheduled}
              </p>
            </div>
            <Clock className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.completed}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Tab Buttons */}
          <div className="flex gap-2">
            {['today', 'week', 'all'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab === 'week' ? 'This Week' : tab}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="flex-1 relative min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search patients or doctors..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="check-in">Checked In</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="text-gray-500">Loading appointments...</div>
        </div>
      ) : (
        <>
          <AppointmentsTable
            appointments={allAppointments}
            currentUser={currentUser}
            onViewDetails={handleViewDetails}
            onEditAppointment={handleEditAppointment}
            onCancelAppointment={handleCancelAppointment}
            isDashboard={true}
            onCheckIn={handleCheckIn}
            pageItem={paginatedAppointments}
            changing={false}
          />

          {/* Pagination Footer */}
          <div className="bg-white rounded-lg shadow-sm mt-4 p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {paginatedAppointments.length} of{' '}
                {filteredAppointments.length} appointments
              </div>
              <Pagination
                page={page}
                maxPage={maxPage}
                onPageChange={setPage}
              />
            </div>
          </div>
        </>
      )}

      {/* View Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 relative">
            <button
              className="absolute right-2 top-2 p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setSelectedAppointment(null)}
            >
              <X size={16} />
            </button>
            <div className="p-6">
              <h3 className="font-bold text-lg mb-4">Appointment Details</h3>
              {selectedAppointment.createdBy && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-semibold">
                      {selectedAppointment.createdBy.firstname?.[0]}
                      {selectedAppointment.createdBy.lastname?.[0]}
                    </div>
                    <div>
                      <div className="font-bold text-lg">
                        {selectedAppointment.createdBy.firstname}{' '}
                        {selectedAppointment.createdBy.lastname}
                      </div>
                      <div className="text-sm text-gray-600">
                        Appointment at {selectedAppointment.timeSlot?.startTime}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p>
                      <strong>Doctor:</strong> Dr.{' '}
                      {selectedAppointment.doctor?.firstname}{' '}
                      {selectedAppointment.doctor?.lastname}
                    </p>
                    <p>
                      <strong>Reason:</strong>{' '}
                      {selectedAppointment.reasonForVisit}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedAppointment.status}
                    </p>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                      onClick={() => setSelectedAppointment(null)}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
