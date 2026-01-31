import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class MedicalRecordsService {
  constructor() {
    this.api = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/medical-records`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY || 'core-1-secret-key',
      },
    });
  }

  /**
   * Get medical records for current user (patient viewing own records)
   * GET /api/medical-records
   */
  async getMyMedicalRecords(params = {}) {
    try {
      const response = await this.api.get('/', { params });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get medical records:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get medical records for a specific patient (doctor/nurse/admin access)
   * GET /api/medical-records/patient/:patientId
   */
  async getPatientMedicalRecords(patientId, params = {}) {
    try {
      const response = await this.api.get(`/patient/${patientId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get patient medical records:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get detailed view of a specific record
   * GET /api/medical-records/:recordType/:recordId
   */
  async getRecordDetails(recordType, recordId) {
    try {
      const response = await this.api.get(`/${recordType}/${recordId}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get record details:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get medical records summary
   * GET /api/medical-records/summary
   */
  async getSummary(patientId = null) {
    try {
      const params = patientId ? { patientId } : {};
      const response = await this.api.get('/summary', { params });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get medical records summary:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get progress notes for an admission
   * GET /api/medical-records/admission/:admissionId/progress-notes
   */
  async getProgressNotes(admissionId) {
    try {
      const response = await this.api.get(
        `/admission/${admissionId}/progress-notes`,
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get progress notes:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get prescriptions for a visit
   * GET /api/medical-records/:visitType/:visitId/prescriptions
   */
  async getPrescriptions(visitType, visitId) {
    try {
      const response = await this.api.get(
        `/${visitType}/${visitId}/prescriptions`,
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to get prescriptions:', error);
      throw error.response?.data || error;
    }
  }
}

export default new MedicalRecordsService();
