// pages/Patient/components/modals/RecordDetailsModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  User,
  Activity,
  Heart,
  Droplet,
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
  Video,
  Download,
  FlaskConical,
  Scan,
  Image as ImageIcon,
  File,
  TrendingUp,
  CalendarCheck,
  MessageSquare,
  Paperclip,
  RefreshCw,
  AlertCircle,
  Bed,
} from 'lucide-react';
import Modal from '../../../../components/ui/Modal';
import { COLORS } from '../../../../configs/CONST';
import { formatDateTime, formatDate } from '../../../../utils/dateFormatter';
import medicalRecordsService from '../../../../services/medicalRecordApi';
import { normalizedWord } from '../../../../utils/normalizedWord';

// ─── Dark mode ────────────────────────────────────────────────────────────────
const dm = () => document.documentElement.classList.contains('dark');

// ─── Colour helpers (called with isDark bool) ─────────────────────────────────
const surfBg = d => (d ? '#0f172a' : 'white');
const surfAlt = d => (d ? '#111827' : '#f8fafc');
const bdr = d => (d ? '#1e293b' : '#e2e8f0');
const txP = d => (d ? '#f1f5f9' : '#0f172a');
const txS = d => (d ? '#94a3b8' : '#64748b');

// ─── Safe string extractor ────────────────────────────────────────────────────
const str = v => {
  if (!v) return null;
  if (typeof v === 'string') return v;
  if (typeof v === 'object')
    return v.primary_diagnosis || v.diagnosis || v.name || null;
  return String(v);
};

// ─── Duration formatter ───────────────────────────────────────────────────────
const fmtDur = secs => {
  if (!secs) return '—';
  return `${Math.floor(secs / 60)}m ${secs % 60}s`;
};

const fmtSize = bytes => {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
};

// ─── Status badge colours ─────────────────────────────────────────────────────
const STATUS_MAP = {
  completed: ['#dcfce7', '#166534'],
  scheduled: ['#dbeafe', '#1e40af'],
  in_progress: ['#fef3c7', '#92400e'],
  cancelled: ['#fee2e2', '#991b1b'],
  active: ['#dcfce7', '#166534'],
  discharged: ['#f1f5f9', '#475569'],
  reported: ['#dcfce7', '#166534'],
};

// ─── Primitives ───────────────────────────────────────────────────────────────

/** Coloured pill badge */
const PillBadge = ({ status, children }) => {
  const [bg, col] = STATUS_MAP[status] ?? ['#f1f5f9', '#64748b'];
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ backgroundColor: bg, color: col }}
    >
      {children ?? normalizedWord(status ?? '').replace(/_/g, ' ')}
    </span>
  );
};

/** Horizontal tab bar */
const TabBar = ({ tabs, active, onChange, dark }) => (
  <div
    className="flex overflow-x-auto border-b shrink-0"
    style={{ borderColor: bdr(dark) }}
  >
    {tabs.map(({ id, label, icon: Icon, count }) => (
      <button
        key={id}
        onClick={() => onChange(id)}
        className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all"
        style={{
          color: active === id ? COLORS.primary : txS(dark),
          borderColor: active === id ? COLORS.primary : 'transparent',
          backgroundColor:
            active === id ? (dark ? '#0d2137' : '#eff6ff') : 'transparent',
        }}
      >
        <Icon size={14} />
        {label}
        {count != null && count > 0 && (
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
            style={{
              backgroundColor:
                active === id ? COLORS.primary : dark ? '#1e293b' : '#f1f5f9',
              color: active === id ? 'white' : txS(dark),
            }}
          >
            {count}
          </span>
        )}
      </button>
    ))}
  </div>
);

/** 2-col info grid card */
const InfoCard = ({ icon: Icon, label, value, dark, badge = false }) => {
  const display = (() => {
    if (value == null) return null;
    if (typeof value === 'object') {
      if (value.person) {
        const { first_name, middle_name, last_name, suffix } = value.person;
        return (
          `${first_name ?? ''} ${middle_name ?? ''} ${last_name ?? ''}`.trim() +
          (suffix ? `, ${suffix}` : '')
        );
      }
      if (value.name) return value.name;
      if (Array.isArray(value)) return value.join(', ');
      return str(value);
    }
    return String(value);
  })();

  if (!display) return null;

  return (
    <div
      className="p-3 rounded-xl border"
      style={{ backgroundColor: surfBg(dark), borderColor: bdr(dark) }}
    >
      <div className="flex items-center gap-2 mb-1">
        {Icon && <Icon size={13} style={{ color: COLORS.primary }} />}
        <span
          className="text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: txS(dark) }}
        >
          {label}
        </span>
      </div>
      {badge ? (
        <PillBadge status={display}>{display}</PillBadge>
      ) : (
        <p
          className="text-sm font-semibold leading-snug"
          style={{ color: txP(dark) }}
        >
          {display}
        </p>
      )}
    </div>
  );
};

/** 2-col grid wrapper */
const InfoGrid = ({ items, dark }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
    {items.map(item => (
      <InfoCard key={item.label} {...item} dark={dark} />
    ))}
  </div>
);

