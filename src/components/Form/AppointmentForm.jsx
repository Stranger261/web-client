// components/forms/AppointmentForm.jsx
import { useState, useEffect } from 'react';
import { formatDate } from '../../utils/dateFormatter';

const AppointmentForm = ({
  appointment = null, // null for create mode, appointment object for edit mode
  currentUser,
  mode = 'create', // 'create' or 'edit'
  onSave,
  onCancel,
  doctors = [], // List of available doctors
  patients = [], // List of available patients (for receptionist)
  timeSlots = [], // Available time slots
}) => {
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    appointmentDate: '',
    timeSlot: {
      startTime: '',
      endTime: '',
    },
    reasonForVisit: '',
    isFollowUp: false,
    status: 'scheduled',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (mode === 'edit' && appointment) {
      setFormData({
        patientId:
          typeof appointment.patient === 'object'
            ? appointment.patient._id || appointment.patient.id
            : appointment.patient || '',
        doctorId: appointment.doctor?._id || appointment.doctor?.id || '',
        appointmentDate: appointment.appointmentDate
          ? new Date(appointment.appointmentDate).toISOString().split('T')[0]
          : '',
        timeSlot: {
          startTime: appointment.timeSlot?.startTime || '',
          endTime: appointment.timeSlot?.endTime || '',
        },
        reasonForVisit: appointment.reasonForVisit || '',
        isFollowUp: appointment.isFollowUp || false,
        status: appointment.status || 'scheduled',
      });
    } else if (mode === 'create' && currentUser.role === 'patient') {
      // Pre-fill patient ID for patient users
      setFormData(prev => ({
        ...prev,
        patientId: currentUser._id || currentUser.id,
      }));
    }
  }, [appointment, mode, currentUser]);

  // Handle input changes
  const handleInputChange = e => {
    const { name, value, type, checked } = e.target;

    if (name.includes('.')) {
      // Handle nested objects (like timeSlot)
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.doctorId) {
      newErrors.doctorId = 'Doctor is required';
    }

    if (currentUser.role !== 'patient' && !formData.patientId) {
      newErrors.patientId = 'Patient is required';
    }

    if (!formData.appointmentDate) {
      newErrors.appointmentDate = 'Appointment date is required';
    }

    if (!formData.timeSlot.startTime) {
      newErrors['timeSlot.startTime'] = 'Start time is required';
    }

    if (!formData.timeSlot.endTime) {
      newErrors['timeSlot.endTime'] = 'End time is required';
    }

    // Check if appointment date is not in the past
    const selectedDate = new Date(formData.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      newErrors.appointmentDate = 'Appointment date cannot be in the past';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const appointmentData = {
        ...formData,
        _id: appointment?._id, // Include ID for edit mode
      };

      await onSave(appointmentData);
    } catch (error) {
      console.error('Error saving appointment:', error);
      // Handle error - maybe show toast or set error state
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Selection - Only for receptionist/doctor */}
      {currentUser.role !== 'patient' && (
        <div>
          <label
            htmlFor="patientId"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Patient *
          </label>
          <select
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors.patientId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Select a patient</option>
            {patients.map(patient => (
              <option
                key={patient._id || patient.id}
                value={patient._id || patient.id}
              >
                {patient.fullName ||
                  patient.displayName ||
                  `${patient.firstname} ${patient.lastname}`}
                {patient.mrn && ` (MRN: ${patient.mrn})`}
              </option>
            ))}
          </select>
          {errors.patientId && (
            <p className="mt-1 text-sm text-red-600">{errors.patientId}</p>
          )}
        </div>
      )}

      {/* Doctor Selection */}
      <div>
        <label
          htmlFor="doctorId"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Doctor *
        </label>
        <select
          id="doctorId"
          name="doctorId"
          value={formData.doctorId}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.doctorId ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        >
          <option value="">Select a doctor</option>
          {doctors.map(doctor => (
            <option
              key={doctor._id || doctor.id}
              value={doctor._id || doctor.id}
            >
              Dr. {doctor.firstname} {doctor.lastname}
              {doctor.specialization && ` - ${doctor.specialization}`}
            </option>
          ))}
        </select>
        {errors.doctorId && (
          <p className="mt-1 text-sm text-red-600">{errors.doctorId}</p>
        )}
      </div>

      {/* Appointment Date */}
      <div>
        <label
          htmlFor="appointmentDate"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Appointment Date *
        </label>
        <input
          type="date"
          id="appointmentDate"
          name="appointmentDate"
          value={formData.appointmentDate}
          onChange={handleInputChange}
          min={new Date().toISOString().split('T')[0]} // Prevent past dates
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
            errors.appointmentDate ? 'border-red-500' : 'border-gray-300'
          }`}
          required
        />
        {errors.appointmentDate && (
          <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
        )}
      </div>

      {/* Time Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Start Time *
          </label>
          <input
            type="time"
            id="startTime"
            name="timeSlot.startTime"
            value={formData.timeSlot.startTime}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors['timeSlot.startTime']
                ? 'border-red-500'
                : 'border-gray-300'
            }`}
            required
          />
          {errors['timeSlot.startTime'] && (
            <p className="mt-1 text-sm text-red-600">
              {errors['timeSlot.startTime']}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            End Time *
          </label>
          <input
            type="time"
            id="endTime"
            name="timeSlot.endTime"
            value={formData.timeSlot.endTime}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              errors['timeSlot.endTime'] ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          />
          {errors['timeSlot.endTime'] && (
            <p className="mt-1 text-sm text-red-600">
              {errors['timeSlot.endTime']}
            </p>
          )}
        </div>
      </div>

      {/* Reason for Visit */}
      <div>
        <label
          htmlFor="reasonForVisit"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Reason for Visit
        </label>
        <textarea
          id="reasonForVisit"
          name="reasonForVisit"
          value={formData.reasonForVisit}
          onChange={handleInputChange}
          rows={3}
          placeholder="Describe the reason for this appointment..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Status - Only for receptionist */}
      {currentUser.role === 'receptionist' && (
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      )}

      {/* Follow-up Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isFollowUp"
          name="isFollowUp"
          checked={formData.isFollowUp}
          onChange={handleInputChange}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isFollowUp" className="ml-2 text-sm text-gray-700">
          This is a follow-up appointment
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Saving...'
            : mode === 'edit'
            ? 'Update Appointment'
            : 'Schedule Appointment'}
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;
