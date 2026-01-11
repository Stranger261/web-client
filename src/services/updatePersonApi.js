import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';
class updatePersonService {
  constructor() {
    this.updateApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/updatePerson`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
  }

  async updatedAddress(userUuid, updatedAddress) {
    try {
      const res = await this.updateApi.patch(`/${userUuid}/update-address`, {
        updatedAddress,
      });

      return res.data;
    } catch (error) {
      console.error('Update address failed.', error.message);
      throw error;
    }
  }

  async updateCivilStatus(userUuid, updatedStatus) {
    try {
      const res = await this.updateApi.patch(
        `/${userUuid}/update-civil_status`,
        { updatedStatus }
      );

      return res.data;
    } catch (error) {
      console.error('Update civil status failed.', error.message);
      throw error;
    }
  }

  async updateContacts(userUuid, updatedContacts) {
    try {
      const res = await this.updateApi.patch(`/${userUuid}/update-contacts`, {
        updatedContacts,
      });

      return res.data;
    } catch (error) {
      console.error('Update contact failed.', error.message);
      throw error;
    }
  }

  async updateEmail(userUuid, updatedEmail) {
    try {
      const res = await this.updateApi.patch(`/${userUuid}/update-email`, {
        updatedEmail,
      });

      return res.data;
    } catch (error) {
      console.error('Update email failed.', error.message);
      throw error;
    }
  }

  async updateHeight(userUuid, updatedHeight) {
    try {
      const res = await this.updateApi.patch(`/${userUuid}/update-height`, {
        updatedHeight,
      });

      return res.data;
    } catch (error) {
      console.error('Update height failed.', error.message);
      throw error;
    }
  }

  async updateWeight(userUuid, updatedWeight) {
    try {
      const res = await this.updateApi.patch(`/${userUuid}/update-weight`, {
        updatedWeight,
      });

      return res.data;
    } catch (error) {
      console.error('Update weight failed.', error.message);
      throw error;
    }
  }

  async updateAllergies(userUuid, updatedAllergies) {
    try {
      const res = await this.updateApi.patch(`/${userUuid}/update-allergies`, {
        updatedAllergies,
      });

      return res.data;
    } catch (error) {
      console.error('Update allergies failed.', error.message);
      throw error;
    }
  }

  async updateChronicConditions(userUuid, updatedChronicConditions) {
    try {
      const res = await this.updateApi.patch(
        `/${userUuid}/update-chronic_conditions`,
        {
          updatedChronicConditions,
        }
      );

      return res.data;
    } catch (error) {
      console.error('Update chronic conditions failed.', error.message);
      throw error;
    }
  }

  async updateCurrentMedications(userUuid, updatedCurrentMedications) {
    try {
      const res = await this.updateApi.patch(
        `/${userUuid}/update-current_medications`,
        {
          updatedCurrentMedications,
        }
      );

      return res.data;
    } catch (error) {
      console.error('Update current medications failed.', error.message);
      throw error;
    }
  }

  async updateInsuranceProvider(userUuid, updatedInsuranceProivder) {
    try {
      const res = await this.updateApi.patch(
        `/${userUuid}/update-insurance_proivder`,
        {
          updatedInsuranceProivder,
        }
      );

      return res.data;
    } catch (error) {
      console.error('Update insurance proivder failed.', error.message);
      throw error;
    }
  }

  async updateInsuranceNumber(userUuid, updatedInsuranceNumber) {
    try {
      const res = await this.updateApi.patch(
        `/${userUuid}/update-insurance_number`,
        {
          updatedInsuranceNumber,
        }
      );

      return res.data;
    } catch (error) {
      console.error('Update insurance number failed.', error.message);
      throw error;
    }
  }

  async updateInsuranceExpiry(userUuid, updatedInsuranceExpiry) {
    try {
      const res = await this.updateApi.patch(
        `/${userUuid}/update-insurance_expiry`,
        {
          updatedInsuranceExpiry,
        }
      );

      return res.data;
    } catch (error) {
      console.error('Update insurance expiry failed.', error.message);
      throw error;
    }
  }
}

export default new updatePersonService();
