// File: /src/pages/DoctorPages/features/DoctorAppointment.jsx
import { useCallback, useEffect, useState } from 'react';
import { Filter, X, Calendar, Search } from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
import { useAppointment } from '../../../contexts/AppointmentContext';
import { useSocket } from '../../../contexts/SocketContext';

import { Button } from '../../../components/ui/button';
import Modal from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/pagination';
import { Select } from '../../../components/ui/select';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import AppointmentDetailModal from '../../../components/Modals/AppointmentDetailModal';

import AppointmentsTable from '../../../components/shared/AppointmentsTable';
import { FilterPanel } from '../../../components/ui/filter-panel';

const DoctorAppointment = () => {
  const { currentUser } = useAuth();
  const { isLoading, appointments, pagination, getDoctorAppointments } =
    useAppointment();
  const { socket, isConnected } = useSocket();

  const [showDetails, setShowDetails] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [filters, setFilters] = useState({
    status: '',
    from_date: '',
    to_date: '',
    appointment_type: '',
    priority: '',
    search: '',
    appointment_mode: '',
  });

  // socket appointments
  const [updatedAppointments, setUpdatedAppointments] = useState([]);

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== '',
  ).length;

  const appointmentFilterConfig = [
    {
      type: 'search',
      name: 'search',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: [
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In-progress' },
        { value: 'checked-in', label: 'Checked In' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no-show', label: 'No Show' },
      ],
    },
    {
      type: 'select',
      name: 'appointment_mode',
      label: 'Appointment Mode',
      options: [
        { value: 'in-person', label: 'In-person' },
        { value: 'online', label: 'Online' },
      ],
    },
    {
      type: 'select',
      name: 'appointment_type',
      label: 'Appointment Type',
      options: [
        { value: 'consultation', label: 'Consultation' },
        { value: 'followup', label: 'Follow-up' },
        { value: 'procedure', label: 'Procedure' },
        { value: 'checkup', label: 'Check-up' },
      ],
    },
    {
      type: 'select',
      name: 'priority',
      label: 'Priority',
      options: [
        { value: 'high', label: 'High' },
        { value: 'normal', label: 'Normal' },
        { value: 'low', label: 'Low' },
      ],
    },
    {
      type: 'date',
      name: 'from_date',
      label: 'From Date',
    },
    {
      type: 'date',
      name: 'to_date',
      label: 'To Date',
    },
  ];

  // ===== Pagination handlers =====
  const handlePageChange = newPage => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = useCallback(newLimit => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  const handleClearFilters = () => {
    setFilters({
      status: '',
      from_date: '',
      to_date: '',
      appointment_type: '',
      priority: '',
      search: '',
      appointment_mode: '',
    });
    setCurrentPage(1);
    setLimit(20);
  };

  const viewAppointment = appt => {
    setSelectedAppt(appt);
    setShowDetails(true);
    console.log(appt);
  };

  const handleStartConsultation = appt => {
    // Add your consultation logic here
    console.log('Starting consultation for:', appt);
  };

  const handleAddNotes = appt => {
    // Add your notes logic here
    console.log('Adding notes for:', appt);
  };

  const handlePrescribe = appt => {
    // Add your prescription logic here
    console.log('Creating prescription for:', appt);
  };

  useEffect(() => {
    setUpdatedAppointments(appointments);
  }, [appointments]);

  // ===== Fetch data on filter/page changes =====
  useEffect(() => {
    const apiFilter = {
      page: currentPage,
      limit,
      ...(filters.status && { status: filters.status }),
      ...(filters.appointment_type && {
        appointment_type: filters.appointment_type,
      }),
      ...(filters.appointment_mode && {
        appointment_mode: filters.appointment_mode,
      }),
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.from_date && { from_date: filters.from_date }),
      ...(filters.to_date && { to_date: filters.to_date }),
      ...(filters.search && { search: filters.search }),
    };

    getDoctorAppointments(currentUser?.staff?.staff_uuid, apiFilter);
  }, [getDoctorAppointments, currentUser, filters, currentPage, limit]);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header - Fixed width constraints */}
      <header className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg mb-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div className="min-w-0 flex-shrink">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My Appointments
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage your patient consultations and schedules
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto flex-shrink-0">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            pageOnChangeFilter={setCurrentPage}
            onFilterChange={setFilters}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            filterConfig={appointmentFilterConfig}
            onClearFilters={handleClearFilters}
            searchPlaceholder="Search by patient name, MRN, or reason..."
            title="Filter Appointments"
          />
        )}
      </header>

      {/* Content Area - Fixed width constraints */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : updatedAppointments.length > 0 ? (
          <>
            <AppointmentsTable
              currentUser={currentUser}
              appointments={updatedAppointments}
              onViewDetails={viewAppointment}
              onStartConsultation={handleStartConsultation}
              onAddNotes={handleAddNotes}
              onPrescribe={handlePrescribe}
              showColumns={[
                'person',
                'date',
                'time',
                'status',
                'appointment_type',
                'priority',
                'actions',
              ]}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={limit}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          </>
        ) : (
          /* Empty State */
          <div className="p-16 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
              <Calendar size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No appointments found
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeFiltersCount > 0
                ? 'Try adjusting your filters to see more results'
                : "You don't have any appointments scheduled"}
            </p>
            {activeFiltersCount > 0 && (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        title="Appointment Details"
      >
        <AppointmentDetailModal
          isOpen={showDetails}
          onClose={() => setShowDetails(false)}
          appointment={selectedAppt}
          currentUser={currentUser}
        />
      </Modal>
    </div>
  );
};

export default DoctorAppointment;
