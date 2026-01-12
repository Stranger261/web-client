// File: /src/pages/PatientPages/features/PatientAppointment.jsx
import { useCallback, useEffect, useState } from 'react';
import { Filter, Plus, X, Calendar, Search } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { useAppointment } from '../../../contexts/AppointmentContext';

import { Button } from '../../../components/ui/button';
import Modal from '../../../components/ui/Modal';
import Pagination from '../../../components/ui/pagination';
import { Select } from '../../../components/ui/select';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import AppointmentDetailModal from '../../../components/Modals/AppointmentDetailModal';

import AppointmentsTable from '../../../components/shared/AppointmentsTable';

import CreateAppointment from '../components/Appointment/CreateAppointment';

const PatientAppointment = () => {
  const { currentUser } = useAuth();
  const { isLoading, appointments, pagination, getPatientAppointments } =
    useAppointment();

  const [showDetails, setShowDetails] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const [filters, setFilters] = useState({
    status: '',
    from_date: '',
    to_date: '',
    appointment_type: '',
    search: '',
    appointment_mode: '',
  });

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ===== Filter handlers =====
  const handleFilterChange = e => {
    const { name, value } = e.target;

    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFilters({
      status: '',
      from_date: '',
      to_date: '',
      appointment_type: '',
      search: '',
      appointment_mode: '',
    });
    setCurrentPage(1);
  };

  const viewAppointment = appt => {
    setSelectedAppt(appt);
    setShowDetails(true);
  };

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
      ...(filters.from_date && { from_date: filters.from_date }),
      ...(filters.to_date && { to_date: filters.to_date }),
      ...(filters.search && { search: filters.search }),
    };

    getPatientAppointments(currentUser?.patient?.patient_uuid, apiFilter);
  }, [getPatientAppointments, currentUser, filters, currentPage, limit]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg mb-4 overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              My Appointments
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage and track your medical appointments
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

            <Button
              variant="create"
              icon={Plus}
              onClick={() => setShowCreate(true)}
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">New Appointment</span>
              <span className="sm:hidden">New</span>
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
                  placeholder="Search by doctor name or reason..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <Select
                label="Status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                options={[
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'in_progress', label: 'In-progress' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'cancelled', label: 'Cancelled' },
                  { value: 'rescheduled', label: 'Rescheduled' },
                  { value: 'no-show', label: 'No Show' },
                ]}
              />

              {/* Appointment Mode */}
              <Select
                label="Appointment Mode"
                name="appointment_mode"
                value={filters.appointment_mode}
                onChange={handleFilterChange}
                options={[
                  { value: 'in-person', label: 'In-person' },
                  { value: 'online', label: 'Online' },
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

      {/* Content Area with padding for cards */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : appointments.length > 0 ? (
          <>
            {/* Add padding wrapper for cards, table handles its own padding */}
            <div>
              <AppointmentsTable
                currentUser={currentUser}
                appointments={appointments}
                onViewDetails={viewAppointment}
                showColumns={[
                  'person',
                  'date',
                  'time',
                  'status',
                  'appointment_type',
                  'actions',
                ]}
              />
            </div>

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
            {activeFiltersCount > 0 ? (
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            ) : (
              <Button
                variant="create"
                icon={Plus}
                onClick={() => setShowCreate(true)}
              >
                Schedule Appointment
              </Button>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Appointment"
      >
        <CreateAppointment onClose={() => setShowCreate(false)} />
      </Modal>

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

export default PatientAppointment;
