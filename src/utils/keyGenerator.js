// File: /src/utils/keyGenerator.js
/**
 * Generate unique key for medical records
 */
export const generateRecordKey = (record, index, activeTab) => {
  // For timeline view
  if (activeTab === 'timeline' && record.id) {
    return record.id; // Use the unique ID from backend
  }

  // For other tabs, use existing IDs
  if (record.prescription_id) return `prescription-${record.prescription_id}`;
  if (record.diagnosis_id) return `diagnosis-${record.diagnosis_id}`;
  if (record.vital_id) return `vitals-${record.vital_id}`;
  if (record.appointment_id) return `appointment-${record.appointment_id}`;
  if (record.record_id) return `medical-record-${record.record_id}`;

  // Fallback: combine type and timestamp
  if (record.created_at || record.record_date || record.appointment_date) {
    const date =
      record.created_at || record.record_date || record.appointment_date;
    return `${activeTab}-${new Date(date).getTime()}-${index}`;
  }

  // Ultimate fallback
  return `${activeTab}-${index}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generate unique key for patient
 */
export const generatePatientKey = patient => {
  return `patient-${patient.patient_id}-${patient.patient_uuid || patient.mrn}`;
};
