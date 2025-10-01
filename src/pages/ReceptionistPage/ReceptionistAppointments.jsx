import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppointments } from '../../context/AppointmentContext';
import { useAuth } from '../../context/AuthContext';
import { usePatient } from '../../context/PatientContext'; // Your existing context
import LoadingOverlay from '../../components/generic/LoadingOverlay';
import Pagination from '../../components/generic/Pagination';
import { LIMIT } from '../../config/CONST';

import AppointmentsTable from '../../components/appointments/AppointmentTables';
import UniversalAppointmentModal from '../../components/modals/UniversalAppointmentModal';
import AppointmentSchedulerModal from '../../components/modals/AppointmentSchedulerModal';

const ReceptionistAppointments = () => {
  const { currentUser } = useAuth();
  const {
    allAppointments,
    filteredAppointments,
    isLoading,
    refreshAppointments,
    searchAndFilterAppointments,
    cancelAppointmentById,
    resetFilters,
  } = useAppointments();

  const {
    getAllPatients,
    patients, // Your existing patients array
    searchPatients, // Your existing search method
    isLoading: patientsLoading,
  } = usePatient();

  // State
  const [page, setPage] = useState(1);
  const [changing, setChanging] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    isFollowUp: 'all',
    dateRange: 'all',
  });
  const [isSearching, setIsSearching] = useState(false);

  // Modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewModalMode, setViewModalMode] = useState('view');
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleInitialPatient, setScheduleInitialPatient] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState(null);

  // Sorting
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await getAllPatients(1, 100); // Load first 100 patients for search
    };
    loadData();
  }, [getAllPatients]);

  // Use filteredAppointments from context, fallback to allAppointments
  const appointmentsToShow =
    filteredAppointments.length > 0 ||
    searchTerm ||
    Object.values(filters).some(f => f !== 'all')
      ? filteredAppointments
      : allAppointments;

  // Helper functions
  const getPatientName = useCallback(appointment => {
    if (appointment.patient && typeof appointment.patient === 'object') {
      return (
        appointment.patient.fullName ||
        appointment.patient.displayName ||
        `${appointment.patient.firstname} ${appointment.patient.lastname}`
      );
    }
    if (appointment.createdBy?.role === 'patient') {
      return `${appointment.createdBy.firstname} ${appointment.createdBy.lastname}`;
    }
    return 'Unknown Patient';
  }, []);

  // my sorting methods
  const sortAppointments = useCallback(
    appointments => {
      if (!appointments || appointments.length === 0) return appointments;

      const sorted = [...appointments].sort((a, b) => {
        let compareA, compareB;

        switch (sortBy) {
          case 'name': {
            const nameA = getPatientName(a).toLowerCase();
            const nameB = getPatientName(b).toLowerCase();
            compareA = nameA;
            compareB = nameB;
            break;
          }

          case 'date':
            // Sort by appointment date
            compareA = new Date(a.appointmentDate);
            compareB = new Date(b.appointmentDate);
            break;

          case 'time':
            // Sort by time slot
            compareA = a.timeSlot.startTime;
            compareB = b.timeSlot.startTime;
            break;

          case 'createdAt':
            // Sort by when appointment was created
            compareA = new Date(a.createdAt);
            compareB = new Date(b.createdAt);
            break;

          case 'status':
            compareA = a.status;
            compareB = b.status;
            break;

          case 'priority': {
            const priorityOrder = { emergency: 3, urgent: 2, normal: 1 };
            compareA = priorityOrder[a.priority] || 0;
            compareB = priorityOrder[b.priority] || 0;
            break;
          }

          default:
            return 0;
        }

        if (compareA < compareB) return sortOrder === 'asc' ? -1 : 1;
        if (compareA > compareB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      return sorted;
    },
    [sortBy, sortOrder, getPatientName]
  );

  const sortedAppointments = useMemo(() => {
    return sortAppointments(appointmentsToShow);
  }, [appointmentsToShow, sortAppointments]);

  // Pagination uses sorted appointments
  const maxPage = Math.ceil(sortedAppointments.length / LIMIT);
  const pageItem = sortedAppointments.slice((page - 1) * LIMIT, page * LIMIT);

  // Reset page when search/filter/sort changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, filters, sortBy, sortOrder]);

  // Handle search and filter
  useEffect(() => {
    const handleSearchAndFilter = async () => {
      if (!searchTerm && Object.values(filters).every(f => f === 'all')) {
        resetFilters();
        return; // Let context handle showing all appointments
      }

      setIsSearching(true);
      try {
        await searchAndFilterAppointments(searchTerm, filters);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(handleSearchAndFilter, 300); // Debounce search
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, filters, searchAndFilterAppointments, resetFilters]);

  // Handle filter changes
  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilters({
      status: 'all',
      priority: 'all',
      isFollowUp: 'all',
      dateRange: 'all',
    });
  };

  // Handle page change
  const handlePageChange = newPage => {
    if (newPage < 1 || newPage > maxPage) return;
    setChanging(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      setPage(newPage);
      setChanging(false);
    }, 290);
  };

  // Handle appointment actions
  const handleViewDetails = appointment => {
    setSelectedAppt(appointment);
    setViewModalMode('view');
    setShowViewModal(true);
  };

  // FOR EDIT APPOINTMENT
  const handleEditAppointment = appointment => {
    setAppointmentToEdit(appointment);
    console.log(appointment);
    setShowEditModal(true);
  };
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setAppointmentToEdit(null);
  };
  const handleEditSuccess = updatedAppointment => {
    console.log('Appointment updated:', updatedAppointment);
    setShowEditModal(false);
    setAppointmentToEdit(null);
    // Refresh your appointments list
    refreshAppointments(); // or whatever method you use to refresh
  };

  const handleCancelAppointment = async appointment => {
    const patientName = getPatientName(appointment);
    const reason = window.prompt(
      `Cancel appointment for ${patientName}?\n\nOptional cancellation reason:`
    );

    if (reason !== null) {
      // User didn't cancel the prompt
      try {
        await cancelAppointmentById(appointment._id, reason);
        await refreshAppointments();
      } catch (error) {
        console.error('Failed to cancel appointment:', error);
      }
    }
  };

  const handleScheduleNew = () => {
    setScheduleInitialPatient(null);
    setShowScheduleModal(true);
  };

  const handleScheduleFollowUp = patient => {
    setScheduleInitialPatient(patient);
    setShowScheduleModal(true);
  };

  const handleScheduleSuccess = async newAppointment => {
    await new Promise(res => setTimeout(res, 1000));
    await refreshAppointments();
    setShowScheduleModal(false);
  };

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date().toDateString();

    return {
      today: allAppointments.filter(appt => {
        const apptDate = new Date(appt.appointmentDate).toDateString();
        return apptDate === today;
      }).length,
      pending: allAppointments.filter(appt => appt.status === 'scheduled')
        .length,
      followUps: allAppointments.filter(appt => appt.isFollowUp).length,
      urgent: allAppointments.filter(
        appt => appt.priority === 'urgent' || appt.priority === 'emergency'
      ).length,
    };
  }, [allAppointments]);

  // Close modals
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedAppt(null);
    setViewModalMode('view');
  };

  const handleCloseScheduleModal = () => {
    setShowScheduleModal(false);
    setScheduleInitialPatient(null);
  };

  if (isLoading && allAppointments.length === 0) return <LoadingOverlay />;

  return (
    <div className="bg-base-100 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b bg-base-100 border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Patient Appointments
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and schedule patient appointments
          </p>
        </div>
        <button
          onClick={handleScheduleNew}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Schedule New Appointment
        </button>
      </header>

      {/* Filters and Search */}
      <div className="px-6 py-4 bg-base-100 border-b border-gray-200">
        <div className="flex flex-wrap gap-3 w-full sm:w-auto overflow-x-auto sm:overflow-visible">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search patients, MRN, doctor, or reason..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filters.status}
              onChange={e => handleFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="checked-in">Checked-in</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.priority}
              onChange={e => handleFilterChange('priority', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="normal">Normal</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>

            <select
              value={filters.dateRange}
              onChange={e => handleFilterChange('dateRange', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="createdAt">Sort by Created Date</option>
              <option value="date">Sort by Appointment Date</option>
              <option value="time">Sort by Time</option>
              <option value="name">Sort by Patient Name</option>
              <option value="status">Sort by Status</option>
              <option value="priority">Sort by Priority</option>
            </select>

            <button
              onClick={() =>
                setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
              }
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>

            <select
              value={filters.isFollowUp}
              onChange={e => handleFilterChange('isFollowUp', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="true">Follow-ups Only</option>
              <option value="false">New Appointments</option>
            </select>

            {/* Clear Filters Button */}
            {(searchTerm || Object.values(filters).some(f => f !== 'all')) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Results Info */}
        <div className="mt-3 text-sm text-gray-600">
          {searchTerm || Object.values(filters).some(f => f !== 'all') ? (
            <span>
              Showing {appointmentsToShow.length} filtered result
              {appointmentsToShow.length !== 1 ? 's' : ''}
              {searchTerm && <span> for "{searchTerm}"</span>}
            </span>
          ) : (
            <span>Showing all {allAppointments.length} appointments</span>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">
                  Today's Appointments
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.today}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.pending}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">
                  Follow-up Appointments
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.followUps}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-900">
                  Urgent/Emergency
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.urgent}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments Table */}
        <AppointmentsTable
          appointments={allAppointments}
          currentUser={currentUser}
          pageItem={pageItem}
          changing={changing}
          onViewDetails={handleViewDetails}
          onEditAppointment={handleEditAppointment}
          onCancelAppointment={handleCancelAppointment}
          // Receptionist sees these columns with MRN and follow-up indicator
          showColumns={[
            'person',
            'mrn',
            'date',
            'time',
            'status',
            'followUp',
            'actions',
          ]}
        />

        {/* Empty State */}
        {appointmentsToShow.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No appointments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || Object.values(filters).some(f => f !== 'all')
                ? 'Try adjusting your search or filters.'
                : 'Get started by scheduling a new appointment.'}
            </p>
            {!(searchTerm || Object.values(filters).some(f => f !== 'all')) && (
              <div className="mt-6">
                <button
                  onClick={handleScheduleNew}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Schedule New Appointment
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {appointmentsToShow.length > 0 && (
          <div className="mt-6">
            <Pagination
              page={page}
              maxPage={maxPage}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>

      {/* View/Edit Appointment Modal */}
      <UniversalAppointmentModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        mode={viewModalMode}
        appointment={selectedAppt}
        currentUser={currentUser}
        onCancel={handleCancelAppointment}
        patients={patients} // Using your existing patients array
      />

      {/* Schedule New Appointment Modal */}
      <AppointmentSchedulerModal
        isOpen={showScheduleModal}
        onClose={handleCloseScheduleModal}
        onSuccess={handleScheduleSuccess}
        initialPatient={scheduleInitialPatient}
        mode="create"
      />

      {/* Edit modal */}
      <AppointmentSchedulerModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
        existingAppointment={appointmentToEdit}
        mode="edit"
      />
    </div>
  );
};

export default ReceptionistAppointments;
