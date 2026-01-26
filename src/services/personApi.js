import axios from 'axios';
import { DEVELOPMENT_BASE_URL, INTERNAL_API_KEY } from '../configs/CONST';
class personService {
  constructor() {
    this.personApi = axios.create({
      baseURL: `${DEVELOPMENT_BASE_URL}/person`,
      withCredentials: true,
      headers: {
        'x-internal-api-key': INTERNAL_API_KEY,
      },
    });
  }

  async createPerson(formData) {
    try {
      const personData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        middle_name: formData.middle_name || null,
        suffix: formData.suffix || null,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        gender_specification: formData.gender_specification || null,
        blood_type: formData.blood_type || null,
        nationality: formData.nationality || 'Filipino',
        civil_status: formData.civil_status || null,
        occupation: formData.occupation || null,
        religion: formData.religion || null,
      };

      const personContact = {
        contact_number: formData.contact_number,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_number: formData.emergency_contact_number,
        emergency_contact_relationship: formData.emergency_contact_relationship,
        emergency_contact_relationship_specification:
          formData.emergency_contact_relationship_specification || null,
        email: formData.email,
      };

      const personAddress = {
        address_type: 'home',
        street_address: formData.street || null,
        house_number: formData.house_number || null,
        subdivision_village: formData.subdivision_village || null,
        region_code: formData.region_code,
        province_code: formData.province_code,
        city_code: formData.city_code,
        barangay_code: formData.barangay_code,
        postal_code: formData.postal_code || null,
      };

      // Optional: Only if ID info is provided
      const personIdentification = formData.id_number
        ? {
            id_type: formData.id_type,
            id_type_specification: formData.id_type_specification || null,
            id_number: formData.id_number,
            id_expiry_date: formData.id_expiry_date || null,
          }
        : null;

      const res = await this.personApi.post('/register/walk-in', {
        personData,
        personContact,
        personAddress,
        personIdentification,
        staffId: formData.staffId,
      });

      return res.data;
    } catch (error) {
      console.error('Create person failed.', error.message);
      throw error;
    }
  }
}

export default new personService();
