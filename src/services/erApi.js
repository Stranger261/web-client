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

export const erService = {
  // ═══════════════════════════════════════════════════════════════
  //  REGISTRATION
  // ═══════════════════════════════════════════════════════════════

  registerKnownPatient: async (
    visitData,
    personData = null,
    faceData = null,
  ) => {
    const response = await apiClient.post('/er/register/known', {
      visitData,
      personData,
      faceData,
    });
    return response.data;
  },

  registerUnknownPatient: async (
    visitData,
    temporaryInfo = {},
    faceData = null,
  ) => {
    const response = await apiClient.post('/er/register/unknown', {
      visitData,
      temporaryInfo,
      faceData,
    });
    return response.data;
  },

  recognizePatientByFace: async base64Image => {
    const response = await apiClient.post('/er/face-recognition', {
      image_base64: base64Image,
    });
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  //  ER VISITS
  // ═══════════════════════════════════════════════════════════════

  getAllVisits: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.status) params.append('status', filters.status);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.triageLevel) params.append('triageLevel', filters.triageLevel);
    const response = await apiClient.get(`/er/visits?${params.toString()}`);
    return response.data;
  },

  getVisitById: async id => {
    const response = await apiClient.get(`/er/visits/${id}`);
    return response.data;
  },

  updateVisit: async (id, updateData) => {
    const response = await apiClient.put(`/er/visits/${id}`, updateData);
    return response.data;
  },

  /**
   * Update ER visit status with transition validation.
   * newStatus: 'in_treatment' | 'admitted' | 'discharged' | 'transferred' | 'left_ama' | 'deceased'
   */
  updateStatus: async (id, status, dispositionType = null) => {
    const response = await apiClient.patch(`/er/visits/${id}/status`, {
      status,
      ...(dispositionType && { disposition_type: dispositionType }),
    });
    return response.data;
  },

  getVisitsByStatus: async status => {
    const response = await apiClient.get(`/er/visits/status/${status}`);
    return response.data;
  },

  getVisitsByPatient: async (patientId, page = 1, limit = 10) => {
    const response = await apiClient.get(`/er/patient/${patientId}/visits`, {
      params: { page, limit },
    });
    return response.data;
  },

  deleteVisit: async id => {
    const response = await apiClient.delete(`/er/visits/${id}`);
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  //  DISPOSITION
  // ═══════════════════════════════════════════════════════════════

  /**
   * Discharge patient.
   * @param {string|object} dispositionTypeOrData
   *   Legacy: pass a string e.g. 'home'
   *   New:    pass object { dispositionType, discharge_instructions,
   *                         follow_up_referral, condition_at_discharge }
   */
  dischargePatient: async (visitId, dispositionTypeOrData = 'home') => {
    const body =
      typeof dispositionTypeOrData === 'string'
        ? { dispositionType: dispositionTypeOrData }
        : {
            dispositionType: dispositionTypeOrData.dispositionType ?? 'home',
            discharge_instructions:
              dispositionTypeOrData.discharge_instructions ?? null,
            follow_up_referral:
              dispositionTypeOrData.follow_up_referral ?? null,
            condition_at_discharge:
              dispositionTypeOrData.condition_at_discharge ?? null,
          };
    const response = await apiClient.post(
      `/er/visits/${visitId}/discharge`,
      body,
    );
    return response.data;
  },

  /**
   * Admit patient to ward.
   * admissionData: {
   *   selected_bed_id,       ← required — passed to ibmsApiClientUtil.assignBed()
   *   selected_bed_info,     ← full bed object from BedSelectionModal
   *   primary_diagnosis,
   *   admitting_doctor,
   *   estimated_stay_days,
   * }
   */
  admitToWard: async (visitId, admissionData) => {
    const response = await apiClient.post(
      `/er/visits/${visitId}/admit`,
      admissionData,
    );
    return response.data;
  },

  /**
   * Transfer patient to another facility.
   * transferData: {
   *   destination_facility,
   *   transfer_reason,
   *   transport_mode,
   *   contact_number,
   * }
   */
  transferPatient: async (visitId, transferData = {}) => {
    const response = await apiClient.post(
      `/er/visits/${visitId}/transfer`,
      transferData,
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  //  ER DOCTORS
  // ═══════════════════════════════════════════════════════════════

  /** All ER doctors regardless of shift */
  getAllERDoctors: async () => {
    const response = await apiClient.get('/er/doctors');
    return response.data;
  },

  /** On-shift doctors (available + busy) — used by AssignDoctorModal */
  getOnShiftDoctors: async () => {
    const response = await apiClient.get('/er/doctors/on-shift');
    return response.data;
  },

  /** On-shift AND free */
  getAvailableDoctors: async () => {
    const response = await apiClient.get('/er/doctors/available');
    return response.data;
  },

  /**
   * Auto-assign: system picks first available doctor.
   * For L1 — called right after triage saves.
   * Also transitions visit → in_treatment on backend.
   */
  autoAssignDoctor: async erVisitId => {
    const response = await apiClient.post(
      `/er/visits/${erVisitId}/auto-assign`,
    );
    return response.data;
  },

  /**
   * Manual assign: nurse picks a specific doctor.
   * For L2–L5. Also transitions visit → in_treatment on backend.
   */
  assignDoctor: async (erVisitId, erDoctorId) => {
    const response = await apiClient.post(
      `/er/visits/${erVisitId}/assign-doctor`,
      {
        er_doctor_id: erDoctorId,
      },
    );
    return response.data;
  },

  /** Release doctor after disposition — also called automatically by backend */
  releaseDoctor: async erDoctorId => {
    const response = await apiClient.patch(`/er/doctors/${erDoctorId}/release`);
    return response.data;
  },

  startShift: async erDoctorId => {
    const response = await apiClient.patch(
      `/er/doctors/${erDoctorId}/start-shift`,
    );
    return response.data;
  },

  endShift: async erDoctorId => {
    const response = await apiClient.patch(
      `/er/doctors/${erDoctorId}/end-shift`,
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  //  TRIAGE
  // ═══════════════════════════════════════════════════════════════

  createTriage: async triageData => {
    const response = await apiClient.post('/er/triage', triageData);
    return response.data;
  },

  getTriageByVisit: async erVisitId => {
    const response = await apiClient.get(`/er/triage/${erVisitId}`);
    return response.data;
  },

  updateTriage: async (id, updateData) => {
    const response = await apiClient.put(`/er/triage/${id}`, updateData);
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  //  TREATMENTS
  // ═══════════════════════════════════════════════════════════════

  createTreatment: async treatmentData => {
    const response = await apiClient.post('/er/treatments', treatmentData);
    return response.data;
  },

  getTreatmentsByVisit: async erVisitId => {
    const response = await apiClient.get(`/er/treatments/visit/${erVisitId}`);
    return response.data;
  },

  updateTreatment: async (id, updateData) => {
    const response = await apiClient.put(`/er/treatments/${id}`, updateData);
    return response.data;
  },

  deleteTreatment: async id => {
    const response = await apiClient.delete(`/er/treatments/${id}`);
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  //  UNKNOWN / UNIDENTIFIED PATIENTS
  // ═══════════════════════════════════════════════════════════════

  getUnknownPatients: async () => {
    const response = await apiClient.get('/er/unknown-patients');
    return response.data;
  },

  getUnidentifiedWithFace: async () => {
    const response = await apiClient.get('/er/unknown-patients/with-face');
    return response.data;
  },

  identifyUnknownPatient: async (
    tempPatientId,
    { realPatientId = null, realPersonData = null } = {},
  ) => {
    const response = await apiClient.put(
      `/er/unknown-patient/${tempPatientId}/identify`,
      {
        realPatientId,
        realPersonData,
      },
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  //  FACE DATA
  // ═══════════════════════════════════════════════════════════════

  saveFaceData: async (personId, faceData) => {
    const response = await apiClient.patch(
      `/er/person/${personId}/face`,
      faceData,
    );
    return response.data;
  },

  // ═══════════════════════════════════════════════════════════════
  //  DASHBOARD
  // ═══════════════════════════════════════════════════════════════

  getDashboardStats: async () => {
    const response = await apiClient.get('/er/dashboard/stats');
    return response.data;
  },

  getWaitingTimes: async () => {
    const response = await apiClient.get('/er/dashboard/waiting-times');
    return response.data;
  },

  getTriageDistribution: async () => {
    const response = await apiClient.get('/er/dashboard/triage-distribution');
    return response.data;
  },
};

export default erService;
