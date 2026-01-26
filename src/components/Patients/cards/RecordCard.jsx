import { useState } from 'react';
import {
  Calendar,
  Stethoscope,
  Activity,
  Pill,
  FileText,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
} from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import Badge from '../../ui/badge';

const RecordCard = ({ record, isDarkMode, viewType = 'timeline' }) => {
  const [expanded, setExpanded] = useState(false);

  // Extract data based on view type
  const getRecordData = () => {
    if (viewType === 'timeline') {
      return {
        type: record.type,
        date: record.record_date || record.date,
        data: record.data || record,
        source: record.source,
        id: record.id,
      };
    }

    // For non-timeline views, the record IS the data
    return {
      type: viewType === 'medical' ? 'medical_record' : viewType.slice(0, -1),
      date:
        record.record_date ||
        record.appointment_date ||
        record.prescription_date ||
        record.created_at,
      data: record,
      source: 'appointment',
      id: null,
    };
  };

  const recordData = getRecordData();
  const { type, date, data, source } = recordData;

  const getRecordIcon = () => {
    switch (type) {
      case 'appointment':
        return Calendar;
      case 'diagnosis':
        return Stethoscope;
      case 'vitals':
        return Activity;
      case 'prescription':
        return Pill;
      case 'consultation':
      case 'lab_result':
      case 'imaging':
      case 'procedure':
      case 'medical_record':
        return FileText;
      default:
        return FileText;
    }
  };

  const getRecordTitle = () => {
    switch (type) {
      case 'appointment':
        return `Appointment - ${data.appointment_type || 'Consultation'}`;
      case 'diagnosis':
        return 'Diagnosis';
      case 'vitals':
        return 'Vital Signs';
      case 'prescription':
        return `Prescription ${data.prescription_number || ''}`;
      case 'consultation':
        return 'Consultation Note';
      case 'lab_result':
        return 'Lab Result';
      case 'imaging':
        return 'Imaging Report';
      case 'procedure':
        return 'Procedure Report';
      default:
        return 'Medical Record';
    }
  };

  const getRecordBadgeColor = () => {
    switch (type) {
      case 'appointment':
        return 'primary';
      case 'diagnosis':
        return 'danger';
      case 'vitals':
        return 'success';
      case 'prescription':
        return 'warning';
      case 'consultation':
        return 'info';
      default:
        return 'default';
    }
  };

  const Icon = getRecordIcon();
  const badgeColor = getRecordBadgeColor();

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      ' ' +
      date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    );
  };

  return (
    <div
      className={`rounded-lg border transition-all hover:shadow-md ${expanded ? 'shadow-sm' : ''}`}
      style={{
        backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
        borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
      }}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div
              className="p-2 rounded-lg flex-shrink-0"
              style={{
                backgroundColor: isDarkMode
                  ? `${COLORS[badgeColor] || COLORS.primary}20`
                  : `${COLORS[badgeColor] || COLORS.primary}10`,
              }}
            >
              <Icon
                className="w-5 h-5"
                style={{
                  color: COLORS[badgeColor] || COLORS.primary,
                }}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3
                  className="font-semibold truncate"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {getRecordTitle()}
                </h3>
                <Badge variant={badgeColor} size="sm">
                  {type.replace('_', ' ').charAt(0).toUpperCase() +
                    type.slice(1)}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span
                  className="flex items-center gap-1"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  <Clock className="w-3 h-3" />
                  {formatDate(date)}
                </span>

                {source && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Source: {source.replace('_', ' ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors flex-shrink-0"
            onClick={e => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
          >
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div
          className="px-4 pb-4 border-t pt-4"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          {/* Render content based on record type */}
          {type === 'appointment' && (
            <AppointmentContent data={data} isDarkMode={isDarkMode} />
          )}

          {type === 'diagnosis' && (
            <DiagnosisContent data={data} isDarkMode={isDarkMode} />
          )}

          {type === 'vitals' && (
            <VitalsContent data={data} isDarkMode={isDarkMode} />
          )}

          {type === 'prescription' && (
            <PrescriptionContent data={data} isDarkMode={isDarkMode} />
          )}

          {/* Add other content types as needed */}
        </div>
      )}
    </div>
  );
};

// Sub-components for different record types
const AppointmentContent = ({ data, isDarkMode }) => {
  console.log(data);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <InfoItem
          label="Appointment Type"
          value={data.appointment_type}
          isDarkMode={isDarkMode}
        />
        <InfoItem label="Status" value={data.status} isDarkMode={isDarkMode} />
      </div>
      {data.diagnosis && (
        <div>
          <h4 className="font-medium mb-1">Diagnosis</h4>
          <p className="text-sm">{data.diagnosis.primary_diagnosis}</p>
        </div>
      )}
    </div>
  );
};

