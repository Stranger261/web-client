import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class bedAssignmentService {
  constructor() {
    this.bedAssignmentApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/bedAssignment`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY || 'core-1-secret-key',
      },
    });
  }

  async assignPatient(data) {
    try {
      const res = await this.bedAssignmentApi.post('/assign', { data });

      return res.data;
    } catch (error) {
      console.error('Failed to assign patient.');
      throw error;
    }
  }

  async releasePatient(data) {
    try {
      const res = await this.bedAssignmentApi.post('/release', { data });

      return res.data;
    } catch (error) {
      console.error('Failed to release patient.');
      throw error;
    }
  }

  async transferPatient(data) {
    try {
      const res = await this.bedAssignmentApi.post('/transfer', { data });
      console.log(res.data);
      return res.data;
    } catch (error) {
      console.error('Failed to transer patient.');
      throw error;
    }
  }

  async getCurrentBed(admissionId) {
    try {
      const res = await this.bedAssignmentApi.post(
        `/admission/${admissionId}/current`,
      );

      return res.data;
    } catch (error) {
      console.error('Failed to get current bed.');
      throw error;
    }
  }

  async getAdmissions(filters = {}) {
    try {
      const res = await this.bedAssignmentApi.get(`/admission`, {
        params: filters,
      });

      return res.data;
    } catch (error) {
      console.error('Failed to get current bed.');
      throw error;
    }
  }

  async getAssignmentHistory(admissionId) {
    try {
      const res = await this.bedAssignmentApi.get(
        `/admission/${admissionId}/history`,
      );

      return res.data;
    } catch (error) {
      console.error('Failed to get current bed.');
      throw error;
    }
  }

  async markBedCleaned(bedId) {
    try {
      const res = await this.bedAssignmentApi.patch(`/${bedId}/cleaned`);

      return res.data;
    } catch (error) {
      console.error('Failed to mark bed clean.');
      throw error;
    }
  }
}
export default new bedAssignmentService();
