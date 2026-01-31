// services/doctorAdmissionApi.js
import axios from 'axios';
import { INTERNAL_API_KEY, DEVELOPMENT_BASE_URL } from '../configs/CONST';

class DoctorAdmissionApi {
  constructor() {
    this.api = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/doctorAdmission`,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
      withCredentials: true,
    });
  }

  // Get doctor's admissions (only patients assigned to this doctor)
  async getDoctorAdmissions(filters = {}) {
    try {
      const res = await this.api.get('/my-admissions', {
        params: filters,
      });
      return res.data;
    } catch (error) {
      console.error('Get doctor admissions error: ', error);
      throw error;
    }
  }

  // Get detailed view of a specific admission (with access control)
  async getDoctorAdmissionDetails(admissionId) {
    try {
      const res = await this.api.get(`/${admissionId}`);
      return res.data;
    } catch (error) {
      console.error('Get doctor admission details error: ', error);
      throw error;
    }
  }

  // Create a doctor's progress note (doctor round)
  async createDoctorRoundNote(admissionId, noteData) {
    try {
      const res = await this.api.post(`/${admissionId}/doctor-round`, {
        noteData,
      });
      return res.data;
    } catch (error) {
      console.error('Create doctor round note error: ', error);
      throw error;
    }
  }

  // Update diagnosis or treatment plan
  async updateAdmissionDiagnosis(admissionId, diagnosisData) {
    try {
      const res = await this.api.patch(
        `/${admissionId}/diagnosis`,
        diagnosisData,
      );
      return res.data;
    } catch (error) {
      console.error('Update admission diagnosis error: ', error);
      throw error;
    }
  }

  // Request discharge for a patient
  async requestPatientDischarge(admissionId, dischargeData) {
    try {
      const res = await this.api.post(
        `/${admissionId}/discharge-request`,
        dischargeData,
      );
      return res.data;
    } catch (error) {
      console.error('Request patient discharge error: ', error);
      throw error;
    }
  }

  // Get doctor's admission statistics
  async getDoctorAdmissionStats(period = 'month') {
    try {
      const res = await this.api.get('/stats', {
        params: { period },
      });
      return res.data;
    } catch (error) {
      console.error('Get doctor admission stats error: ', error);
      throw error;
    }
  }

  // Get patients for doctor's rounds
  async getPatientsForRounds(floor = null) {
    try {
      const res = await this.api.get('/rounds/patients', {
        params: { floor },
      });
      return res.data;
    } catch (error) {
      console.error('Get patients for rounds error: ', error);
      throw error;
    }
  }

  // Get admission progress notes (doctor's view)
  async getDoctorAdmissionProgressNotes(admissionId, filters = {}) {
    try {
      const res = await this.api.get(`/${admissionId}/notes`, {
        params: filters,
      });
      return res.data;
    } catch (error) {
      console.error('Get doctor admission progress notes error: ', error);
      throw error;
    }
  }
}

export default new DoctorAdmissionApi();
