// services/appointmentApi.js
// COMPLETE VERSION - Replace your existing file with this

import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8002/appointments',
  withCredentials: true,
  headers: {
    'x-internal-api-key': 'CORE-1-HMS-safe-key',
  },
});

// ===== EXISTING FUNCTIONS (Keep these) =====

/**
 * Fetches all appointments for the currently logged-in user.
 */
export const fetchMyAppointments = async () => {
  try {
    const response = await apiClient.get('/me');
    return response.data.data;
  } catch (error) {
    console.error(
      'API Error fetching appointments:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to fetch appointments'
    );
  }
};

/**
 * Fetches all appointments (for receptionist/staff)
 */
export const fetchAllAppointments = async () => {
  try {
    const response = await apiClient.get('/all');
    return response.data.data;
  } catch (error) {
    console.error(
      'API Error fetching appointments:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to fetch appointments'
    );
  }
};

/**
 * Creates a new appointment (patient booking)
 */
export const createAppointment = async appointmentData => {
  try {
    const response = await apiClient.post('/create', appointmentData);
    return response.data;
  } catch (error) {
    console.error(
      'API Error creating appointment:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to create appointment'
    );
  }
};

/**
 * Cancels an existing appointment
 */
export const cancelAppointment = async (appointmentId, reason = '') => {
  try {
    const payload = reason ? { reason } : {};
    const response = await apiClient.patch(`/cancel/${appointmentId}`, payload);
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      'API Error cancelling appointment:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to cancel appointment'
    );
  }
};

// ===== NEW FUNCTIONS FOR RECEPTIONIST FEATURES =====

/**
 * Fetch patient's appointment history for follow-up detection
 * @param {string} patientId - Patient ID from patient service
 * @returns {Promise<Array>} Patient's previous appointments
 */
export const fetchPatientAppointmentHistory = async patientId => {
  try {
    const response = await apiClient.get(`/patient/${patientId}/history`);
    return response.data.data;
  } catch (error) {
    console.error(
      'API Error fetching patient history:',
      error.response?.data?.message || error.message
    );
    // Return empty array instead of throwing - follow-up is optional
    return [];
  }
};

/**
 * Create appointment with receptionist features (priority, notes, etc.)
 * @param {Object} appointmentData - Enhanced appointment data
 * @returns {Promise<Object>} Created appointment
 */
export const createReceptionistAppointment = async appointmentData => {
  try {
    const response = await apiClient.post(
      '/receptionist/create',
      appointmentData
    );
    return response.data;
  } catch (error) {
    console.error(
      'API Error creating receptionist appointment:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to create appointment'
    );
  }
};

/**
 * Update an existing appointment
 * @param {string} appointmentId - Appointment ID
 * @param {Object} appointmentData - Updated appointment data
 * @returns {Promise<Object>} Updated appointment
 */
export const updateAppointment = async (appointmentId, appointmentData) => {
  try {
    const response = await apiClient.put(
      `/update/${appointmentId}`,
      appointmentData
    );
    return response.data;
  } catch (error) {
    console.error(
      'API Error updating appointment:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to update appointment'
    );
  }
};

/**
 * Search appointments with filters
 * @param {string} searchTerm - Search term
 * @param {Object} filters - Filter options (status, priority, isFollowUp, dateRange)
 * @returns {Promise<Array>} Filtered appointments
 */
export const searchAppointments = async (searchTerm = '', filters = {}) => {
  try {
    const params = {
      ...(searchTerm && { search: searchTerm }),
      ...filters,
    };

    const response = await apiClient.get('/search', { params });
    return response.data.data;
  } catch (error) {
    console.error(
      'API Error searching appointments:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to search appointments'
    );
  }
};

/**
 * Get appointment statistics for dashboard
 * @returns {Promise<Object>} Appointment statistics
 */
export const fetchAppointmentStats = async () => {
  try {
    const response = await apiClient.get('/stats');
    return response.data.data;
  } catch (error) {
    console.error(
      'API Error fetching appointment stats:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to fetch appointment statistics'
    );
  }
};

/**
 * Confirm appointment (change status from scheduled to confirmed)
 * @param {string} appointmentId - Appointment ID
 * @returns {Promise<Object>} Confirmed appointment
 */
export const confirmAppointment = async appointmentId => {
  try {
    const response = await apiClient.patch(`/confirm/${appointmentId}`);
    return response.data;
  } catch (error) {
    console.error(
      'API Error confirming appointment:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to confirm appointment'
    );
  }
};

/**
 * Mark appointment as completed
 * @param {string} appointmentId - Appointment ID
 * @param {Object} completionData - Completion details (optional)
 * @returns {Promise<Object>} Completed appointment
 */
export const completeAppointment = async (
  appointmentId,
  completionData = {}
) => {
  try {
    const response = await apiClient.patch(
      `/complete/${appointmentId}`,
      completionData
    );
    return response.data;
  } catch (error) {
    console.error(
      'API Error completing appointment:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message || 'Failed to complete appointment'
    );
  }
};

/**
 * Get appointments by date range
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Array>} Appointments in date range
 */
export const fetchAppointmentsByDateRange = async (startDate, endDate) => {
  try {
    const response = await apiClient.get('/search', {
      params: { startDate, endDate },
    });
    return response.data.data;
  } catch (error) {
    console.error(
      'API Error fetching appointments by date range:',
      error.response?.data?.message || error.message
    );
    throw new Error(
      error.response?.data?.message ||
        'Failed to fetch appointments by date range'
    );
  }
};

export const fetchMyDoctors = async () => {
  const response = await axios.get(
    'http://localhost:8002/schedule/my-doctors',
    {
      withCredentials: true,
      headers: {
        'x-internal-api-key': 'CORE-1-HMS-safe-key',
      },
    }
  );
  return response.data;
};

export const fetchDoctorAppointments = async docId => {
  const res = await apiClient(`/doctor/${docId}`);

  console.log(res);
  return res.data;
};
