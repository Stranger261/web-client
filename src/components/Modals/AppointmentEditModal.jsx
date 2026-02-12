import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  XCircle,
  Save,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { COLORS } from '../../configs/CONST';
import Badge from '../ui/badge';
import { RescheduleCalendar } from '../shared/RescheduleCalendar';
import appointmentApi from '../../services/appointmentApi';
import toast from 'react-hot-toast';
import { useAppointment } from '../../contexts/AppointmentContext';

const AppointmentEditModal = ({
  isOpen,
  onClose,
  appointment,
  onUpdate,
  onGetDoctorAvailability, // ✅ Required prop for loading schedule
}) => {
  const { rescheduleAppointment } = useAppointment();
  const isDarkMode = document.documentElement.classList.contains('dark');

  const [activeTab, setActiveTab] = useState('reschedule'); // 'details' or 'reschedule'
  const [isLoading, setIsLoading] = useState(false);

  // Reschedule state
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Cancel state
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // ✅ Load doctor's schedule when modal opens
  useEffect(() => {
    if (isOpen && appointment?.doctor?.staff_uuid && onGetDoctorAvailability) {
      const today = new Date();
      const startDate = format(startOfMonth(today), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(today), 'yyyy-MM-dd');

      console.log('Loading doctor schedule:', {
        doctorUuid: appointment.doctor.staff_uuid,
        startDate,
        endDate,
      });

      onGetDoctorAvailability(
        appointment.doctor.staff_uuid,
        startDate,
        endDate,
      );
    }
  }, [isOpen, appointment?.doctor?.staff_uuid, onGetDoctorAvailability]);

  if (!appointment) return null;

  const handleDateTimeSelect = ({ time, assignedDoctor }) => {
    setSelectedTimeSlot(time);
  };

  const handleReschedule = async () => {
    if (!selectedTimeSlot) {
      toast.error('Please select a new date and time');
      return;
    }

    try {
      setIsLoading(true);

      const response = await rescheduleAppointment(
        appointment.appointment_id,
        selectedTimeSlot.date,
        selectedTimeSlot.start_time,
      );

      toast.success('Appointment rescheduled successfully');
      onUpdate && onUpdate(response.data);
      window.dispatchEvent(new Event('refresh-today-appointments'));
      onClose();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || 'Failed to reschedule appointment';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setIsLoading(true);

      const response = await appointmentApi.updateAppointment(
        appointment.appointment_id,
        {
          status: 'cancelled',
          notes: `Cancelled: ${cancelReason}`,
        },
      );

      toast.success('Appointment cancelled successfully');
      onUpdate && onUpdate(response.data);
      setShowCancelConfirm(false);
      onClose();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || 'Failed to cancel appointment';
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    label,
    value,
    onChange,
    type = 'text',
    options,
    disabled = false,
  }) => (
    <div className="mb-4">
      <label
        className="block text-sm font-medium mb-2"
        style={{
          color: isDarkMode ? COLORS.text.light : COLORS.text.primary,
        }}
      >
        {label}
      </label>
      {options ? (
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border transition-colors"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border transition-colors resize-none"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-lg border transition-colors"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        />
      )}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="rounded-2xl shadow-xl w-full relative max-w-6xl max-h-[90vh] flex flex-col"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
            }}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="p-6 border-b flex-shrink-0"
              style={{
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
              }}
            >
              <div className="flex justify-between items-start mb-4">
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
                      Edit Appointment
                    </h2>
                    <p
                      className="text-sm"
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
                  }}
                >
                  ×
                </button>
              </div>
            </div>

            {/* Body - Scrollable */}
            <div className="overflow-y-auto flex-1">
              <div className="p-6">
                <RescheduleCalendar
                  currentAppointment={appointment}
                  onDateTimeSelect={handleDateTimeSelect}
                />
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div
              className="p-6 border-t flex-shrink-0"
              style={{
                borderColor: isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
              }}
            >
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.darkHover
                      : 'rgb(243 244 246)',
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Cancel
                </button>

                {appointment.status !== 'cancelled' && (
                  <button
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={isLoading}
                    className="px-4 py-2.5 font-medium rounded-lg transition-colors"
                    style={{
                      backgroundColor: COLORS.danger,
                      color: 'white',
                    }}
                  >
                    <XCircle size={18} className="inline mr-2" />
                    Cancel Appointment
                  </button>
                )}

                <button
                  onClick={handleReschedule}
                  disabled={isLoading || !selectedTimeSlot}
                  className="flex-1 px-4 py-2.5 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: COLORS.info,
                    color: 'white',
                  }}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Save size={18} />
                      Reschedule
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelConfirm && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-[60] px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="rounded-xl shadow-xl w-full max-w-md p-6"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
            }}
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3
                  className="text-lg font-bold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Cancel Appointment
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  This action cannot be undone
                </p>
              </div>
            </div>

            <InputField
              label="Reason for Cancellation"
              value={cancelReason}
              onChange={setCancelReason}
              type="textarea"
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowCancelConfirm(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 font-medium rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : 'rgb(243 244 246)',
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 font-medium rounded-lg"
                style={{
                  backgroundColor: COLORS.danger,
                  color: 'white',
                }}
              >
                {isLoading ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AppointmentEditModal;
