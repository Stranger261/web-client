import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Format date for display
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
 * Format time for display
 */
const formatTime = timeString => {
  if (!timeString) return 'N/A';
  // Handle both "HH:MM:SS" and "HH:MM" formats
  const parts = timeString.split(':');
  const hours = parseInt(parts[0]);
  const minutes = parts[1];
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
};

/**
 * Calculate statistics from appointments
 */
const calculateStatistics = appointments => {
  const stats = {
    total: appointments.length,
    byStatus: {},
    byDepartment: {},
    byPaymentStatus: {},
    byType: {},
    byPriority: {},
    onlineConsultations: 0,
    inPersonConsultations: 0,
  };

  appointments.forEach(apt => {
    // Status statistics
    const status = apt.status || 'unknown';
    stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

    // Department statistics
    const dept = apt.department_name || 'Unknown';
    stats.byDepartment[dept] = (stats.byDepartment[dept] || 0) + 1;

    // Payment status statistics
    const paymentStatus = apt.payment_status || 'unknown';
    stats.byPaymentStatus[paymentStatus] =
      (stats.byPaymentStatus[paymentStatus] || 0) + 1;

    // Appointment type statistics
    const type = apt.appointment_type || 'unknown';
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Priority statistics
    const priority = apt.priority || 'normal';
    stats.byPriority[priority] = (stats.byPriority[priority] || 0) + 1;

    // Online vs In-person
    if (apt.is_online_consultation) {
      stats.onlineConsultations++;
    } else {
      stats.inPersonConsultations++;
    }
  });

  return stats;
};

/**
 * Export appointments to CSV format
 */
