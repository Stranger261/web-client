import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

class exportService {
  /**
   * Export data to CSV format with comprehensive medical details
   */
  exportToCSV(records, filename = 'medical-records') {
    if (!records || records.length === 0) {
      throw new Error('No data to export');
    }

    // Flatten records with all details
    const flattenedData = this.flattenRecordsForCSV(records);

    // Convert to CSV
    const headers = Object.keys(flattenedData[0]);
    const csvContent = [
      headers.join(','),
      ...flattenedData.map(row =>
        headers
          .map(header => {
            const cell = row[header];
            if (cell === null || cell === undefined) return '';
            if (typeof cell === 'object') {
              return `"${JSON.stringify(cell).replace(/"/g, '""')}"`;
            }
            return `"${String(cell).replace(/"/g, '""')}"`;
          })
          .join(','),
      ),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  }

  /**
   * Flatten records including nested admissions, prescriptions, and progress notes
   */
  flattenRecordsForCSV(records) {
    const flattened = [];

    records.forEach(record => {
      // Base record data
      const baseData = {
        'Record ID': `${record.type}-${record.id}`,
        Date: new Date(record.date).toLocaleString(),
        Type: record.title,
        Status: record.status,
        'Chief Complaint': record.chiefComplaint || '',
        Diagnosis: record.diagnosis || '',
        'Treatment Plan': record.treatmentPlan || '',
        Doctor: record.doctor,
        Disposition: record.disposition || '',

        // Vitals
        'Blood Pressure': record.vitals?.bloodPressure || '',
        'Heart Rate': record.vitals?.heartRate || '',
        Temperature: record.vitals?.temperature || '',
        'O2 Saturation': record.vitals?.oxygenSaturation || '',
        Weight: record.vitals?.weight || '',
        BMI: record.vitals?.bmi || '',
        'Pain Level': record.vitals?.painLevel || '',

        // Admission details
        'Has Admission': record.relatedAdmission ? 'Yes' : 'No',
        'Admission Number': record.relatedAdmission?.admissionNumber || '',
        'Admission Status': record.relatedAdmission?.status || '',
        'Length of Stay': record.relatedAdmission?.lengthOfStay
          ? `${record.relatedAdmission.lengthOfStay} days`
          : '',
        'Discharge Date': record.relatedAdmission?.dischargeDate
          ? new Date(record.relatedAdmission.dischargeDate).toLocaleDateString()
          : '',
        'Discharge Summary': record.relatedAdmission?.dischargeSummary || '',

        // Counts
        'Progress Notes Count':
          record.relatedAdmission?.progressNotesCount || 0,
        'Prescriptions Count':
          record.relatedAdmission?.prescriptions?.length || 0,
      };

      flattened.push(baseData);

      // Add prescription details as separate rows if needed
      if (record.relatedAdmission?.prescriptions) {
        record.relatedAdmission.prescriptions.forEach(rx => {
          rx.items?.forEach(item => {
            flattened.push({
              'Record ID': `${record.type}-${record.id}-RX`,
              Date: new Date(rx.prescriptionDate).toLocaleDateString(),
              Type: 'Prescription',
              Status: rx.status,
              Medication: item.medicationName,
              Dosage: item.dosage,
              Frequency: item.frequency,
              Route: item.route,
              Duration: item.duration,
              Instructions: item.instructions || '',
              Dispensed: item.dispensed ? 'Yes' : 'No',
            });
          });
        });
      }
    });

    return flattened;
  }

  /**
   * Export data to JSON format with full structure
   */
  exportToJSON(records, filename = 'medical-records') {
    if (!records || records.length === 0) {
      throw new Error('No data to export');
    }

    const jsonContent = JSON.stringify(
      {
        exportDate: new Date().toISOString(),
        totalRecords: records.length,
        records: records,
      },
      null,
      2,
    );

    const blob = new Blob([jsonContent], {
      type: 'application/json;charset=utf-8;',
    });
    saveAs(blob, `${filename}-${new Date().toISOString().split('T')[0]}.json`);
  }

  /**
   * Export to beautiful, comprehensive PDF
   */
  exportToPDF(records, patientInfo = {}, filename = 'medical-records') {
    if (!records || records.length === 0) {
      throw new Error('No data to export');
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let currentY = 0;
    let pageNumber = 1;

    // Colors
    const colors = {
      primary: [41, 128, 185],
      secondary: [52, 73, 94],
      success: [46, 204, 113],
      danger: [231, 76, 60],
      warning: [241, 196, 15],
      lightGray: [240, 240, 240],
      darkGray: [100, 100, 100],
    };

    // Helper: Add page header
    const addHeader = () => {
      // Blue header bar
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Title
      doc.setFontSize(20);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPREHENSIVE MEDICAL RECORDS', pageWidth / 2, 18, {
        align: 'center',
      });

      // Subtitle
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Protected Health Information - Confidential',
        pageWidth / 2,
        26,
        {
          align: 'center',
        },
      );

      // Document ID
      doc.setFontSize(9);
      const docId = `DOC-${Date.now().toString(36).toUpperCase()}`;
      doc.text(`Document ID: ${docId}`, pageWidth / 2, 35, {
        align: 'center',
      });

      return 50; // Return Y position after header
    };

