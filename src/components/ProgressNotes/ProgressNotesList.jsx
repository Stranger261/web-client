import { useState } from 'react';
import {
  FileText,
  Clock,
  User,
  AlertCircle,
  Edit,
  Trash2,
  History,
  Activity,
} from 'lucide-react';
import { Button } from '../ui/button';
import Badge from '../ui/badge';
import { COLORS } from '../../configs/CONST';
import { LoadingSpinner } from '../ui/loading-spinner';

const ProgressNotesList = ({ notes, loading }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [expandedNoteId, setExpandedNoteId] = useState(null);

  const toggleExpand = noteId => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId);
  };

  const getNoteTypeColor = type => {
    switch (type) {
      case 'doctor_round':
        return COLORS.info;
      case 'nurse_note':
        return COLORS.success;
      case 'vital_signs':
        return COLORS.warning;
      case 'medication_admin':
        return COLORS.purple;
      case 'procedure':
        return COLORS.danger;
      case 'assessment':
        return COLORS.info;
      default:
        return COLORS.text.secondary;
    }
  };

  const getNoteTypeBadgeVariant = type => {
    switch (type) {
      case 'doctor_round':
        return 'primary';
      case 'nurse_note':
        return 'success';
      case 'vital_signs':
        return 'warning';
      case 'medication_admin':
        return 'info';
      case 'procedure':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatNoteType = type => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatDateTime = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRecorderName = recorder => {
    if (!recorder) return 'Unknown';
    const person = recorder.person;
    return `${person?.first_name || ''} ${person?.last_name || ''}`.trim();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText
          className="w-12 h-12 mx-auto mb-3"
          style={{ color: COLORS.text.secondary }}
        />
        <p
          className="text-lg font-medium"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          No progress notes yet
        </p>
        <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
          Add the first progress note to start tracking patient progress
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map(note => {
        const isExpanded = expandedNoteId === note.note_id;
        const recorderName = getRecorderName(note.recorder);
        const hasVitals =
          note.temperature || note.blood_pressure_systolic || note.heart_rate;

        return (
          <div
            key={note.note_id}
            className="p-4 rounded-lg border transition-all"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.dark
                : COLORS.surface.light,
              borderColor: note.is_critical
                ? COLORS.danger
                : isDarkMode
                  ? COLORS.border.dark
                  : COLORS.border.light,
              borderWidth: note.is_critical ? '2px' : '1px',
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: getNoteTypeColor(note.note_type) + '20',
                  }}
                >
                  <FileText
                    size={20}
                    style={{ color: getNoteTypeColor(note.note_type) }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={getNoteTypeBadgeVariant(note.note_type)}>
                      {formatNoteType(note.note_type)}
                    </Badge>

                    {note.is_critical && (
                      <Badge variant="danger" icon={AlertCircle} showIcon>
                        Critical
                      </Badge>
                    )}

                    {note.is_amended && (
                      <Badge variant="warning" icon={Edit} showIcon>
                        Amended
                      </Badge>
                    )}

                    {hasVitals && (
                      <Badge variant="success" icon={Activity} showIcon>
                        With Vitals
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-sm">
                    <User size={14} style={{ color: COLORS.text.secondary }} />
                    <span style={{ color: COLORS.text.secondary }}>
                      {recorderName}
                    </span>
                    <span style={{ color: COLORS.text.secondary }}>•</span>
                    <Clock size={14} style={{ color: COLORS.text.secondary }} />
                    <span style={{ color: COLORS.text.secondary }}>
                      {formatDateTime(note.note_date)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleExpand(note.note_id)}
              >
                {isExpanded ? 'Collapse' : 'Expand'}
              </Button>
            </div>

            {/* Preview (Always visible) */}
            {!isExpanded && (
              <div className="space-y-2">
                {note.subjective && (
                  <p
                    className="text-sm line-clamp-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.primary,
                    }}
                  >
                    <span className="font-semibold">S:</span> {note.subjective}
                  </p>
                )}
                {note.assessment && (
                  <p
                    className="text-sm line-clamp-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.light
                        : COLORS.text.primary,
                    }}
                  >
                    <span className="font-semibold">A:</span> {note.assessment}
                  </p>
                )}
              </div>
            )}

            {/* Expanded Content */}
            {isExpanded && (
              <div className="space-y-4 mt-4">
                {/* SOAP Notes */}
                <div
                  className="p-3 rounded-lg space-y-3"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.lightHover,
                  }}
                >
                  <h4
                    className="text-sm font-semibold flex items-center gap-2"
                    style={{
                      color: isDarkMode
                        ? COLORS.text.white
                        : COLORS.text.primary,
                    }}
                  >
                    <FileText size={16} />
                    SOAP Notes
                  </h4>

                  {note.subjective && (
                    <div>
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Subjective
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.primary,
                        }}
                      >
                        {note.subjective}
                      </p>
                    </div>
                  )}

                  {note.objective && (
                    <div>
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Objective
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.primary,
                        }}
                      >
                        {note.objective}
                      </p>
                    </div>
                  )}

                  {note.assessment && (
                    <div>
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Assessment
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.primary,
                        }}
                      >
                        {note.assessment}
                      </p>
                    </div>
                  )}

                  {note.plan && (
                    <div>
                      <p
                        className="text-xs font-semibold mb-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Plan
                      </p>
                      <p
                        className="text-sm"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.primary,
                        }}
                      >
                        {note.plan}
                      </p>
                    </div>
                  )}
                </div>

                {/* Vital Signs */}
                {hasVitals && (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.darkHover
                        : COLORS.surface.lightHover,
                    }}
                  >
                    <h4
                      className="text-sm font-semibold mb-3 flex items-center gap-2"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      <Activity size={16} />
                      Vital Signs
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {note.temperature && (
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            Temperature
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {note.temperature}°C
                          </p>
                        </div>
                      )}

                      {note.blood_pressure_systolic &&
                        note.blood_pressure_diastolic && (
                          <div>
                            <p
                              className="text-xs"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Blood Pressure
                            </p>
                            <p
                              className="text-sm font-medium"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {note.blood_pressure_systolic}/
                              {note.blood_pressure_diastolic}
                            </p>
                          </div>
                        )}

                      {note.heart_rate && (
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            Heart Rate
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {note.heart_rate} bpm
                          </p>
                        </div>
                      )}

                      {note.respiratory_rate && (
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            Respiratory Rate
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {note.respiratory_rate} bpm
                          </p>
                        </div>
                      )}

                      {note.oxygen_saturation && (
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            O2 Saturation
                          </p>
                          <p
                            className="text-sm font-medium"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {note.oxygen_saturation}%
                          </p>
                        </div>
                      )}

                      {note.pain_level !== null &&
                        note.pain_level !== undefined && (
                          <div>
                            <p
                              className="text-xs"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Pain Level
                            </p>
                            <p
                              className="text-sm font-medium"
                              style={{
                                color: isDarkMode
                                  ? COLORS.text.white
                                  : COLORS.text.primary,
                              }}
                            >
                              {note.pain_level}/10
                            </p>
                          </div>
                        )}

                      {note.consciousness_level && (
                        <div>
                          <p
                            className="text-xs"
                            style={{ color: COLORS.text.secondary }}
                          >
                            Consciousness
                          </p>
                          <p
                            className="text-sm font-medium capitalize"
                            style={{
                              color: isDarkMode
                                ? COLORS.text.white
                                : COLORS.text.primary,
                            }}
                          >
                            {note.consciousness_level}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                {(note.intake_output ||
                  note.wound_care ||
                  note.special_instructions) && (
                  <div
                    className="p-3 rounded-lg space-y-2"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.darkHover
                        : COLORS.surface.lightHover,
                    }}
                  >
                    {note.intake_output && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          Intake/Output
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.primary,
                          }}
                        >
                          {note.intake_output}
                        </p>
                      </div>
                    )}

                    {note.wound_care && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          Wound Care
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.primary,
                          }}
                        >
                          {note.wound_care}
                        </p>
                      </div>
                    )}

                    {note.special_instructions && (
                      <div>
                        <p
                          className="text-xs font-semibold mb-1"
                          style={{ color: COLORS.text.secondary }}
                        >
                          Special Instructions
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.primary,
                          }}
                        >
                          {note.special_instructions}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Amendment Info */}
                {note.is_amended && note.amendment_reason && (
                  <div
                    className="p-3 rounded-lg border-l-4"
                    style={{
                      backgroundColor: COLORS.warning + '10',
                      borderLeftColor: COLORS.warning,
                    }}
                  >
                    <p
                      className="text-xs font-semibold mb-1"
                      style={{ color: COLORS.warning }}
                    >
                      Amendment Reason
                    </p>
                    <p
                      className="text-sm"
                      style={{ color: COLORS.text.secondary }}
                    >
                      {note.amendment_reason}
                    </p>
                    {note.amended_at && (
                      <p
                        className="text-xs mt-1"
                        style={{ color: COLORS.text.secondary }}
                      >
                        Amended on {formatDateTime(note.amended_at)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressNotesList;
