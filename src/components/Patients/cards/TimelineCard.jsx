// components/Patients/cards/TimelineCard.jsx
import { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  User,
  Activity,
  Building2,
  FileText,
  ClipboardList,
  Clock,
  CheckCircle,
  XCircle,
  Circle,
  TrendingUp,
  CalendarCheck,
  Video,
  Eye,
  Download,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Scan,
  MessageSquare,
  Paperclip,
  Bed,
} from 'lucide-react';
import { COLORS } from '../../../configs/CONST';
import { formatDateTime } from '../../../utils/dateFormatter';
import exportService from '../../../services/exportService';
import RecordDetailsModal from '../../../pages/Patient/components/modals/RecordDetailsModal';
import { normalizedWord } from '../../../utils/normalizedWord';

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_MAP = {
  completed: { bg: '#dcfce7', text: '#166534', Icon: CheckCircle },
  scheduled: { bg: '#dbeafe', text: '#1e40af', Icon: CalendarCheck },
  in_progress: { bg: '#fef3c7', text: '#92400e', Icon: Clock },
  cancelled: { bg: '#fee2e2', text: '#991b1b', Icon: XCircle },
  active: { bg: '#dcfce7', text: '#166534', Icon: Activity },
  admitted: { bg: '#fef9c3', text: '#854d0e', Icon: Bed },
  discharged: { bg: '#f3f4f6', text: '#4b5563', Icon: TrendingUp },
  reported: { bg: '#dcfce7', text: '#166534', Icon: CheckCircle },
  completed_report: { bg: '#dcfce7', text: '#166534', Icon: CheckCircle },
};

// ─── Type config ──────────────────────────────────────────────────────────────
const TYPE_MAP = {
  appointment: { bg: '#f0f9ff', icon: '#0284c7', Icon: Calendar },
  admission: { bg: '#fffbeb', icon: '#d97706', Icon: Building2 },
  laboratory: { bg: '#f0fdf4', icon: '#16a34a', Icon: FlaskConical },
  imaging: { bg: '#faf5ff', icon: '#9333ea', Icon: Scan },
  medical_record: { bg: '#f3e8ff', icon: '#9333ea', Icon: ClipboardList },
};

// ─── Tiny Badge ───────────────────────────────────────────────────────────────
const Badge = ({ bg, color, Icon: I, children }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
    style={{ backgroundColor: bg, color }}
  >
    {I && <I size={10} />}
    {children}
  </span>
);

