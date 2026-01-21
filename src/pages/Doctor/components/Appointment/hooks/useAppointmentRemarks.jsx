import { useState, useEffect } from 'react';

export const useAppointmentRemarks = appointment => {
  const [formData, setFormData] = useState({
    chiefComplaint: '',
    diagnosis: '',
    treatment: '',
    prescription: '',
    followUpNotes: '',
    followUpDate: '',
    vitalSigns: {
      bloodPressure: '',
      heartRate: '',
      temperature: '',
      respiratoryRate: '',
      oxygenSaturation: '',
    },
    labTests: '',
    additionalNotes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        chiefComplaint: appointment.reason || '',
        diagnosis: appointment.diagnosis || '',
        treatment: appointment.treatment || '',
        prescription: appointment.prescription || '',
        followUpNotes: appointment.follow_up_notes || '',
        followUpDate: appointment.follow_up_date || '',
        vitalSigns: {
          bloodPressure: appointment.blood_pressure || '',
          heartRate: appointment.heart_rate || '',
          temperature: appointment.temperature || '',
          respiratoryRate: appointment.respiratory_rate || '',
          oxygenSaturation: appointment.oxygen_saturation || '',
        },
        labTests: appointment.lab_tests || '',
        additionalNotes: appointment.notes || '',
      });
    }
  }, [appointment]);

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleVitalSignChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, [field]: value },
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.chiefComplaint.trim()) {
      newErrors.chiefComplaint = 'Chief complaint is required';
    }
    if (!formData.diagnosis.trim()) {
      newErrors.diagnosis = 'Diagnosis is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async onSave => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      await onSave({
        appointmentId: appointment.appointment_id,
        ...formData,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 1500);
      return true;
    } catch (error) {
      setErrors({ submit: 'Failed to save. Please try again.' });
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
    handleVitalSignChange,
    handleSave,
  };
};
