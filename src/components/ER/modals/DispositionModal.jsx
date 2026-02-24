import { useState, useEffect } from 'react';
import {
  X,
  Home,
  Building2,
  ArrowRightLeft,
  AlertTriangle,
  Skull,
  ChevronDown,
  Loader,
  CheckCircle,
  FileText,
  Phone,
  UserCheck,
  Bed,
} from 'lucide-react';
import { erService } from '../../../services/erApi';
import BedSelectionModal from '../../Modals/BedSelectionModal';
import toast from 'react-hot-toast';

// ─── DoctorSelect — defined outside so it never remounts on render ────────────
const DoctorSelect = ({ value, onChange, doctors, loading }) => (
  <div className="relative">
    {loading ? (
      <div className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 flex items-center gap-2">
        <Loader size={13} className="animate-spin shrink-0" />
        Loading doctors…
      </div>
    ) : (
      <>
        <select
          value={value ?? ''}
          onChange={e =>
            onChange(e.target.value ? parseInt(e.target.value) : null)
          }
          className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="">Select admitting doctor…</option>
          {doctors.map(doc => {
            const p = doc.staff?.person;
            const name = p
              ? `Dr. ${p.first_name} ${p.last_name}`
              : `Doctor #${doc.er_doctor_id}`;
            const tag =
              doc.is_on_shift && doc.is_available
                ? ' — Available'
                : doc.is_on_shift
                  ? ' — Busy'
                  : ' — Off shift';
            return (
              <option key={doc.er_doctor_id} value={doc.er_doctor_id}>
                {name}
                {tag}
              </option>
            );
          })}
        </select>
        <ChevronDown
          size={13}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </>
    )}
  </div>
);

// ─── Constants (defined outside component — never recreated) ─────────────────

const OUTCOMES = [
  {
    key: 'discharged',
    label: 'Discharge',
    sub: 'Send patient home',
    Icon: Home,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    chip: 'bg-green-100 dark:bg-green-900/40',
    btnCls: 'bg-green-600 hover:bg-green-700',
  },
  {
    key: 'admitted',
    label: 'Admit to Ward',
    sub: 'Transfer to inpatient bed',
    Icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    border: 'border-purple-200 dark:border-purple-800',
    chip: 'bg-purple-100 dark:bg-purple-900/40',
    btnCls: 'bg-purple-600 hover:bg-purple-700',
  },
  // {
  //   key: 'transferred',
  //   label: 'Transfer',
  //   sub: 'Send to another facility',
  //   Icon: ArrowRightLeft,
  //   color: 'text-blue-600 dark:text-blue-400',
  //   bg: 'bg-blue-50 dark:bg-blue-900/20',
  //   border: 'border-blue-200 dark:border-blue-800',
  //   chip: 'bg-blue-100 dark:bg-blue-900/40',
  //   btnCls: 'bg-blue-600 hover:bg-blue-700',
  // },
  // {
  //   key: 'left_ama',
  //   label: 'Left AMA',
  //   sub: 'Against medical advice',
  //   Icon: AlertTriangle,
  //   color: 'text-amber-600 dark:text-amber-400',
  //   bg: 'bg-amber-50 dark:bg-amber-900/20',
  //   border: 'border-amber-200 dark:border-amber-800',
  //   chip: 'bg-amber-100 dark:bg-amber-900/40',
  //   btnCls: 'bg-amber-500 hover:bg-amber-600',
  // },
  {
    key: 'deceased',
    label: 'Deceased',
    sub: 'Document time of death',
    Icon: Skull,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-50 dark:bg-slate-800',
    border: 'border-slate-200 dark:border-slate-600',
    chip: 'bg-slate-100 dark:bg-slate-700',
    btnCls: 'bg-slate-700 hover:bg-slate-800',
  },
];