// ─── TimelineCard ─────────────────────────────────────────────────────────────
const TimelineCard = ({
  record,
  isDarkMode,
  isExpanded,
  onToggle,
  userRole = 'patient',
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportRef = useRef(null);

  // Close export menu on outside click
  useEffect(() => {
    const handler = e => {
      if (exportRef.current && !exportRef.current.contains(e.target))
        setShowExportMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Collapse sections when card collapses
  useEffect(() => {
    if (!isExpanded) setShowExportMenu(false);
  }, [isExpanded]);

  const statusConf = STATUS_MAP[record.status] ?? {
    bg: '#f3f4f6',
    text: '#6b7280',
    Icon: Circle,
  };
  const typeConf = TYPE_MAP[record.type] ?? {
    bg: '#f3f4f6',
    icon: '#6b7280',
    Icon: Activity,
  };
  const StatusIcon = statusConf.Icon;
  const TypeIcon = typeConf.Icon;

  // ── Title ────────────────────────────────────────────────────────────────
  const getTitle = () => {
    switch (record.type) {
      case 'appointment':
        return record.isOnlineConsultation
          ? 'Online Consultation'
          : 'Appointment';
      case 'admission':
        return 'Hospital Admission';
      case 'laboratory':
        return record.testName || record.test?.name || 'Laboratory Test';
      case 'imaging':
        return record.service?.name || record.description || 'Imaging Study';
      case 'medical_record':
        return record.title || 'Medical Record';
      default:
        return 'Record';
    }
  };

  // ── Meta chips shown in header ────────────────────────────────────────────
  const renderMeta = () => {
    const chips = [];

    if (record.doctor)
      chips.push(
        <Badge
          key="doc"
          bg={isDarkMode ? '#1e3a5f' : '#dbeafe'}
          color={isDarkMode ? '#93c5fd' : '#1e40af'}
          Icon={User}
        >
          {record.doctor}
        </Badge>,
      );

    if (record.type === 'laboratory') {
      if (record.testName)
        chips.push(
          <Badge
            key="test"
            bg={isDarkMode ? '#14532d' : '#dcfce7'}
            color={isDarkMode ? '#86efac' : '#166534'}
            Icon={FlaskConical}
          >
            {record.testName}
          </Badge>,
        );
      if (record.resultCount > 0)
        chips.push(
          <Badge key="res" bg="#dcfce7" color="#166534" Icon={CheckCircle}>
            {record.resultCount} results
          </Badge>,
        );
      if (!record.hasResults)
        chips.push(
          <Badge key="pend" bg="#fef3c7" color="#92400e" Icon={Clock}>
            Pending
          </Badge>,
        );
    }

    if (record.type === 'imaging') {
      if (record.modality)
        chips.push(
          <Badge
            key="mod"
            bg={isDarkMode ? '#3b1f6e' : '#f3e8ff'}
            color={isDarkMode ? '#c4b5fd' : '#7c3aed'}
            Icon={Scan}
          >
            {record.modality}
          </Badge>,
        );
      if (record.hasReport)
        chips.push(
          <Badge key="rpt" bg="#dcfce7" color="#166534" Icon={FileText}>
            Report ready
          </Badge>,
        );
    }

    if (record.isOnlineConsultation) {
      chips.push(
        <Badge key="tele" bg="#dbeafe" color="#0284c7" Icon={Video}>
          Telehealth
        </Badge>,
      );
      // Show message & file count if available
      const msgCount = record.consultation?.messageCount || 0;
      const fileCount = (record.consultationMessages || []).filter(
        m => m.isFile,
      ).length;
      if (msgCount > 0)
        chips.push(
          <Badge
            key="msg"
            bg={isDarkMode ? '#0f2040' : '#eff6ff'}
            color={isDarkMode ? '#93c5fd' : '#1e40af'}
            Icon={MessageSquare}
          >
            {msgCount} messages
          </Badge>,
        );
      if (fileCount > 0)
        chips.push(
          <Badge
            key="file"
            bg={isDarkMode ? '#0f2040' : '#eff6ff'}
            color={isDarkMode ? '#93c5fd' : '#1e40af'}
            Icon={Paperclip}
          >
            {fileCount} files
          </Badge>,
        );
    }

    if (record.type === 'admission') {
      if (record.admissionNumber)
        chips.push(
          <Badge
            key="adm"
            bg={isDarkMode ? '#451a03' : '#fef3c7'}
            color={isDarkMode ? '#fbbf24' : '#92400e'}
            Icon={FileText}
          >
            {record.admissionNumber}
          </Badge>,
        );
      if (record.lengthOfStay)
        chips.push(
          <Badge
            key="los"
            bg={isDarkMode ? '#1e293b' : '#f1f5f9'}
            color={isDarkMode ? '#94a3b8' : '#475569'}
            Icon={Clock}
          >
            {record.lengthOfStay}d stay
          </Badge>,
        );
    }

    return chips;
  };

  // ── Preview lines shown in dropdown ──────────────────────────────────────
  const renderPreview = () => {
    const labelColor = isDarkMode ? '#94a3b8' : '#64748b';
    const valueColor = isDarkMode ? '#f1f5f9' : '#0f172a';

    const Line = ({ label, value }) =>
      value ? (
        <div className="flex gap-2 text-xs">
          <span className="shrink-0 font-medium" style={{ color: labelColor }}>
            {label}:
          </span>
          <span className="truncate" style={{ color: valueColor }}>
            {value}
          </span>
        </div>
      ) : null;

    switch (record.type) {
      case 'appointment':
      case 'medical_record':
        return (
          <div className="space-y-1.5">
            <Line label="Chief complaint" value={record.chiefComplaint} />
            <Line
              label="Diagnosis"
              value={
                typeof record.diagnosis === 'string'
                  ? record.diagnosis
                  : record.diagnosis?.primary_diagnosis
              }
            />
            <Line
              label="Treatment"
              value={record.treatmentPlan || record.treatment}
            />
            {/* Telehealth quick-glance */}
            {record.isOnlineConsultation && record.consultation && (
              <div
                className="mt-2 flex items-center gap-3 px-3 py-2 rounded-xl border"
                style={{
                  background: isDarkMode ? '#0f2040' : '#eff6ff',
                  borderColor: isDarkMode ? '#1e3a5f' : '#bfdbfe',
                }}
              >
                <Video size={14} style={{ color: '#0284c7' }} />
                <span
                  className="text-xs font-medium"
                  style={{ color: isDarkMode ? '#93c5fd' : '#1e40af' }}
                >
                  {record.consultation.messageCount || 0} messages ·{' '}
                  {Math.floor((record.consultation.durationSeconds || 0) / 60)}m
                  session
                </span>
              </div>
            )}
          </div>
        );

      case 'admission':
        return (
          <div className="space-y-1.5">
            <Line label="Diagnosis" value={record.diagnosis} />
            <Line label="Source" value={record.admissionSource} />
            <Line label="Discharge type" value={record.dischargeType} />
            {record.progressNotesCount > 0 && (
              <Badge
                bg={isDarkMode ? '#1e293b' : '#f1f5f9'}
                color={isDarkMode ? '#94a3b8' : '#475569'}
                Icon={ClipboardList}
              >
                {record.progressNotesCount} progress notes
              </Badge>
            )}
          </div>
        );

      case 'laboratory':
        return (
          <div className="space-y-1.5">
            <Line label="Test" value={record.testName || record.test?.name} />
            <Line
              label="Department"
              value={record.department || record.test?.department}
            />
            <Line label="Physician" value={record.orderingPhysician} />
            <Line label="Indication" value={record.clinicalIndication} />
          </div>
        );

      case 'imaging':
        return (
          <div className="space-y-1.5">
            <Line label="Service" value={record.service?.name} />
            <Line label="Body part" value={record.bodyPart} />
            <Line label="Indication" value={record.clinicalIndication} />
            {record.report?.impression && (
              <Line
                label="Impression"
                value={
                  record.report.impression.slice(0, 100) +
                  (record.report.impression.length > 100 ? '…' : '')
                }
              />
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = async (format, e) => {
    e.stopPropagation();
    setShowExportMenu(false);
    setIsExporting(true);
    try {
      const data = { ...record, date: formatDateTime(record.date) };
      if (format === 'CSV')
        exportService.exportToCSV([data], `${record.type}-${record.id}`);
      if (format === 'PDF')
        exportService.exportToPDF(
          [data],
          { name: getTitle(), date: formatDateTime(record.date) },
          `${record.type}-${record.id}`,
        );
    } catch {
    } finally {
      setIsExporting(false);
    }
  };

  const cardBg = isDarkMode ? '#0f172a' : 'white';
  const cardBorder = isDarkMode ? '#1e293b' : '#e2e8f0';
  const secondaryColor = isDarkMode ? '#94a3b8' : '#64748b';

  return (
    <>
      {/* Single modal for ALL record types including telehealth */}
      {showModal && (
        <RecordDetailsModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          record={record}
          userRole={userRole}
        />
      )}

      <div
        className="rounded-2xl border overflow-hidden transition-all duration-200"
        style={{
          backgroundColor: cardBg,
          borderColor: cardBorder,
          boxShadow: isExpanded
            ? isDarkMode
              ? '0 4px 24px rgba(0,0,0,0.4)'
              : '0 4px 20px rgba(0,0,0,0.08)'
            : '0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* ── Header row — click to expand ── */}
        <div
          className="p-4 cursor-pointer select-none transition-colors"
          onClick={onToggle}
          style={{
            backgroundColor: isExpanded
              ? isDarkMode
                ? '#111827'
                : '#f8fafc'
              : 'transparent',
          }}
        >
          <div className="flex items-start gap-3">
            {/* Type icon badge */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: typeConf.bg }}
            >
              <TypeIcon size={20} style={{ color: typeConf.icon }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {/* Title + status */}
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h4
                      className="font-bold text-[15px] leading-tight"
                      style={{ color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
                    >
                      {getTitle()}
                    </h4>
                    {record.status && (
                      <Badge
                        bg={statusConf.bg}
                        color={statusConf.text}
                        Icon={StatusIcon}
                      >
                        {normalizedWord(record.status).replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Date */}
                  <div
                    className="flex items-center gap-1.5 text-xs mb-2"
                    style={{ color: secondaryColor }}
                  >
                    <Calendar size={12} />
                    <span>{formatDateTime(record.date)}</span>
                  </div>

                  {/* Meta chips */}
                  <div className="flex flex-wrap gap-1.5">{renderMeta()}</div>
                </div>

                {/* Expand chevron */}
                <button
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
                  style={{
                    color: secondaryColor,
                    backgroundColor: isExpanded
                      ? isDarkMode
                        ? '#1e293b'
                        : '#e2e8f0'
                      : 'transparent',
                  }}
                >
                  {isExpanded ? (
                    <ChevronUp size={18} />
                  ) : (
                    <ChevronDown size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Expanded body ── */}
        {isExpanded && (
          <div
            className="px-4 pb-4 border-t"
            style={{ borderColor: isDarkMode ? '#1e293b' : '#e2e8f0' }}
          >
            {/* Preview data */}
            {renderPreview() && (
              <div className="pt-3 pb-3">{renderPreview()}</div>
            )}

            {/* Action bar */}
            <div
              className="flex items-center gap-2 pt-3 border-t"
              style={{ borderColor: isDarkMode ? '#1e293b' : '#f1f5f9' }}
            >
              {/* View Details — opens RecordDetailsModal for all types */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
                style={{ backgroundColor: COLORS.primary, color: 'white' }}
              >
                <Eye size={15} />
                View Details
              </button>

              {/* Export dropdown */}
              <div className="relative" ref={exportRef}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    setShowExportMenu(v => !v);
                  }}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-sm border transition-all hover:opacity-90"
                  style={{
                    backgroundColor: isDarkMode ? '#1e293b' : '#f8fafc',
                    color: isDarkMode ? '#f1f5f9' : '#0f172a',
                    borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                  }}
                >
                  {isExporting ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  <span>Export</span>
                  <ChevronDown size={13} />
                </button>

                {showExportMenu && !isExporting && (
                  <div
                    className="absolute right-0 bottom-full mb-2 rounded-xl shadow-xl overflow-hidden z-50 min-w-[160px] border"
                    style={{
                      backgroundColor: isDarkMode ? '#1e293b' : 'white',
                      borderColor: isDarkMode ? '#334155' : '#e2e8f0',
                    }}
                  >
                    {['CSV', 'PDF'].map((fmt, i) => (
                      <button
                        key={fmt}
                        onClick={e => handleExport(fmt, e)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{
                          color: isDarkMode ? '#f1f5f9' : '#0f172a',
                          borderBottom:
                            i === 0
                              ? `1px solid ${isDarkMode ? '#334155' : '#f1f5f9'}`
                              : 'none',
                        }}
                        onMouseEnter={e =>
                          (e.currentTarget.style.backgroundColor = isDarkMode
                            ? '#334155'
                            : '#f8fafc')
                        }
                        onMouseLeave={e =>
                          (e.currentTarget.style.backgroundColor =
                            'transparent')
                        }
                      >
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor:
                              fmt === 'PDF' ? '#ef4444' : '#22c55e',
                          }}
                        >
                          <FileText size={12} className="text-white" />
                        </div>
                        Export as {fmt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TimelineCard;
