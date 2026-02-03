import { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Building2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileText,
} from 'lucide-react';
import { FilterPanel } from '../../../components/ui/filter-panel';
import Pagination from '../../../components/ui/pagination';
import appointmentApi from '../../../services/appointmentApi';
import EmptyState from '../../../components/ui/EmptyState';
import { Button } from '../../../components/ui/button';
import AppointmentDetailModal from '../../../components/Modals/AppointmentDetailModal';
import { useAuth } from '../../../contexts/AuthContext';
import { useSchedule } from '../../../contexts/ScheduleContext';

const AppointmentsPage = () => {
  const { currentUser } = useAuth();
  const { allDoctors, getAllDoctors, departments, getDepartments } =
    useSchedule();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Filtered doctors based on selected department
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  // Appointments state
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mobile view state
  const [showCalendar, setShowCalendar] = useState(true);

  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    departmentId: '',
    doctorId: '',
  });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });

  // Modal states
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  useEffect(() => {
    getAllDoctors();
    getDepartments();
  }, []);

  // Filter doctors when department changes
  useEffect(() => {
    if (filters.departmentId) {
      const filtered = allDoctors.filter(
        doctor => doctor.department?._id === parseInt(filters.departmentId),
      );
      setFilteredDoctors(filtered);

      // Reset doctor filter if selected doctor is not in the filtered list
      if (filters.doctorId) {
        const doctorExists = filtered.find(
          d => d.staff_id === parseInt(filters.doctorId),
        );
        if (!doctorExists) {
          setFilters(prev => ({ ...prev, doctorId: '' }));
        }
      }
    } else {
      setFilteredDoctors(allDoctors);
    }
  }, [filters.departmentId, allDoctors]);

  // Fetch appointments when date or filters change
  useEffect(() => {
    if (selectedDate) {
      fetchAppointments();
    }
  }, [selectedDate, filters, currentPage, itemsPerPage]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);

    try {
      const formattedDate = formatDateForAPI(selectedDate);
      const queryParams = new URLSearchParams({
        ...(filters.status && { status: filters.status }),
        ...(filters.departmentId && { departmentId: filters.departmentId }),
        ...(filters.doctorId && { doctorId: filters.doctorId }),
        page: currentPage,
        limit: itemsPerPage,
      });

      const result = await appointmentApi.getAllSlotsForDate(
        formattedDate,
        queryParams,
      );

      console.log(result);

      if (result.success) {
        setAppointments(result.data.res || []);
        setPagination(result.data.pagination);

        // On mobile, auto-switch to appointments view after selecting date
        if (window.innerWidth < 1024) {
          setShowCalendar(false);
        }
      }
    } catch (err) {
      setError(err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateForAPI = date => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDate = date => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateSelect = date => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  const handleFilterChange = newFilters => {
    // If department changed, reset doctor
    if (newFilters.departmentId !== filters.departmentId) {
      newFilters.doctorId = '';
    }

    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = clearedFilters => {
    setFilters(clearedFilters);
    setCurrentPage(1);
  };

  const handlePageChange = page => {
    setCurrentPage(page);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };

  const handleItemsPerPageChange = newItemsPerPage => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleAppointmentClick = async appointmentId => {
    setShowModal(true);
    setLoadingDetails(true);
    setDetailsError(null);
    setSelectedAppointment(null);

    try {
      const appointmentDetails =
        await appointmentApi.getAppointmentById(appointmentId);
      setSelectedAppointment(appointmentDetails.data);
    } catch (err) {
      console.error('Failed to fetch appointment details:', err);
      setDetailsError(err.message || 'Failed to load appointment details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
    setDetailsError(null);
  };

  // Build filter configuration with dynamic data
  const filterConfig = [
    {
      type: 'search',
      name: 'search',
      label: 'Search',
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All Statuses' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'arrived', label: 'Arrived' },
        { value: 'checked_in', label: 'Checked in' },
        { value: 'in_progress', label: 'In progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no-show', label: 'No Show' },
      ],
    },
    {
      type: 'select',
      name: 'departmentId',
      label: 'Department',
      loading: !departments || departments.length === 0,
      options: [
        { value: '', label: 'All Departments' },
        ...(departments || []).map(dept => ({
          value: (dept.department_id || dept._id)?.toString(),
          label: dept.department_name,
        })),
      ],
    },
    {
      type: 'select',
      name: 'doctorId',
      label: 'Doctor',
      loading: !allDoctors || allDoctors.length === 0,
      disabled: !filters.departmentId, // ✅ Disabled until department is selected
      options: [
        {
          value: '',
          label: filters.departmentId
            ? 'All Doctors in Department'
            : 'Select Department First',
        },
        ...(filteredDoctors || []).map(doctor => ({
          value: (doctor.staff_id || doctor._id)?.toString(),
          label: doctor.name || `Dr. ${doctor.firstname} ${doctor.lastname}`,
        })),
      ],
    },
  ];

  const getStatusColor = status => {
    const colors = {
      scheduled:
        'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
      completed:
        'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800',
      cancelled:
        'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
      'no-show':
        'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
    };
    return (
      colors[status] ||
      'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Appointments Calendar
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Select a date to view and manage appointments
          </p>
        </div>

        {/* Mobile Toggle Buttons */}
        <div className="lg:hidden mb-4 flex gap-2">
          <button
            onClick={() => setShowCalendar(true)}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              showCalendar
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            }`}
          >
            Calendar
          </button>
          <button
            onClick={() => setShowCalendar(false)}
            disabled={!selectedDate}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              !showCalendar
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            Appointments
            {selectedDate && pagination.total > 0 && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">
                {pagination.total}
              </span>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Calendar */}
          <div
            className={`lg:col-span-1 ${showCalendar ? 'block' : 'hidden lg:block'}`}
          >
            <CalendarWidget
              currentMonth={currentMonth}
              setCurrentMonth={setCurrentMonth}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
            />
          </div>

          {/* Right Section - Appointments List */}
          <div
            className={`lg:col-span-2 ${!showCalendar ? 'block' : 'hidden lg:block'}`}
          >
            {!selectedDate ? (
              <EmptyState
                title="Select a Date."
                message=" Choose a date from the calendar to view appointments and available slots"
                icon={CalendarIcon}
              />
            ) : (
              <AppointmentsList
                selectedDate={selectedDate}
                appointments={appointments}
                loading={loading}
                error={error}
                filters={filters}
                showFilters={showFilters}
                setShowFilters={setShowFilters}
                filterConfig={filterConfig}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
                pagination={pagination}
                currentPage={currentPage}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
                formatDate={formatDate}
                getStatusColor={getStatusColor}
                onBackToCalendar={() => setShowCalendar(true)}
                onAppointmentClick={handleAppointmentClick}
              />
            )}
          </div>
        </div>

        {/* Appointment Details Modal */}
        {showModal && (
          <AppointmentDetailModal
            appointment={selectedAppointment}
            loading={loadingDetails}
            error={detailsError}
            onClose={handleCloseModal}
            getStatusColor={getStatusColor}
            isOpen={showModal}
            currentUser={currentUser}
          />
        )}
      </div>
    </div>
  );
};

// Calendar Widget Component
const CalendarWidget = ({
  currentMonth,
  setCurrentMonth,
  selectedDate,
  onDateSelect,
}) => {
  const getDaysInMonth = date => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthYear = currentMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const isToday = date => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = date => {
    if (!date || !selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const isPast = date => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isFuture = date => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>

        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
          {monthYear}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label="Next month"
        >
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const isDateToday = isToday(date);
          const isDateSelected = isSelected(date);
          const isDatePast = isPast(date);
          const isDateFuture = isFuture(date);

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date)}
              className={`
                aspect-square rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center justify-center
                ${
                  isDateSelected
                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                    : isDateToday
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400'
                      : isDatePast
                        ? 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              aria-label={`Select ${date.toLocaleDateString()}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-4 h-4 rounded bg-blue-600 flex-shrink-0"></div>
          <span className="text-gray-600 dark:text-gray-400">Selected</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-4 h-4 rounded bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-600 dark:border-blue-400 flex-shrink-0"></div>
          <span className="text-gray-600 dark:text-gray-400">Today</span>
        </div>
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <div className="w-4 h-4 rounded text-gray-500 border border-gray-300 dark:border-gray-600 flex items-center justify-center flex-shrink-0">
            <span className="text-[10px]">15</span>
          </div>
          <span className="text-gray-600 dark:text-gray-400">
            Past dates (viewable)
          </span>
        </div>
      </div>
    </div>
  );
};

// Appointments List Component
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
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-800">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Mobile back button */}
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
          {!loading && appointments && appointments.length > 0 && (
            <Button onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">
                {showFilters ? 'Hide' : 'Show'} Filters
              </span>
              <span className="sm:hidden">Filter</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error State */}
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

      {/* Appointments List */}
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

          {/* Pagination */}
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

// Appointment Card Component
const AppointmentCard = ({ appointment, getStatusColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer group"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        {/* Left Section - Time & Doctor Info */}
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

          {/* Click to view hint */}
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view details →
          </div>
        </div>

        {/* Right Section - Appointment Details */}
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

          {appointment.payment_status && (
            <div className="flex sm:justify-end items-start">
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  appointment.payment_status === 'paid'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                }`}
              >
                {appointment.payment_status}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;
