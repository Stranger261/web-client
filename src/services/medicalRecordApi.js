// services/medicalRecordApi.js
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

  // ==================== PATIENT PORTAL METHODS ====================

  /**
   * Get medical records for current user (patient viewing own records)
   * GET /api/medical-records
   * @param {Object} params - Query parameters (page, limit, startDate, endDate, recordType, status, search)
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
   * Get complete patient health data (for portal dashboard)
   * GET /api/medical-records/patient/:patientId/health-data
   * @param {number} patientId - Patient ID
   * @param {Object} params - Query parameters (startDate, endDate, recordType, limit, page)
   */
  async getPatientHealthData(patientId, params = {}) {
    try {
      const response = await this.api.get(`/patient/${patientId}/health-data`, {
        params,
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get patient health data:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get medical records summary
   * GET /api/medical-records/summary
   * @param {number} patientId - Optional patient ID for staff access
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
   * Get patient summary statistics
   * GET /api/medical-records/patient/:patientId/summary
   * @param {number} patientId - Patient ID
   */
  async getPatientSummary(patientId) {
    try {
      const response = await this.api.get(`/patient/${patientId}/summary`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get patient summary:', error);
      throw error.response?.data || error;
    }
  }

  // ==================== DETAILED RECORD METHODS ====================

  /**
   * Get detailed view of a specific record
   * GET /api/medical-records/:recordType/:recordId
   * @param {string} recordType - Type of record (appointment, admission, medical_record, laboratory, imaging)
   * @param {number} recordId - Record ID
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
   * Get detailed lab order with results
   * GET /api/medical-records/laboratory/:orderId/details
   * @param {number} orderId - Lab order ID
   */
  async getLabOrderDetails(orderId) {
    try {
      const response = await this.api.get(`/laboratory/${orderId}/details`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get lab order details:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get detailed imaging study with report
   * GET /api/medical-records/imaging/:studyId/details
   * @param {number} studyId - Imaging study ID
   */
  async getImagingStudyDetails(studyId) {
    try {
      const response = await this.api.get(`/imaging/${studyId}/details`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to get imaging study details:', error);
      throw error.response?.data || error;
    }
  }

  /**
   * Get progress notes for an admission
   * GET /api/medical-records/admission/:admissionId/progress-notes
   * @param {number} admissionId - Admission ID
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
   * @param {string} visitType - Type of visit (admission, appointment)
   * @param {number} visitId - Visit ID
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

  // ==================== HEALTHCARE PROVIDER METHODS ====================

  /**
   * Get medical records for a specific patient (doctor/nurse/admin access)
   * GET /api/medical-records/patient/:patientId
   * @param {number} patientId - Patient ID
   * @param {Object} params - Query parameters
   */
  async getPatientMedicalRecords(patientId, params = {}) {
    console.log('start to call backend');
    try {
      const response = await this.api.get(`/patient/${patientId}`, { params });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get patient medical records:', error);
      throw error.response?.data || error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get record by type and ID (convenience method)
   * @param {Object} record - Record object with type and id
   */
  async getRecordByType(record) {
    if (!record || !record.type || !record.id) {
      throw new Error('Invalid record object');
    }

    // Extract the base type without prefix
    let recordType = record.type;
    let recordId = record.id;

    // Handle prefixed IDs (e.g., "apt-123", "lab-456")
    if (typeof record.id === 'string' && record.id.includes('-')) {
      const [prefix, id] = record.id.split('-');
      recordId = parseInt(id);

      // Map prefix to record type
      const prefixMap = {
        apt: 'appointment',
        adm: 'admission',
        mr: 'medical_record',
        lab: 'laboratory',
        img: 'imaging',
      };
      recordType = prefixMap[prefix] || record.type;
    }

    // Use appropriate detail method based on type
    switch (recordType) {
      case 'laboratory':
        return this.getLabOrderDetails(recordId);
      case 'imaging':
        return this.getImagingStudyDetails(recordId);
      default:
        return this.getRecordDetails(recordType, recordId);
    }
  }

  /**
   * Format filters for API request
   * @param {Object} filters - Filter object
   */
  formatFilters(filters = {}) {
    const formatted = {};

    // Only include non-empty values
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        formatted[key] = value;
      }
    });

    return formatted;
  }

  /**
   * Get records by date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {Object} additionalFilters - Additional filters
   */
  async getRecordsByDateRange(startDate, endDate, additionalFilters = {}) {
    const filters = this.formatFilters({
      startDate,
      endDate,
      ...additionalFilters,
    });

    return this.getMyMedicalRecords(filters);
  }

  /**
   * Get recent records
   * @param {number} limit - Number of records to fetch
   */
  async getRecentRecords(limit = 10) {
    return this.getMyMedicalRecords({ limit, page: 1 });
  }

  /**
   * Search records
   * @param {string} searchTerm - Search term
   * @param {Object} additionalFilters - Additional filters
   */
  async searchRecords(searchTerm, additionalFilters = {}) {
    const filters = this.formatFilters({
      search: searchTerm,
      ...additionalFilters,
    });

    return this.getMyMedicalRecords(filters);
  }

  /**
   * Get records by type
   * @param {string} recordType - Type of records (appointment, admission, medical_record, laboratory, imaging)
   * @param {Object} additionalFilters - Additional filters
   */
  async getRecordsByType(recordType, additionalFilters = {}) {
    const filters = this.formatFilters({
      recordType,
      ...additionalFilters,
    });

    return this.getMyMedicalRecords(filters);
  }

  /**
   * Get records by status
   * @param {string} status - Status filter
   * @param {Object} additionalFilters - Additional filters
   */
  async getRecordsByStatus(status, additionalFilters = {}) {
    const filters = this.formatFilters({
      status,
      ...additionalFilters,
    });

    return this.getMyMedicalRecords(filters);
  }
}

export default new MedicalRecordsService();
