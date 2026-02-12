import axios from 'axios';
import { INTERNAL_API_KEY, DEVELOPMENT_BASE_URL } from '../configs/CONST';

class patientService {
  constructor() {
    this.patientApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/patients`,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
      withCredentials: true,
    });

    // Nurse-specific API instance
    this.nurseApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/patients/nurse`,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
      withCredentials: true,
    });
  }

  async getDoctorsPatients(doctorUuid, filters = {}) {
    try {
      const res = await this.patientApi.get(`/doctors/${doctorUuid}/patients`, {
        params: filters,
      });

      return res.data;
    } catch (error) {
      console.log('Get doctor patients error: ', error);
      throw error;
    }
  }

  async getPatientMedicalHistory(patientUuid, filters) {
    try {
      const medHistory = await this.patientApi.get(
        `/${patientUuid}/med-history`,
        { params: filters },
      );

      return medHistory.data;
    } catch (error) {
      console.log('Get patient medical history failed: ', error);
      throw error;
    }
  }

  async getPatientMedicalRecords(patientUuid, filters) {
    try {
      const medRecords = await this.patientApi.get(
        `/${patientUuid}/med-records`,
        { params: filters },
      );

      return medRecords.data;
    } catch (error) {
      console.log('Get patient medical history failed: ', error);
      throw error;
    }
  }

  async getPatientDetails(patientUuid) {
    try {
      const patient = await this.patientApi.get(`/${patientUuid}/details`);

      return patient.data;
    } catch (error) {
      console.log('Get patient medical history failed: ', error);
      throw error;
    }
  }

  async getPatient(search) {
    try {
      const patient = await this.patientApi.get('/', { params: { search } });

      return patient.data;
    } catch (error) {
      console.log('Get patient failed: ', error);
      throw error;
    }
  }

  async getAllPatients(filters = {}) {
    try {
      const response = await this.patientApi.get('/all', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Get all patients error:', error);
      throw error;
    }
  }

  async addFaceToPatient(personId, faceImageBase64, staffId) {
    try {
      const response = await this.patientApi.post(`/add-face/${personId}`, {
        personId,
        faceImageBase64,
        staffId,
      });
      return response.data;
    } catch (error) {
      console.error('Add face to patient error:', error);
      throw error;
    }
  }

  // ===========================
  // NURSE-SPECIFIC METHODS
  // ===========================

  /**
   * Get nurse's assigned patients (from care team)
   * @param {Object} filters - Filter options (status, search, gender, page, limit)
   * @returns {Promise} Response with patients, stats, pagination
   */
  async getNursePatients(filters = {}) {
    try {
      const response = await this.nurseApi.get('/patients', {
        params: filters,
      });
      return response.data;
    } catch (error) {
      console.error('Get nurse patients error:', error);
      throw error;
    }
  }

  /**
   * Get specific patient details (with care team validation)
   * @param {String} patientUuid - Patient UUID
   * @returns {Promise} Patient details
   */
  async getNursePatientDetails(patientUuid) {
    try {
      const response = await this.nurseApi.get(`/patients/${patientUuid}`);
      return response.data;
    } catch (error) {
      console.error('Get nurse patient details error:', error);
      throw error;
    }
  }

  /**
   * Get patient medical records (with care team validation)
   * @param {String} patientUuid - Patient UUID
   * @param {Object} filters - Filter options
   * @returns {Promise} Medical records timeline
   */
  async getNursePatientMedicalRecords(patientUuid, filters = {}) {
    try {
      const response = await this.nurseApi.get(
        `/patients/${patientUuid}/medical-records`,
        { params: filters },
      );
      return response.data;
    } catch (error) {
      console.error('Get nurse patient medical records error:', error);
      throw error;
    }
  }

  /**
   * Get nurse's care team assignments
   * @returns {Promise} Care team assignments
   */
  async getNurseCareTeamAssignments() {
    try {
      const response = await this.nurseApi.get('/care-team');
      return response.data;
    } catch (error) {
      console.error('Get nurse care team assignments error:', error);
      throw error;
    }
  }
}

export default new patientService();
