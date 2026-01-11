import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';

class allergyService {
  constructor() {
    this.allergyApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/allergies`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
  }

  async getAllAllergies(userUuid) {
    try {
      const res = await this.allergyApi.get(`/${userUuid}/all`);

      return res.data;
    } catch (error) {
      console.error('Get all allergies failed.', error.message);
      throw error;
    }
  }

  async getCriticalAllergies(userUuid) {
    try {
      const res = await this.allergyApi.get(`/${userUuid}/critical`);

      return res.data;
    } catch (error) {
      console.error('Get critical allergies failed.', error.message);
      throw error;
    }
  }

  async createAllergy(userUuid, allergyData) {
    try {
      const res = await this.allergyApi.post(`/${userUuid}/create`, {
        allergyData,
      });

      return res.data;
    } catch (error) {
      console.error('Create allergy failed.', error.message);
      throw error;
    }
  }

  async updateAllergy(userUuid, allergyId, updatedAllergy) {
    try {
      const res = await this.allergyApi.patch(
        `/${userUuid}/${allergyId}/update`,
        { updatedAllergy }
      );

      return res.data;
    } catch (error) {
      console.error('Update allergy failed.', error.message);
      throw error;
    }
  }

  async deleteAllergy(userUuid, allergyId) {
    try {
      const res = await this.allergyApi.delete(
        `/${userUuid}/${allergyId}/delete`
      );

      return res.data;
    } catch (error) {
      console.error('Delete allergy failed.', error.message);
      throw error;
    }
  }
}

export default new allergyService();
