import {
  Clock,
  Video,
  MapPin,
  Eye,
  User,
  Stethoscope,
  LogIn,
  Calendar,
  Activity, // Added for vitals
} from 'lucide-react';

import Badge from '../ui/badge';
import { LoadingSpinner } from '../ui/loading-spinner';
import EmptyState from '../ui/EmptyState';

import { calculateAge } from '../../utils/patientHelpers';
import { formatDate } from '../../utils/dateFormatter';
import Pagination from '../ui/pagination';

const AppointmentList = ({
  isLoading,
  appointments = [],
  upcomingAppointments = [],
  pagination,
  limit,
  darkMode,
  onPageChange,
  onItemsPerPageChange,
  onViewAppointment,
  onStartConsultation,
  onCallPatient,
  onStartAppointment,
  onRecordVitals, // Added for nurse to record vitals
  userRole = 'doctor',
  showPagination = false,
  emptyMessage = 'No appointments available',
}) => {
  // Get priority badge styling
  const getPriorityBadge = priority => {
    if (priority === 'high') {
      return darkMode
        ? { bg: 'rgb(153 27 27)', text: 'rgb(254 226 226)' }
        : { bg: 'rgb(254 226 226)', text: 'rgb(153 27 27)' };
    }
    return null;
  };

  // Get status variant for badge
  const getStatusVariant = status => {
    const statusMap = {
      scheduled: 'warning',
      confirmed: 'info',
      arrived: 'success',
      'in-progress': 'primary',
      completed: 'success',
      cancelled: 'danger',
      'no-show': 'danger',
      rescheduled: 'info',
    };
    return statusMap[status] || 'default';
  };

  // Role-based action logic
  const getAppointmentActions = appointment => {
    const actions = [];

    // All roles can view appointment details
    actions.push({
      icon: Eye,
      label: 'View appointment details',
      onClick: () => onViewAppointment(appointment),
      className: darkMode
        ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
        : 'bg-gray-100 hover:bg-gray-200 text-gray-600',
    });

    // Skip actions for completed/cancelled appointments
    if (['completed', 'cancelled'].includes(appointment.status)) {
      return actions;
    }

    // NURSE ROLE LOGIC
    if (userRole === 'nurse') {
      // Nurse can only act when patient has arrived
      if (appointment.status === 'arrived') {
        // Nurse can start appointment/mark as ready
        if (onStartAppointment) {
          actions.push({
            icon: LogIn,
            label: 'Start Appointment',
            onClick: () => onStartAppointment(appointment),
            className: darkMode
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white',
            isPrimary: true,
          });
        }

        // Nurse can record vitals (only for in-person appointments)
        if (onRecordVitals && !appointment.is_online_consultation) {
          actions.push({
            icon: Activity,
            label: 'Record Vitals',
            onClick: () => onRecordVitals(appointment),
            className: darkMode
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white',
            isPrimary: true,
          });
        }
      }

      // Mode indicator for nurse (shows appointment type)
      actions.push({
        icon: appointment.is_online_consultation ? Video : MapPin,
        label: appointment.is_online_consultation
          ? 'Online Appointment'
          : 'In-Person Appointment',
        className: appointment.is_online_consultation
          ? 'p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg'
          : 'p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg',
        isModeIndicator: true,
      });
    }

    // DOCTOR ROLE LOGIC
    if (userRole === 'doctor') {
      // Doctor can start appointments that are in 'arrived' or 'in-progress' status
      if (
        appointment.status === 'checked_in' ||
        appointment.status === 'in_progress'
      ) {
        // For online consultations
        if (appointment.is_online_consultation) {
          actions.push({
            icon: Video,
            label: 'Call Patient',
            onClick: () => onCallPatient(appointment),
            className:
              'px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2',
            isPrimary: true,
          });
        }
        // For in-person consultations
        else if (onStartConsultation) {
          actions.push({
            icon: Stethoscope,
            label:
              appointment.status === 'in_progress'
                ? 'Continue Consultation'
                : 'Start Consultation',
            onClick: () => onStartConsultation(appointment),
            className:
              'px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium text-sm flex items-center gap-2',
            isPrimary: true,
          });
        }
      }
      // If not yet arrived, show appointment mode indicator
      else {
        actions.push({
          icon: appointment.is_online_consultation ? Video : MapPin,
          label: appointment.is_online_consultation
            ? 'Online Appointment'
            : 'In-Person Appointment',
          className: appointment.is_online_consultation
            ? 'p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg'
            : 'p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg',
          isModeIndicator: true,
        });
      }
    }

    // RECEPTIONIST ROLE LOGIC
    if (userRole === 'receptionist') {
      // Receptionist can mark patient as arrived
      if (
        appointment.status === 'confirmed' ||
        appointment.status === 'scheduled'
      ) {
        if (onStartAppointment) {
          actions.push({
            icon: LogIn,
            label: 'Mark as Arrived',
            onClick: () => onStartAppointment(appointment),
            className: darkMode
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white',
            isPrimary: true,
          });
        }
      }

      // Mode indicator for receptionist
      actions.push({
        icon: appointment.is_online_consultation ? Video : MapPin,
        label: appointment.is_online_consultation
          ? 'Online Appointment'
          : 'In-Person Appointment',
        className: appointment.is_online_consultation
          ? 'p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg'
          : 'p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg',
        isModeIndicator: true,
      });
    }

    // PATIENT ROLE LOGIC (minimal actions)
    if (userRole === 'patient') {
      // Patient can cancel/reschedule if not completed/cancelled
      if (!['completed', 'cancelled'].includes(appointment.status)) {
        // Mode indicator for patient
        actions.push({
          icon: appointment.is_online_consultation ? Video : MapPin,
          label: appointment.is_online_consultation
            ? 'Online Appointment'
            : 'In-Person Appointment',
          className: appointment.is_online_consultation
            ? 'p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg'
            : 'p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg',
          isModeIndicator: true,
        });
      }
    }

    return actions;
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const hasAppointments = appointments && appointments.length > 0;
  const hasUpcomingAppointments =
    upcomingAppointments && upcomingAppointments.length > 0;

  if (!hasAppointments && !hasUpcomingAppointments) {
    return <EmptyState message={emptyMessage} />;
  }

  // Helper to render appointment item (reduces duplication)
  const renderAppointmentItem = (apt, isUpcoming = false) => {
    const priorityBadge = getPriorityBadge(apt.priority);
    const patient = apt?.patient?.person;
    const doctor = apt?.doctor?.person;
    const fullname = patient
      ? `${patient.first_name} ${patient.last_name}`
      : 'Unknown Patient';
    const doctorName = doctor
      ? `Dr. ${doctor.first_name} ${doctor.last_name}`
      : 'Unknown Doctor';
    const age = patient ? calculateAge(patient.date_of_birth) : 'N/A';
    const actions = getAppointmentActions(apt);

    return (
      <div
        key={apt.appointment_id}
        className={
          darkMode
            ? 'hover:bg-gray-800 transition-colors'
            : 'hover:bg-gray-50 transition-colors'
        }
      >
        <div className="flex items-center justify-between gap-4 flex-wrap p-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                isUpcoming
                  ? 'bg-purple-100 dark:bg-purple-900/30'
                  : 'bg-blue-100 dark:bg-blue-900/30'
              }`}
            >
              <User
                className={
                  isUpcoming
                    ? 'text-purple-600 dark:text-purple-400'
                    : 'text-blue-600 dark:text-blue-400'
                }
                size={24}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {userRole === 'patient' ? doctorName : fullname}
                </h3>
                {priorityBadge && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: priorityBadge.bg,
                      color: priorityBadge.text,
                    }}
                  >
                    HIGH
                  </span>
                )}
              </div>
              <p
                className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {userRole === 'patient'
                  ? `${apt.department?.department_name || 'General'}`
                  : `${apt?.patient?.mrn || 'N/A'} • ${age} years`}{' '}
                • {apt.is_online_consultation ? 'Online' : 'In-Person'}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                {isUpcoming && (
                  <span
                    className={`flex items-center text-sm font-medium ${
                      darkMode ? 'text-purple-400' : 'text-purple-600'
                    }`}
                  >
                    <Calendar size={14} className="mr-1" />
                    {formatDate(apt.appointment_date)}
                  </span>
                )}
                <span
                  className={`flex items-center text-sm ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  <Clock size={14} className="mr-1" />
                  {apt.start_time}
                </span>
                <span
                  className={`text-sm ${
                    darkMode ? 'text-gray-300' : 'text-gray-900'
                  }`}
                >
                  {apt.reason}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={getStatusVariant(apt.status)}>{apt.status}</Badge>

            <div className="flex items-center gap-2">
              {actions.map((action, index) =>
                action.isPrimary ? (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`px-3 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${action.className}`}
                    title={action.label}
                  >
                    <action.icon size={16} />
                    {action.label}
                  </button>
                ) : action.isModeIndicator ? (
                  <div
                    key={index}
                    className={`p-2 rounded-lg ${action.className}`}
                    title={action.label}
                  >
                    <action.icon size={16} />
                  </div>
                ) : (
                  <button
                    key={index}
                    onClick={action.onClick}
                    className={`p-2 rounded-lg transition-colors ${action.className}`}
                    title={action.label}
                  >
                    <action.icon size={16} />
                  </button>
                ),
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Today's Appointments Section */}
      {hasAppointments && (
        <div
          className={`rounded-lg border ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div
            className={`px-6 py-4 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar
                className={darkMode ? 'text-blue-400' : 'text-blue-600'}
                size={20}
              />
              <h2
                className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Today's Appointments
              </h2>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  darkMode
                    ? 'bg-blue-900/30 text-blue-400'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {appointments.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {appointments.map(apt => renderAppointmentItem(apt, false))}
          </div>
        </div>
      )}

      {/* Upcoming Appointments Section */}
      {hasUpcomingAppointments && (
        <div
          className={`rounded-lg border ${
            darkMode
              ? 'border-gray-700 bg-gray-800'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div
            className={`px-6 py-4 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar
                className={darkMode ? 'text-purple-400' : 'text-purple-600'}
                size={20}
              />
              <h2
                className={`text-lg font-semibold ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}
              >
                Upcoming Appointments
              </h2>
              <span
                className={`text-sm ${
                  darkMode ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                (Next 7 Days)
              </span>
              <span
                className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  darkMode
                    ? 'bg-purple-900/30 text-purple-400'
                    : 'bg-purple-100 text-purple-800'
                }`}
              >
                {upcomingAppointments.length}
              </span>
            </div>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {upcomingAppointments.map(apt => renderAppointmentItem(apt, true))}
          </div>
        </div>
      )}

      {showPagination && pagination && (
        <Pagination
          currentPage={pagination.page}
          totalItems={pagination.total}
          itemsPerPage={limit}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
        />
      )}
    </div>
  );
};

export default AppointmentList;