const DiagnosisContent = ({ data, isDarkMode }) => (
  <div className="space-y-3">
    <InfoItem
      label="Chief Complaint"
      value={data.chief_complaint}
      isDarkMode={isDarkMode}
    />
    <InfoItem
      label="Primary Diagnosis"
      value={data.primary_diagnosis}
      isDarkMode={isDarkMode}
    />
    {data.icd_10_code && (
      <InfoItem
        label="ICD-10 Code"
        value={data.icd_10_code}
        isDarkMode={isDarkMode}
      />
    )}
    {data.treatment_plan && (
      <InfoItem
        label="Treatment Plan"
        value={data.treatment_plan}
        isDarkMode={isDarkMode}
        span={2}
      />
    )}
  </div>
);

const VitalsContent = ({ data, isDarkMode }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {data.temperature && (
      <InfoItem
        label="Temperature"
        value={`${data.temperature}°C`}
        isDarkMode={isDarkMode}
      />
    )}
    {data.blood_pressure_systolic && data.blood_pressure_diastolic && (
      <InfoItem
        label="Blood Pressure"
        value={`${data.blood_pressure_systolic}/${data.blood_pressure_diastolic} mmHg`}
        isDarkMode={isDarkMode}
      />
    )}
    {data.heart_rate && (
      <InfoItem
        label="Heart Rate"
        value={`${data.heart_rate} bpm`}
        isDarkMode={isDarkMode}
      />
    )}
    {data.respiratory_rate && (
      <InfoItem
        label="Respiratory Rate"
        value={`${data.respiratory_rate} bpm`}
        isDarkMode={isDarkMode}
      />
    )}
    {data.oxygen_saturation && (
      <InfoItem
        label="O2 Saturation"
        value={`${data.oxygen_saturation}%`}
        isDarkMode={isDarkMode}
      />
    )}
    {data.pain_level && (
      <InfoItem
        label="Pain Level"
        value={`${data.pain_level}/10`}
        isDarkMode={isDarkMode}
      />
    )}
  </div>
);

const PrescriptionContent = ({ data, isDarkMode }) => (
  <div className="space-y-3">
    <div className="grid grid-cols-2 gap-3">
      <InfoItem
        label="Prescription #"
        value={data.prescription_number}
        isDarkMode={isDarkMode}
      />
      <InfoItem
        label="Status"
        value={data.prescription_status}
        isDarkMode={isDarkMode}
      />
    </div>
    {data.notes && (
      <InfoItem
        label="Notes"
        value={data.notes}
        isDarkMode={isDarkMode}
        span={2}
      />
    )}
    {data.items && data.items.length > 0 && (
      <div>
        <h4 className="font-medium mb-2">Medications</h4>
        <div className="space-y-2">
          {data.items.map((item, index) => (
            <div
              key={index}
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded"
            >
              <p className="font-medium">{item.medication_name}</p>
              <p className="text-sm">
                {item.dosage} • {item.frequency} • {item.duration}
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const InfoItem = ({ label, value, isDarkMode, span = 1 }) => (
  <div className={`col-span-${span}`}>
    <p
      className="text-xs font-medium mb-1"
      style={{ color: isDarkMode ? COLORS.text.light : COLORS.text.secondary }}
    >
      {label}
    </p>
    <p
      className="text-sm"
      style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
    >
      {value || 'N/A'}
    </p>
  </div>
);

export default RecordCard;
