import axios from 'axios';
import { APPOINTMENT_SERVICE_BASE_URL } from '../config/API_URL';
const api = axios.create({
  baseURL: APPOINTMENT_SERVICE_BASE_URL,
  withCredentials: true,
  headers: {
    'x-internal-api-key': 'CORE-1-HMS-safe-key',
  },
});

export const billingService = {
  // Create bill
  createBill: async billData => {
    const { data } = await api.post('/billing', billData);
    return data;
  },

  // Get bill by ID
  getBillById: async id => {
    const { data } = await api.get(`/billing/${id}`);
    return data;
  },

  // Get all bills
  getAllBills: async (filters = {}) => {
    const { data } = await api.get('/billing', { params: filters });
    return data;
  },

  // Get pending bills
  getPendingBills: async () => {
    const { data } = await api.get('/billing/pending/list');
    return data;
  },

  // Add item to bill
  addItemToBill: async (billId, itemData) => {
    const { data } = await api.post(`/billing/${billId}/items`, itemData);
    return data;
  },

  // Process payment
  processPayment: async (billId, paymentData) => {
    const { data } = await api.post(`/billing/${billId}/payment`, paymentData);
    return data;
  },

  // Apply discount
  applyDiscount: async (billId, discountAmount, reason, approvedBy) => {
    const { data } = await api.post(`/billing/${billId}/discount`, {
      discountAmount,
      reason,
      approvedBy,
    });
    return data;
  },

  // Generate receipt
  generateReceipt: async billId => {
    const { data } = await api.post(`/billing/${billId}/receipt`);
    return data;
  },

  // Get billing stats
  getBillingStats: async (dateFrom, dateTo) => {
    const { data } = await api.get('/billing/stats/overview', {
      params: { dateFrom, dateTo },
    });
    return data;
  },

  // Get today's revenue
  getTodayRevenue: async () => {
    const { data } = await api.get('/billing/stats/today');
    return data;
  },

  // Get patient billing history
  getPatientBillingHistory: async patientId => {
    const { data } = await api.get(`/billing/patient/${patientId}/history`);
    return data;
  },

  // Cancel bill
  cancelBill: async (billId, reason) => {
    const { data } = await api.patch(`/billing/${billId}/cancel`, { reason });
    return data;
  },
};
