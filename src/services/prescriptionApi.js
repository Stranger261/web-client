import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class prescriptionService {
  constructor() {
    this.prescriptionApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/prescriptions`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
        'Content-Type': 'application/json',
      },
    });
  }

  async createPrescription(prescriptionData) {
    try {
      const res = await this.prescriptionApi.post('/', { prescriptionData });

      return res.data;
    } catch (error) {
      console.error('Failed to create prescription: ', error.message);
      throw error;
    }
  }

  async getPrescriptionById(prescriptionId) {
    try {
      const res = await this.prescriptionApi.get(`/${prescriptionId}`);

      return res.data;
    } catch (error) {
      console.error('Failed to get prescription: ', error.message);
      throw error;
    }
  }

  async getPatientPrescriptions(patientId, activeOnly = false) {
    try {
      const res = await this.prescriptionApi.post(
        `/patient/${patientId}?activeOnly=${activeOnly}`,
      );

      return res.data;
    } catch (error) {
      console.error('Failed to get patient prescription: ', error.message);
      throw error;
    }
  }

  async dispenseMedication(itemId) {
    try {
      const res = await this.prescriptionApi.patch(`/item/${itemId}/dispense`);

      return res.data;
    } catch (error) {
      console.error('Failed to dispense prescription: ', error.message);
      throw error;
    }
  }
}

export default new prescriptionService();
