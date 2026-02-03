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
}

export default new ScheduleService();
