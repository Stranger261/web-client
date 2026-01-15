import { formatDate } from '../../../../../utils/dateFormatter';

export const exportToJSON = records => {
  const dataStr = JSON.stringify(records, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medical-records-${
    new Date().toISOString().split('T')[0]
  }.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToCSV = records => {
  // CSV headers
  const headers = [
    'Date',
    'Type',
    'Diagnosis',
    'Chief Complaint',
    'Treatment',
    'Prescription',
    'Doctor Name',
    'Doctor Specialization',
    'Doctor License',
    'BP',
    'Pulse',
    'Temperature',
    'Weight',
  ];

  // Convert records to CSV rows
  const rows = records.map(record => {
    const doctorName = record.doctor?.person
      ? `${record.doctor.person.first_name} ${record.doctor.person.last_name}`
      : 'N/A';

    return [
      formatDate(record.created_at || record.date),
      record.type || '',
      record.diagnosis || '',
      record.chief_complaint || record.chiefComplaint || '',
      record.treatment || '',
      record.prescription || '',
      doctorName,
      record.doctor?.specialization || '',
      record.doctor?.license_number || '',
      record.vitalSigns?.bp || '',
      record.vitalSigns?.pulse || '',
      record.vitalSigns?.temp || '',
      record.vitalSigns?.weight || '',
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medical-records-${
    new Date().toISOString().split('T')[0]
  }.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToPDF = async records => {
  // Create HTML content for PDF
  const doctorName = record => {
    if (record.doctor?.person) {
      return `Dr. ${record.doctor.person.first_name} ${record.doctor.person.last_name}`;
    }
    return 'N/A';
  };

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
      max-width: 800px;
      margin: 0 auto;
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
    .record-type {
      display: inline-block;
      background-color: #2563eb;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .record-date {
      float: right;
      color: #6b7280;
      font-size: 14px;
    }
    .section {
      margin: 15px 0;
    }
    .section-title {
      font-weight: bold;
      color: #1f2937;
      margin-bottom: 5px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .section-content {
      color: #374151;
      line-height: 1.6;
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
      font-size: 14px;
    }
    .doctor-info {
      background-color: #f0fdf4;
      padding: 10px;
      border-left: 3px solid #10b981;
      margin-top: 15px;
      border-radius: 4px;
    }
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 20px 0;
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

  ${records
    .map(
      record => `
    <div class="record">
      <div class="record-header">
        <span class="record-type">${record.type || 'Consultation'}</span>
        <span class="record-date">${formatDate(
          record.created_at || record.date
        )}</span>
        <div style="clear: both;"></div>
      </div>

      <div class="section">
        <div class="section-title">Diagnosis</div>
        <div class="section-content">${
          record.diagnosis || 'No diagnosis recorded'
        }</div>
      </div>

      <div class="section">
        <div class="section-title">Chief Complaint</div>
        <div class="section-content">${
          record.chief_complaint ||
          record.chiefComplaint ||
          'No chief complaint recorded'
        }</div>
      </div>

      ${
        record.vitalSigns
          ? `
        <div class="section">
          <div class="section-title">Vital Signs</div>
          <div class="vital-signs">
            ${
              record.vitalSigns.bp
                ? `<div class="vital-item"><strong>BP:</strong> ${record.vitalSigns.bp}</div>`
                : ''
            }
            ${
              record.vitalSigns.pulse
                ? `<div class="vital-item"><strong>Pulse:</strong> ${record.vitalSigns.pulse}</div>`
                : ''
            }
            ${
              record.vitalSigns.temp
                ? `<div class="vital-item"><strong>Temp:</strong> ${record.vitalSigns.temp}</div>`
                : ''
            }
            ${
              record.vitalSigns.weight
                ? `<div class="vital-item"><strong>Weight:</strong> ${record.vitalSigns.weight}</div>`
                : ''
            }
          </div>
        </div>
      `
          : ''
      }

      ${
        record.treatment
          ? `
        <div class="section">
          <div class="section-title">Treatment</div>
          <div class="section-content">${record.treatment}</div>
        </div>
      `
          : ''
      }

      ${
        record.prescription
          ? `
        <div class="section">
          <div class="section-title">Prescription</div>
          <div class="section-content">${record.prescription}</div>
        </div>
      `
          : ''
      }

      ${
        record.notes
          ? `
        <div class="section">
          <div class="section-title">Notes</div>
          <div class="section-content">${record.notes}</div>
        </div>
      `
          : ''
      }

      ${
        record.doctor
          ? `
        <div class="doctor-info">
          <strong>Attending Physician:</strong> ${doctorName(record)}<br>
          ${
            record.doctor.specialization
              ? `<strong>Specialization:</strong> ${record.doctor.specialization}<br>`
              : ''
          }
          ${
            record.doctor.license_number
              ? `<strong>License:</strong> ${record.doctor.license_number}<br>`
              : ''
          }
          ${
            record.doctor.employee_number
              ? `<strong>Employee #:</strong> ${record.doctor.employee_number}`
              : ''
          }
        </div>
      `
          : ''
      }
    </div>
  `
    )
    .join('')}
</body>
</html>
    `;

  // Create blob and download as HTML (can be printed as PDF)
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `medical-records-${
    new Date().toISOString().split('T')[0]
  }.html`;
  link.click();
  URL.revokeObjectURL(url);

  // Optional: Open in new window for printing to PDF
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
};
