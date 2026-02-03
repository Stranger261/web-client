import axios from 'axios';
import { DEVELOPMENT_BASE_URL } from '../configs/CONST';

const apiClient = axios.create({
  baseURL: DEVELOPMENT_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-internal-api-key': 'core-1-secret-key',
  },
  withCredentials: true,
});

export const laboratoryService = {
  // ========== Lab Order Endpoints ==========

  createLabOrder: async orderData => {
    const response = await apiClient.post('/lab/orders', orderData);
    return response.data;
  },

  getAllLabOrders: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(`/lab/orders?${params.toString()}`);
    return response.data;
  },

  getLabOrderById: async orderId => {
    const response = await apiClient.get(`/lab/orders/${orderId}`);
    return response.data;
  },

  getLabOrdersByAppointment: async appointmentId => {
    const response = await apiClient.get(
      `/lab/orders/appointment/${appointmentId}`,
    );
    return response.data;
  },

  getLabOrdersByPatient: async (patientId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(
      `/lab/orders/patient/${patientId}?${params.toString()}`,
    );
    return response.data;
  },

  updateLabOrder: async (orderId, updateData) => {
    const response = await apiClient.put(`/lab/orders/${orderId}`, updateData);
    return response.data;
  },

  cancelLabOrder: async (orderId, reason) => {
    const response = await apiClient.delete(`/lab/orders/${orderId}`, {
      data: { reason },
    });
    return response.data;
  },

  // ========== Lab Test Endpoints ==========

  getLabOrderTests: async orderId => {
    const response = await apiClient.get(`/lab/orders/${orderId}/tests`);
    return response.data;
  },

  updateLabResults: async (orderId, results) => {
    const response = await apiClient.put(`/lab/orders/${orderId}/results`, {
      results,
    });
    return response.data;
  },

  // ========== Lab Specimen Endpoints ==========

  collectSpecimen: async (orderId, collectionData) => {
    const response = await apiClient.post(
      `/lab/orders/${orderId}/collect`,
      collectionData,
    );
    return response.data;
  },

  updateSpecimenStatus: async (orderId, status, notes = null) => {
    const response = await apiClient.patch(
      `/lab/orders/${orderId}/specimen-status`,
      {
        status,
        notes,
      },
    );
    return response.data;
  },

  // ========== Lab Dashboard Endpoints ==========

  getDashboardStats: async () => {
    const response = await apiClient.get('/lab/dashboard/stats');
    return response.data;
  },

  getPendingOrders: async () => {
    const response = await apiClient.get('/lab/dashboard/pending');
    return response.data;
  },

  getStatOrders: async () => {
    const response = await apiClient.get('/lab/dashboard/stat');
    return response.data;
  },

  // ========== Lab Reports Endpoints ==========

  generateLabReport: async orderId => {
    const response = await apiClient.get(`/lab/reports/${orderId}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getPatientLabHistory: async (patientId, filters = {}) => {
    const params = new URLSearchParams();
    if (filters.testName) params.append('testName', filters.testName);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);

    const response = await apiClient.get(
      `/lab/reports/patient/${patientId}/history?${params.toString()}`,
    );
    return response.data;
  },

  // ========== Lab Test Catalog Endpoints ==========

  getTestCatalog: async () => {
    const response = await apiClient.get('/lab/catalog/tests');
    return response.data;
  },

  searchTests: async query => {
    const response = await apiClient.get(
      `/lab/catalog/tests/search?q=${encodeURIComponent(query)}`,
    );
    return response.data;
  },

  getTestDetails: async testCode => {
    const response = await apiClient.get(`/lab/catalog/tests/${testCode}`);
    return response.data;
  },

  // ========== Quality Control Endpoints ==========

  getQualityControlResults: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.testCode) params.append('testCode', filters.testCode);

    const response = await apiClient.get(
      `/lab/qc/results?${params.toString()}`,
    );
    return response.data;
  },

  recordQualityControl: async qcData => {
    const response = await apiClient.post('/lab/qc/record', qcData);
    return response.data;
  },

  // ========== Lab Equipment Endpoints ==========

  getEquipmentStatus: async () => {
    const response = await apiClient.get('/lab/equipment/status');
    return response.data;
  },

  updateEquipmentMaintenance: async (equipmentId, maintenanceData) => {
    const response = await apiClient.post(
      `/lab/equipment/${equipmentId}/maintenance`,
      maintenanceData,
    );
    return response.data;
  },

  // ========== Batch Processing Endpoints ==========

  createBatch: async batchData => {
    const response = await apiClient.post('/lab/batches', batchData);
    return response.data;
  },

  getBatchById: async batchId => {
    const response = await apiClient.get(`/lab/batches/${batchId}`);
    return response.data;
  },

  processBatch: async (batchId, results) => {
    const response = await apiClient.post(`/lab/batches/${batchId}/process`, {
      results,
    });
    return response.data;
  },

  // ========== Critical Results Endpoints ==========

  getCriticalResults: async () => {
    const response = await apiClient.get('/lab/critical-results');
    return response.data;
  },

  acknowledgeCriticalResult: async (resultId, acknowledgmentData) => {
    const response = await apiClient.post(
      `/lab/critical-results/${resultId}/acknowledge`,
      acknowledgmentData,
    );
    return response.data;
  },

  // ========== Lab Statistics Endpoints ==========

  getTurnaroundTimeStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.testType) params.append('testType', filters.testType);

    const response = await apiClient.get(
      `/lab/statistics/turnaround-time?${params.toString()}`,
    );
    return response.data;
  },

  getTestVolumeStats: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.groupBy) params.append('groupBy', filters.groupBy);

    const response = await apiClient.get(
      `/lab/statistics/test-volume?${params.toString()}`,
    );
    return response.data;
  },

  getAllService: async () => {
    try {
      const res = await apiClient.get('/lab/all/services');

      return res.data;
    } catch (error) {
      console.error('Failed to get ris service: ', error.message);
      throw error;
    }
  },

  createOrder: async orderData => {
    try {
      const res = await apiClient.post('/lab/orders/create', orderData);
      return res.data;
    } catch (error) {
      console.error('Failed to create order: ', error.message);
      throw error;
    }
  },

  updateOrders: async updateData => {
    try {
      const res = await apiClient.put('/lab/orders/update', updateData);
      return res.data;
    } catch (error) {
      console.error('Failed to update orders: ', error.message);
      throw error;
    }
  },
};

export default laboratoryService;