const DISCHARGE_TYPES = [
  { value: 'home', label: 'Home' },
  { value: 'home_with_hha', label: 'Home with home health aide' },
  { value: 'rehab', label: 'Rehabilitation facility' },
  { value: 'snf', label: 'Skilled nursing facility' },
];

const TRANSPORT_MODES = ['Ambulance', 'Private vehicle', 'Helicopter', 'Other'];

const EMPTY = {
  discharged: {
    discharge_type: 'home',
    condition_at_discharge: '',
    discharge_instructions: '',
    follow_up_referral: '',
  },
  admitted: {
    selected_bed_id: null,
    selected_bed_info: null,
    primary_diagnosis: '',
    admitting_doctor_id: null,
    estimated_stay_days: '',
  },
  transferred: {
    destination_facility: '',
    transfer_reason: '',
    transport_mode: 'Ambulance',
    contact_number: '',
  },
  left_ama: { refusal_reason: '', witnessed_by: '', ama_notes: '' },
  deceased: {
    time_of_death: new Date().toISOString().slice(0, 16),
    cause_of_death: '',
    pronounced_by: '',
  },
};

// ─── Input style helpers (plain functions, not components — no re-mount) ───────
const inp = (err = false) =>
  `w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${err ? 'border-red-400 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'}`;
const area = (err = false) => inp(err) + ' resize-none';
const sel = (err = false) => inp(err) + ' appearance-none cursor-pointer';

