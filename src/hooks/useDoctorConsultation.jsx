import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

import consultationService from '../services/consultationApi';
import diagnosisService from '../services/diagnosisApi';
import precriptionService from '../services/prescriptionApi';
import laboratoryService from '../services/laboratoryApi';

export const useDoctorConsultation = appointment => {
  const [consultationData, setConsultationData] = useState(null);
  const [diagnosisData, setDiagnosisData] = useState({
    appointmentId: appointment?.appointment_id || null,
    chief_complaint: '',
    history_of_present_illness: '',
    physical_examination: '',
    primary_diagnosis: '',
    icd_10_code: '',
    secondary_diagnoses: '',
    treatment_plan: '',
    procedures_performed: '',
    disposition: '',
    disposition_notes: '',
    requires_admission: false,
    admission_reason: '',
    estimated_stay_days: '',
    requires_followup: false,
    followup_date: '',
    followup_instructions: '',
    lab_tests_ordered: '',
    imaging_ordered: '',
    clinical_notes: '',
    order_priority: 'routine',
    selected_bed_id: null,
    selected_bed_info: null,
  });

  const [prescriptionData, setPrescriptionData] = useState({
    medications: [],
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false); // Track order saving

  // Load consultation data on mount
  useEffect(() => {
    if (appointment?.appointment_id) {
      loadConsultationData(appointment.appointment_id);
    }
  }, [appointment?.appointment_id]);

  // Auto-update requires_admission based on disposition
  useEffect(() => {
    setDiagnosisData(prev => ({
      ...prev,
      requires_admission: prev.disposition === 'admit',
      requires_followup: prev.disposition === 'followup',
    }));
  }, [diagnosisData.disposition]);

  const loadConsultationData = async appointmentId => {
    try {
      const data =
        await consultationService.getCompleteConsultation(appointmentId);
      setConsultationData(data.data);

      // Pre-fill chief complaint from vitals if available
      if (data.data.vitals?.chief_complaint) {
        setDiagnosisData(prev => ({
          ...prev,
          chief_complaint: data.data.vitals.chief_complaint,
        }));
      }
    } catch (error) {
      console.error('Failed to load consultation data:', error);
    }
  };

  const handleDiagnosisChange = (field, value) => {
    setDiagnosisData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // NEW FUNCTION: Handle imaging order updates
  const handleImagingOrderUpdate = async (serviceIds, serviceType = 'ris') => {
    try {
      setIsSavingOrder(true);

      // Update local state
      setDiagnosisData(prev => ({
        ...prev,
        imaging_ordered: serviceIds.join(','),
      }));

      // Call backend API to save orders
      if (appointment?.appointment_id && appointment?.patient_id) {
        await laboratoryService.createOrder({
          appointmentId: appointment.appointment_id,
          patientId: appointment.patient_id,
          serviceType: serviceType, // 'ris' or 'lis'
          serviceIds: serviceIds,
          priority: diagnosisData.order_priority,
          clinicalNotes: diagnosisData.clinical_notes,
        });
      }

      console.log(`Updated ${serviceType} orders:`, serviceIds);
    } catch (error) {
      console.error(`Failed to update ${serviceType} orders:`, error);
      toast.error(`Failed to save ${serviceType} order changes`);
      // Revert local state on error
      setDiagnosisData(prev => ({
        ...prev,
        imaging_ordered: prev.imaging_ordered, // Keep previous value
      }));
    } finally {
      setIsSavingOrder(false);
    }
  };

  // NEW FUNCTION: Handle lab order updates
  const handleLabOrderUpdate = async (serviceIds, serviceType = 'lis') => {
    try {
      setIsSavingOrder(true);

      // Update local state
      setDiagnosisData(prev => ({
        ...prev,
        lab_tests_ordered: serviceIds.join(','),
      }));

      // Call backend API to save orders
      if (appointment?.appointment_id && appointment?.patient_id) {
        await laboratoryService.createOrder({
          appointmentId: appointment.appointment_id,
          patientId: appointment.patient_id,
          serviceType: serviceType, // 'ris' or 'lis'
          serviceIds: serviceIds,
          priority: diagnosisData.order_priority,
          clinicalNotes: diagnosisData.clinical_notes,
        });
      }

      console.log(`Updated ${serviceType} orders:`, serviceIds);
    } catch (error) {
      console.error(`Failed to update ${serviceType} orders:`, error);
      toast.error(`Failed to save ${serviceType} order changes`);
      // Revert local state on error
      setDiagnosisData(prev => ({
        ...prev,
        lab_tests_ordered: prev.lab_tests_ordered, // Keep previous value
      }));
    } finally {
      setIsSavingOrder(false);
    }
  };

  // NEW FUNCTION: Handle priority and notes changes that affect orders
  const handleOrderDetailsChange = async (field, value) => {
    const prevValue = diagnosisData[field];

    // Update local state
    handleDiagnosisChange(field, value);

    // If orders exist, update them in backend
    const hasImagingOrders =
      diagnosisData.imaging_ordered && diagnosisData.imaging_ordered.trim();
    const hasLabOrders =
      diagnosisData.lab_tests_ordered && diagnosisData.lab_tests_ordered.trim();

    if (
      (hasImagingOrders || hasLabOrders) &&
      (field === 'order_priority' || field === 'clinical_notes')
    ) {
      try {
        setIsSavingOrder(true);

        const updateData = {
          appointmentId: appointment.appointment_id,
          patientId: appointment.patient_id,
        };

        if (field === 'order_priority') {
          updateData.priority = value;
        } else if (field === 'clinical_notes') {
          updateData.clinicalNotes = value;
        }

        // Update existing orders with new priority/notes
        await laboratoryService.updateOrders(updateData);

        console.log(`Updated order ${field}:`, value);
      } catch (error) {
        console.error(`Failed to update order ${field}:`, error);
        // Revert on error
        handleDiagnosisChange(field, prevValue);
        toast.error(`Failed to update ${field}`);
      } finally {
        setIsSavingOrder(false);
      }
    }
  };

  const handlePrescriptionChange = (index, field, value) => {
    setPrescriptionData(prev => {
      const newMedications = [...prev.medications];
      newMedications[index] = {
        ...newMedications[index],
        [field]: value,
      };
      return { ...prev, medications: newMedications };
    });
  };

  const addMedication = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: [
        ...prev.medications,
        {
          medication_name: '',
          dosage: '',
          frequency: '',
          route: '',
          duration: '',
          quantity: '',
          instructions: '',
        },
      ],
    }));
  };

  const removeMedication = index => {
    setPrescriptionData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!diagnosisData.primary_diagnosis.trim()) {
      newErrors.primary_diagnosis = 'Primary diagnosis is required';
    }

    if (!diagnosisData.disposition) {
      newErrors.disposition = 'Please select a disposition';
    }

    if (
      diagnosisData.disposition === 'admit' &&
      !diagnosisData.admission_reason.trim()
    ) {
      newErrors.admission_reason = 'Admission reason is required';
    }

    // Disposition-specific validations
    if (diagnosisData.disposition === 'admit') {
      if (!diagnosisData.admission_reason.trim()) {
        newErrors.admission_reason = 'Admission reason is required';
      }
      if (!diagnosisData.selected_bed_id) {
        newErrors.selected_bed_id = 'Please select a bed for admission';
      }
    }

    // Validate prescriptions
    prescriptionData.medications.forEach((med, index) => {
      if (!med.medication_name.trim()) {
        newErrors[`medication_${index}_name`] = 'Medication name is required';
      }
      if (!med.dosage.trim()) {
        newErrors[`medication_${index}_dosage`] = 'Dosage is required';
      }
      if (!med.frequency.trim()) {
        newErrors[`medication_${index}_frequency`] = 'Frequency is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      toast.error('Please check and fill up the required fields.');
      setErrors(prev => ({
        ...prev,
        submit: 'Please fix the errors before saving',
      }));
      return false;
    }

    setIsSaving(true);
    setErrors({});

    try {
      // 1. Create diagnosis (includes all order data now)
      const diagnosisResponse =
        await diagnosisService.createDiagnosis(diagnosisData);

      // 2. Create prescription if medications exist
      if (prescriptionData.medications.length > 0) {
        await precriptionService.createPrescription({
          appointmentId: appointment.appointment_id,
          admissionId:
            diagnosisResponse.data?.admission?.admission?.admission_id,
          patientId: appointment.patient_id,
          items: prescriptionData.medications,
          notes: 'Prescribed during consultation',
        });
      }

      setSaveSuccess(true);

      toast.success('Diagnosis created and completed the appointment.');
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 1000);

      return true;
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.message ||
          'Failed to save consultation. Please try again.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    consultationData,
    diagnosisData,
    prescriptionData,
    errors,
    isSaving,
    isSavingOrder, // Expose order saving state
    saveSuccess,
    handleDiagnosisChange,
    handleImagingOrderUpdate, // Add this
    handleLabOrderUpdate, // Add this
    handleOrderDetailsChange, // Add this
    handlePrescriptionChange,
    addMedication,
    removeMedication,
    handleSubmit,
  };
};
