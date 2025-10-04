import axios from 'axios';
import { APPOINTMENT_SERVICE_BASE_URL } from '../config/API_URL';

const scheduleApi = axios.create({
  baseURL: `${APPOINTMENT_SERVICE_BASE_URL}/schedule`,
  withCredentials: true,
  headers: { 'x-internal-api-key': 'CORE-1-HMS-safe-key' },
});

/**
 * Fetches the list of all departments.
 * @returns {Promise<Array>} A list of departments.
 */
export const fetchDepartments = async () => {
  try {
    const response = await axios.get(
      `${APPOINTMENT_SERVICE_BASE_URL}/department/view`,
      {
        withCredentials: true,
        headers: { 'x-internal-api-key': 'CORE-1-HMS-safe-key' },
      }
    );
    return response.data.data;
  } catch (error) {
    console.error(
      'Error fetching departments:',
      error.response?.data?.message || error.message
    );
    throw (
      error.response?.data?.message || new Error('Failed to fetch departments')
    );
  }
};

/**
 * Fetches the list of all doctors.
 * @returns {Promise<Array>} A list of doctor profiles.
 */
export const fetchDoctors = async () => {
  try {
    const response = await scheduleApi.get('/view/doctors');
    return response.data.data;
  } catch (error) {
    console.error(
      'Error fetching doctors:',
      error.response?.data?.message || error.message
    );
    throw error.response?.data?.message || new Error('Failed to fetch doctors');
  }
};

/**
 * Fetches the monthly schedule for a specific doctor.
 * @param {string} doctorId - The ID of the doctor.
 * @param {string} month - The month to fetch in 'YYYY-MM' format.
 * @returns {Promise<Object>} The doctor's schedule object.
 */
export const fetchDoctorSchedule = async (doctorId, month) => {
  if (!doctorId || !month) {
    throw new Error('Doctor ID and month are required to fetch a schedule.');
  }
  try {
    const response = await scheduleApi.get(`/${doctorId}/${month}`);
    return response.data.data;
  } catch (error) {
    console.error(
      'Error fetching schedule:',
      error.response?.data?.message || error.message
    );
    throw (
      error.response?.data?.message || new Error('Failed to fetch schedule')
    );
  }
};

/**
 * NEW: Fetches all schedules for all doctors in a given department and month.
 * This is the new function.
 * @param {string} departmentId - The ID of the department.
 * @param {string} month - The month in 'YYYY-MM' format.
 */
export const fetchSchedulesForDepartment = async (departmentId, month) => {
  try {
    // It calls the new backend endpoint we created.
    const response = await scheduleApi.get(
      `/by-department/${departmentId}/${month}`
    );
    return response.data.data;
  } catch (error) {
    console.error(
      `Error fetching schedules for department ${departmentId}:`,
      error.response?.data?.message || error.message
    );
    throw error;
  }
};
