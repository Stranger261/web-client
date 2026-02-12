import {
  Download,
  FileText,
  FileJson,
  ChevronDown,
  Filter,
  ChevronLeft,
  AlertCircle,
  Calendar as CalendarIcon,
  Clock,
  X,
  User,
  Building2,
} from 'lucide-react';
import { FilterPanel } from '../../../components/ui/filter-panel';
import Pagination from '../../../components/ui/pagination';

// Appointment Card Component (keeping original)
const AppointmentCard = ({ appointment, getStatusColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="font-semibold text-base sm:text-lg">
                {appointment.appointment_time}
              </span>
            </div>
            <span
              className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(appointment.status)}`}
            >
              {appointment.status}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
              <User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="font-medium text-sm sm:text-base break-words">
                Dr. {appointment.doctor?.person?.first_name}{' '}
                {appointment.doctor?.person?.last_name}
              </span>
            </div>

            <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
              <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs sm:text-sm break-words">
                {appointment.doctor?.department?.department_name}
              </span>
            </div>

            {appointment.reason && (
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs sm:text-sm line-clamp-2">
                  <span className="font-medium">Reason:</span>{' '}
                  {appointment.reason}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view details →
          </div>
        </div>

        <div className="flex sm:flex-col gap-4 sm:gap-0 sm:text-right border-t sm:border-t-0 pt-4 sm:pt-0 sm:min-w-[140px]">
          <div className="flex-1 sm:flex-none">
            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
              {appointment.appointment_number}
            </div>
            <div className="text-xs sm:text-sm space-y-1">
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  Duration:
                </span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  {appointment.duration_minutes} min
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Fee:</span>
                <span className="ml-2 font-medium text-gray-900 dark:text-white">
                  ₱{parseFloat(appointment.consultation_fee).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppointmentsList = ({
  selectedDate,
  appointments,
  loading,
  error,
  filters,
  showFilters,
  setShowFilters,
  filterConfig,
  onFilterChange,
  onClearFilters,
  pagination,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  formatDate,
  getStatusColor,
  onBackToCalendar,
  onAppointmentClick,
  isExporting,
  showExportDropdown,
  setShowExportDropdown,
  handleExport,
  currentUser,
  allAppointmentsCount,
}) => {
  const ExportDropdown = () => (
    <div className="relative">
      {/* Export Button */}
      <button
        onClick={() => setShowExportDropdown(!showExportDropdown)}
        disabled={!selectedDate || allAppointmentsCount === 0 || isExporting}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg shadow-lg shadow-green-500/30 hover:shadow-green-500/40 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        <Download size={18} />
        <span className="hidden sm:inline font-semibold">Export</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${showExportDropdown ? 'rotate-180' : ''}`}
        />
        {allAppointmentsCount > 0 && !isExporting && (
          <span className="ml-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full text-xs font-bold">
            {allAppointmentsCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showExportDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowExportDropdown(false)}
          />

          {/* Menu - Plain white dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Export Patient List
              </h3>
              <button
                onClick={() => setShowExportDropdown(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-3 space-y-2">
              {/* Export as PDF */}
              <button
                onClick={() => {
                  handleExport('pdf');
                  setShowExportDropdown(false);
                }}
                disabled={isExporting}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium 
                 bg-gray-50 dark:bg-gray-700 
                 hover:bg-gray-100 dark:hover:bg-gray-600
                 text-gray-700 dark:text-gray-200
                 border border-gray-200 dark:border-gray-600
                 rounded-lg transition-colors duration-150
                 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="w-4 h-4 mr-2.5 text-gray-500" />
                Export as PDF
              </button>

              {/* Export as JSON */}
              <button
                onClick={() => {
                  handleExport('json');
                  setShowExportDropdown(false);
                }}
                disabled={isExporting}
                className="flex items-center w-full px-4 py-2.5 text-sm font-medium 
                 bg-gray-50 dark:bg-gray-700 
                 hover:bg-gray-100 dark:hover:bg-gray-600
                 text-gray-700 dark:text-gray-200
                 border border-gray-200 dark:border-gray-600
                 rounded-lg transition-colors duration-150
                 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileJson className="w-4 h-4 mr-2.5 text-gray-500" />
                Export as JSON
              </button>

              {/* Tip */}
              <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                💡 Tip: Use filters before exporting to export specific patients
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <button
              onClick={onBackToCalendar}
              className="lg:hidden mb-2 text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Back to Calendar
            </button>

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
              {formatDate(selectedDate)}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
              {loading
                ? 'Loading...'
                : `${pagination.total} ${pagination.total === 1 ? 'appointment' : 'appointments'} found`}
            </p>
          </div>

          {!loading && selectedDate && allAppointmentsCount > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline">
                  {showFilters ? 'Hide' : 'Show'} Filters
                </span>
                <span className="sm:hidden">Filter</span>
              </button>

              <ExportDropdown />
            </div>
          )}
        </div>
      </div>

      {appointments && appointments.length > 0 && (
        <FilterPanel
          filters={filters}
          onFilterChange={onFilterChange}
          onClearFilters={onClearFilters}
          filterConfig={filterConfig}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          searchPlaceholder="Search by patient name, appointment number..."
          title="Filter Appointments"
          pageOnChangeFilter={page => onPageChange(page)}
        />
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error && !loading && (
        <div className="mx-4 sm:mx-6 my-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-red-900 dark:text-red-200">
              Error loading appointments
            </h4>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1">
              {error}
            </p>
          </div>
        </div>
      )}

      {!loading && !error && (
        <>
          {appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                No appointments found
              </h3>
              {filters.departmentId ||
              filters.doctorId ||
              filters.status ||
              filters.search ? (
                <div className="text-center max-w-md">
                  <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mb-4">
                    No appointments match your current filters for this date.
                  </p>
                  <button
                    onClick={() =>
                      onClearFilters({
                        search: '',
                        status: '',
                        departmentId: '',
                        doctorId: '',
                      })
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center max-w-md">
                  There are no appointments scheduled for this date.
                </p>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {appointments.map(appointment => (
                <AppointmentCard
                  key={appointment.appointment_id}
                  appointment={appointment}
                  getStatusColor={getStatusColor}
                  onClick={() => onAppointmentClick(appointment.appointment_id)}
                />
              ))}
            </div>
          )}

          {appointments.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              onPageChange={onPageChange}
              onItemsPerPageChange={onItemsPerPageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentsList;