/** Highlighted section box */
const Section = ({ title, icon: Icon, children, dark, accent = false }) => (
  <div
    className="rounded-xl p-4 border"
    style={{
      backgroundColor: accent ? (dark ? '#0d2137' : '#eff6ff') : surfAlt(dark),
      borderColor: accent ? (dark ? '#1e3a5f' : '#bfdbfe') : bdr(dark),
    }}
  >
    {title && (
      <div className="flex items-center gap-2 mb-3">
        {Icon && (
          <Icon
            size={15}
            style={{ color: accent ? '#0284c7' : COLORS.primary }}
          />
        )}
        <h4 className="font-semibold text-sm" style={{ color: txP(dark) }}>
          {title}
        </h4>
      </div>
    )}
    {children}
  </div>
);

/** Empty state */
const Empty = ({ message, icon: Icon, dark }) => (
  <div className="flex flex-col items-center justify-center py-14 gap-3 text-center">
    {Icon && <Icon size={40} style={{ color: txS(dark), opacity: 0.35 }} />}
    <p className="text-sm" style={{ color: txS(dark) }}>
      {message}
    </p>
  </div>
);

// ─── SHARED PANELS ────────────────────────────────────────────────────────────

const VitalsPanel = ({ vitals, dark }) => {
  if (!vitals)
    return <Empty message="No vital signs recorded" icon={Heart} dark={dark} />;

  const items = [
    {
      icon: ThermometerSun,
      label: 'Temperature',
      value: vitals.temperature,
      unit: '°C',
    },
    {
      icon: Heart,
      label: 'Blood Pressure',
      value: vitals.bloodPressure,
      unit: 'mmHg',
    },
    {
      icon: Activity,
      label: 'Heart Rate',
      value: vitals.heartRate,
      unit: 'bpm',
    },
    { icon: Droplet, label: 'SpO₂', value: vitals.oxygenSaturation, unit: '%' },
    {
      icon: Activity,
      label: 'Resp. Rate',
      value: vitals.respiratoryRate,
      unit: '/min',
    },
    { icon: Weight, label: 'Weight', value: vitals.weight, unit: 'kg' },
    { icon: Ruler, label: 'Height', value: vitals.height, unit: 'cm' },
    { icon: Activity, label: 'BMI', value: vitals.bmi, unit: '' },
  ].filter(i => i.value != null && i.value !== '');

  if (!items.length)
    return <Empty message="No vital signs recorded" icon={Heart} dark={dark} />;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map(({ icon: Icon, label, value, unit }) => (
        <div
          key={label}
          className="rounded-xl p-4 border"
          style={{ backgroundColor: surfBg(dark), borderColor: bdr(dark) }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Icon size={13} style={{ color: COLORS.primary }} />
            <span className="text-xs font-medium" style={{ color: txS(dark) }}>
              {label}
            </span>
          </div>
          <div
            className="text-2xl font-black tabular-nums"
            style={{ color: txP(dark) }}
          >
            {value}
            <span
              className="text-xs font-normal ml-1"
              style={{ color: txS(dark) }}
            >
              {unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const PrescriptionsPanel = ({ prescriptions, dark }) => {
  if (!prescriptions?.length)
    return <Empty message="No prescriptions" icon={Pill} dark={dark} />;
  return (
    <div className="space-y-3">
      {prescriptions.map((rx, i) => (
        <div
          key={rx.prescriptionId ?? i}
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: bdr(dark) }}
        >
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ backgroundColor: surfAlt(dark) }}
          >
            <div className="flex items-center gap-2">
              <FileText size={13} style={{ color: txS(dark) }} />
              <span className="text-xs font-mono" style={{ color: txS(dark) }}>
                {rx.prescriptionNumber}
              </span>
              <span className="text-xs" style={{ color: txS(dark) }}>
                · {formatDate(rx.prescriptionDate)}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${rx.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
            >
              {rx.status}
            </span>
          </div>
          <div style={{ backgroundColor: surfBg(dark) }}>
            {rx.items?.map((item, j) => (
              <div
                key={item.itemId ?? j}
                className="px-4 py-3 border-t"
                style={{ borderColor: bdr(dark) }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Pill size={14} style={{ color: '#16a34a' }} />
                  <span
                    className="font-semibold text-sm"
                    style={{ color: txP(dark) }}
                  >
                    {item.medicationName}
                  </span>
                </div>
                <div
                  className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs"
                  style={{ color: txS(dark) }}
                >
                  {item.dosage && (
                    <span>
                      <span
                        className="font-medium"
                        style={{ color: txP(dark) }}
                      >
                        Dose:{' '}
                      </span>
                      {item.dosage}
                    </span>
                  )}
                  {item.frequency && (
                    <span>
                      <span
                        className="font-medium"
                        style={{ color: txP(dark) }}
                      >
                        Freq:{' '}
                      </span>
                      {item.frequency}
                    </span>
                  )}
                  {item.route && (
                    <span>
                      <span
                        className="font-medium"
                        style={{ color: txP(dark) }}
                      >
                        Route:{' '}
                      </span>
                      {item.route}
                    </span>
                  )}
                  {item.duration && (
                    <span>
                      <span
                        className="font-medium"
                        style={{ color: txP(dark) }}
                      >
                        Duration:{' '}
                      </span>
                      {item.duration}
                    </span>
                  )}
                </div>
                {item.instructions && (
                  <div
                    className="mt-2 text-xs px-3 py-2 rounded-lg italic"
                    style={{
                      backgroundColor: dark ? '#1e3a5f' : '#eff6ff',
                      color: dark ? '#93c5fd' : '#1e40af',
                    }}
                  >
                    {item.instructions}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ProgressNotesPanel = ({ notes, dark }) => {
  if (!notes?.length)
    return (
      <Empty
        message="No progress notes available"
        icon={ClipboardList}
        dark={dark}
      />
    );
  return (
    <div className="space-y-3">
      {notes.map((note, i) => (
        <div
          key={note.noteId ?? i}
          className="rounded-xl border-l-4 border overflow-hidden"
          style={{
            borderLeftColor: note.isCritical ? '#ef4444' : COLORS.primary,
            borderColor: bdr(dark),
            backgroundColor: surfBg(dark),
          }}
        >
          <div
            className="px-4 py-3 border-b flex items-center justify-between"
            style={{ borderColor: bdr(dark), backgroundColor: surfAlt(dark) }}
          >
            <div>
              <span
                className="font-semibold text-sm capitalize"
                style={{ color: txP(dark) }}
              >
                {note.noteType}
              </span>
              <div
                className="flex items-center gap-2 mt-0.5 text-xs"
                style={{ color: txS(dark) }}
              >
                <Clock size={11} />
                {formatDateTime(note.noteDate)}
                <span>·</span>
                {note.recordedBy}
              </div>
            </div>
            {note.isCritical && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                <AlertTriangle size={11} /> Critical
              </span>
            )}
          </div>
          <div className="px-4 py-3 space-y-2">
            {[
              ['Subjective', note.subjective],
              ['Objective', note.objective],
              ['Assessment', note.assessment],
              ['Plan', note.plan],
            ]
              .filter(([, v]) => v)
              .map(([label, val]) => (
                <div key={label}>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wide mb-0.5"
                    style={{ color: txS(dark) }}
                  >
                    {label}
                  </p>
                  <p className="text-sm" style={{ color: txP(dark) }}>
                    {val}
                  </p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const LabResultsPanel = ({ results, dark }) => {
  if (!results?.length)
    return (
      <Empty message="No results available" icon={FlaskConical} dark={dark} />
    );
  return (
    <div className="space-y-3">
      {results.map((r, i) => (
        <div
          key={r.resultId ?? i}
          className="rounded-xl border p-4"
          style={{
            backgroundColor: surfBg(dark),
            borderColor: r.isAbnormal
              ? dark
                ? '#7f1d1d'
                : '#fca5a5'
              : bdr(dark),
            borderLeftWidth: r.isAbnormal ? 4 : 1,
            borderLeftColor: r.isAbnormal ? '#ef4444' : bdr(dark),
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-sm" style={{ color: txP(dark) }}>
                {r.parameter}
              </p>
              <p className="text-xs mt-0.5" style={{ color: txS(dark) }}>
                Ref: {r.referenceRange || 'N/A'}
              </p>
            </div>
            {r.isAbnormal && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                <AlertTriangle size={11} /> {r.status || 'Abnormal'}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className="text-2xl font-black tabular-nums"
              style={{ color: r.isAbnormal ? '#ef4444' : txP(dark) }}
            >
              {r.value}
            </span>
            <span className="text-sm" style={{ color: txS(dark) }}>
              {r.unit}
            </span>
          </div>
          {r.notes && (
            <p
              className="mt-2 text-xs rounded-lg px-3 py-2"
              style={{ backgroundColor: surfAlt(dark), color: txS(dark) }}
            >
              {r.notes}
            </p>
          )}
          <div
            className="flex justify-between mt-3 pt-2 border-t text-xs"
            style={{ borderColor: bdr(dark), color: txS(dark) }}
          >
            <span>Verified: {r.verifiedBy || '—'}</span>
            <span>{formatDateTime(r.resultDate)}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

const RadiologyReportPanel = ({ report, dark }) => {
  if (!report)
    return <Empty message="No report available" icon={FileText} dark={dark} />;
  return (
    <div className="space-y-4">
      <InfoGrid
        dark={dark}
        items={[
          { icon: User, label: 'Radiologist', value: report.radiologist },
          {
            icon: Calendar,
            label: 'Report Date',
            value: formatDateTime(report.reportDate || report.report_date),
          },
          {
            icon: Activity,
            label: 'Status',
            value: report.status,
            badge: true,
          },
          { icon: User, label: 'Verified by', value: report.verifiedBy },
        ]}
      />
      {report.findings && (
        <Section title="Findings" icon={FileText} dark={dark}>
          <p
            className="text-sm whitespace-pre-wrap leading-relaxed"
            style={{ color: txP(dark) }}
          >
            {report.findings}
          </p>
        </Section>
      )}
      {report.impression && (
        <Section title="Impression" icon={Stethoscope} dark={dark} accent>
          <p
            className="text-sm font-medium leading-relaxed"
            style={{ color: txP(dark) }}
          >
            {report.impression}
          </p>
        </Section>
      )}
      {report.recommendations && (
        <Section title="Recommendations" icon={ClipboardList} dark={dark}>
          <p className="text-sm leading-relaxed" style={{ color: txP(dark) }}>
            {report.recommendations}
          </p>
        </Section>
      )}
      {report.isCritical && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-100 text-red-700 text-sm font-semibold">
          <AlertTriangle size={15} /> Critical Result — Requires immediate
          attention
        </div>
      )}
    </div>
  );
};

// ─── TELEHEALTH PANELS ────────────────────────────────────────────────────────

/**
 * Chat messages panel
 * Data shape from buildMedicalTimeline → formatConsultationMessage:
 *   { messageId, messageContent, fileUrl, fileType, fileSize, sentAt,
 *     senderName, senderId, senderType, isFile, isImage }
 */
const TelehealthChatPanel = ({ messages, dark }) => {
  const textMsgs = (messages ?? []).filter(m => !m.isFile);

  if (!textMsgs.length)
    return (
      <Empty
        message="No chat messages in this session"
        icon={MessageSquare}
        dark={dark}
      />
    );

  return (
    <div className="space-y-3">
      {textMsgs.map((msg, i) => {
        const isPatient = msg.senderType === 'patient';
        return (
          <div
            key={msg.messageId ?? i}
            className={`flex ${isPatient ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[82%] rounded-2xl px-4 py-3"
              style={{
                backgroundColor: isPatient
                  ? dark
                    ? '#1e3a5f'
                    : '#dbeafe'
                  : dark
                    ? '#1e293b'
                    : '#f1f5f9',
                borderBottomRightRadius: isPatient ? 4 : undefined,
                borderBottomLeftRadius: isPatient ? undefined : 4,
              }}
            >
              {/* Sender row */}
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="text-xs font-bold"
                  style={{
                    color: isPatient
                      ? dark
                        ? '#93c5fd'
                        : '#1e40af'
                      : txS(dark),
                  }}
                >
                  {msg.senderName}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium capitalize"
                  style={{
                    backgroundColor: isPatient
                      ? dark
                        ? '#1e40af'
                        : '#bfdbfe'
                      : dark
                        ? '#334155'
                        : '#e2e8f0',
                    color: isPatient
                      ? dark
                        ? '#bfdbfe'
                        : '#1e40af'
                      : txS(dark),
                  }}
                >
                  {msg.senderType}
                </span>
              </div>

              {/* Message body */}
              <p
                className="text-sm leading-relaxed"
                style={{ color: txP(dark) }}
              >
                {msg.messageContent}
              </p>

              {/* Timestamp */}
              <p
                className="text-[10px] mt-1.5 text-right"
                style={{ color: txS(dark) }}
              >
                {formatDateTime(msg.sentAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Shared files panel
 * Same data shape as chat but isFile === true.
 * Files with isImage also have fileUrl for inline preview.
 */
const TelehealthFilesPanel = ({ messages, dark }) => {
  const fileMsgs = (messages ?? []).filter(m => m.isFile);

  if (!fileMsgs.length)
    return (
      <Empty
        message="No files shared in this session"
        icon={Paperclip}
        dark={dark}
      />
    );

  const downloadFile = async (url, name) => {
    try {
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed');
      const blob = await res.blob();
      const a = Object.assign(document.createElement('a'), {
        href: URL.createObjectURL(blob),
        download: name,
      });
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      alert('Download failed. Please try again.');
    }
  };

  return (
    <div className="space-y-3">
      {fileMsgs.map((msg, i) => (
        <div
          key={msg.messageId ?? i}
          className="rounded-xl border p-4"
          style={{ backgroundColor: surfBg(dark), borderColor: bdr(dark) }}
        >
          <div className="flex items-start gap-3">
            {/* File type icon */}
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: msg.isImage ? '#dbeafe' : surfAlt(dark),
              }}
            >
              {msg.isImage ? (
                <ImageIcon size={22} style={{ color: '#0284c7' }} />
              ) : (
                <File size={22} style={{ color: txS(dark) }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* File name + sender */}
              <p
                className="font-semibold text-sm truncate"
                style={{ color: txP(dark) }}
              >
                {msg.messageContent}
              </p>
              <p className="text-xs mt-0.5" style={{ color: txS(dark) }}>
                {fmtSize(msg.fileSize)}
                {msg.fileSize ? ' · ' : ''}Shared by {msg.senderName}
              </p>

              {/* Inline image preview */}
              {msg.isImage && msg.fileUrl && (
                <div className="mt-3">
                  <img
                    src={msg.fileUrl}
                    alt={msg.messageContent}
                    className="max-w-full h-auto rounded-xl cursor-pointer border"
                    style={{ maxHeight: 280, borderColor: bdr(dark) }}
                    onClick={() => window.open(msg.fileUrl, '_blank')}
                    onError={e => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Download button */}
              {msg.fileUrl && (
                <button
                  onClick={() => downloadFile(msg.fileUrl, msg.messageContent)}
                  className="mt-3 flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold transition-colors"
                  style={{ backgroundColor: COLORS.primary, color: 'white' }}
                >
                  <Download size={14} /> Download
                </button>
              )}
            </div>
          </div>

          {/* Timestamp footer */}
          <div
            className="mt-3 pt-3 border-t text-xs flex items-center gap-1.5"
            style={{ borderColor: bdr(dark), color: txS(dark) }}
          >
            <Clock size={11} />
            {formatDateTime(msg.sentAt)}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── APPOINTMENT VIEW ─────────────────────────────────────────────────────────
/**
 * For online consultations, tabs are:
 *   Overview · Clinical Details · Vitals · Chat · Files · [Prescriptions] · [Admission]
 *
 * For in-person appointments:
 *   Overview · Clinical Details · Vitals · [Prescriptions] · [Admission]
 */
const AppointmentView = ({ record, dark }) => {
  const isTele = record.isOnlineConsultation;
  const msgs = record.consultationMessages ?? [];
  const chatMsgs = msgs.filter(m => !m.isFile);
  const fileMsgs = msgs.filter(m => m.isFile);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'clinical', label: 'Clinical Details', icon: Stethoscope },
    { id: 'vitals', label: 'Vitals', icon: Heart },
    ...(isTele
      ? [
          {
            id: 'chat',
            label: 'Chat',
            icon: MessageSquare,
            count: chatMsgs.length,
          },
          {
            id: 'files',
            label: 'Files',
            icon: Paperclip,
            count: fileMsgs.length,
          },
        ]
      : []),
    ...(record.prescriptions?.length
      ? [
          {
            id: 'prescriptions',
            label: 'Prescriptions',
            icon: Pill,
            count: record.prescriptions.length,
          },
        ]
      : []),
    ...(record.relatedAdmission
      ? [{ id: 'admission', label: 'Admission', icon: Building2 }]
      : []),
  ];

  const [tab, setTab] = useState('overview');

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={tabs} active={tab} onChange={setTab} dark={dark} />

      <div className="flex-1 overflow-y-auto pt-4 pb-2 space-y-4">
        {/* ── Overview ── */}
        {tab === 'overview' && (
          <>
            {/* Telehealth session summary banner */}
            {isTele && record.consultation && (
              <Section dark={dark} accent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <Video size={22} style={{ color: '#0284c7' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-bold text-sm"
                      style={{ color: dark ? '#93c5fd' : '#0284c7' }}
                    >
                      Online Consultation Session
                    </p>
                    <div
                      className="flex flex-wrap gap-4 mt-1 text-xs"
                      style={{ color: txS(dark) }}
                    >
                      <span className="flex items-center gap-1">
                        <Clock size={11} />
                        {fmtDur(record.consultation.durationSeconds)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare size={11} />
                        {chatMsgs.length} messages
                      </span>
                      <span className="flex items-center gap-1">
                        <Paperclip size={11} />
                        {fileMsgs.length} files
                      </span>
                    </div>
                  </div>
                  <PillBadge status={record.consultation.status} />
                </div>
              </Section>
            )}

            <InfoGrid
              dark={dark}
              items={[
                {
                  icon: Calendar,
                  label: 'Date & Time',
                  value: formatDateTime(record.date),
                },
                { icon: User, label: 'Doctor', value: record.doctor },
                {
                  icon: Activity,
                  label: 'Status',
                  value: record.status,
                  badge: true,
                },
                {
                  icon: ClipboardList,
                  label: 'Type',
                  value: normalizedWord(record.appointmentType),
                },
              ]}
            />

            {record.chiefComplaint && (
              <Section title="Chief Complaint" icon={AlertTriangle} dark={dark}>
                <p className="text-sm" style={{ color: txP(dark) }}>
                  {record.chiefComplaint}
                </p>
              </Section>
            )}

            {str(record.diagnosis) && (
              <Section title="Diagnosis" icon={Stethoscope} dark={dark} accent>
                <p className="text-sm font-medium" style={{ color: txP(dark) }}>
                  {str(record.diagnosis)}
                </p>
                {record.secondaryDiagnoses && (
                  <p
                    className="text-xs mt-2 opacity-70"
                    style={{ color: txS(dark) }}
                  >
                    Secondary: {record.secondaryDiagnoses}
                  </p>
                )}
              </Section>
            )}

            {(record.requiresFollowup || record.followupDate) && (
              <Section title="Follow-up" icon={CalendarCheck} dark={dark}>
                {record.followupDate && (
                  <p
                    className="text-sm font-medium"
                    style={{ color: txP(dark) }}
                  >
                    {formatDate(record.followupDate)}
                  </p>
                )}
              </Section>
            )}
          </>
        )}

        {/* ── Clinical Details ── */}
        {tab === 'clinical' && (
          <>
            {str(record.diagnosis) && (
              <Section
                title="Primary Diagnosis"
                icon={Stethoscope}
                dark={dark}
                accent
              >
                <p
                  className="text-sm font-semibold"
                  style={{ color: txP(dark) }}
                >
                  {str(record.diagnosis)}
                </p>
                {record.diagnosis?.history_of_present_illness && (
                  <div
                    className="mt-3 pt-3 border-t"
                    style={{ borderColor: bdr(dark) }}
                  >
                    <p
                      className="text-xs font-bold mb-1"
                      style={{ color: txS(dark) }}
                    >
                      History of Present Illness
                    </p>
                    <p className="text-sm" style={{ color: txP(dark) }}>
                      {record.diagnosis.history_of_present_illness}
                    </p>
                  </div>
                )}
                {record.diagnosis?.physical_examination && (
                  <div
                    className="mt-3 pt-3 border-t"
                    style={{ borderColor: bdr(dark) }}
                  >
                    <p
                      className="text-xs font-bold mb-1"
                      style={{ color: txS(dark) }}
                    >
                      Physical Examination
                    </p>
                    <p className="text-sm" style={{ color: txP(dark) }}>
                      {record.diagnosis.physical_examination}
                    </p>
                  </div>
                )}
              </Section>
            )}
            {record.treatmentPlan && (
              <Section title="Treatment Plan" icon={ClipboardList} dark={dark}>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: txP(dark) }}
                >
                  {record.treatmentPlan}
                </p>
              </Section>
            )}
            {record.diagnosis?.disposition && (
              <Section title="Disposition" icon={FileText} dark={dark}>
                <p className="text-sm" style={{ color: txP(dark) }}>
                  {record.diagnosis.disposition}
                </p>
              </Section>
            )}
            {record.notes && (
              <Section title="Notes" icon={FileText} dark={dark}>
                <p className="text-sm italic" style={{ color: txP(dark) }}>
                  {record.notes}
                </p>
              </Section>
            )}
            {!str(record.diagnosis) &&
              !record.treatmentPlan &&
              !record.notes && (
                <Empty
                  message="No clinical details recorded"
                  icon={Stethoscope}
                  dark={dark}
                />
              )}
          </>
        )}

        {tab === 'vitals' && <VitalsPanel vitals={record.vitals} dark={dark} />}
        {tab === 'chat' && <TelehealthChatPanel messages={msgs} dark={dark} />}
        {tab === 'files' && (
          <TelehealthFilesPanel messages={msgs} dark={dark} />
        )}
        {tab === 'prescriptions' && (
          <PrescriptionsPanel
            prescriptions={record.prescriptions}
            dark={dark}
          />
        )}

        {/* ── Related Admission ── */}
        {tab === 'admission' &&
          (record.relatedAdmission ? (
            <>
              <InfoGrid
                dark={dark}
                items={[
                  {
                    icon: Calendar,
                    label: 'Admission Date',
                    value: formatDateTime(
                      record.relatedAdmission.admissionDate,
                    ),
                  },
                  {
                    icon: User,
                    label: 'Attending Doctor',
                    value: record.relatedAdmission.doctor,
                  },
                  {
                    icon: Building2,
                    label: 'Type',
                    value: record.relatedAdmission.admissionType,
                  },
                  {
                    icon: Activity,
                    label: 'Status',
                    value: record.relatedAdmission.status,
                    badge: true,
                  },
                ]}
              />
              {record.relatedAdmission.diagnosis && (
                <Section title="Diagnosis" icon={Stethoscope} dark={dark}>
                  <p className="text-sm" style={{ color: txP(dark) }}>
                    {record.relatedAdmission.diagnosis}
                  </p>
                </Section>
              )}
              {record.relatedAdmission.prescriptions?.length > 0 && (
                <PrescriptionsPanel
                  prescriptions={record.relatedAdmission.prescriptions}
                  dark={dark}
                />
              )}
            </>
          ) : (
            <Empty
              message="No related admission"
              icon={Building2}
              dark={dark}
            />
          ))}
      </div>
    </div>
  );
};

// ─── ADMISSION VIEW ───────────────────────────────────────────────────────────
const AdmissionView = ({ record, dark }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'details', label: 'Details', icon: Building2 },
    ...(record.recentProgressNotes?.length
      ? [
          {
            id: 'progress',
            label: 'Progress Notes',
            icon: ClipboardList,
            count:
              record.progressNotesCount || record.recentProgressNotes.length,
          },
        ]
      : []),
    ...(record.prescriptions?.length
      ? [
          {
            id: 'prescriptions',
            label: 'Prescriptions',
            icon: Pill,
            count: record.prescriptions.length,
          },
        ]
      : []),
    ...(record.dischargeDate || record.dischargeSummary
      ? [{ id: 'discharge', label: 'Discharge', icon: TrendingUp }]
      : []),
  ];
  const [tab, setTab] = useState('overview');

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={tabs} active={tab} onChange={setTab} dark={dark} />
      <div className="flex-1 overflow-y-auto pt-4 pb-2 space-y-4">
        {tab === 'overview' && (
          <>
            <InfoGrid
              dark={dark}
              items={[
                {
                  icon: Calendar,
                  label: 'Admission Date',
                  value: formatDateTime(record.date),
                },
                { icon: User, label: 'Attending Dr', value: record.doctor },
                { icon: Building2, label: 'Type', value: record.admissionType },
                {
                  icon: Activity,
                  label: 'Status',
                  value: record.status,
                  badge: true,
                },
              ]}
            />
            <InfoCard
              icon={FileText}
              label="Admission #"
              value={record.admissionNumber}
              dark={dark}
            />
            {record.diagnosis && (
              <Section
                title="Diagnosis at Admission"
                icon={Stethoscope}
                dark={dark}
                accent
              >
                <p className="text-sm font-medium" style={{ color: txP(dark) }}>
                  {record.diagnosis}
                </p>
              </Section>
            )}
          </>
        )}

        {tab === 'details' && (
          <InfoGrid
            dark={dark}
            items={[
              {
                icon: Clock,
                label: 'Length of Stay',
                value: record.lengthOfStay
                  ? `${record.lengthOfStay} days`
                  : null,
              },
              {
                icon: Calendar,
                label: 'Expected Discharge',
                value: record.expectedDischargeDate
                  ? formatDate(record.expectedDischargeDate)
                  : null,
              },
              {
                icon: Building2,
                label: 'Admission Source',
                value: record.admissionSource,
              },
              {
                icon: Building2,
                label: 'Admission Type',
                value: record.admissionType,
              },
            ]}
          />
        )}

        {tab === 'progress' && (
          <ProgressNotesPanel notes={record.recentProgressNotes} dark={dark} />
        )}
        {tab === 'prescriptions' && (
          <PrescriptionsPanel
            prescriptions={record.prescriptions}
            dark={dark}
          />
        )}

        {tab === 'discharge' && (
          <div className="space-y-4">
            <InfoGrid
              dark={dark}
              items={[
                {
                  icon: Calendar,
                  label: 'Discharge Date',
                  value: record.dischargeDate
                    ? formatDateTime(record.dischargeDate)
                    : null,
                },
                {
                  icon: FileText,
                  label: 'Discharge Type',
                  value: record.dischargeType,
                },
              ]}
            />
            {record.dischargeSummary && (
              <Section title="Discharge Summary" icon={FileText} dark={dark}>
                <p
                  className="text-sm whitespace-pre-wrap leading-relaxed"
                  style={{ color: txP(dark) }}
                >
                  {record.dischargeSummary}
                </p>
              </Section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── LABORATORY VIEW ──────────────────────────────────────────────────────────
const LaboratoryView = ({ record, dark }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    ...(record.specimen
      ? [{ id: 'specimen', label: 'Specimen', icon: FlaskConical }]
      : []),
    ...(record.results?.length
      ? [
          {
            id: 'results',
            label: 'Results',
            icon: FileText,
            count: record.resultCount,
          },
        ]
      : []),
    ...(record.clinicalIndication
      ? [{ id: 'clinical', label: 'Clinical Info', icon: Stethoscope }]
      : []),
  ];
  const [tab, setTab] = useState('overview');

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={tabs} active={tab} onChange={setTab} dark={dark} />
      <div className="flex-1 overflow-y-auto pt-4 pb-2 space-y-4">
        {tab === 'overview' && (
          <InfoGrid
            dark={dark}
            items={[
              {
                icon: Calendar,
                label: 'Order Date',
                value: formatDateTime(record.date),
              },
              {
                icon: FlaskConical,
                label: 'Test Name',
                value: record.testName || record.test?.name,
              },
              {
                icon: Building2,
                label: 'Department',
                value: record.department || record.test?.department,
              },
              { icon: Activity, label: 'Priority', value: record.priority },
              {
                icon: User,
                label: 'Ordering Physician',
                value: record.orderingPhysician,
              },
              {
                icon: Activity,
                label: 'Status',
                value: record.status,
                badge: true,
              },
            ]}
          />
        )}

        {tab === 'specimen' && record.specimen && (
          <InfoGrid
            dark={dark}
            items={[
              {
                icon: FlaskConical,
                label: 'Type',
                value: record.specimen.type,
              },
              {
                icon: FileText,
                label: 'Specimen #',
                value: record.specimen.specimenNumber,
              },
              {
                icon: Calendar,
                label: 'Collection Date',
                value: formatDateTime(record.specimen.collectionDate),
              },
            ]}
          />
        )}

        {tab === 'results' && (
          <LabResultsPanel results={record.results} dark={dark} />
        )}
        {tab === 'clinical' && (
          <Section title="Clinical Indication" icon={Stethoscope} dark={dark}>
            <p className="text-sm" style={{ color: txP(dark) }}>
              {record.clinicalIndication}
            </p>
          </Section>
        )}
      </div>
    </div>
  );
};

// ─── IMAGING VIEW ─────────────────────────────────────────────────────────────
const ImagingView = ({ record, dark }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'study', label: 'Study Details', icon: Scan },
    ...(record.report
      ? [{ id: 'report', label: 'Radiology Report', icon: FileText }]
      : []),
    ...(record.clinicalIndication
      ? [{ id: 'clinical', label: 'Clinical Info', icon: Stethoscope }]
      : []),
  ];
  const [tab, setTab] = useState('overview');

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={tabs} active={tab} onChange={setTab} dark={dark} />
      <div className="flex-1 overflow-y-auto pt-4 pb-2 space-y-4">
        {tab === 'overview' && (
          <>
            <InfoGrid
              dark={dark}
              items={[
                {
                  icon: Calendar,
                  label: 'Study Date',
                  value: formatDateTime(record.date),
                },
                {
                  icon: Scan,
                  label: 'Modality',
                  value: record.modality || record.service?.modality,
                },
                { icon: Building2, label: 'Body Part', value: record.bodyPart },
                {
                  icon: Activity,
                  label: 'Status',
                  value: record.status,
                  badge: true,
                },
                {
                  icon: FileText,
                  label: 'Accession #',
                  value: record.accessionNumber,
                },
                { icon: Activity, label: 'Priority', value: record.priority },
              ]}
            />
            {record.description && (
              <Section title="Description" icon={FileText} dark={dark}>
                <p className="text-sm" style={{ color: txP(dark) }}>
                  {record.description}
                </p>
              </Section>
            )}
          </>
        )}

        {tab === 'study' && (
          <InfoGrid
            dark={dark}
            items={[
              { icon: Scan, label: 'Service', value: record.service?.name },
              {
                icon: FileText,
                label: 'Service Code',
                value: record.service?.code,
              },
              {
                icon: Building2,
                label: 'Category',
                value: record.service?.category,
              },
              {
                icon: User,
                label: 'Referring Physician',
                value: record.appointment?.referringPhysician,
              },
            ]}
          />
        )}

        {tab === 'report' && (
          <RadiologyReportPanel report={record.report} dark={dark} />
        )}
        {tab === 'clinical' && (
          <Section title="Clinical Indication" icon={Stethoscope} dark={dark}>
            <p className="text-sm" style={{ color: txP(dark) }}>
              {record.clinicalIndication}
            </p>
          </Section>
        )}
      </div>
    </div>
  );
};

// ─── MEDICAL RECORD VIEW ──────────────────────────────────────────────────────
const MedicalRecordView = ({ record, dark }) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'clinical', label: 'Clinical Details', icon: Stethoscope },
    ...(record.treatmentPlan || record.treatment
      ? [{ id: 'treatment', label: 'Treatment', icon: ClipboardList }]
      : []),
  ];
  const [tab, setTab] = useState('overview');

  return (
    <div className="flex flex-col h-full">
      <TabBar tabs={tabs} active={tab} onChange={setTab} dark={dark} />
      <div className="flex-1 overflow-y-auto pt-4 pb-2 space-y-4">
        {tab === 'overview' && (
          <>
            <InfoGrid
              dark={dark}
              items={[
                {
                  icon: Calendar,
                  label: 'Record Date',
                  value: formatDateTime(record.date),
                },
                { icon: User, label: 'Doctor', value: record.doctor },
                {
                  icon: FileText,
                  label: 'Record Type',
                  value: record.recordType,
                },
                {
                  icon: Building2,
                  label: 'Visit Type',
                  value: record.visitType,
                },
              ]}
            />
            {record.chiefComplaint && (
              <Section title="Chief Complaint" icon={AlertTriangle} dark={dark}>
                <p className="text-sm" style={{ color: txP(dark) }}>
                  {record.chiefComplaint}
                </p>
              </Section>
            )}
          </>
        )}

        {tab === 'clinical' && (
          <>
            {str(record.diagnosis) && (
              <Section title="Diagnosis" icon={Stethoscope} dark={dark} accent>
                <p
                  className="text-sm font-semibold"
                  style={{ color: txP(dark) }}
                >
                  {str(record.diagnosis)}
                </p>
              </Section>
            )}
            {record.notes && (
              <Section title="Notes" icon={FileText} dark={dark}>
                <p
                  className="text-sm italic leading-relaxed"
                  style={{ color: txP(dark) }}
                >
                  {record.notes}
                </p>
              </Section>
            )}
            {!str(record.diagnosis) && !record.notes && (
              <Empty
                message="No clinical details recorded"
                icon={Stethoscope}
                dark={dark}
              />
            )}
          </>
        )}

        {tab === 'treatment' && (
          <Section title="Treatment Plan" icon={ClipboardList} dark={dark}>
            <p
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: txP(dark) }}
            >
              {record.treatmentPlan || record.treatment}
            </p>
          </Section>
        )}
      </div>
    </div>
  );
};

// ─── ROOT MODAL ───────────────────────────────────────────────────────────────
const RecordDetailsModal = ({
  isOpen,
  onClose,
  record,
  userRole = 'patient',
}) => {
  const dark = dm();
  const [loading, setLoading] = useState(false);
  const [detailed, setDetailed] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && record) {
      setDetailed(null);
      setError(null);
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, record?.id]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await medicalRecordsService.getRecordByType(record);
      setDetailed(res);
    } catch {
      setError('Could not load full details — showing available data.');
    } finally {
      setLoading(false);
    }
  };

  if (!record) return null;

  // Merge timeline data with any extra fetched data
  const merged = detailed ? { ...record, ...detailed } : record;

  const getTitle = () => {
    const map = {
      appointment: merged.isOnlineConsultation
        ? 'Online Consultation Details'
        : 'Appointment Details',
      admission: 'Admission Details',
      laboratory: 'Lab Test Details',
      imaging: 'Imaging Study Details',
      medical_record: 'Medical Record Details',
    };
    return map[record.type] ?? 'Record Details';
  };

  const renderBody = () => {
    if (loading)
      return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: COLORS.primary }}
          />
          <p className="text-sm" style={{ color: txS(dark) }}>
            Loading details…
          </p>
        </div>
      );

    switch (record.type) {
      case 'appointment':
        return <AppointmentView record={merged} dark={dark} />;
      case 'admission':
        return <AdmissionView record={merged} dark={dark} />;
      case 'laboratory':
        return <LaboratoryView record={merged} dark={dark} />;
      case 'imaging':
        return <ImagingView record={merged} dark={dark} />;
      case 'medical_record':
        return <MedicalRecordView record={merged} dark={dark} />;
      default:
        return (
          <Empty message="Unknown record type" icon={FileText} dark={dark} />
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={getTitle()} size="xl">
      <div
        className="flex flex-col"
        style={{ minHeight: 420, maxHeight: 'min(680px, 80vh)' }}
      >
        {/* Non-blocking error banner */}
        {error && !loading && (
          <div className="mb-3 flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm shrink-0">
            <div className="flex items-center gap-2">
              <AlertCircle size={14} />
              {error}
            </div>
            <button
              onClick={load}
              className="flex items-center gap-1 text-xs font-semibold underline"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        <div className="flex-1 overflow-hidden flex flex-col">
          {renderBody()}
        </div>
      </div>
    </Modal>
  );
};

export default RecordDetailsModal;
