// scheduleApi.js - ENHANCED VERSION

import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class ScheduleService {
  constructor() {
    this.scheduleApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/doctors`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  // ==================== EXISTING METHODS ====================

  async getDepartments() {
    try {
      const departments = await this.scheduleApi.get('/departments');
      return departments.data;
    } catch (error) {
      console.error('Appointment Service error', error);
      throw error;
    }
  }

  async getAllDoctors() {
    try {
      const allDoctors = await this.scheduleApi.get('/doctors');
      return allDoctors.data;
    } catch (error) {
      console.error('All doctors error: ', error);
      throw error;
    }
  }

  async getDoctorsByDept(departmentId, patientUuid = null) {
    try {
      const params = patientUuid ? { patientUuid } : {};
      const doctorsByDept = await this.scheduleApi.get(
        `/departments/${departmentId}/doctors`,
        { params },
      );

      return doctorsByDept.data;
    } catch (error) {
      console.error('get doctor dept error: ', error);
      throw error;
    }
  }

  async getDoctorsAvailability(doctorUuid, startDate, endDate) {
    try {
      const doctorsAvailability = await this.scheduleApi.get(
        `/doctors/${doctorUuid}/availability`,
        { params: { startDate, endDate } },
      );
      console.log(doctorsAvailability.data);

      return doctorsAvailability.data;
    } catch (error) {
      console.error('doctors availability error: ', error);
      throw error;
    }
  }

  async getCombinedSchedule(departmentId, startDate, endDate) {
    try {
      const combinedSchedule = await this.scheduleApi.get(
        `/departments/${departmentId}/availability`,
        {
          params: { startDate, endDate },
        },
      );

      return combinedSchedule.data;
    } catch (error) {
      console.error('Combined sched error: ', error);
      throw error;
    }
  }

  async createDoctorSchedule(scheduleData) {
    try {
      const res = await this.scheduleApi.post('/', { scheduleData });

      return res.data;
    } catch (error) {
      console.error('Create doctor sched error: ', error);
      throw error;
    }
  }

  // ==================== NEW SCHEDULE CANCELLATION METHODS ====================

  /**
   * Cancel all remaining appointments for a doctor on a specific date
   * Use case: Doctor has emergency and cannot continue for the day
   * @param {number} doctorId - The staff_id of the doctor
   * @param {string} date - The date to cancel (yyyy-MM-dd)
   * @param {string} reason - Reason for cancellation
   * @returns {Promise} - Cancellation summary
   */
  async cancelDoctorScheduleForDay(doctorId, date, reason) {
    try {
      const response = await this.scheduleApi.post('/cancel-schedule/day', {
        doctorId,
        date,
        reason,
      });

      return response.data;
    } catch (error) {
      console.error('Cancel doctor schedule for day error:', error);
      throw error;
    }
  }

  /**
   * Cancel doctor schedule for multiple days
   * Use case: Sick leave, vacation, extended absence
   * @param {number} doctorId - The staff_id of the doctor
   * @param {string} startDate - Start date (yyyy-MM-dd)
   * @param {string} endDate - End date (yyyy-MM-dd)
   * @param {string} leaveType - Type of leave (sick, emergency, personal, vacation)
   * @param {string} reason - Reason for leave
   * @returns {Promise} - Cancellation summary
   */
  async cancelDoctorScheduleForPeriod(
    doctorId,
    startDate,
    endDate,
    leaveType,
    reason,
  ) {
    try {
      const response = await this.scheduleApi.post('/cancel-schedule/period', {
        doctorId,
        startDate,
        endDate,
        leaveType,
        reason,
      });

      return response.data;
    } catch (error) {
      console.error('Cancel doctor schedule for period error:', error);
      throw error;
    }
  }

  /**
   * Block specific time slots for a doctor
   * Use case: Meeting, administrative work, break
   * @param {number} doctorId - The staff_id of the doctor
   * @param {string} date - The date (yyyy-MM-dd)
   * @param {string} startTime - Start time (HH:mm:ss)
   * @param {string} endTime - End time (HH:mm:ss)
   * @param {string} reason - Reason for blocking
   * @returns {Promise} - Block summary
   */
  async blockDoctorTimeSlots(doctorId, date, startTime, endTime, reason) {
    try {
      const response = await this.scheduleApi.post('/block-timeslots', {
        doctorId,
        date,
        startTime,
        endTime,
        reason,
      });

      return response.data;
    } catch (error) {
      console.error('Block doctor time slots error:', error);
      throw error;
    }
  }

  /**
   * Get doctor's leave summary
   * @param {number} doctorId - The staff_id of the doctor
   * @param {string} startDate - Start date for query
   * @param {string} endDate - End date for query
   * @returns {Promise} - Leave summary
   */
  async getDoctorLeaveSummary(doctorId, startDate, endDate) {
    try {
      const response = await this.scheduleApi.get(`/${doctorId}/leaves`, {
        params: { startDate, endDate },
      });

      return response.data;
    } catch (error) {
      console.error('Get doctor leave summary error:', error);
      throw error;
    }
  }
}

export default new ScheduleService();
