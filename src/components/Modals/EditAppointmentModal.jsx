import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  AlertCircle,
  Save,
  X,
} from 'lucide-react';

const EditAppointmentModal = ({
  isOpen,
  onClose,
  appointment,
  onSave,
  doctors = [],
  availableTimeSlots = [],
}) => {
  const [formData, setFormData] = useState({
    doctor: '',
    appointmentDate: '',
    timeSlot: '',
    reasonForVisit: '',
    notes: '',
    status: 'scheduled',
    priority: 'normal',
    isFollowUp: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [changes, setChanges] = useState([]);

  useEffect(() => {
    if (appointment && isOpen) {
      const date = new Date(appointment.appointmentDate);
      const dateString = date.toISOString().split('T')[0];

      // Format time slot to match your structure
      const timeSlotValue = appointment.timeSlot
        ? `${appointment.timeSlot.startTime}-${appointment.timeSlot.endTime}`
        : '';

      setFormData({
        doctor: appointment.doctor?._id || '',
        appointmentDate: dateString,
        timeSlot: timeSlotValue,
        reasonForVisit: appointment.reasonForVisit || '',
        notes: appointment.notes || '',
        status: appointment.status || 'scheduled',
        priority: appointment.priority || 'normal',
        isFollowUp: appointment.isFollowUp || false,
      });
      setErrors({});
      setShowConfirmation(false);
      setChanges([]);
    }
  }, [appointment, isOpen]);

  const formatTimeSlot = timeSlot => {
    if (!timeSlot) return 'Not set';
    if (
      typeof timeSlot === 'object' &&
      timeSlot.startTime &&
      timeSlot.endTime
    ) {
      return `${timeSlot.startTime} - ${timeSlot.endTime}`;
    }
    return timeSlot;
  };

  const detectChanges = () => {
    const changesList = [];

    if (appointment) {
      const originalDate = new Date(appointment.appointmentDate)
        .toISOString()
        .split('T')[0];

      if (formData.appointmentDate !== originalDate) {
        changesList.push({
          field: 'Date',
          from: new Date(appointment.appointmentDate).toLocaleDateString(
            'en-US',
            {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            }
          ),
          to: new Date(formData.appointmentDate).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          }),
        });
      }

      if (formData.doctor !== appointment.doctor?._id) {
        const oldDoctor = doctors.find(d => d._id === appointment.doctor?._id);
        const newDoctor = doctors.find(d => d._id === formData.doctor);
        changesList.push({
          field: 'Doctor',
          from: oldDoctor
            ? `Dr. ${oldDoctor.firstname} ${oldDoctor.lastname}`
            : 'Unknown',
          to: newDoctor
            ? `Dr. ${newDoctor.firstname} ${newDoctor.lastname}`
            : 'Unknown',
        });
      }

      const originalTimeSlot = `${appointment.timeSlot?.startTime}-${appointment.timeSlot?.endTime}`;
      if (formData.timeSlot !== originalTimeSlot) {
        changesList.push({
          field: 'Time',
          from: formatTimeSlot(appointment.timeSlot),
          to: formData.timeSlot.replace('-', ' - '),
        });
      }

      if (formData.reasonForVisit !== (appointment.reasonForVisit || '')) {
        changesList.push({
          field: 'Reason for Visit',
          from: appointment.reasonForVisit || 'None',
          to: formData.reasonForVisit || 'None',
        });
      }

      if (formData.priority !== appointment.priority) {
        changesList.push({
          field: 'Priority',
          from: appointment.priority || 'normal',
          to: formData.priority,
        });
      }

      if (formData.isFollowUp !== appointment.isFollowUp) {
        changesList.push({
          field: 'Follow-up Status',
          from: appointment.isFollowUp ? 'Yes' : 'No',
          to: formData.isFollowUp ? 'Yes' : 'No',
        });
      }
    }

    return changesList;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctor) {
      newErrors.doctor = 'Please select a doctor';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Please select a date';
    } else {
      const selectedDate = new Date(formData.appointmentDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.appointmentDate = 'Cannot schedule appointments in the past';
      }
    }

    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Please select a time slot';
    }

    if (!formData.reasonForVisit || formData.reasonForVisit.trim().length < 5) {
      newErrors.reasonForVisit =
        'Please provide a reason (at least 5 characters)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    const detectedChanges = detectChanges();

    if (detectedChanges.length === 0) {
      setErrors({ general: 'No changes were made' });
      return;
    }

    setChanges(detectedChanges);
    setShowConfirmation(true);
  };

  const handleConfirmSave = async () => {
    setIsSubmitting(true);

    try {
      // Parse time slot back to your API format
      const [startTime, endTime] = formData.timeSlot.split('-');

      const updatedData = {
        _id: appointment._id,
        doctor: formData.doctor,
        appointmentDate: formData.appointmentDate,
        timeSlot: {
          startTime: startTime.trim(),
          endTime: endTime.trim(),
        },
        reasonForVisit: formData.reasonForVisit,
        notes: formData.notes,
        status: formData.status,
        priority: formData.priority,
        isFollowUp: formData.isFollowUp,
      };

      await onSave(updatedData);
      onClose();
    } catch (error) {
      setErrors({ general: error.message || 'Failed to update appointment' });
    } finally {
      setIsSubmitting(false);
      setShowConfirmation(false);
    }
  };

  if (!isOpen) return null;

  const selectedDoctor = doctors.find(d => d._id === formData.doctor);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-base-100 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-base-300">
          <div>
            <h2 className="text-2xl font-bold text-base-content">
              Edit Appointment
            </h2>
            <p className="text-base-content/70 text-sm mt-1">
              Reschedule or modify appointment details
            </p>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {!showConfirmation ? (
            <div className="space-y-6">
              {errors.general && (
                <div className="alert alert-error">
                  <AlertCircle size={20} />
                  <span>{errors.general}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Stethoscope size={18} />
                  Select Doctor *
                </label>
                <select
                  className={`select select-bordered w-full ${
                    errors.doctor ? 'select-error' : ''
                  }`}
                  value={formData.doctor}
                  onChange={e => handleChange('doctor', e.target.value)}
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      Dr. {doctor.firstname} {doctor.lastname} -{' '}
                      {doctor.specialization}
                    </option>
                  ))}
                </select>
                {errors.doctor && (
                  <p className="text-xs text-error mt-1">{errors.doctor}</p>
                )}

                {selectedDoctor && (
                  <div className="mt-3 p-3 bg-base-200 rounded-lg">
                    <div className="text-sm">
                      <p className="font-semibold">
                        {selectedDoctor.specialization}
                      </p>
                      <p className="text-base-content/70">
                        Dr. {selectedDoctor.firstname} {selectedDoctor.lastname}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Calendar size={18} />
                  Appointment Date *
                </label>
                <input
                  type="date"
                  className={`input input-bordered w-full ${
                    errors.appointmentDate ? 'input-error' : ''
                  }`}
                  value={formData.appointmentDate}
                  onChange={e =>
                    handleChange('appointmentDate', e.target.value)
                  }
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.appointmentDate && (
                  <p className="text-xs text-error mt-1">
                    {errors.appointmentDate}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <Clock size={18} />
                  Time Slot *
                </label>
                <select
                  className={`select select-bordered w-full ${
                    errors.timeSlot ? 'select-error' : ''
                  }`}
                  value={formData.timeSlot}
                  onChange={e => handleChange('timeSlot', e.target.value)}
                >
                  <option value="">Select time</option>
                  {availableTimeSlots.map(slot => (
                    <option
                      key={`${slot.startTime}-${slot.endTime}`}
                      value={`${slot.startTime}-${slot.endTime}`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </option>
                  ))}
                </select>
                {errors.timeSlot && (
                  <p className="text-xs text-error mt-1">{errors.timeSlot}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Priority</label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.priority}
                    onChange={e => handleChange('priority', e.target.value)}
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="emergency">Emergency</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Status</label>
                  <select
                    className="select select-bordered w-full"
                    value={formData.status}
                    onChange={e => handleChange('status', e.target.value)}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-primary"
                    checked={formData.isFollowUp}
                    onChange={e => handleChange('isFollowUp', e.target.checked)}
                  />
                  <span className="text-sm font-semibold">
                    This is a follow-up appointment
                  </span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2">
                  <FileText size={18} />
                  Reason for Visit *
                </label>
                <textarea
                  className={`textarea textarea-bordered h-24 w-full ${
                    errors.reasonForVisit ? 'textarea-error' : ''
                  }`}
                  placeholder="Describe the reason for this appointment..."
                  value={formData.reasonForVisit}
                  onChange={e => handleChange('reasonForVisit', e.target.value)}
                />
                {errors.reasonForVisit && (
                  <p className="text-xs text-error mt-1">
                    {errors.reasonForVisit}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Additional Notes (Optional)
                </label>
                <textarea
                  className="textarea textarea-bordered h-20 w-full"
                  placeholder="Any additional information..."
                  value={formData.notes}
                  onChange={e => handleChange('notes', e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="btn btn-outline flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  <Save size={18} />
                  Review Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="alert alert-info">
                <AlertCircle size={24} />
                <div>
                  <h3 className="font-bold">Confirm Changes</h3>
                  <div className="text-sm">
                    Please review the changes before confirming
                  </div>
                </div>
              </div>

              <div className="bg-base-200 rounded-lg p-6 space-y-4">
                <h3 className="font-semibold text-lg mb-4">Changes Summary:</h3>
                {changes.map((change, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 pb-4 border-b border-base-300 last:border-0 last:pb-0"
                  >
                    <div className="flex-1">
                      <div className="text-sm text-base-content/70 mb-1">
                        {change.field}
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="bg-error/20 text-error px-3 py-1 rounded line-through">
                          {change.from}
                        </div>
                        <span>→</span>
                        <div className="bg-success/20 text-success px-3 py-1 rounded font-semibold">
                          {change.to}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="alert alert-warning">
                <AlertCircle size={20} />
                <span className="text-sm">
                  A notification will be sent to the doctor about this change.
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="btn btn-outline flex-1"
                  disabled={isSubmitting}
                >
                  Back to Edit
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="btn btn-primary flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Confirm & Save
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditAppointmentModal;
