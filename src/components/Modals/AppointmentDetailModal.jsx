import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  CreditCard,
  MapPin,
  Hash,
  DollarSign,
  Activity,
} from 'lucide-react';
import { COLORS } from '../../configs/CONST';
import Badge from '../ui/badge';
import { formatDate } from '../../utils/dateFormatter';
import { formatTime } from '../../utils/FormatTime';
import appointmentApi from '../../services/appointmentApi';
import toast from 'react-hot-toast';
import AppointmentEditModal from './AppointmentEditModal';

const AppointmentDetailModal = ({
  isOpen,
  onClose,
  appointment,
  currentUser,
  onGetDoctorAvailability,
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!appointment) return null;

  const isToday =
    new Date().toLocaleDateString('en-CA') === appointment.appointment_date;

  // Get status color
  const getStatusVariant = status => {
    const statusMap = {
      confirmed: 'success',
      cancelled: 'danger',
      completed: 'primary',
      rescheduled: 'info',
      scheduled: 'warning',
      checked_in: 'success',
      no_show: 'danger',
    };
    return statusMap[status] || 'default';
  };

  const markAppointmentAsArrived = appointment => {
    try {
      const newAppointment = appointmentApi.updateAppointmentStatus(
        appointment.appointment_id,
        'arrived',
      );
      toast.success('Appointment status changed.');
      window.dispatchEvent(new Event('refresh-today-appointments'));
      onClose();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || 'Update status failed.';
      toast.error(errorMsg);
    }
  };

  // Get payment status color
  const getPaymentStatusColor = status => {
    const colorMap = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200',
      refunded: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const DetailRow = ({ icon: Icon, label, value, valueClassName = '' }) => {
    if (!value) return null;

    return (
      <div className="flex items-start gap-3 py-2">
        <div
          className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.darkHover
              : 'rgb(239 246 255)',
          }}
        >
          <Icon size={18} style={{ color: COLORS.info }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-xs font-medium uppercase tracking-wide"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            {label}
          </p>
          <p
            className={`text-sm font-semibold mt-0.5 ${valueClassName}`}
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {value}
          </p>
        </div>
      </div>
    );
  };

  const SectionTitle = ({ children }) => (
    <h3
      className="text-sm font-bold uppercase tracking-wide mb-3 flex items-center gap-2"
      style={{
        color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
      }}
    >
      <div
        className="h-1 w-8 rounded-full"
        style={{ backgroundColor: COLORS.info }}
      ></div>
      {children}
    </h3>
  );

  // Format doctor name
  const doctorName = appointment.doctor?.person
    ? `Dr. ${appointment.doctor.person.first_name} ${appointment.doctor.person.last_name}`
    : 'N/A';

  // Format patient name (for receptionist/doctor view)
  const patientName = appointment.patient?.person
    ? `${appointment.patient.person.first_name} ${
        appointment.patient.person.middle_name || ''
      } ${appointment.patient.person.last_name}`.trim()
    : 'N/A';

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 px-4"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="rounded-2xl shadow-xl w-full relative max-w-4xl p-6"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: COLORS.info }}
                  >
                    <Calendar size={20} className="text-white" />
                  </div>
                  <div>
                    <h2
                      className="text-xl font-bold"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      Appointment Details
                    </h2>
                    <p
                      className="text-sm font-normal"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      {appointment.appointment_number}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="text-2xl font-bold transition-colors"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.color = isDarkMode
                      ? COLORS.text.white
                      : COLORS.text.primary;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color = isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary;
                  }}
                >
                  ×
                </button>
              </div>

              {/* Body */}
              <div className="overflow-y-auto max-h-[70vh]">
                <div className="space-y-6">
                  {/* Status Overview */}
                  <div
                    className="rounded-lg p-4 border"
                    style={{
                      background: isDarkMode
                        ? 'linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))'
                        : 'linear-gradient(to right, rgb(239 246 255), rgb(238 242 255))',
                      borderColor: isDarkMode
                        ? COLORS.border.dark
                        : 'rgb(191 219 254)',
                    }}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <p
                          className="text-xs font-medium mb-1"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Status
                        </p>
                        <Badge
                          variant={getStatusVariant(appointment.status)}
                          className="text-sm px-3 py-1"
                        >
                          {appointment.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div>
                        <p
                          className="text-xs font-medium mb-1"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Payment Status
                        </p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getPaymentStatusColor(
                            appointment.payment_status,
                          )}`}
                        >
                          {appointment.payment_status.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p
                          className="text-xs font-medium mb-1"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Priority
                        </p>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            appointment.priority === 'urgent'
                              ? 'bg-red-100 text-red-800 border border-red-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}
                        >
                          {appointment.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Doctor Information */}
                      {currentUser.role !== 'doctor' && (
                        <div>
                          <SectionTitle>Doctor Information</SectionTitle>
                          <div
                            className="rounded-lg border p-4 space-y-1"
                            style={{
                              backgroundColor: isDarkMode
                                ? COLORS.surface.dark
                                : 'white',
                              borderColor: isDarkMode
                                ? COLORS.border.dark
                                : COLORS.border.light,
                            }}
                          >
                            <DetailRow
                              icon={Stethoscope}
                              label="Doctor Name"
                              value={doctorName}
                            />
                            <DetailRow
                              icon={Activity}
                              label="Specialization"
                              value={appointment.doctor?.specialization}
                            />
                            <DetailRow
                              icon={Hash}
                              label="License Number"
                              value={appointment.doctor?.license_number}
                            />
                            <DetailRow
                              icon={MapPin}
                              label="Department"
                              value={appointment.department?.department_name}
                            />
                          </div>
                        </div>
                      )}
                      {/* Patient Information - Only show for non-patient users */}
                      {currentUser?.role !== 'patient' && (
                        <div>
                          <SectionTitle>Patient Information</SectionTitle>
                          <div
                            className="rounded-lg border p-4 space-y-1"
                            style={{
                              backgroundColor: isDarkMode
                                ? COLORS.surface.dark
                                : 'white',
                              borderColor: isDarkMode
                                ? COLORS.border.dark
                                : COLORS.border.light,
                            }}
                          >
                            <DetailRow
                              icon={User}
                              label="Patient Name"
                              value={patientName}
                            />
                            <DetailRow
                              icon={Hash}
                              label="Patient UUID"
                              value={appointment?.patient?.patient_uuid}
                            />
                          </div>
                        </div>
                      )}

                      {/* Appointment Details */}
                      <div>
                        <SectionTitle>Appointment Details</SectionTitle>
                        <div
                          className="rounded-lg border p-4 space-y-1"
                          style={{
                            backgroundColor: isDarkMode
                              ? COLORS.surface.dark
                              : 'white',
                            borderColor: isDarkMode
                              ? COLORS.border.dark
                              : COLORS.border.light,
                          }}
                        >
                          <DetailRow
                            icon={FileText}
                            label="Type"
                            value={appointment.appointment_type}
                            valueClassName="capitalize"
                          />
                          <DetailRow
                            icon={FileText}
                            label="Reason"
                            value={appointment.reason}
                          />
                          {appointment.notes && (
                            <DetailRow
                              icon={FileText}
                              label="Notes"
                              value={appointment.notes}
                            />
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Schedule Information */}
                      <div>
                        <SectionTitle>Schedule</SectionTitle>
                        <div
                          className="rounded-lg border p-4 space-y-1"
                          style={{
                            backgroundColor: isDarkMode
                              ? COLORS.surface.dark
                              : 'white',
                            borderColor: isDarkMode
                              ? COLORS.border.dark
                              : COLORS.border.light,
                          }}
                        >
                          <DetailRow
                            icon={Calendar}
                            label="Date"
                            value={formatDate(appointment.appointment_date)}
                          />
                          <DetailRow
                            icon={Clock}
                            label="Time"
                            value={`${formatTime(
                              appointment.start_time,
                            )} - ${formatTime(appointment.end_time)}`}
                          />
                          <DetailRow
                            icon={Clock}
                            label="Duration"
                            value={`${appointment.duration_minutes} minutes`}
                          />
                          {appointment.time_extended_minutes > 0 && (
                            <DetailRow
                              icon={Clock}
                              label="Time Extended"
                              value={`${appointment.time_extended_minutes} minutes`}
                              valueClassName="text-orange-600"
                            />
                          )}
                        </div>
                      </div>

                      {/* Payment Information */}
                      <div>
                        <SectionTitle>Payment Information</SectionTitle>
                        <div
                          className="rounded-lg border p-4 space-y-1"
                          style={{
                            backgroundColor: isDarkMode
                              ? COLORS.surface.dark
                              : 'white',
                            borderColor: isDarkMode
                              ? COLORS.border.dark
                              : COLORS.border.light,
                          }}
                        >
                          <DetailRow
                            icon={DollarSign}
                            label="Consultation Fee"
                            value={`₱${parseFloat(
                              appointment.consultation_fee,
                            ).toFixed(2)}`}
                          />
                          {appointment.extension_fee &&
                            parseFloat(appointment.extension_fee) > 0 && (
                              <DetailRow
                                icon={DollarSign}
                                label="Extension Fee"
                                value={`₱${parseFloat(
                                  appointment.extension_fee,
                                ).toFixed(2)}`}
                              />
                            )}
                          <div
                            className="pt-2 mt-2"
                            style={{
                              borderTop: `1px solid ${
                                isDarkMode
                                  ? COLORS.border.dark
                                  : COLORS.border.light
                              }`,
                            }}
                          >
                            <DetailRow
                              icon={CreditCard}
                              label="Total Amount"
                              value={`₱${parseFloat(
                                appointment.total_amount,
                              ).toFixed(2)}`}
                              valueClassName="text-lg"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Location Information */}
                      {appointment.department?.location && (
                        <div>
                          <SectionTitle>Location</SectionTitle>
                          <div
                            className="rounded-lg border p-4"
                            style={{
                              backgroundColor: isDarkMode
                                ? COLORS.surface.dark
                                : 'white',
                              borderColor: isDarkMode
                                ? COLORS.border.dark
                                : COLORS.border.light,
                            }}
                          >
                            <DetailRow
                              icon={MapPin}
                              label="Department Location"
                              value={appointment.department.location}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div
                    className="pt-4"
                    style={{
                      borderTop: `1px solid ${
                        isDarkMode ? COLORS.border.dark : COLORS.border.light
                      }`,
                    }}
                  >
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Created
                        </p>
                        <p
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          {new Date(appointment.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          Last Updated
                        </p>
                        <p
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          {new Date(appointment.updated_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div
                    className="flex gap-3 pt-4"
                    style={{
                      borderTop: `1px solid ${
                        isDarkMode ? COLORS.border.dark : COLORS.border.light
                      }`,
                    }}
                  >
                    <button
                      onClick={onClose}
                      className="flex-1 px-4 py-2.5 font-medium rounded-lg transition-colors"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.surface.darkHover
                          : 'rgb(243 244 246)',
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = isDarkMode
                          ? 'rgb(55 65 81)'
                          : 'rgb(229 231 235)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = isDarkMode
                          ? COLORS.surface.darkHover
                          : 'rgb(243 244 246)';
                      }}
                    >
                      Close
                    </button>
                    {currentUser?.role === 'receptionist' &&
                      appointment.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => setIsEditModalOpen(true)}
                            className="flex-1 px-4 py-2.5 font-medium rounded-lg transition-colors"
                            style={{
                              backgroundColor: COLORS.info,
                              color: 'white',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.backgroundColor =
                                'rgb(29 78 216)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.backgroundColor =
                                COLORS.info;
                            }}
                          >
                            Edit Appointment
                          </button>
                          {appointment.status === 'scheduled' && isToday && (
                            <button
                              className="px-4 py-2.5 font-medium rounded-lg transition-colors"
                              style={{
                                backgroundColor: COLORS.success,
                                color: 'white',
                              }}
                              onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor =
                                  'rgb(21 128 61)';
                              }}
                              onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor =
                                  COLORS.success;
                              }}
                              onClick={() =>
                                markAppointmentAsArrived(appointment)
                              }
                            >
                              Mark as arrived
                            </button>
                          )}
                        </>
                      )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AppointmentEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        appointment={appointment}
        onUpdate={onClose}
        onGetDoctorAvailability={onGetDoctorAvailability}
      />
    </>
  );
};

export default AppointmentDetailModal;
