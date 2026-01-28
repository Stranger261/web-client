import { useEffect, useState } from 'react';
import {
  FileText,
  Clock,
  User,
  AlertCircle,
  Edit,
  Activity,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit3,
} from 'lucide-react';
import { Button } from '../../../ui/button';
import Badge from '../../../ui/badge';
import { COLORS } from '../../../../configs/CONST';
import { LoadingSpinner } from '../../../ui/loading-spinner';
import progressNotesApi from '../../../../services/progressNotesApi';
import ProgressNoteModal from '../../../ProgressNotes/components/modals/ProgressNoteModal';
import toast from 'react-hot-toast';
import { formatDateTime } from '../../../../utils/dateFormatter';

const ProgressNotesTab = ({ admissionId, admission }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAmendModal, setShowAmendModal] = useState(false);
  const [selectedNoteToAmend, setSelectedNoteToAmend] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, [admissionId]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const res = await progressNotesApi.getAdmissionProgressNotes(admissionId);
      setNotes(res.data?.notes || []);
    } catch (error) {
      toast.error('Failed to get progress notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNote = async noteData => {
    try {
      await progressNotesApi.createProgressNote(noteData);
      toast.success('Progress note created successfully');
      setShowCreateModal(false);
      fetchNotes(); // Refresh notes list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create note');
    }
  };

  const handleAmendNote = async amendmentData => {
    try {
      await progressNotesApi.amendProgressNote(
        selectedNoteToAmend.note_id,
        amendmentData,
      );
      toast.success('Progress note amended successfully');
      setShowAmendModal(false);
      setSelectedNoteToAmend(null);
      fetchNotes(); // Refresh notes list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to amend note');
    }
  };

  const openAmendModal = note => {
    setSelectedNoteToAmend(note);
    setShowAmendModal(true);
  };

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

  const getRecorderName = recorder => {
    if (!recorder) return 'Unknown';
    const person = recorder.person;
    return `${person?.first_name || ''} ${person?.last_name || ''}`.trim();
  };

  if (loading && !notes) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  if (!notes || notes.length === 0) {
    return (
      <>
        <div className="text-center py-8 sm:py-12 px-4">
          <FileText
            className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3"
            style={{ color: COLORS.text.secondary }}
          />
          <p
            className="text-base sm:text-lg font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            No progress notes yet
          </p>
          <p
            className="text-xs sm:text-sm mt-1 mb-4"
            style={{ color: COLORS.text.secondary }}
          >
            Add the first progress note to start tracking patient progress
          </p>
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setShowCreateModal(true)}
          >
            Add Progress Note
          </Button>
        </div>

        {/* Create Modal */}
        <ProgressNoteModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          admission={admission}
          onSubmit={handleCreateNote}
        />
      </>
    );
  }

  return (
    <>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          {notes.length} progress note{notes.length !== 1 ? 's' : ''}
        </p>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setShowCreateModal(true)}
        >
          Add Note
        </Button>
      </div>

      {/* Notes List */}
      <div className="space-y-2 sm:space-y-3">
        {notes.map(note => {
          const isExpanded = expandedNoteId === note.note_id;
          const recorderName = getRecorderName(note.recorder);
          const hasVitals =
            note.temperature || note.blood_pressure_systolic || note.heart_rate;

          return (
            <div
              key={note.note_id}
              className="rounded-lg border-2 overflow-hidden cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-md"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.dark
                  : COLORS.surface.light,
                borderColor: note.is_critical
                  ? COLORS.danger
                  : isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
              }}
              onClick={() => toggleExpand(note.note_id)}
            >
              {/* Header */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                  <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                    <div
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor:
                          getNoteTypeColor(note.note_type) + '20',
                      }}
                    >
                      <span className="text-base sm:text-xl">📝</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap mb-1.5 sm:mb-2">
                        <Badge
                          variant={getNoteTypeBadgeVariant(note.note_type)}
                        >
                          <span className="text-xs">
                            {formatNoteType(note.note_type)}
                          </span>
                        </Badge>

                        {note.is_critical && (
                          <Badge variant="danger" icon={AlertCircle} showIcon>
                            <span className="text-xs">Critical</span>
                          </Badge>
                        )}

                        {note.is_amended && (
                          <Badge variant="warning" icon={Edit} showIcon>
                            <span className="text-xs">Amended</span>
                          </Badge>
                        )}

                        {hasVitals && (
                          <Badge variant="success" icon={Activity} showIcon>
                            <span className="text-xs hidden sm:inline">
                              With Vitals
                            </span>
                            <span className="text-xs sm:hidden">Vitals</span>
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap">
                        <div className="flex items-center gap-1">
                          <User
                            size={12}
                            className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                            style={{ color: COLORS.text.secondary }}
                          />
                          <span
                            style={{ color: COLORS.text.secondary }}
                            className="truncate"
                          >
                            {recorderName}
                          </span>
                        </div>
                        <span style={{ color: COLORS.text.secondary }}>•</span>
                        <div className="flex items-center gap-1">
                          <Clock
                            size={12}
                            className="sm:w-3.5 sm:h-3.5 flex-shrink-0"
                            style={{ color: COLORS.text.secondary }}
                          />
                          <span
                            style={{ color: COLORS.text.secondary }}
                            className="truncate"
                          >
                            {formatDateTime(note.note_date)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        openAmendModal(note);
                      }}
                      className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded hover:bg-opacity-10 transition flex items-center gap-1"
                      style={{
                        color: COLORS.warning,
                        backgroundColor: COLORS.warning + '15',
                      }}
                      title="Amend this note"
                    >
                      <Edit3 size={14} className="sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Amend</span>
                    </button>

                    <button
                      onClick={e => {
                        e.stopPropagation();
                        toggleExpand(note.note_id);
                      }}
                      className="text-xs sm:text-sm font-medium px-2 sm:px-3 py-1 rounded hover:bg-opacity-10 transition flex items-center gap-1"
                      style={{ color: COLORS.primary }}
                    >
                      <span className="hidden sm:inline">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={14} className="sm:w-4 sm:h-4" />
                      ) : (
                        <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Preview (When Collapsed) */}
                {!isExpanded && (
                  <div className="space-y-1 text-xs sm:text-sm mt-2 sm:mt-3">
                    {note.subjective && (
                      <p
                        className="line-clamp-1"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.primary,
                        }}
                      >
                        <span className="font-semibold">S:</span>{' '}
                        {note.subjective}
                      </p>
                    )}
                    {note.assessment && (
                      <p
                        className="line-clamp-1"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.light
                            : COLORS.text.primary,
                        }}
                      >
                        <span className="font-semibold">A:</span>{' '}
                        {note.assessment}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Expanded Content - Keep your existing expanded content */}

              {/* Expanded Content */}
              {isExpanded && (
                <div
                  className="border-t px-3 sm:px-4 pb-3 sm:pb-4"
                  style={{
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  <div className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
                    {/* SOAP Notes */}
                    <div
                      className="p-3 sm:p-4 rounded-lg space-y-2 sm:space-y-3"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.surface.darkHover
                          : COLORS.surface.lightHover,
                      }}
                    >
                      <h4
                        className="text-xs sm:text-sm font-bold flex items-center gap-2"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                        }}
                      >
                        <FileText size={14} className="sm:w-4 sm:h-4" />
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
                            className="text-xs sm:text-sm leading-relaxed"
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
                            className="text-xs sm:text-sm leading-relaxed"
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
                            className="text-xs sm:text-sm leading-relaxed"
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
                            className="text-xs sm:text-sm leading-relaxed"
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

                    {/* Vital Signs - Responsive Grid */}
                    {hasVitals && (
                      <div
                        className="p-3 sm:p-4 rounded-lg"
                        style={{
                          backgroundColor: isDarkMode
                            ? COLORS.surface.darkHover
                            : COLORS.surface.lightHover,
                        }}
                      >
                        <h4
                          className="text-xs sm:text-sm font-semibold mb-3 sm:mb-4 flex items-center gap-2"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          <Activity size={14} className="sm:w-4 sm:h-4" />
                          Vital Signs
                        </h4>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                          {note.temperature && (
                            <div>
                              <p
                                className="text-xs mb-1"
                                style={{ color: COLORS.text.secondary }}
                              >
                                Temperature
                              </p>
                              <p
                                className="text-base sm:text-lg font-semibold"
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
                                  className="text-xs mb-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  Blood Pressure
                                </p>
                                <p
                                  className="text-base sm:text-lg font-semibold"
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
                                className="text-xs mb-1"
                                style={{ color: COLORS.text.secondary }}
                              >
                                Heart Rate
                              </p>
                              <p
                                className="text-base sm:text-lg font-semibold"
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

                          {note.oxygen_saturation && (
                            <div>
                              <p
                                className="text-xs mb-1"
                                style={{ color: COLORS.text.secondary }}
                              >
                                O2 Sat
                              </p>
                              <p
                                className="text-base sm:text-lg font-semibold"
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

                          {note.respiratory_rate && (
                            <div>
                              <p
                                className="text-xs mb-1"
                                style={{ color: COLORS.text.secondary }}
                              >
                                Respiratory Rate
                              </p>
                              <p
                                className="text-base sm:text-lg font-semibold"
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

                          {note.pain_level !== null &&
                            note.pain_level !== undefined && (
                              <div>
                                <p
                                  className="text-xs mb-1"
                                  style={{ color: COLORS.text.secondary }}
                                >
                                  Pain Level
                                </p>
                                <p
                                  className="text-base sm:text-lg font-semibold"
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
                                className="text-xs mb-1"
                                style={{ color: COLORS.text.secondary }}
                              >
                                Consciousness
                              </p>
                              <p
                                className="text-base sm:text-lg font-semibold capitalize"
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

                    {/* Intake/Output & Wound Care */}
                    {(note.intake_output || note.wound_care) && (
                      <div className="space-y-2 sm:space-y-3">
                        {note.intake_output && (
                          <div
                            className="p-3 sm:p-4 rounded-lg"
                            style={{
                              backgroundColor: isDarkMode
                                ? COLORS.surface.darkHover
                                : COLORS.surface.lightHover,
                            }}
                          >
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Intake/Output
                            </p>
                            <p
                              className="text-xs sm:text-sm leading-relaxed"
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
                          <div
                            className="p-3 sm:p-4 rounded-lg"
                            style={{
                              backgroundColor: isDarkMode
                                ? COLORS.surface.darkHover
                                : COLORS.surface.lightHover,
                            }}
                          >
                            <p
                              className="text-xs font-semibold mb-2"
                              style={{ color: COLORS.text.secondary }}
                            >
                              Wound Care
                            </p>
                            <p
                              className="text-xs sm:text-sm leading-relaxed"
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
                      </div>
                    )}

                    {/* Special Instructions */}
                    {note.special_instructions && (
                      <div
                        className="p-3 sm:p-4 rounded-lg border-l-4"
                        style={{
                          backgroundColor: isDarkMode
                            ? COLORS.info + '15'
                            : COLORS.info + '10',
                          borderLeftColor: COLORS.info,
                        }}
                      >
                        <p
                          className="text-xs font-semibold mb-2"
                          style={{ color: COLORS.info }}
                        >
                          📌 Special Instructions
                        </p>
                        <p
                          className="text-xs sm:text-sm leading-relaxed"
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

                    {/* Amendment Info */}
                    {note.is_amended && note.amendment_reason && (
                      <div
                        className="p-3 sm:p-4 rounded-lg border-l-4"
                        style={{
                          backgroundColor: isDarkMode
                            ? COLORS.warning + '15'
                            : COLORS.warning + '10',
                          borderLeftColor: COLORS.warning,
                        }}
                      >
                        <p
                          className="text-xs font-semibold mb-2 flex items-center gap-1"
                          style={{ color: COLORS.warning }}
                        >
                          <AlertCircle
                            size={12}
                            className="sm:w-3.5 sm:h-3.5"
                          />
                          Amendment Reason
                        </p>
                        <p
                          className="text-xs sm:text-sm leading-relaxed"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.primary,
                          }}
                        >
                          {note.amendment_reason}
                        </p>
                        {note.amended_at && (
                          <p
                            className="text-xs mt-2 flex items-center gap-1"
                            style={{ color: COLORS.text.secondary }}
                          >
                            <Clock size={10} className="sm:w-3 sm:h-3" />
                            Amended on {formatDateTime(note.amended_at)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {/* Create New Note Modal */}
      <ProgressNoteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        admission={admission}
        onSubmit={handleCreateNote}
      />

      {/* Amend Existing Note Modal */}
      <ProgressNoteModal
        isOpen={showAmendModal}
        onClose={() => {
          setShowAmendModal(false);
          setSelectedNoteToAmend(null);
        }}
        admission={admission}
        onSubmit={handleAmendNote}
        initialData={selectedNoteToAmend}
      />
    </>
  );
};

export default ProgressNotesTab;
