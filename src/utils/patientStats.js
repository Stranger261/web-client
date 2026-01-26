/**
 * Calculate comprehensive patient statistics from normalized patient data
 * @param {Object} patient - Normalized patient data from getPatientDetails
 * @returns {Object} Patient statistics
 */
export const calculatePatientStats = patient => {
  if (!patient) {
    return {
      totalVisits: 0,
      lastVisit: null,
      activePrescriptions: 0,
      totalPrescriptions: 0,
      admissionCount: 0,
      lastAdmission: null,
      diagnosisCount: 0,
      completedVisits: 0,
      hasVitals: 0,
      averageVitals: null,
    };
  }

  const appointments = patient.appointments || [];
  const walkInAdmissions = patient.walkInAdmissions || [];

  // Total visits (appointments with admissions)
  const totalVisits = appointments.length;

  // Last visit date (most recent appointment or admission)
  const appointmentDates = appointments
    .map(apt => apt.vitals?.recorded_at || apt.appointment_date)
    .filter(Boolean);

  const walkInDates = walkInAdmissions
    .map(adm => adm.admission_date)
    .filter(Boolean);

  const allDates = [...appointmentDates, ...walkInDates]
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  const lastVisit = allDates.length > 0 ? allDates[0] : null;

  // Collect all prescriptions from appointments and walk-in admissions
  const allPrescriptions = [];

  // From appointments with admissions
  appointments.forEach(apt => {
    if (apt.resultingAdmission?.prescriptions) {
      allPrescriptions.push(...apt.resultingAdmission.prescriptions);
    }
  });

  // From walk-in admissions
  walkInAdmissions.forEach(adm => {
    if (adm.prescriptions) {
      allPrescriptions.push(...adm.prescriptions);
    }
  });

  const totalPrescriptions = allPrescriptions.length;

  // Active prescriptions (status = 'active')
  const activePrescriptions = allPrescriptions.filter(
    rx => rx.prescription_status === 'active',
  ).length;

  // Total admissions (from appointments + walk-in)
  const admissionsFromAppointments = appointments.filter(
    apt => apt.resultingAdmission,
  ).length;
  const admissionCount = admissionsFromAppointments + walkInAdmissions.length;

  // Last admission
  const admissionDates = [
    ...appointments
      .filter(apt => apt.resultingAdmission)
      .map(apt => apt.resultingAdmission.admission_date),
    ...walkInAdmissions.map(adm => adm.admission_date),
  ]
    .filter(Boolean)
    .map(d => new Date(d))
    .sort((a, b) => b - a);

  const lastAdmission = admissionDates.length > 0 ? admissionDates[0] : null;

  // Diagnosis count
  const diagnosisCount = appointments.filter(apt => apt.diagnosis).length;

  // Completed visits (appointments with diagnosis)
  const completedVisits = appointments.filter(
    apt => apt.diagnosis && apt.diagnosis.primary_diagnosis,
  ).length;

  // Appointments with vitals recorded
  const hasVitals = appointments.filter(apt => apt.vitals).length;

  // Calculate average vitals from all appointments
  const vitalsData = appointments
    .filter(apt => apt.vitals)
    .map(apt => apt.vitals);

  let averageVitals = null;
  if (vitalsData.length > 0) {
    const calculateAverage = field => {
      const values = vitalsData
        .map(v => parseFloat(v[field]))
        .filter(n => !isNaN(n) && n > 0);
      return values.length > 0
        ? (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
        : null;
    };

    averageVitals = {
      temperature: calculateAverage('temperature'),
      heartRate: calculateAverage('heart_rate'),
      systolic: calculateAverage('blood_pressure_systolic'),
      diastolic: calculateAverage('blood_pressure_diastolic'),
      oxygenSaturation: calculateAverage('oxygen_saturation'),
      weight: calculateAverage('weight'),
      height: calculateAverage('height'),
      bmi: calculateAverage('bmi'),
    };
  }

  // Latest vitals
  const latestVitals =
    vitalsData.length > 0
      ? vitalsData.sort(
          (a, b) => new Date(b.recorded_at) - new Date(a.recorded_at),
        )[0]
      : null;

  // Triage level distribution
  const triageLevels = vitalsData.map(v => v.triage_level).filter(Boolean);

  const triageDistribution = {
    emergency: triageLevels.filter(t => t === 'emergency').length,
    urgent: triageLevels.filter(t => t === 'urgent').length,
    semi_urgent: triageLevels.filter(t => t === 'semi_urgent').length,
    non_urgent: triageLevels.filter(t => t === 'non_urgent').length,
  };

  // Admission status distribution
  const admissionStatuses = [
    ...appointments
      .filter(apt => apt.resultingAdmission)
      .map(apt => apt.resultingAdmission.admission_status),
    ...walkInAdmissions.map(adm => adm.admission_status),
  ].filter(Boolean);

  const admissionStatusDistribution = {
    active: admissionStatuses.filter(s => s === 'active').length,
    discharged: admissionStatuses.filter(s => s === 'discharged').length,
    transferred: admissionStatuses.filter(s => s === 'transferred').length,
    deceased: admissionStatuses.filter(s => s === 'deceased').length,
  };

  return {
    // Core stats for overview cards
    totalVisits,
    lastVisit,
    activePrescriptions,

    // Extended stats
    totalPrescriptions,
    admissionCount,
    lastAdmission,
    diagnosisCount,
    completedVisits,
    hasVitals,
    averageVitals,
    latestVitals,
    triageDistribution,
    admissionStatusDistribution,

    // Percentage calculations
    completionRate:
      totalVisits > 0 ? ((completedVisits / totalVisits) * 100).toFixed(1) : 0,
    vitalsRecordedRate:
      totalVisits > 0 ? ((hasVitals / totalVisits) * 100).toFixed(1) : 0,
  };
};
