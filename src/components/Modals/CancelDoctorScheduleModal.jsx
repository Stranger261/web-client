// CancelDoctorScheduleModal.jsx - WITH LEAVE REASON FOR ALL TABS

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Calendar, Clock, X } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import scheduleApi from '../../services/scheduleApi';
import { COLORS } from '../../configs/CONST';

const CancelDoctorScheduleModal = ({
  isOpen,
  onClose,
  doctors = [],
  onSuccess,
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [cancelType, setCancelType] = useState('day');
  const [leaveReason, setLeaveReason] = useState('emergency');
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    reason: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leaveReasons = [
    { value: 'vacation', label: 'Vacation' },
    { value: 'sick_leave', label: 'Sick Leave' },
    { value: 'conference', label: 'Conference' },
    { value: 'personal', label: 'Personal' },
    { value: 'emergency', label: 'Emergency' },
  ];

  const handleSubmit = async e => {
    e.preventDefault();

    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      const fullReason = `${leaveReason}: ${formData.reason}`;

      if (cancelType === 'day') {
        result = await scheduleApi.cancelDoctorScheduleForDay(
          selectedDoctor.staff_id,
          formData.date,
          fullReason,
        );
      } else if (cancelType === 'period') {
        result = await scheduleApi.cancelDoctorScheduleForPeriod(
          selectedDoctor.staff_id,
          formData.startDate,
          formData.endDate,
          leaveReason,
          formData.reason,
        );
      } else {
        result = await scheduleApi.blockDoctorTimeSlots(
          selectedDoctor.staff_id,
          formData.date,
          formData.startTime + ':00',
          formData.endTime + ':00',
          fullReason,
        );
      }

      toast.success(result.data.message);
      onSuccess && onSuccess(result.data);
      handleClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to cancel schedule',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedDoctor(null);
    setCancelType('day');
    setLeaveReason('emergency');
    setFormData({
      date: format(new Date(), 'yyyy-MM-dd'),
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '17:00',
      reason: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-50 p-4"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="rounded-xl shadow-xl w-full max-w-md overflow-hidden"
          style={{
            backgroundColor: isDarkMode ? '#1f2937' : 'white',
          }}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-600" />
              </div>
              <h2 className="text-lg font-semibold">Cancel Schedule</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <form onSubmit={handleSubmit} className="p-4 space-y-4">
            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Doctor *</label>
              <select
                value={selectedDoctor?.staff_id || ''}
                onChange={e => {
                  const doctor = doctors.find(
                    d => d.staff_id === parseInt(e.target.value),
                  );
                  setSelectedDoctor(doctor);
                }}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                required
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.staff_id} value={doctor.staff_id}>
                    Dr. {doctor.person?.first_name || doctor.firstname}{' '}
                    {doctor.person?.last_name || doctor.lastname}
                  </option>
                ))}
              </select>
            </div>

            {/* Cancel Type Tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              {[
                { value: 'day', label: 'Day' },
                { value: 'period', label: 'Period' },
                { value: 'timeslot', label: 'Time Slot' },
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setCancelType(type.value)}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    cancelType === type.value
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Leave Reason Dropdown - NOW SHOWS FOR ALL TABS */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Leave Type *
              </label>
              <select
                value={leaveReason}
                onChange={e => setLeaveReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border text-sm"
                required
              >
                {leaveReasons.map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date/Time Inputs */}
            {cancelType === 'day' && (
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={e =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cancels all remaining appointments for this day
                </p>
              </div>
            )}

            {cancelType === 'period' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={e =>
                        setFormData({ ...formData, startDate: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">To</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={e =>
                        setFormData({ ...formData, endDate: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {cancelType === 'timeslot' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={e =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-lg border text-sm"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Start
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={e =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      End
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={e =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Warning */}
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-xs text-yellow-800">
                ⚠️ This will cancel affected appointments. Patients need to be
                notified.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg border hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !selectedDoctor}
                className="flex-1 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CancelDoctorScheduleModal;
