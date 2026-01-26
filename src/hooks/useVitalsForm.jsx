import { useState, useEffect } from 'react';
import vitalsService from '../services/vitalsApi';
import toast from 'react-hot-toast';

export const useVitalsForm = appointment => {
  const [formData, setFormData] = useState({
    appointmentId: appointment?.appointment_id || null,
    patientId: appointment?.patient_id || null,
    chief_complaint: '',
    temperature: '',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    height: '',
    weight: '',
    bmi: null,
    pain_level: 0,
    triage_level: '',
    nurse_notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Auto-calculate BMI
  useEffect(() => {
    if (formData.height && formData.weight) {
      const heightInMeters = formData.height / 100;
      const bmi = (formData.weight / (heightInMeters * heightInMeters)).toFixed(
        2,
      );
      setFormData(prev => ({ ...prev, bmi: parseFloat(bmi) }));
    } else {
      setFormData(prev => ({ ...prev, bmi: null }));
    }
  }, [formData.height, formData.weight]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.chief_complaint.trim()) {
      newErrors.chief_complaint = 'Chief complaint is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      return false;
    }

    setIsSaving(true);
    setErrors({});

    try {
      await vitalsService.createVitals(formData);
      setSaveSuccess(true);

      toast.success('Patient Vitals created.');

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);

      return true;
    } catch (error) {
      setErrors({
        submit:
          error.response?.data?.message ||
          'Failed to save vitals. Please try again.',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    errors,
    isSaving,
    saveSuccess,
    handleFieldChange,
    handleSubmit,
  };
};