    // Helper: Add patient info box
    const addPatientInfo = yPos => {
      // Patient info box
      doc.setFillColor(...colors.lightGray);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, 'F');

      // Border
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, yPos, pageWidth - 2 * margin, 30, 3, 3, 'S');

      doc.setTextColor(...colors.secondary);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('PATIENT INFORMATION', margin + 5, yPos + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      const leftCol = margin + 5;
      const rightCol = pageWidth / 2 + 5;
      const lineHeight = 5;
      let infoY = yPos + 14;

      // Left column
      doc.text(`Name: ${patientInfo.name || 'Not specified'}`, leftCol, infoY);
      doc.text(`MRN: ${patientInfo.mrn || 'N/A'}`, leftCol, infoY + lineHeight);
      doc.text(
        `DOB: ${patientInfo.dob ? new Date(patientInfo.dob).toLocaleDateString() : 'N/A'}`,
        leftCol,
        infoY + lineHeight * 2,
      );

      // Right column
      doc.text(`Gender: ${patientInfo.gender || 'N/A'}`, rightCol, infoY);
      doc.text(
        `Generated: ${new Date().toLocaleString()}`,
        rightCol,
        infoY + lineHeight,
      );
      doc.text(
        `Total Records: ${records.length}`,
        rightCol,
        infoY + lineHeight * 2,
      );

      return yPos + 35; // Return Y position after patient info
    };

    // Helper: Add page footer
    const addFooter = () => {
      doc.setFontSize(8);
      doc.setTextColor(...colors.darkGray);
      doc.setFont('helvetica', 'italic');

      // Footer line
      doc.setDrawColor(...colors.lightGray);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);

      // Confidentiality notice
      doc.text(
        'CONFIDENTIAL: This document contains protected health information. Unauthorized disclosure is prohibited by law.',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' },
      );

      // Page number
      doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 10, {
        align: 'right',
      });

      pageNumber++;
    };

    // Helper: Check if new page is needed
    const checkNewPage = requiredSpace => {
      if (currentY + requiredSpace > pageHeight - 25) {
        addFooter();
        doc.addPage();
        currentY = addHeader();
        return true;
      }
      return false;
    };

    // Helper: Add section header
    const addSectionHeader = (title, icon = '') => {
      checkNewPage(15);

      doc.setFillColor(...colors.primary);
      doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 10, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${icon} ${title}`, margin + 5, currentY + 7);

      currentY += 12;
    };

    // Start PDF generation
    currentY = addHeader();
    currentY = addPatientInfo(currentY);

    // Add summary statistics
    addSectionHeader('SUMMARY STATISTICS');

    const stats = this.calculateStatistics(records);
    const statsData = [
      ['Total Appointments', stats.totalAppointments],
      ['Total Admissions', stats.totalAdmissions],
      ['Total Prescriptions', stats.totalPrescriptions],
      ['Total Progress Notes', stats.totalProgressNotes],
      ['Completed Records', stats.completedRecords],
      ['Active Records', stats.activeRecords],
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Count']],
      body: statsData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        textColor: [255, 255, 255],
        fontSize: 9,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold' },
        1: { cellWidth: 60, halign: 'center' },
      },
      margin: { left: margin, right: margin },
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // Process each record
    records.forEach((record, index) => {
      checkNewPage(80);

      // Record header
      const recordTitle = `${index + 1}. ${record.title} - ${new Date(record.date).toLocaleDateString()}`;
      addSectionHeader(recordTitle);

      // Basic info table
      const basicInfo = [
        ['Date & Time', new Date(record.date).toLocaleString()],
        ['Type', record.title],
        ['Status', record.status],
        ['Doctor', record.doctor],
      ];

      if (record.chiefComplaint) {
        basicInfo.push(['Chief Complaint', record.chiefComplaint]);
      }
      if (record.diagnosis) {
        basicInfo.push(['Diagnosis', record.diagnosis]);
      }
      if (record.treatmentPlan) {
        basicInfo.push(['Treatment Plan', record.treatmentPlan]);
      }

      autoTable(doc, {
        startY: currentY,
        body: basicInfo,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold', textColor: colors.secondary },
          1: { cellWidth: 110 },
        },
        margin: { left: margin + 5 },
      });

      currentY = doc.lastAutoTable.finalY + 3;

      // Vitals if available
      if (record.vitals) {
        checkNewPage(40);

        doc.setFillColor(230, 247, 255);
        doc.roundedRect(
          margin + 5,
          currentY,
          pageWidth - 2 * margin - 10,
          8,
          2,
          2,
          'F',
        );

        doc.setTextColor(...colors.primary);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('VITAL SIGNS', margin + 10, currentY + 5.5);

        currentY += 10;

        const vitalsData = [];
        if (record.vitals.bloodPressure)
          vitalsData.push([
            'Blood Pressure',
            record.vitals.bloodPressure + ' mmHg',
          ]);
        if (record.vitals.heartRate)
          vitalsData.push(['Heart Rate', record.vitals.heartRate + ' bpm']);
        if (record.vitals.temperature)
          vitalsData.push(['Temperature', record.vitals.temperature + ' °C']);
        if (record.vitals.oxygenSaturation)
          vitalsData.push([
            'O2 Saturation',
            record.vitals.oxygenSaturation + ' %',
          ]);
        if (record.vitals.weight)
          vitalsData.push(['Weight', record.vitals.weight + ' kg']);
        if (record.vitals.bmi) vitalsData.push(['BMI', record.vitals.bmi]);

        if (vitalsData.length > 0) {
          autoTable(doc, {
            startY: currentY,
            body: vitalsData,
            theme: 'grid',
            styles: {
              fontSize: 8,
              cellPadding: 2,
            },
            columnStyles: {
              0: { cellWidth: 50, fontStyle: 'bold' },
              1: { cellWidth: 40, halign: 'center' },
            },
            margin: { left: margin + 10 },
          });

          currentY = doc.lastAutoTable.finalY + 5;
        }
      }

      // Related Admission
      if (record.relatedAdmission) {
        checkNewPage(60);

        const admission = record.relatedAdmission;

        doc.setFillColor(255, 243, 224);
        doc.roundedRect(
          margin + 5,
          currentY,
          pageWidth - 2 * margin - 10,
          8,
          2,
          2,
          'F',
        );

        doc.setTextColor(217, 119, 6);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('HOSPITAL ADMISSION', margin + 10, currentY + 5.5);

        currentY += 10;

        const admissionInfo = [
          ['Admission Number', admission.admissionNumber],
          [
            'Admission Date',
            new Date(admission.admissionDate).toLocaleString(),
          ],
          ['Status', admission.status],
          ['Type', admission.admissionType],
          ['Attending Doctor', admission.doctor],
          ['Length of Stay', `${admission.lengthOfStay} days`],
        ];

        if (admission.diagnosis) {
          admissionInfo.push(['Admission Diagnosis', admission.diagnosis]);
        }
        if (admission.dischargeDate) {
          admissionInfo.push([
            'Discharge Date',
            new Date(admission.dischargeDate).toLocaleString(),
          ]);
        }
        if (admission.dischargeSummary) {
          admissionInfo.push(['Discharge Summary', admission.dischargeSummary]);
        }

        autoTable(doc, {
          startY: currentY,
          body: admissionInfo,
          theme: 'striped',
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold' },
            1: { cellWidth: 105 },
          },
          alternateRowStyles: {
            fillColor: [255, 251, 245],
          },
          margin: { left: margin + 10 },
        });

        currentY = doc.lastAutoTable.finalY + 5;

        // Progress Notes
        if (
          admission.recentProgressNotes &&
          admission.recentProgressNotes.length > 0
        ) {
          checkNewPage(40);

          doc.setFillColor(243, 232, 255);
          doc.roundedRect(
            margin + 10,
            currentY,
            pageWidth - 2 * margin - 20,
            7,
            2,
            2,
            'F',
          );

          doc.setTextColor(147, 51, 234);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(
            `PROGRESS NOTES (${admission.progressNotesCount} total)`,
            margin + 15,
            currentY + 4.5,
          );

          currentY += 9;

          admission.recentProgressNotes.forEach((note, noteIndex) => {
            if (noteIndex < 5) {
              // Limit to 5 notes to save space
              checkNewPage(35);

              doc.setFontSize(8);
              doc.setTextColor(...colors.secondary);
              doc.setFont('helvetica', 'bold');
              doc.text(
                `Note ${noteIndex + 1} - ${note.noteType} - ${new Date(note.noteDate).toLocaleString()}`,
                margin + 15,
                currentY,
              );

              if (note.recordedBy) {
                doc.setFont('helvetica', 'italic');
                doc.text(`By: ${note.recordedBy}`, margin + 15, currentY + 4);
              }

              currentY += 7;

              const noteContent = [];
              if (note.subjective)
                noteContent.push(['Subjective', note.subjective]);
              if (note.objective)
                noteContent.push(['Objective', note.objective]);
              if (note.assessment)
                noteContent.push(['Assessment', note.assessment]);
              if (note.plan) noteContent.push(['Plan', note.plan]);

              if (noteContent.length > 0) {
                autoTable(doc, {
                  startY: currentY,
                  body: noteContent,
                  theme: 'plain',
                  styles: {
                    fontSize: 7,
                    cellPadding: 1,
                  },
                  columnStyles: {
                    0: {
                      cellWidth: 25,
                      fontStyle: 'bold',
                      textColor: [147, 51, 234],
                    },
                    1: { cellWidth: 120 },
                  },
                  margin: { left: margin + 15 },
                });

                currentY = doc.lastAutoTable.finalY + 4;
              }
            }
          });

          if (admission.progressNotesCount > 5) {
            doc.setFontSize(7);
            doc.setFont('helvetica', 'italic');
            doc.setTextColor(...colors.darkGray);
            doc.text(
              `... and ${admission.progressNotesCount - 5} more progress notes`,
              margin + 15,
              currentY,
            );
            currentY += 5;
          }
        }

        // Prescriptions
        if (admission.prescriptions && admission.prescriptions.length > 0) {
          checkNewPage(40);

          doc.setFillColor(220, 252, 231);
          doc.roundedRect(
            margin + 10,
            currentY,
            pageWidth - 2 * margin - 20,
            7,
            2,
            2,
            'F',
          );

          doc.setTextColor(22, 163, 74);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text(
            `PRESCRIPTIONS (${admission.prescriptions.length} total)`,
            margin + 15,
            currentY + 4.5,
          );

          currentY += 9;

          admission.prescriptions.forEach((rx, rxIndex) => {
            checkNewPage(30);

            doc.setFontSize(8);
            doc.setTextColor(...colors.secondary);
            doc.setFont('helvetica', 'bold');
            doc.text(
              `Rx ${rxIndex + 1} - ${rx.prescriptionNumber} - ${new Date(rx.prescriptionDate).toLocaleDateString()}`,
              margin + 15,
              currentY,
            );
            doc.setFont('helvetica', 'normal');
            doc.text(`Status: ${rx.status}`, margin + 15, currentY + 4);

            currentY += 8;

            if (rx.items && rx.items.length > 0) {
              const rxData = rx.items.map(item => [
                item.medicationName,
                item.dosage,
                item.frequency,
                item.route,
                item.duration,
                item.dispensed ? '✓' : '✗',
              ]);

              autoTable(doc, {
                startY: currentY,
                head: [
                  [
                    'Medication',
                    'Dosage',
                    'Frequency',
                    'Route',
                    'Duration',
                    'Disp.',
                  ],
                ],
                body: rxData,
                theme: 'grid',
                headStyles: {
                  fillColor: [22, 163, 74],
                  fontSize: 7,
                },
                styles: {
                  fontSize: 7,
                  cellPadding: 1,
                },
                columnStyles: {
                  0: { cellWidth: 40 },
                  1: { cellWidth: 25 },
                  2: { cellWidth: 30 },
                  3: { cellWidth: 20 },
                  4: { cellWidth: 20 },
                  5: { cellWidth: 10, halign: 'center' },
                },
                margin: { left: margin + 15 },
              });

              currentY = doc.lastAutoTable.finalY + 4;

              // Add instructions if available
              rx.items.forEach((item, itemIdx) => {
                if (item.instructions) {
                  doc.setFontSize(7);
                  doc.setFont('helvetica', 'italic');
                  doc.setTextColor(...colors.darkGray);
                  doc.text(
                    `${item.medicationName}: ${item.instructions}`,
                    margin + 15,
                    currentY,
                  );
                  currentY += 3;
                }
              });
            }

            currentY += 3;
          });
        }
      }

      // Separator between records
      currentY += 5;
      doc.setDrawColor(...colors.lightGray);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
    });

    // Final summary page
    checkNewPage(60);
    addSectionHeader('DOCUMENT SUMMARY');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.secondary);

    const summaryPoints = [
      `• This comprehensive medical record contains ${records.length} entries`,
      `• Generated on ${new Date().toLocaleString()}`,
      `• Includes detailed clinical information, vitals, diagnoses, and treatment plans`,
      `• Contains ${stats.totalAdmissions} hospital admission(s) with full details`,
      `• Includes ${stats.totalPrescriptions} prescription(s) across all records`,
      `• Contains ${stats.totalProgressNotes} progress note(s) from admissions`,
      `• All information is protected under HIPAA regulations`,
      `• For medical and administrative purposes only`,
    ];

    summaryPoints.forEach((point, idx) => {
      doc.text(point, margin + 5, currentY + idx * 6);
    });

    currentY += summaryPoints.length * 6 + 10;

    // Legal disclaimer
    doc.setFillColor(255, 243, 224);
    doc.roundedRect(margin, currentY, pageWidth - 2 * margin, 20, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 119, 6);
    doc.text('IMPORTANT NOTICE', margin + 5, currentY + 6);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...colors.secondary);
    doc.text(
      'This document contains Protected Health Information (PHI) and is subject to federal and state privacy laws.',
      margin + 5,
      currentY + 11,
    );
    doc.text(
      'Unauthorized access, use, or disclosure may result in civil and criminal penalties.',
      margin + 5,
      currentY + 15,
    );

    // Add final footer
    addFooter();

    // Save the PDF
    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  /**
   * Calculate statistics from records
   */
  calculateStatistics(records) {
    const stats = {
      totalAppointments: 0,
      totalAdmissions: 0,
      totalPrescriptions: 0,
      totalProgressNotes: 0,
      completedRecords: 0,
      activeRecords: 0,
    };

    records.forEach(record => {
      if (record.type === 'appointment') stats.totalAppointments++;
      if (record.type === 'admission') stats.totalAdmissions++;
      if (record.relatedAdmission) stats.totalAdmissions++;

      if (record.status === 'completed') stats.completedRecords++;
      if (record.status === 'active') stats.activeRecords++;

      if (record.relatedAdmission) {
        stats.totalProgressNotes +=
          record.relatedAdmission.progressNotesCount || 0;
        stats.totalPrescriptions +=
          record.relatedAdmission.prescriptions?.length || 0;
      }
    });

    return stats;
  }

  /**
   * Get icon for record type
   */
  getRecordIcon(type) {
    const icons = {
      appointment: '📅',
      admission: '🏥',
      medical_record: '📋',
      lab_result: '🧪',
      imaging: '🔬',
    };
    return icons[type] || '📄';
  }

  /**
   * Prepare records for export with all nested data
   */
  prepareMedicalRecordsForExport(records, patientInfo = {}) {
    return records.map(record => ({
      // Basic info
      id: record.id,
      type: record.type,
      date: record.date,
      title: record.title,
      status: record.status,

      // Clinical info
      chiefComplaint: record.chiefComplaint,
      diagnosis: record.diagnosis,
      treatmentPlan: record.treatmentPlan,
      disposition: record.disposition,

      // Provider info
      doctor: record.doctor,

      // Vitals
      vitals: record.vitals,

      // Admission details (nested)
      relatedAdmission: record.relatedAdmission
        ? {
            admissionNumber: record.relatedAdmission.admissionNumber,
            admissionDate: record.relatedAdmission.admissionDate,
            status: record.relatedAdmission.status,
            admissionType: record.relatedAdmission.admissionType,
            diagnosis: record.relatedAdmission.diagnosis,
            doctor: record.relatedAdmission.doctor,
            lengthOfStay: record.relatedAdmission.lengthOfStay,
            dischargeDate: record.relatedAdmission.dischargeDate,
            dischargeSummary: record.relatedAdmission.dischargeSummary,

            // Progress notes
            progressNotes: record.relatedAdmission.recentProgressNotes,
            progressNotesCount: record.relatedAdmission.progressNotesCount,

            // Prescriptions
            prescriptions: record.relatedAdmission.prescriptions,
          }
        : null,

      // Metadata
      exportDate: new Date().toISOString(),
      patientInfo: patientInfo,
    }));
  }
}

export default new exportService();
