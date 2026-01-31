import { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Activity,
  Heart,
  Droplet,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  Pill,
  ClipboardList,
  ThermometerSun,
  Weight,
  Ruler,
  AlertTriangle,
  Clock,
  Stethoscope,
  CheckCircle,
  XCircle,
  Circle,
  TrendingUp,
  CalendarCheck,
} from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import { formatDate, formatDateTime } from '../../../utils/dateFormatter';

const TimelineCard = ({
  record,
  isDarkMode,
  isExpanded,
  onToggle,
  userRole = 'patient',
}) => {
  const [expandedSections, setExpandedSections] = useState({
    vitals: false,
    diagnosis: false,
    admission: false,
    prescriptions: false,
    progressNotes: false,
  });

  useEffect(() => {
    if (!isExpanded) {
      setExpandedSections({
        vitals: false,
        diagnosis: false,
        admission: false,
        prescriptions: false,
        progressNotes: false,
      });
    }
  }, [isExpanded]);

  const toggleSection = (section, e) => {
    e.stopPropagation();
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusColor = status => {
    const colors = {
      completed: { bg: '#dcfce7', text: '#166534', Icon: CheckCircle },
      scheduled: { bg: '#dbeafe', text: '#1e40af', Icon: CalendarCheck },
      in_progress: { bg: '#fef3c7', text: '#92400e', Icon: Clock },
      cancelled: { bg: '#fee2e2', text: '#991b1b', Icon: XCircle },
      active: { bg: '#dcfce7', text: '#166534', Icon: Activity },
      discharged: { bg: '#f3f4f6', text: '#4b5563', Icon: TrendingUp },
    };
    return colors[status] || { bg: '#f3f4f6', text: '#6b7280', Icon: Circle };
  };

  const getTypeIcon = () => {
    switch (record.type) {
      case 'appointment':
        return <Calendar size={20} />;
      case 'admission':
        return <Building2 size={20} />;
      case 'medical_record':
        return <FileText size={20} />;
      default:
        return <Activity size={20} />;
    }
  };

  const getTypeColor = () => {
    switch (record.type) {
      case 'appointment':
        return { bg: '#f0f9ff', icon: '#0284c7' };
      case 'admission':
        return { bg: '#fef3c7', icon: '#d97706' };
      case 'medical_record':
        return { bg: '#f3e8ff', icon: '#9333ea' };
      default:
        return { bg: '#f3f4f6', icon: '#6b7280' };
    }
  };

  const renderVitals = vitals => {
    if (!vitals) return null;

    const vitalItems = [
      {
        icon: ThermometerSun,
        label: 'Temperature',
        value: vitals.temperature,
        unit: '°C',
        color: '#ef4444',
      },
      {
        icon: Heart,
        label: 'Blood Pressure',
        value: vitals.bloodPressure,
        unit: 'mmHg',
        color: '#ec4899',
      },
      {
        icon: Activity,
        label: 'Heart Rate',
        value: vitals.heartRate,
        unit: 'bpm',
        color: '#f59e0b',
      },
      {
        icon: Droplet,
        label: 'O₂ Saturation',
        value: vitals.oxygenSaturation,
        unit: '%',
        color: '#3b82f6',
      },
      {
        icon: Weight,
        label: 'Weight',
        value: vitals.weight,
        unit: 'kg',
        color: '#8b5cf6',
      },
      {
        icon: Ruler,
        label: 'Height',
        value: vitals.height,
        unit: 'cm',
        color: '#06b6d4',
      },
      {
        icon: Activity,
        label: 'BMI',
        value: vitals.bmi,
        unit: '',
        color: '#10b981',
      },
      {
        icon: AlertTriangle,
        label: 'Pain Level',
        value: vitals.painLevel,
        unit: '/10',
        color: '#f97316',
      },
    ].filter(item => item.value !== null && item.value !== undefined);

    return (
      <div className="space-y-2">
        <button
          onClick={e => toggleSection('vitals', e)}
          className="w-full flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f0f9ff',
            border: `1px solid ${isDarkMode ? COLORS.border.dark : '#bfdbfe'}`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#dbeafe' }}
            >
              <Activity size={16} style={{ color: '#0284c7' }} />
            </div>
            <span
              className="font-semibold text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Vital Signs
            </span>
          </div>
          {expandedSections.vitals ? (
            <ChevronUp size={16} style={{ color: '#0284c7' }} />
          ) : (
            <ChevronDown size={16} style={{ color: '#0284c7' }} />
          )}
        </button>

        {expandedSections.vitals && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {vitalItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg border"
                  style={{
                    backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
                    borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon size={14} style={{ color: item.color }} />
                    <div
                      className="text-xs font-medium"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      {item.label}
                    </div>
                  </div>
                  <div
                    className="text-lg font-bold"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    {item.value}
                    <span className="text-xs font-normal ml-1 opacity-60">
                      {item.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderAdmission = admission => {
    if (!admission) return null;

    const statusConfig = getStatusColor(admission.status);
    const StatusIcon = statusConfig.Icon;

    return (
      <div className="space-y-2 mt-3">
        <button
          onClick={e => toggleSection('admission', e)}
          className="w-full flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#fef3c7',
            border: `1px solid ${isDarkMode ? COLORS.border.dark : '#fde68a'}`,
          }}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: '#fde68a' }}
            >
              <Building2 size={16} style={{ color: '#d97706' }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="font-semibold text-sm"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Related Admission
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"
                  style={{
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.text,
                  }}
                >
                  <StatusIcon size={12} />
                  {admission.status}
                </span>
              </div>
              <div
                className="text-xs mt-0.5 truncate"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                {admission.admissionNumber}
              </div>
            </div>
          </div>
          {expandedSections.admission ? (
            <ChevronUp
              size={16}
              className="flex-shrink-0"
              style={{ color: '#d97706' }}
            />
          ) : (
            <ChevronDown
              size={16}
              className="flex-shrink-0"
              style={{ color: '#d97706' }}
            />
          )}
        </button>

        {expandedSections.admission && (
          <div
            className="p-4 space-y-3 rounded-lg border animate-in fade-in slide-in-from-top-2 duration-200"
            style={{
              backgroundColor: isDarkMode ? COLORS.surface.dark : '#fffbeb',
              borderColor: isDarkMode ? COLORS.border.dark : '#fde68a',
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoItem
                icon={Calendar}
                label="Admission Date"
                value={formatDateTime(admission.admissionDate)}
                isDarkMode={isDarkMode}
              />
              <InfoItem
                icon={FileText}
                label="Type"
                value={admission.admissionType}
                isDarkMode={isDarkMode}
                capitalize
              />
              <InfoItem
                icon={User}
                label="Attending Doctor"
                value={admission.doctor}
                isDarkMode={isDarkMode}
              />
              <InfoItem
                icon={Clock}
                label="Length of Stay"
                value={
                  admission.lengthOfStay
                    ? `${admission.lengthOfStay} day(s)`
                    : 'N/A'
                }
                isDarkMode={isDarkMode}
              />
            </div>

            {admission.diagnosis && (
              <div
                className="p-3 rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : 'white',
                }}
              >
                <div
                  className="text-xs font-medium mb-1 flex items-center gap-1"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  <Stethoscope size={14} />
                  Admission Diagnosis
                </div>
                <div
                  className="text-sm font-medium"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {admission.diagnosis}
                </div>
              </div>
            )}

            {admission.dischargeDate && (
              <div className="space-y-2">
                <InfoItem
                  icon={Calendar}
                  label="Discharge Date"
                  value={formatDateTime(admission.dischargeDate)}
                  isDarkMode={isDarkMode}
                />
                {admission.dischargeSummary && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.darkHover
                        : 'white',
                    }}
                  >
                    <div
                      className="text-xs font-medium mb-1"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      Discharge Summary
                    </div>
                    <div
                      className="text-sm"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {admission.dischargeSummary}
                    </div>
                  </div>
                )}
              </div>
            )}

            {admission.prescriptions && admission.prescriptions.length > 0 && (
              <div className="mt-3">
                {renderPrescriptions(admission.prescriptions, true)}
              </div>
            )}

            {admission.recentProgressNotes &&
              admission.recentProgressNotes.length > 0 && (
                <div className="mt-3">
                  {renderProgressNotes(admission.recentProgressNotes)}
                </div>
              )}
          </div>
        )}
      </div>
    );
  };

  const renderPrescriptions = (prescriptions, isNested = false) => {
    if (!prescriptions || prescriptions.length === 0) return null;

    return (
      <div className={isNested ? 'space-y-2' : 'space-y-2 mt-3'}>
        <button
          onClick={e => toggleSection('prescriptions', e)}
          className="w-full flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#f0fdf4',
            border: `1px solid ${isDarkMode ? COLORS.border.dark : '#bbf7d0'}`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#bbf7d0' }}
            >
              <Pill size={16} style={{ color: '#16a34a' }} />
            </div>
            <span
              className="font-semibold text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Prescriptions ({prescriptions.length})
            </span>
          </div>
          {expandedSections.prescriptions ? (
            <ChevronUp size={16} style={{ color: '#16a34a' }} />
          ) : (
            <ChevronDown size={16} style={{ color: '#16a34a' }} />
          )}
        </button>

        {expandedSections.prescriptions && (
          <div className="space-y-3 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {prescriptions.map((prescription, idx) => {
              const statusConfig = getStatusColor(prescription.status);
              const StatusIcon = statusConfig.Icon;
              return (
                <div
                  key={prescription.prescriptionId || idx}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
                    borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div
                        className="text-xs font-mono mb-1"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        {prescription.prescriptionNumber}
                      </div>
                      <div
                        className="text-sm font-medium flex items-center gap-1"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        <Calendar size={12} />
                        {formatDate(prescription.prescriptionDate)}
                      </div>
                    </div>
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
                      style={{
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.text,
                      }}
                    >
                      <StatusIcon size={12} />
                      {prescription.status}
                    </span>
                  </div>

                  {prescription.items && prescription.items.length > 0 && (
                    <div className="space-y-2">
                      {prescription.items.map((item, itemIdx) => (
                        <div
                          key={item.itemId || itemIdx}
                          className="p-3 rounded-lg"
                          style={{
                            backgroundColor: isDarkMode
                              ? COLORS.surface.darkHover
                              : '#f9fafb',
                          }}
                        >
                          <div
                            className="font-semibold text-sm mb-2 flex items-center gap-2"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            <Pill size={16} style={{ color: '#16a34a' }} />
                            {item.medicationName}
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="opacity-60">Dosage:</span>
                              <span className="font-medium">{item.dosage}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="opacity-60">Frequency:</span>
                              <span className="font-medium">
                                {item.frequency}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="opacity-60">Route:</span>
                              <span className="font-medium">{item.route}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="opacity-60">Duration:</span>
                              <span className="font-medium">
                                {item.duration}
                              </span>
                            </div>
                          </div>
                          {item.instructions && (
                            <div
                              className="mt-2 p-2 rounded text-xs flex items-start gap-2"
                              style={{
                                backgroundColor: isDarkMode
                                  ? COLORS.surface.dark
                                  : '#eff6ff',
                                color: isDarkMode
                                  ? COLORS.text.light
                                  : '#1e40af',
                              }}
                            >
                              <FileText
                                size={12}
                                className="mt-0.5 flex-shrink-0"
                              />
                              <div>
                                <span className="font-medium">
                                  Instructions:
                                </span>{' '}
                                {item.instructions}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderProgressNotes = notes => {
    if (!notes || notes.length === 0) return null;

    // For patients, we might want to show a simplified view
    const isPatient = userRole === 'patient';

    return (
      <div className="space-y-2">
        <button
          onClick={e => toggleSection('progressNotes', e)}
          className="w-full flex items-center justify-between p-3 rounded-lg transition-all hover:shadow-sm"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#faf5ff',
            border: `1px solid ${isDarkMode ? COLORS.border.dark : '#e9d5ff'}`,
          }}
        >
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#e9d5ff' }}
            >
              <ClipboardList size={16} style={{ color: '#9333ea' }} />
            </div>
            <span
              className="font-semibold text-sm"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Progress Notes ({notes.length})
            </span>
          </div>
          {expandedSections.progressNotes ? (
            <ChevronUp size={16} style={{ color: '#9333ea' }} />
          ) : (
            <ChevronDown size={16} style={{ color: '#9333ea' }} />
          )}
        </button>

        {expandedSections.progressNotes && (
          <div className="space-y-2 p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            {notes.map((note, idx) => {
              // For patients, show summary first
              if (isPatient && note.summary) {
                return (
                  <div
                    key={note.noteId || idx}
                    className="p-4 rounded-lg border"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.dark
                        : 'white',
                      borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
                    }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div
                          className="text-sm font-semibold capitalize flex items-center gap-2"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          <ClipboardList size={16} />
                          {note.noteType || 'Progress Note'}
                        </div>
                        <div
                          className="text-xs mt-1 flex items-center gap-2"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                          }}
                        >
                          <Clock size={12} />
                          {formatDateTime(note.noteDate)}
                        </div>
                      </div>
                      {note.isCritical && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Critical
                        </span>
                      )}
                    </div>

                    {/* Show summary for patients */}
                    <div className="mb-3">
                      <div
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        {note.summary}
                      </div>
                    </div>

                    {/* If patient can view details, show expandable sections */}
                    {note.canViewDetails && (
                      <div className="space-y-2">
                        {note.subjective && (
                          <NoteSection
                            label="S - Subjective"
                            content={note.subjective}
                            isDarkMode={isDarkMode}
                          />
                        )}
                        {note.objective && (
                          <NoteSection
                            label="O - Objective"
                            content={note.objective}
                            isDarkMode={isDarkMode}
                          />
                        )}
                        {note.assessment && (
                          <NoteSection
                            label="A - Assessment"
                            content={note.assessment}
                            isDarkMode={isDarkMode}
                          />
                        )}
                        {note.plan && (
                          <NoteSection
                            label="P - Plan"
                            content={note.plan}
                            isDarkMode={isDarkMode}
                          />
                        )}
                      </div>
                    )}

                    {/* If patient cannot view full details, show message */}
                    {!note.canViewDetails && note.is_sensitive && (
                      <div
                        className="p-3 rounded-lg text-center text-sm italic"
                        style={{
                          backgroundColor: isDarkMode
                            ? COLORS.surface.darkHover
                            : '#f3f4f6',
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        Detailed clinical notes are available to your healthcare
                        team.
                      </div>
                    )}
                  </div>
                );
              }

              // For doctors/healthcare providers, show full details
              return (
                <div
                  key={note.noteId || idx}
                  className="p-4 rounded-lg border-l-4"
                  style={{
                    backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
                    borderColor: note.isCritical ? '#ef4444' : '#9333ea',
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div
                        className="text-sm font-semibold capitalize flex items-center gap-2"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        <ClipboardList size={16} />
                        {note.noteType}
                      </div>
                      <div
                        className="text-xs mt-1 flex items-center gap-2"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.secondary,
                        }}
                      >
                        <Clock size={12} />
                        {formatDateTime(note.noteDate)}
                        <span>•</span>
                        <User size={12} />
                        {note.recordedBy}
                      </div>
                    </div>
                    {note.isCritical && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                        <AlertTriangle size={12} />
                        Critical
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm">
                    {note.subjective && (
                      <NoteSection
                        label="S - Subjective"
                        content={note.subjective}
                        isDarkMode={isDarkMode}
                      />
                    )}
                    {note.objective && (
                      <NoteSection
                        label="O - Objective"
                        content={note.objective}
                        isDarkMode={isDarkMode}
                      />
                    )}
                    {note.assessment && (
                      <NoteSection
                        label="A - Assessment"
                        content={note.assessment}
                        isDarkMode={isDarkMode}
                      />
                    )}
                    {note.plan && (
                      <NoteSection
                        label="P - Plan"
                        content={note.plan}
                        isDarkMode={isDarkMode}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const statusConfig = getStatusColor(record.status);
  const typeColor = getTypeColor();
  const StatusIcon = statusConfig.Icon;

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all hover:shadow-md"
      style={{
        backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
        borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
      }}
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer transition-colors hover:bg-opacity-50"
        onClick={onToggle}
        style={{
          backgroundColor: isExpanded
            ? isDarkMode
              ? COLORS.surface.darkHover
              : '#f9fafb'
            : 'transparent',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="p-2.5 rounded-xl flex-shrink-0 shadow-sm"
              style={{ backgroundColor: typeColor.bg }}
            >
              <div style={{ color: typeColor.icon }}>{getTypeIcon()}</div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <h4
                  className="font-bold text-base"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  {record.title}
                </h4>
                {record.status && (
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1"
                    style={{
                      backgroundColor: statusConfig.bg,
                      color: statusConfig.text,
                    }}
                  >
                    <StatusIcon size={12} />
                    {record.status}
                  </span>
                )}
              </div>

              <div
                className="text-sm mb-2 flex items-center gap-1.5"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                <Calendar size={14} />
                {formatDateTime(record.date)}
              </div>

              {record.doctor && (
                <div
                  className="flex items-center gap-1.5 text-sm px-2.5 py-1 rounded-lg inline-flex"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.darkHover
                      : '#f3f4f6',
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  <User size={14} />
                  <span className="font-medium">{record.doctor}</span>
                </div>
              )}
            </div>
          </div>

          <button
            className="flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-opacity-50"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              backgroundColor: isExpanded
                ? isDarkMode
                  ? COLORS.surface.dark
                  : '#e5e7eb'
                : 'transparent',
            }}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="p-4 border-t space-y-3 animate-in fade-in slide-in-from-top-2 duration-200"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : '#e5e7eb',
          }}
        >
          {record.chiefComplaint && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.darkHover
                  : '#eff6ff',
              }}
            >
              <div
                className="text-xs font-semibold mb-1 flex items-center gap-1"
                style={{ color: isDarkMode ? COLORS.text.light : '#1e40af' }}
              >
                <AlertTriangle size={14} />
                Chief Complaint
              </div>
              <div
                className="text-sm font-medium"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {record.chiefComplaint}
              </div>
            </div>
          )}

          {record.diagnosis && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.darkHover
                  : '#fef3c7',
              }}
            >
              <div
                className="text-xs font-semibold mb-1 flex items-center gap-1"
                style={{ color: isDarkMode ? COLORS.text.light : '#92400e' }}
              >
                <Stethoscope size={14} />
                Diagnosis
              </div>
              <div
                className="text-sm font-medium"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {record.diagnosis}
              </div>
              {record.secondaryDiagnoses && (
                <div
                  className="text-xs mt-1.5 pt-1.5 border-t"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                    borderColor: isDarkMode ? COLORS.border.dark : '#fde68a',
                  }}
                >
                  <span className="font-medium">Secondary:</span>{' '}
                  {record.secondaryDiagnoses}
                </div>
              )}
            </div>
          )}

          {record.treatmentPlan && (
            <div
              className="p-3 rounded-lg"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.darkHover
                  : '#f0fdf4',
              }}
            >
              <div
                className="text-xs font-semibold mb-1 flex items-center gap-1"
                style={{ color: isDarkMode ? COLORS.text.light : '#166534' }}
              >
                <ClipboardList size={14} />
                Treatment Plan
              </div>
              <div
                className="text-sm"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {record.treatmentPlan}
              </div>
            </div>
          )}

          {record.vitals && renderVitals(record.vitals)}
          {record.relatedAdmission && renderAdmission(record.relatedAdmission)}
          {record.prescriptions &&
            !record.relatedAdmission &&
            renderPrescriptions(record.prescriptions)}

          {record.type === 'admission' && (
            <>
              {record.admissionNumber && (
                <InfoItem
                  icon={FileText}
                  label="Admission Number"
                  value={record.admissionNumber}
                  isDarkMode={isDarkMode}
                />
              )}
              {record.hasPrescriptions &&
                renderPrescriptions(record.prescriptions)}
              {record.hasProgressNotes &&
                renderProgressNotes(record.recentProgressNotes)}
            </>
          )}
        </div>
      )}
    </div>
  );
};

// Helper Components
const InfoItem = ({
  icon: Icon,
  label,
  value,
  isDarkMode,
  capitalize = false,
}) => (
  <div className="flex items-start gap-2">
    <Icon
      size={16}
      className="mt-0.5 flex-shrink-0"
      style={{ color: COLORS.primary }}
    />
    <div className="flex-1 min-w-0">
      <div
        className="text-xs font-medium mb-0.5"
        style={{
          color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
        }}
      >
        {label}
      </div>
      <div
        className={`text-sm font-semibold ${capitalize ? 'capitalize' : ''}`}
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        {value}
      </div>
    </div>
  </div>
);

const NoteSection = ({ label, content, isDarkMode }) => (
  <div
    className="p-2 rounded-lg"
    style={{
      backgroundColor: isDarkMode ? COLORS.surface.darkHover : '#fafbfc',
    }}
  >
    <div
      className="text-xs font-semibold mb-1"
      style={{ color: isDarkMode ? COLORS.text.light : '#6b7280' }}
    >
      {label}
    </div>
    <div
      className="text-sm leading-relaxed"
      style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
    >
      {content}
    </div>
  </div>
);

export default TimelineCard;
