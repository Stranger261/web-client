import {
  ClipboardList,
  FileText,
  Pill,
  Stethoscope,
  StickyNote,
  Calendar,
} from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import { COLORS } from '../../../../configs/CONST';
import { formatDateTime } from '../../../../utils/dateFormatter';
import { normalizedWord } from '../../../../utils/normalizedWord';

const RecordDetailModal = ({ isOpen, onClose, record }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  if (!record) return null;

  const InfoSection = ({ icon: Icon, title, children, highlight = false }) => (
    <div
      className="p-4 rounded-lg mb-4"
      style={{
        backgroundColor: highlight
          ? isDarkMode
            ? COLORS.primary + '15'
            : COLORS.primary + '08'
          : isDarkMode
          ? COLORS.background.dark
          : COLORS.background.main,
        border: `1px solid ${
          isDarkMode ? COLORS.border.dark : COLORS.border.light
        }`,
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className="p-2 rounded-lg"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.primary + '20'
              : COLORS.primary + '15',
          }}
        >
          <Icon size={20} style={{ color: COLORS.primary }} />
        </div>
        <h3
          className="font-semibold text-lg"
          style={{
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          }}
        >
          {title}
        </h3>
      </div>
      <div className="pl-11">{children}</div>
    </div>
  );

  const DetailText = ({ children, className = '' }) => (
    <p
      className={`text-base leading-relaxed ${className}`}
      style={{ color: isDarkMode ? COLORS.text.light : COLORS.text.primary }}
    >
      {children || 'Not specified'}
    </p>
  );

  const MetaInfo = ({ label, value }) => (
    <div className="flex items-center gap-2 text-sm">
      <span
        style={{
          color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
        }}
      >
        {label}:
      </span>
      <span
        className="font-medium"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Medical Record Details"
      size="lg"
    >
      {/* Header Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <MetaInfo
            label="Record Date"
            value={formatDateTime(record.record_date)}
          />
          <MetaInfo
            label="Record Type"
            value={normalizedWord(record.record_type)}
          />
        </div>
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <MetaInfo
            label="Visit Type"
            value={normalizedWord(record.visit_type)}
          />
          <MetaInfo label="Doctor ID" value={record.doctor_id} />
        </div>
      </div>

      {/* Main Content Sections */}
      <InfoSection icon={FileText} title="Chief Complaint" highlight>
        <DetailText>{record.chief_complaint}</DetailText>
      </InfoSection>

      <InfoSection icon={Stethoscope} title="Diagnosis">
        <DetailText className="font-medium text-lg">
          {record.diagnosis}
        </DetailText>
      </InfoSection>

      <InfoSection icon={ClipboardList} title="Treatment Plan">
        <DetailText>{record.treatment}</DetailText>
      </InfoSection>

      <InfoSection icon={Pill} title="Prescription">
        <div
          className="p-3 rounded-md font-mono text-sm"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : '#f8fafc',
            border: `1px dashed ${
              isDarkMode ? COLORS.border.dark : COLORS.border.light
            }`,
          }}
        >
          <DetailText>{record.prescription}</DetailText>
        </div>
      </InfoSection>

      {record.notes && (
        <InfoSection icon={StickyNote} title="Additional Notes">
          <DetailText className="italic">{record.notes}</DetailText>
        </InfoSection>
      )}

      {/* Footer */}
      <div
        className="mt-6 pt-4 border-t text-xs flex items-center gap-2"
        style={{
          borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          color: COLORS.text.secondary,
        }}
      >
        <Calendar size={14} />
        <span>Created: {formatDateTime(record.created_at)}</span>
      </div>
    </Modal>
  );
};

export default RecordDetailModal;
