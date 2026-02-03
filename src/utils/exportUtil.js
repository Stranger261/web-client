import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format date for export
 */
const formatDate = dateString => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Export patients to CSV format
 */
export const exportToCSV = patients => {
  if (!patients || patients.length === 0) {
    alert('No patient data to export');
    return;
  }

  const headers = [
    'Patient ID',
    'MRN',
    'Full Name',
    'Email',
    'Phone',
    'Date of Birth',
    'Gender',
    'Blood Type',
    'Civil Status',
    'Nationality',
    'Primary Address',
    'Insurance Provider',
    'Insurance Number',
    'First Visit Date',
    'Registration Date',
    'Status',
  ];

  const rows = patients.map(p => {
    const primaryAddress = p.addresses?.find(a => a.is_primary);

    const fullAddress = primaryAddress
      ? `${primaryAddress.barangay || ''}, ${primaryAddress.city || ''}, ${primaryAddress.province || ''}`
      : 'N/A';

    return [
      p.patient_id || '',
      p.mrn || '',
      `${p.first_name || ''} ${p.middle_name || ''} ${p.last_name || ''}`.trim(),
      p.email || '',
      p.phone || '',
      formatDate(p.date_of_birth),
      p.gender || '',
      p.blood_type || '',
      p.civil_status || '',
      p.nationality || '',
      fullAddress,
      p.insurance_provider || '',
      p.insurance_number || '',
      formatDate(p.first_visit_date),
      formatDate(p.created_at),
      p.patient_status || 'active',
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          const cellStr = String(cell);
          if (
            cellStr.includes(',') ||
            cellStr.includes('"') ||
            cellStr.includes('\n')
          ) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        })
        .join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `patients_export_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

/**
 * Export patients to JSON format
 */
export const exportToJSON = patients => {
  if (!patients || patients.length === 0) {
    alert('No patient data to export');
    return;
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    totalPatients: patients.length,
    patients: patients.map(p => ({
      patientId: p.patient_id,
      uuid: p.patient_uuid,
      mrn: p.mrn,
      personalInfo: {
        firstName: p.first_name,
        middleName: p.middle_name,
        lastName: p.last_name,
        suffix: p.suffix,
        gender: p.gender,
        genderSpecification: p.gender_specification,
        dateOfBirth: p.date_of_birth,
        bloodType: p.blood_type,
        civilStatus: p.civil_status,
        nationality: p.nationality,
        religion: p.religion,
        occupation: p.occupation,
      },
      contactInfo: {
        email: p.email,
        phone: p.phone,
        contacts: p.contacts || [],
      },
      addresses: p.addresses || [],
      insurance: {
        provider: p.insurance_provider,
        number: p.insurance_number,
        expiry: p.insurance_expiry,
      },
      registration: {
        type: p.registration_type,
        firstVisitDate: p.first_visit_date,
        createdAt: p.created_at,
        status: p.patient_status,
      },
    })),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `patients_export_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
};

/**
 * Export patients to PDF format
 */
export const exportToPDF = patients => {
  if (!patients || patients.length === 0) {
    alert('No patient data to export');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4');

  doc.setFontSize(18);
  doc.text('Patient Records Export', 14, 15);

  doc.setFontSize(10);
  doc.text(`Export Date: ${new Date().toLocaleDateString()}`, 14, 22);
  doc.text(`Total Patients: ${patients.length}`, 14, 27);

  const tableHeaders = [
    'MRN',
    'Full Name',
    'Gender',
    'DOB',
    'Blood Type',
    'Phone',
    'City',
    'Status',
  ];

  const tableData = patients.map(p => {
    const primaryAddress = p.addresses?.find(a => a.is_primary);

    return [
      p.mrn || 'N/A',
      `${p.first_name || ''} ${p.last_name || ''}`.trim(),
      p.gender || 'N/A',
      formatDate(p.date_of_birth),
      p.blood_type || 'N/A',
      p.phone || 'N/A',
      primaryAddress?.city || 'N/A',
      p.patient_status || 'active',
    ];
  });

  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: 32,
    theme: 'striped',
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 9,
    },
    bodyStyles: {
      fontSize: 8,
    },
  });

  doc.save(`patients_export_${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Main export function that handles all formats
 */
export const exportPatients = (patients, format = 'csv') => {
  switch (format.toLowerCase()) {
    case 'csv':
      exportToCSV(patients);
      break;
    case 'json':
      exportToJSON(patients);
      break;
    case 'pdf':
      exportToPDF(patients);
      break;
    default:
      console.error('Unsupported export format:', format);
      alert('Unsupported export format. Please choose CSV, JSON, or PDF.');
  }
};
