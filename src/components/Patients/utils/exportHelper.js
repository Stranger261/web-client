import { formatDate } from '../../../utils/dateFormatter';

/**
 * Helper function to format vitals data
 */
const formatVitals = vitals => {
  if (!vitals) return {};

  return {
    temperature: vitals.temperature || '',
    bloodPressure:
      vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic
        ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`
        : '',
    heartRate: vitals.heart_rate || '',
    respiratoryRate: vitals.respiratory_rate || '',
    oxygenSaturation: vitals.oxygen_saturation || '',
    height: vitals.height || '',
    weight: vitals.weight || '',
    bmi: vitals.bmi || '',
    painLevel: vitals.pain_level || '',
  };
};

/**
 * Helper function to format prescription items
 */
const formatPrescriptionItems = items => {
  if (!items || !items.length) return 'No prescriptions';

  return items
    .map(
      item =>
        `${item.medication_name} - ${item.dosage} (${item.frequency}) via ${item.route || 'oral'} for ${item.duration || 'N/A'}`,
    )
    .join('; ');
};

/**
 * Export to JSON
 */
export const exportToJSON = records => {
  const dataStr = JSON.stringify(records, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medical-records-${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export to CSV
 */
export const exportToCSV = appointments => {
  const headers = [
    'Date',
    'Chief Complaint',
    'Triage Level',
    'Temperature',
    'Blood Pressure',
    'Heart Rate',
    'Respiratory Rate',
    'O2 Saturation',
    'Height',
    'Weight',
    'BMI',
    'Pain Level',
    'Primary Diagnosis',
    'ICD-10 Code',
    'Treatment Plan',
    'Disposition',
    'Admission Status',
    'Prescriptions',
  ];

  const rows = appointments.map(apt => {
    const vitals = apt.vitals || {};
    const diagnosis = apt.diagnosis || {};
    const admission = apt.resultingAdmission || {};
    const prescriptions = admission.prescriptions || [];
    const allItems = prescriptions.flatMap(p => p.items || []);

    return [
      formatDate(vitals.recorded_at || apt.appointment_date),
      vitals.chief_complaint || diagnosis.chief_complaint || '',
      vitals.triage_level || '',
      vitals.temperature || '',
      vitals.blood_pressure_systolic && vitals.blood_pressure_diastolic
        ? `${vitals.blood_pressure_systolic}/${vitals.blood_pressure_diastolic}`
        : '',
      vitals.heart_rate || '',
      vitals.respiratory_rate || '',
      vitals.oxygen_saturation || '',
      vitals.height || '',
      vitals.weight || '',
      vitals.bmi || '',
      vitals.pain_level || '',
      diagnosis.primary_diagnosis || '',
      diagnosis.icd_10_code || '',
      diagnosis.treatment_plan || '',
      diagnosis.disposition || admission.admission_status || '',
      admission.admission_id ? 'Admitted' : 'Not Admitted',
      formatPrescriptionItems(allItems),
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medical-records-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export to PDF (HTML format)
 */
export const exportToPDF = async appointments => {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Medical Records</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      padding: 20px;
      max-width: 900px;
      margin: 0 auto;
      font-size: 13px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 10px;
    }
    .record {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      page-break-inside: avoid;
    }
    .record-header {
      background-color: #eff6ff;
      padding: 10px;
      margin: -20px -20px 15px -20px;
      border-radius: 8px 8px 0 0;
      border-bottom: 2px solid #2563eb;
    }
    .record-date {
      font-weight: bold;
      color: #1f2937;
      font-size: 14px;
    }
    .triage-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      float: right;
      text-transform: uppercase;
    }
    .triage-emergency { background-color: #dc2626; color: white; }
    .triage-urgent { background-color: #ea580c; color: white; }
    .triage-semi_urgent { background-color: #eab308; color: white; }
    .triage-non_urgent { background-color: #10b981; color: white; }
    .section {
      margin: 15px 0;
    }
    .section-title {
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 8px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
    }
    .section-content {
      color: #374151;
      line-height: 1.6;
      padding: 5px 0;
    }
    .vital-signs {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 10px;
    }
    .vital-item {
      background-color: #f9fafb;
      padding: 8px;
      border-radius: 4px;
      font-size: 12px;
    }
    .vital-label {
      font-weight: 600;
      color: #6b7280;
      font-size: 10px;
      text-transform: uppercase;
      display: block;
      margin-bottom: 2px;
    }
    .vital-value {
      color: #1f2937;
      font-size: 14px;
      font-weight: bold;
    }
    .diagnosis-box {
      background-color: #fef3c7;
      padding: 12px;
      border-left: 4px solid #f59e0b;
      margin: 15px 0;
      border-radius: 4px;
    }
    .admission-box {
      background-color: #dbeafe;
      padding: 12px;
      border-left: 4px solid #3b82f6;
      margin: 15px 0;
      border-radius: 4px;
    }
    .prescription-box {
      background-color: #f0fdf4;
      padding: 12px;
      border-left: 4px solid #10b981;
      margin: 15px 0;
      border-radius: 4px;
    }
    .prescription-item {
      margin: 8px 0;
      padding: 8px;
      background-color: white;
      border-radius: 4px;
    }
    .medication-name {
      font-weight: bold;
      color: #1f2937;
    }
    .medication-details {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
    }
    .info-row {
      display: flex;
      margin: 5px 0;
    }
    .info-label {
      font-weight: 600;
      min-width: 150px;
      color: #6b7280;
    }
    .info-value {
      color: #1f2937;
    }
    @media print {
      body { margin: 0; padding: 10px; }
      .record { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Medical Records Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}</p>
  </div>

  ${appointments
    .map(apt => {
      const vitals = apt.vitals || {};
      const diagnosis = apt.diagnosis || {};
      const admission = apt.resultingAdmission || {};
      const prescriptions = admission.prescriptions || [];
      const formattedVitals = formatVitals(vitals);

      return `
    <div class="record">
      <div class="record-header">
        <span class="record-date">${formatDate(vitals.recorded_at || apt.appointment_date || 'N/A')}</span>
        ${vitals.triage_level ? `<span class="triage-badge triage-${vitals.triage_level}">${vitals.triage_level.replace('_', ' ')}</span>` : ''}
        <div style="clear: both;"></div>
      </div>

      ${
        vitals.chief_complaint || diagnosis.chief_complaint
          ? `
      <div class="section">
        <div class="section-title">Chief Complaint</div>
        <div class="section-content">${vitals.chief_complaint || diagnosis.chief_complaint}</div>
      </div>
      `
          : ''
      }

      ${
        Object.values(formattedVitals).some(v => v)
          ? `
      <div class="section">
        <div class="section-title">Vital Signs</div>
        <div class="vital-signs">
          ${
            formattedVitals.temperature
              ? `
          <div class="vital-item">
            <span class="vital-label">Temperature</span>
            <span class="vital-value">${formattedVitals.temperature}°C</span>
          </div>`
              : ''
          }
          ${
            formattedVitals.bloodPressure
              ? `
          <div class="vital-item">
            <span class="vital-label">Blood Pressure</span>
            <span class="vital-value">${formattedVitals.bloodPressure}</span>
          </div>`
              : ''
          }
          ${
            formattedVitals.heartRate
              ? `
          <div class="vital-item">
            <span class="vital-label">Heart Rate</span>
            <span class="vital-value">${formattedVitals.heartRate} bpm</span>
          </div>`
              : ''
          }
          ${
            formattedVitals.respiratoryRate
              ? `
          <div class="vital-item">
            <span class="vital-label">Respiratory Rate</span>
            <span class="vital-value">${formattedVitals.respiratoryRate}/min</span>
          </div>`
              : ''
          }
          ${
            formattedVitals.oxygenSaturation
              ? `
          <div class="vital-item">
            <span class="vital-label">O2 Saturation</span>
            <span class="vital-value">${formattedVitals.oxygenSaturation}%</span>
          </div>`
              : ''
          }
          ${
            formattedVitals.height
              ? `
          <div class="vital-item">
            <span class="vital-label">Height</span>
            <span class="vital-value">${formattedVitals.height} cm</span>
          </div>`
              : ''
          }
          ${
            formattedVitals.weight
              ? `
          <div class="vital-item">
            <span class="vital-label">Weight</span>
            <span class="vital-value">${formattedVitals.weight} kg</span>
          </div>`
              : ''
          }
          ${
            formattedVitals.bmi
              ? `
          <div class="vital-item">
            <span class="vital-label">BMI</span>
            <span class="vital-value">${formattedVitals.bmi}</span>
          </div>`
              : ''
          }
          ${
            formattedVitals.painLevel
              ? `
          <div class="vital-item">
            <span class="vital-label">Pain Level</span>
            <span class="vital-value">${formattedVitals.painLevel}/10</span>
          </div>`
              : ''
          }
        </div>
      </div>
      `
          : ''
      }

      ${
        vitals.nurse_notes
          ? `
      <div class="section">
        <div class="section-title">Nurse Notes</div>
        <div class="section-content">${vitals.nurse_notes}</div>
      </div>
      `
          : ''
      }

      ${
        diagnosis.primary_diagnosis
          ? `
      <div class="diagnosis-box">
        <div class="section-title">Diagnosis</div>
        <div class="info-row">
          <span class="info-label">Primary Diagnosis:</span>
          <span class="info-value">${diagnosis.primary_diagnosis}</span>
        </div>
        ${
          diagnosis.icd_10_code
            ? `
        <div class="info-row">
          <span class="info-label">ICD-10 Code:</span>
          <span class="info-value">${diagnosis.icd_10_code}</span>
        </div>`
            : ''
        }
        ${
          diagnosis.secondary_diagnoses
            ? `
        <div class="info-row">
          <span class="info-label">Secondary Diagnoses:</span>
          <span class="info-value">${diagnosis.secondary_diagnoses}</span>
        </div>`
            : ''
        }
        ${
          diagnosis.history_of_present_illness
            ? `
        <div style="margin-top: 10px;">
          <div class="info-label">History of Present Illness:</div>
          <div class="section-content">${diagnosis.history_of_present_illness}</div>
        </div>`
            : ''
        }
        ${
          diagnosis.physical_examination
            ? `
        <div style="margin-top: 10px;">
          <div class="info-label">Physical Examination:</div>
          <div class="section-content">${diagnosis.physical_examination}</div>
        </div>`
            : ''
        }
        ${
          diagnosis.treatment_plan
            ? `
        <div style="margin-top: 10px;">
          <div class="info-label">Treatment Plan:</div>
          <div class="section-content">${diagnosis.treatment_plan}</div>
        </div>`
            : ''
        }
        ${
          diagnosis.procedures_performed
            ? `
        <div style="margin-top: 10px;">
          <div class="info-label">Procedures Performed:</div>
          <div class="section-content">${diagnosis.procedures_performed}</div>
        </div>`
            : ''
        }
        ${
          diagnosis.disposition
            ? `
        <div class="info-row" style="margin-top: 10px;">
          <span class="info-label">Disposition:</span>
          <span class="info-value"><strong>${diagnosis.disposition.toUpperCase()}</strong></span>
        </div>`
            : ''
        }
        ${
          diagnosis.disposition_notes
            ? `
        <div class="section-content" style="margin-top: 5px;">${diagnosis.disposition_notes}</div>`
            : ''
        }
      </div>
      `
          : ''
      }

      ${
        admission.admission_id
          ? `
      <div class="admission-box">
        <div class="section-title">Admission Information</div>
        <div class="info-row">
          <span class="info-label">Admission Number:</span>
          <span class="info-value">${admission.admission_number || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Admission Date:</span>
          <span class="info-value">${formatDate(admission.admission_date)}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Admission Type:</span>
          <span class="info-value">${admission.admission_type || 'N/A'}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="info-value"><strong>${admission.admission_status || 'active'}</strong></span>
        </div>
        ${
          admission.diagnosis_at_admission
            ? `
        <div style="margin-top: 10px;">
          <div class="info-label">Diagnosis at Admission:</div>
          <div class="section-content">${admission.diagnosis_at_admission}</div>
        </div>`
            : ''
        }
        ${
          admission.discharge_date
            ? `
        <div class="info-row" style="margin-top: 10px;">
          <span class="info-label">Discharge Date:</span>
          <span class="info-value">${formatDate(admission.discharge_date)}</span>
        </div>`
            : ''
        }
        ${
          admission.discharge_summary
            ? `
        <div style="margin-top: 10px;">
          <div class="info-label">Discharge Summary:</div>
          <div class="section-content">${admission.discharge_summary}</div>
        </div>`
            : ''
        }
      </div>
      `
          : ''
      }

      ${
        prescriptions.length > 0
          ? `
      <div class="prescription-box">
        <div class="section-title">Prescriptions</div>
        ${prescriptions
          .map(
            prescription => `
          ${
            prescription.prescription_number
              ? `
          <div class="info-row">
            <span class="info-label">Prescription #:</span>
            <span class="info-value">${prescription.prescription_number}</span>
          </div>`
              : ''
          }
          ${
            prescription.prescription_date
              ? `
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${formatDate(prescription.prescription_date)}</span>
          </div>`
              : ''
          }
          ${
            prescription.notes
              ? `
          <div class="section-content" style="margin: 10px 0;">${prescription.notes}</div>`
              : ''
          }
          ${
            prescription.items && prescription.items.length > 0
              ? `
          <div style="margin-top: 10px;">
            ${prescription.items
              .map(
                item => `
            <div class="prescription-item">
              <div class="medication-name">${item.medication_name}</div>
              <div class="medication-details">
                <strong>Dosage:</strong> ${item.dosage} | 
                <strong>Frequency:</strong> ${item.frequency} | 
                <strong>Route:</strong> ${item.route || 'oral'} | 
                <strong>Duration:</strong> ${item.duration || 'N/A'} |
                <strong>Quantity:</strong> ${item.quantity || 'N/A'}
              </div>
              ${item.instructions ? `<div class="medication-details" style="margin-top: 4px;"><strong>Instructions:</strong> ${item.instructions}</div>` : ''}
              ${item.dispensed ? `<div class="medication-details" style="color: #10b981; margin-top: 4px;">✓ Dispensed on ${formatDate(item.dispensed_at)}</div>` : ''}
            </div>
            `,
              )
              .join('')}
          </div>`
              : ''
          }
        `,
          )
          .join('<hr style="margin: 15px 0;">')}
      </div>
      `
          : ''
      }
    </div>
    `;
    })
    .join('')}
</body>
</html>
  `;

  // Create blob and download as HTML
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medical-records-${new Date().toISOString().split('T')[0]}.html`;
  link.click();
  URL.revokeObjectURL(url);

  // Open in new window for printing to PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