export const exportAppointmentsToCSV = (
  appointments,
  filename = 'appointments_export',
) => {
  if (!appointments || appointments.length === 0) {
    alert('No appointment data to export');
    return;
  }

  // Define CSV headers
  const headers = [
    'Appointment Number',
    'Date',
    'Time',
    'Status',
    'Patient Name',
    'Patient Email',
    'Patient Phone',
    'Doctor Name',
    'Department',
    'Type',
    'Duration (min)',
    'Priority',
    'Online Consultation',
    'Reason',
  ];

  // Convert appointments to CSV rows
  const rows = appointments.map(apt => [
    apt.appointment_number || '',
    apt.appointment_date || '',
    formatTime(apt.appointment_time),
    apt.status || '',
    apt.patient_name || 'N/A',
    apt.patient_email || 'N/A',
    apt.patient_phone || 'N/A',
    apt.doctor_name || 'N/A',
    apt.department_name || 'N/A',
    apt.appointment_type || 'consultation',
    apt.duration_minutes || '',
    apt.priority || 'normal',
    apt.is_online_consultation ? 'Yes' : 'No',
    apt.reason || '',
  ]);

  // Combine headers and rows
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

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export appointments to JSON format
 */
export const exportAppointmentsToJSON = (
  appointments,
  filename = 'appointments_export',
) => {
  if (!appointments || appointments.length === 0) {
    alert('No appointment data to export');
    return;
  }

  const stats = calculateStatistics(appointments);

  const exportData = {
    metadata: {
      hospitalName: 'HVill Hospital',
      exportDate: new Date().toISOString(),
      exportedBy: 'Administrator',
      totalAppointments: appointments.length,
      dateRange:
        appointments.length > 0
          ? {
              from: appointments[0].appointment_date,
              to: appointments[appointments.length - 1].appointment_date,
            }
          : null,
    },
    statistics: stats,
    appointments: appointments.map(apt => ({
      appointmentInfo: {
        appointmentNumber: apt.appointment_number,
        appointmentId: apt.appointment_id,
        date: apt.appointment_date,
        time: apt.appointment_time,
        startTime: apt.start_time,
        endTime: apt.end_time,
        status: apt.status,
        type: apt.appointment_type || 'consultation',
        priority: apt.priority || 'normal',
        duration: apt.duration_minutes,
      },
      patientInfo: {
        patientId: apt.patient_id,
        patientName: apt.patient_name,
        patientEmail: apt.patient_email,
        patientPhone: apt.patient_phone,
      },
      doctorInfo: {
        doctorId: apt.doctor_id,
        doctorName: apt.doctor_name,
        employeeNumber: apt.doctor?.employee_number,
        specialty: apt.department_name,
      },
      departmentInfo: {
        departmentId: apt.department_id,
        departmentName: apt.department_name,
        departmentCode: apt.doctor?.department?.department_code,
      },
      consultationDetails: {
        isOnline: apt.is_online_consultation || false,
        reason: apt.reason,
        notes: apt.notes,
      },
      timestamps: {
        createdAt: apt.created_at,
        updatedAt: apt.updated_at,
        cancelledAt: apt.cancelled_at,
      },
    })),
  };

  // Create and download file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export appointments to PDF format with comprehensive report
 */
export const exportAppointmentsToPDF = (
  appointments,
  filename = 'appointments_export',
  additionalInfo = {},
) => {
  if (!appointments || appointments.length === 0) {
    alert('No appointment data to export');
    return;
  }

  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Calculate statistics
  const stats = calculateStatistics(appointments);

  // Colors
  const primaryColor = [41, 128, 185]; // Blue
  const secondaryColor = [52, 73, 94]; // Dark gray
  const accentColor = [46, 204, 113]; // Green

  let yPosition = 20;

  // ========== HEADER SECTION ==========
  // Hospital Logo/Name
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('HVill Hospital', pageWidth / 2, yPosition, { align: 'center' });

  yPosition += 8;
  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.setFont('helvetica', 'normal');
  doc.text('Appointment Records Report', pageWidth / 2, yPosition, {
    align: 'center',
  });

  yPosition += 10;

  // Report Info Box
  doc.setFillColor(240, 248, 255);
  doc.rect(14, yPosition, pageWidth - 28, 20, 'F');

  yPosition += 6;
  doc.setFontSize(9);
  doc.setTextColor(60);

  const exportDate = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.text(`Report Generated: ${exportDate}`, 20, yPosition);
  doc.text(
    `Generated By: ${additionalInfo.generatedBy || 'Administrator'}`,
    20,
    yPosition + 5,
  );
  doc.text(`Total Appointments: ${appointments.length}`, 20, yPosition + 10);

  if (appointments.length > 0) {
    doc.text(
      `Date: ${formatDate(appointments[0].appointment_date)}`,
      pageWidth - 80,
      yPosition,
    );
  }

  yPosition += 18;

  // ========== STATISTICS SECTION ==========
  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Summary Statistics', 14, yPosition);

  yPosition += 8;

  // Statistics Cards
  const cardWidth = (pageWidth - 40) / 4;
  let xPosition = 14;

  // Helper function to draw stat card
  const drawStatCard = (x, y, title, value, color) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, cardWidth, 18, 2, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(title, x + cardWidth / 2, y + 6, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(String(value), x + cardWidth / 2, y + 14, { align: 'center' });
  };

  drawStatCard(
    xPosition,
    yPosition,
    'Total Appointments',
    stats.total,
    primaryColor,
  );
  drawStatCard(
    xPosition + cardWidth + 4,
    yPosition,
    'Completed',
    stats.byStatus['completed'] || 0,
    accentColor,
  );
  drawStatCard(
    xPosition + (cardWidth + 4) * 2,
    yPosition,
    'Scheduled',
    stats.byStatus['scheduled'] || 0,
    [52, 152, 219],
  );
  drawStatCard(
    xPosition + (cardWidth + 4) * 3,
    yPosition,
    'Cancelled',
    stats.byStatus['cancelled'] || 0,
    [231, 76, 60],
  );

  yPosition += 25;

  // Status Breakdown
  doc.setFontSize(11);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Status Breakdown', 14, yPosition);

  yPosition += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);

  const statusColors = {
    scheduled: [52, 152, 219],
    completed: [46, 204, 113],
    cancelled: [231, 76, 60],
    'no-show': [241, 196, 15],
    arrived: [155, 89, 182],
  };

  xPosition = 14;
  Object.entries(stats.byStatus).forEach(([status, count]) => {
    const color = statusColors[status] || [149, 165, 166];
    doc.setFillColor(...color);
    doc.circle(xPosition, yPosition, 2, 'F');
    doc.setTextColor(60);
    doc.text(`${status}: ${count}`, xPosition + 5, yPosition + 1);
    xPosition += 45;
  });

  yPosition += 8;

  // Department Breakdown
  doc.setFontSize(11);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Department Distribution', 14, yPosition);

  yPosition += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60);

  xPosition = 14;
  let rowCount = 0;
  Object.entries(stats.byDepartment).forEach(([dept, count]) => {
    doc.text(`• ${dept}: ${count}`, xPosition, yPosition);
    xPosition += 70;
    rowCount++;
    if (rowCount % 3 === 0) {
      xPosition = 14;
      yPosition += 5;
    }
  });

  if (rowCount % 3 !== 0) {
    yPosition += 5;
  }

  yPosition += 3;

  // Additional Statistics Row
  doc.setFontSize(9);
  doc.text(`Online Consultations: ${stats.onlineConsultations}`, 14, yPosition);
  doc.text(`In-Person: ${stats.inPersonConsultations}`, 90, yPosition);

  yPosition += 8;

  // ========== APPOINTMENTS TABLE ==========
  doc.setFontSize(14);
  doc.setTextColor(...secondaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text('Appointment Details', 14, yPosition);

  yPosition += 5;

  // Prepare table data
  const tableHeaders = [
    'Apt #',
    'Time',
    'Patient Name',
    'Patient Email',
    'Patient Phone',
    'Doctor',
    'Department',
    'Type',
    'Duration',
    'Status',
  ];

  const tableData = appointments.map(apt => [
    apt.appointment_number || '',
    formatTime(apt.appointment_time),
    apt.patient_name || 'N/A',
    apt.patient_email || 'N/A',
    apt.patient_phone || 'N/A',
    apt.doctor_name || 'N/A',
    apt.department_name || 'N/A',
    apt.appointment_type || 'consultation',
    `${apt.duration_minutes || 0}m`,
    apt.status || '',
  ]);

  // Add table
  autoTable(doc, {
    head: [tableHeaders],
    body: tableData,
    startY: yPosition,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Apt #
      1: { cellWidth: 20 }, // Time
      2: { cellWidth: 35 }, // Patient Name
      3: { cellWidth: 45 }, // Patient Email
      4: { cellWidth: 30 }, // Patient Phone
      5: { cellWidth: 35 }, // Doctor
      6: { cellWidth: 30 }, // Department
      7: { cellWidth: 25 }, // Type
      8: { cellWidth: 18 }, // Duration
      9: { cellWidth: 22 }, // Status
    },
    margin: { top: yPosition, left: 14, right: 14, bottom: 20 },
    didDrawPage: data => {
      // Footer on each page
      const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;
      const totalPages = doc.internal.getNumberOfPages();

      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        `HVill Hospital - Appointment Report | Page ${pageNumber} of ${totalPages}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      );

      doc.text(`Generated: ${exportDate}`, 14, pageHeight - 10);
    },
  });

  // Save the PDF
  doc.save(`${filename}.pdf`);
};

/**
 * Main export function that handles all formats
 */
export const exportAppointments = (
  appointments,
  format = 'csv',
  filename = 'appointments_export',
  additionalInfo = {},
) => {
  switch (format.toLowerCase()) {
    case 'csv':
      exportAppointmentsToCSV(appointments, filename);
      break;
    case 'json':
      exportAppointmentsToJSON(appointments, filename);
      break;
    case 'pdf':
      exportAppointmentsToPDF(appointments, filename, additionalInfo);
      break;
    default:
      console.error('Unsupported export format:', format);
      alert('Unsupported export format. Please choose CSV, JSON, or PDF.');
  }
};