// ─── Field wrapper — defined OUTSIDE component so it's never recreated ────────
// This is the root cause of the focus bug: defining components inside render
// causes React to unmount + remount them on every keystroke.
const Field = ({ label, required, error, half, children }) => (
  <div className={half ? '' : 'col-span-2'}>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function DispositionModal({
  isOpen,
  onClose,
  visit,
  onSuccess,
}) {
  const [outcome, setOutcome] = useState(null);
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [phase, setPhase] = useState('select');
  const [showBedModal, setShowBedModal] = useState(false);
  const [doctors, setDoctors] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setOutcome(null);
      setForm({});
      setErrors({});
      setPhase('select');
    }
  }, [isOpen]);

  const selectOutcome = o => {
    setOutcome(o);
    setForm({ ...EMPTY[o.key] });
    setErrors({});
    setPhase('form');
    if (o.key === 'admitted') loadDoctors();
  };

  const loadDoctors = async () => {
    setLoadingDocs(true);
    try {
      const res = await erService.getAllERDoctors();
      const list = res?.data ?? res ?? [];
      setDoctors(list);
    } catch {
      toast.error('Failed to load doctors');
    } finally {
      setLoadingDocs(false);
    }
  };

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    setErrors(e => ({ ...e, [key]: null }));
  };

  const handleBedSelect = bed => {
    set('selected_bed_id', bed.bed_id);
    set('selected_bed_info', bed);
  };

  const validate = () => {
    const e = {};
    if (outcome.key === 'discharged') {
      if (!form.condition_at_discharge?.trim())
        e.condition_at_discharge = 'Required';
    }
    if (outcome.key === 'admitted') {
      if (!form.selected_bed_id) e.selected_bed_id = 'Please select a bed';
      if (!form.primary_diagnosis?.trim()) e.primary_diagnosis = 'Required';
    }
    if (outcome.key === 'transferred') {
      if (!form.destination_facility?.trim())
        e.destination_facility = 'Required';
      if (!form.transfer_reason?.trim()) e.transfer_reason = 'Required';
    }
    if (outcome.key === 'deceased') {
      if (!form.time_of_death) e.time_of_death = 'Required';
      if (!form.cause_of_death?.trim()) e.cause_of_death = 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!outcome || !validate()) return;
    setSaving(true);
    try {
      let result;
      switch (outcome.key) {
        case 'discharged':
          result = await erService.dischargePatient(visit.er_visit_id, {
            dispositionType: form.discharge_type,
            condition_at_discharge: form.condition_at_discharge,
            discharge_instructions: form.discharge_instructions || null,
            follow_up_referral: form.follow_up_referral || null,
          });
          break;
        case 'admitted':
          result = await erService.admitToWard(visit.er_visit_id, {
            selected_bed_id: form.selected_bed_id,
            selected_bed_info: form.selected_bed_info,
            primary_diagnosis: form.primary_diagnosis,
            admitting_doctor_id: form.admitting_doctor_id || null,
            estimated_stay_days: form.estimated_stay_days
              ? parseInt(form.estimated_stay_days)
              : null,
          });
          break;
        case 'transferred':
          result = await erService.transferPatient(visit.er_visit_id, {
            destination_facility: form.destination_facility,
            transfer_reason: form.transfer_reason,
            transport_mode: form.transport_mode || null,
            contact_number: form.contact_number || null,
          });
          break;
        case 'left_ama':
          result = await erService.updateStatus(
            visit.er_visit_id,
            'left_ama',
            'left_ama',
          );
          break;
        case 'deceased':
          result = await erService.updateStatus(
            visit.er_visit_id,
            'deceased',
            'deceased',
          );
          break;
      }
      setPhase('done');
      setTimeout(() => onSuccess?.({ newStatus: outcome.key, result }), 900);
    } catch (err) {
      toast.error(
        err.response?.data?.message ??
          err.message ??
          'Failed to save disposition',
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const patientName = visit?.patient
    ? `${visit.patient.person?.first_name ?? ''} ${visit.patient.person?.last_name ?? ''}`.trim() ||
      'Unknown Patient'
    : 'Unknown Patient';

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div
          className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
          style={{ maxHeight: '90vh' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText
                  size={17}
                  className="text-slate-600 dark:text-slate-400"
                />
              </div>
              <div>
                <h2 className="font-black text-slate-900 dark:text-slate-100">
                  Disposition
                </h2>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {visit?.er_number} · {patientName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 min-h-0">
            {/* ══ SELECT ══ */}
            {phase === 'select' && (
              <div className="p-6">
                <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                  Select outcome
                </p>
                <div className="space-y-2">
                  {OUTCOMES.map(o => (
                    <button
                      key={o.key}
                      onClick={() => selectOutcome(o)}
                      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border-2 text-left transition-all hover:-translate-y-px hover:shadow-sm ${o.bg} ${o.border}`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${o.chip}`}
                      >
                        <o.Icon size={17} className={o.color} />
                      </div>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${o.color}`}>
                          {o.label}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {o.sub}
                        </p>
                      </div>
                      <ChevronDown
                        size={15}
                        className="text-slate-400 -rotate-90 shrink-0"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ══ FORM ══ */}
            {phase === 'form' && outcome && (
              <div className="p-6 space-y-4">
                {/* Outcome badge */}
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${outcome.bg} ${outcome.border}`}
                >
                  <outcome.Icon size={16} className={outcome.color} />
                  <div className="flex-1">
                    <p className={`font-black text-sm ${outcome.color}`}>
                      {outcome.label}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {outcome.sub}
                    </p>
                  </div>
                  <button
                    onClick={() => setPhase('select')}
                    className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    Change
                  </button>
                </div>

                {/* ── DISCHARGE ── */}
                {outcome.key === 'discharged' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Discharge Type" required half>
                      <div className="relative">
                        <select
                          value={form.discharge_type}
                          onChange={e => set('discharge_type', e.target.value)}
                          className={sel()}
                        >
                          {DISCHARGE_TYPES.map(d => (
                            <option key={d.value} value={d.value}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Condition at Discharge"
                      required
                      half
                      error={errors.condition_at_discharge}
                    >
                      <input
                        value={form.condition_at_discharge}
                        onChange={e =>
                          set('condition_at_discharge', e.target.value)
                        }
                        placeholder="e.g. Stable, Improved"
                        className={inp(!!errors.condition_at_discharge)}
                      />
                    </Field>

                    <Field label="Discharge Instructions">
                      <textarea
                        value={form.discharge_instructions}
                        onChange={e =>
                          set('discharge_instructions', e.target.value)
                        }
                        placeholder="Medications, restrictions, wound care…"
                        rows={3}
                        className={area()}
                      />
                    </Field>

                    <Field label="Follow-up / Referral">
                      <textarea
                        value={form.follow_up_referral}
                        onChange={e =>
                          set('follow_up_referral', e.target.value)
                        }
                        placeholder="e.g. Follow up with PCP in 7 days…"
                        rows={3}
                        className={area()}
                      />
                    </Field>
                  </div>
                )}

                {/* ── ADMIT ── */}
                {outcome.key === 'admitted' && (
                  <div className="p-4 rounded-xl border-2 border-purple-300 dark:border-purple-700 space-y-4">
                    <h4 className="font-bold text-sm flex items-center gap-2 text-purple-600 dark:text-purple-400">
                      <Building2 size={15} /> Admission Details
                    </h4>

                    {/* Bed selection — same pattern as DispositionTab */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                        Assign Bed<span className="text-red-500 ml-0.5">*</span>
                      </label>
                      {form.selected_bed_info ? (
                        <div className="flex items-center justify-between p-3 rounded-lg border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20">
                          <div className="flex items-center gap-3">
                            <Bed
                              size={16}
                              className="text-green-600 dark:text-green-400 shrink-0"
                            />
                            <div>
                              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                Bed {form.selected_bed_info.bed_number}
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Floor {form.selected_bed_info.floor_number} ·
                                Room {form.selected_bed_info.room_number} ·{' '}
                                {form.selected_bed_info.bed_type
                                  ?.replace('_', ' ')
                                  .toUpperCase()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowBedModal(true)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            Change
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowBedModal(true)}
                          className={`w-full px-4 py-3 rounded-lg border-2 border-dashed transition-all hover:border-solid hover:bg-slate-50 dark:hover:bg-slate-800 ${errors.selected_bed_id ? 'border-red-400 dark:border-red-500' : 'border-slate-300 dark:border-slate-600'}`}
                        >
                          <div className="flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400">
                            <Bed size={16} />
                            <span className="text-sm font-medium">
                              Select Bed
                            </span>
                          </div>
                        </button>
                      )}
                      {errors.selected_bed_id && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.selected_bed_id}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Primary Diagnosis"
                        required
                        error={errors.primary_diagnosis}
                      >
                        <input
                          value={form.primary_diagnosis}
                          onChange={e =>
                            set('primary_diagnosis', e.target.value)
                          }
                          placeholder="e.g. Acute MI, Pneumonia"
                          className={inp(!!errors.primary_diagnosis)}
                        />
                      </Field>

                      <Field label="Admitting Doctor" half>
                        <DoctorSelect
                          value={form.admitting_doctor_id}
                          onChange={id => set('admitting_doctor_id', id)}
                          doctors={doctors}
                          loading={loadingDocs}
                        />
                      </Field>

                      <Field label="Est. Stay (days)" half>
                        <input
                          type="number"
                          min="1"
                          value={form.estimated_stay_days}
                          onChange={e =>
                            set('estimated_stay_days', e.target.value)
                          }
                          placeholder="e.g. 3"
                          className={inp()}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── TRANSFER ── */}
                {outcome.key === 'transferred' && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="Destination Facility"
                      required
                      error={errors.destination_facility}
                    >
                      <input
                        value={form.destination_facility}
                        onChange={e =>
                          set('destination_facility', e.target.value)
                        }
                        placeholder="Hospital or clinic name"
                        className={inp(!!errors.destination_facility)}
                      />
                    </Field>

                    <Field label="Transport Mode" half>
                      <div className="relative">
                        <select
                          value={form.transport_mode}
                          onChange={e => set('transport_mode', e.target.value)}
                          className={sel()}
                        >
                          {TRANSPORT_MODES.map(m => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={13}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                      </div>
                    </Field>

                    <Field
                      label="Transfer Reason"
                      required
                      error={errors.transfer_reason}
                    >
                      <textarea
                        value={form.transfer_reason}
                        onChange={e => set('transfer_reason', e.target.value)}
                        placeholder="Reason for transfer…"
                        rows={3}
                        className={area(!!errors.transfer_reason)}
                      />
                    </Field>

                    <Field label="Contact at Destination" half>
                      <div className="relative">
                        <Phone
                          size={13}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                        />
                        <input
                          value={form.contact_number}
                          onChange={e => set('contact_number', e.target.value)}
                          placeholder="+63 2 xxxx xxxx"
                          className={inp() + ' pl-8'}
                        />
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── LEFT AMA ── */}
                {outcome.key === 'left_ama' && (
                  <div className="space-y-3">
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                        Against Medical Advice
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                        Patient has chosen to leave without completing
                        treatment.
                      </p>
                    </div>
                    <Field label="Reason for Refusal">
                      <textarea
                        value={form.refusal_reason}
                        onChange={e => set('refusal_reason', e.target.value)}
                        placeholder="Patient's stated reason…"
                        rows={3}
                        className={area()}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Witnessed by" half>
                        <input
                          value={form.witnessed_by}
                          onChange={e => set('witnessed_by', e.target.value)}
                          placeholder="Name of witness"
                          className={inp()}
                        />
                      </Field>
                      <Field label="Additional Notes" half>
                        <input
                          value={form.ama_notes}
                          onChange={e => set('ama_notes', e.target.value)}
                          placeholder="Any additional documentation"
                          className={inp()}
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── DECEASED ── */}
                {outcome.key === 'deceased' && (
                  <div className="space-y-3">
                    <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-3">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        Time of Death Documentation
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="Time of Death"
                        required
                        half
                        error={errors.time_of_death}
                      >
                        <input
                          type="datetime-local"
                          value={form.time_of_death}
                          onChange={e => set('time_of_death', e.target.value)}
                          className={inp(!!errors.time_of_death)}
                        />
                      </Field>
                      <Field label="Pronounced by" half>
                        <input
                          value={form.pronounced_by}
                          onChange={e => set('pronounced_by', e.target.value)}
                          placeholder="Doctor name"
                          className={inp()}
                        />
                      </Field>
                    </div>
                    <Field
                      label="Cause of Death"
                      required
                      error={errors.cause_of_death}
                    >
                      <textarea
                        value={form.cause_of_death}
                        onChange={e => set('cause_of_death', e.target.value)}
                        placeholder="Primary cause of death…"
                        rows={3}
                        className={area(!!errors.cause_of_death)}
                      />
                    </Field>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => setPhase('select')}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={submit}
                    disabled={saving}
                    className={`flex-1 py-2.5 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed shadow-sm ${outcome.btnCls}`}
                  >
                    {saving ? (
                      <>
                        <Loader size={14} className="animate-spin" /> Saving…
                      </>
                    ) : (
                      <>
                        <outcome.Icon size={14} /> Confirm {outcome.label}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ══ DONE ══ */}
            {phase === 'done' && outcome && (
              <div className="flex flex-col items-center gap-4 py-14 px-6 text-center">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center ${outcome.chip}`}
                >
                  <CheckCircle size={30} className={outcome.color} />
                </div>
                <div>
                  <p className="font-black text-lg text-slate-800 dark:text-slate-200">
                    {outcome.label} Confirmed
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {visit?.er_number} · {patientName}
                  </p>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Updating board…
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BedSelectionModal — outside main modal, same as DispositionTab */}
      <BedSelectionModal
        isOpen={showBedModal}
        onClose={() => setShowBedModal(false)}
        onSelectBed={handleBedSelect}
        admissionType="emergency"
      />
    </>
  );
}
