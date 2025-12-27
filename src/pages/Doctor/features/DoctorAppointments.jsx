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

import AppointmentsTable from '../../../components/shared/AppointmentsTable';

import AppointmentDetailModal from '../components/Appointment/AppointmentDetailModal';

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
  });

  // socket appointments
  const [updatedAppointments, setUpdatedAppointments] = useState([]);

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== ''
  ).length;

  // ===== Pagination handlers =====
  const handlePageChange = newPage => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = useCallback(newLimit => {
    setLimit(newLimit);
    setCurrentPage(1);
  }, []);

  // ===== Filter handlers =====
  const handleFilterChange = e => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      status: '',
      from_date: '',
      to_date: '',
      appointment_type: '',
      priority: '',
      search: '',
    });
    setCurrentPage(1);
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
      ...(filters.priority && { priority: filters.priority }),
      ...(filters.from_date && { from_date: filters.from_date }),
      ...(filters.to_date && { to_date: filters.to_date }),
      ...(filters.search && { search: filters.search }),
    };

    getDoctorAppointments(currentUser?.staff?.staff_uuid, apiFilter);
  }, [getDoctorAppointments, currentUser, filters, currentPage, limit]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
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
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className="text-blue-600" size={18} />
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                  Filter Appointments
                </h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by patient name, MRN, or reason..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Status Filter */}
              <Select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                options={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'checked-in', label: 'Checked In' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'no-show', label: 'No Show' },
                ]}
              />

              {/* Appointment Type */}
              <Select
                label="Appointment Type"
                name="appointment_type"
                value={filters.appointment_type}
                onChange={handleFilterChange}
                options={[
                  { value: 'consultation', label: 'Consultation' },
                  { value: 'followup', label: 'Follow-up' },
                  { value: 'procedure', label: 'Procedure' },
                  { value: 'checkup', label: 'Check-up' },
                ]}
              />

              {/* Priority */}
              <Select
                label="Priority"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                options={[
                  { value: 'high', label: 'High' },
                  { value: 'normal', label: 'Normal' },
                  { value: 'low', label: 'Low' },
                ]}
              />

              {/* From Date Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  From Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="from_date"
                    value={filters.from_date}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* To Date Filter */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  To Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="to_date"
                    value={filters.to_date}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Clear Button */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={handleClearFilters}
                disabled={activeFiltersCount === 0}
              >
                <X size={16} className="mr-1" />
                Clear All Filters
              </Button>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Active Filters:
                </span>
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || key === 'search') return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium border border-blue-200 dark:border-blue-800"
                    >
                      {key.replace('_', ' ')}: {value}
                      <button
                        onClick={() =>
                          handleFilterChange({
                            target: { name: key, value: '' },
                          })
                        }
                        className="hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-sm p-0.5"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
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
        />
      </Modal>
    </div>
  );
};

export default DoctorAppointment;
