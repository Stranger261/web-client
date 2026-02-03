import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, MapPin, User, Plus, X } from 'lucide-react';
import Modal from '../ui/Modal';

const CreateScheduleModal = ({
  isOpen,
  onClose,
  doctors,
  onSubmit,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [doctorName, setDoctorName] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    staff_id: '',
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '12:00',
    location: '',
    effective_from: '',
    effective_until: '',
    is_active: true,
  });

  // Days of week
  const daysOfWeek = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Time slots (30 min intervals from 6 AM to 10 PM)
  const timeSlots = Array.from({ length: 32 }, (_, i) => {
    const hour = Math.floor(i / 2) + 6; // Start from 6 AM
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      staff_id: '',
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '12:00',
      location: '',
      effective_from: '',
      effective_until: '',
      is_active: true,
    });
    setSelectedDoctor('');
    setDoctorName('');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.staff_id) {
      newErrors.staff_id = 'Please select a doctor';
    }

    if (!formData.start_time) {
      newErrors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      newErrors.end_time = 'End time is required';
    }

    if (formData.start_time && formData.end_time) {
      if (formData.start_time >= formData.end_time) {
        newErrors.time = 'End time must be after start time';
      }
    }

    if (formData.effective_from && formData.effective_until) {
      if (
        new Date(formData.effective_until) < new Date(formData.effective_from)
      ) {
        newErrors.dates = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);

    try {
      // Format data for API
      const scheduleData = {
        ...formData,
        start_time: `${formData.start_time}:00`,
        end_time: `${formData.end_time}:00`,
      };

      // Add effective dates if provided
      if (formData.effective_from) {
        scheduleData.effective_from = `${formData.effective_from}T00:00:00Z`;
      }

      if (formData.effective_until) {
        scheduleData.effective_until = `${formData.effective_until}T23:59:59Z`;
      }

      // Call the onSubmit function passed from parent
      await onSubmit(scheduleData);

      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating schedule:', error);
      // Error is already handled by the parent component
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDoctorChange = e => {
    const value = e.target.value;
    setSelectedDoctor(value);

    // Find the selected doctor to get their name
    const selectedDoc = doctors?.find(doc => doc.staff_id.toString() === value);
    if (selectedDoc) {
      setDoctorName(selectedDoc.name);
    }

    setFormData(prev => ({ ...prev, staff_id: value }));
  };

  // Quick time presets
  const timePresets = [
    { label: 'Morning (9AM - 12PM)', start: '09:00', end: '12:00' },
    { label: 'Afternoon (1PM - 5PM)', start: '13:00', end: '17:00' },
    { label: 'Evening (6PM - 9PM)', start: '18:00', end: '21:00' },
  ];

  const applyTimePreset = (start, end) => {
    setFormData(prev => ({
      ...prev,
      start_time: start,
      end_time: end,
    }));
  };

  // Helper function to format time for display
  const formatTimeForDisplay = time => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper function to calculate duration
  const calculateDuration = (start, end) => {
    if (!start || !end) return '';

    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);

    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;

    const durationMinutes = endTotal - startTotal;

    if (durationMinutes < 60) {
      return `${durationMinutes} minutes`;
    } else {
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Doctor Schedule">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Doctor Selection */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <User size={18} />
            <label className="font-medium">Select Doctor</label>
          </div>

          {doctors && doctors.length > 0 ? (
            <>
              <select
                name="staff_id"
                value={selectedDoctor}
                onChange={handleDoctorChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.staff_id ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                <option value="">Select a doctor</option>
                {doctors.map(doctor => (
                  <option key={doctor.staff_id} value={doctor.staff_id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>

              {selectedDoctor && doctorName && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-blue-800">{doctorName}</p>
                  <p className="text-sm text-blue-600">Selected for schedule</p>
                </div>
              )}
            </>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Loading doctors list...</p>
            </div>
          )}

          {errors.staff_id && (
            <p className="text-sm text-red-600">{errors.staff_id}</p>
          )}
        </div>

        {/* Day of Week */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-gray-700">
            <Calendar size={18} />
            <label className="font-medium">Day of Week</label>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysOfWeek.map(day => (
              <button
                key={day}
                type="button"
                onClick={() =>
                  setFormData(prev => ({ ...prev, day_of_week: day }))
                }
                className={`py-2 text-sm font-medium rounded-lg transition-all ${
                  formData.day_of_week === day
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isLoading}
              >
                {day.slice(0, 3)}
              </button>
            ))}
          </div>

          <div className="text-center">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
              {formData.day_of_week}
            </span>
          </div>
        </div>

        {/* Time Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-700">
              <Clock size={18} />
              <label className="font-medium">Time Slots</label>
            </div>

            {/* Quick Presets */}
            <div className="flex space-x-2">
              {timePresets.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyTimePreset(preset.start, preset.end)}
                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  disabled={isLoading}
                >
                  {preset.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {errors.time && <p className="text-sm text-red-600">{errors.time}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <select
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.start_time ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                {timeSlots.map(time => (
                  <option key={`start-${time}`} value={time}>
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <select
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                  errors.end_time ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={isLoading}
              >
                {timeSlots.map(time => (
                  <option key={`end-${time}`} value={time}>
                    {formatTimeForDisplay(time)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Display */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-600">
              Schedule:{' '}
              <span className="font-medium text-gray-800">
                {formatTimeForDisplay(formData.start_time)}
              </span>{' '}
              to{' '}
              <span className="font-medium text-gray-800">
                {formatTimeForDisplay(formData.end_time)}
              </span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Total duration:{' '}
              {calculateDuration(formData.start_time, formData.end_time)}
            </p>
          </div>
        </div>

        {/* Effective Dates */}
        <div className="space-y-4">
          <label className="block font-medium text-gray-700">
            Effective Period (Optional)
          </label>

          {errors.dates && (
            <p className="text-sm text-red-600">{errors.dates}</p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <input
                type="date"
                name="effective_from"
                value={formData.effective_from}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date (Optional)
              </label>
              <input
                type="date"
                name="effective_until"
                value={formData.effective_until}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={isLoading}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Leave dates empty for indefinite schedule
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleChange}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            disabled={isLoading}
          />
          <label htmlFor="is_active" className="text-gray-700">
            Active Schedule
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            disabled={isLoading}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Create Schedule</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateScheduleModal;
