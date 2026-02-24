import { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit3,
  Save,
  XCircle,
  Clock,
  User,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  Pill,
  Activity,
  Loader,
} from 'lucide-react';
import { erService } from '../../../services/erApi';
import toast from 'react-hot-toast';

// Treatment type options — maps to treatment_type varchar(100)
const TREATMENT_TYPES = [
  'Medication',
  'IV Access',
  'Oxygen Therapy',
  'Wound Care',
  'Splinting / Immobilization',
  'Intubation',
  'CPR',
  'Defibrillation',
  'Suturing',
  'Catheterization',
  'Nasogastric Tube',
  'Monitoring',
  'Blood Transfusion',
  'Procedure',
  'Other',
];

// Route options — matches your enum exactly
const ROUTES = ['oral', 'IV', 'IM', 'subcutaneous', 'topical', 'inhalation'];

const MEDICATION_TYPES = ['Medication'];

const emptyForm = () => ({
  treatment_type: '',
  description: '',
  medication_name: '',
  dosage: '',
  route: '',
  outcome: '',
  treatment_time: new Date().toISOString().slice(0, 16), // datetime-local format
});

/**
 * TreatmentModal
 *
 * Lists all treatments for a visit and allows adding / editing / deleting.
 * Maps exactly to er_treatments columns:
 *   treatment_id, er_visit_id, treatment_time, performed_by,
 *   treatment_type, description, medication_name?, dosage?, route?, outcome?
 *
 * Props:
 *   isOpen       boolean
 *   onClose      fn
 *   visit        { er_visit_id, er_number, patient, triage_level, ... }
 *   currentUser  { staff_id, person: { first_name, last_name } }
 *   onUpdated    fn() — called after any create/update/delete
 */
export default function TreatmentModal({
  isOpen,
  onClose,
  visit,
  currentUser,
  onUpdated,
}) {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = new, number = editing
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen && visit) fetchTreatments();
    else {
      setTreatments([]);
      setFormOpen(false);
      setEditingId(null);
      setForm(emptyForm());
    }
  }, [isOpen, visit]);

  const fetchTreatments = async () => {
    setLoading(true);
    try {
      const res = await erService.getTreatmentsByVisit(visit.er_visit_id);
      setTreatments(res?.data ?? res ?? []);
    } catch {
      toast.error('Failed to load treatments');
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const openEdit = t => {
    setEditingId(t.treatment_id);
    setForm({
      treatment_type: t.treatment_type ?? '',
      description: t.description ?? '',
      medication_name: t.medication_name ?? '',
      dosage: t.dosage ?? '',
      route: t.route ?? '',
      outcome: t.outcome ?? '',
      treatment_time: t.treatment_time
        ? new Date(t.treatment_time).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm());
  };

  const isMedication = MEDICATION_TYPES.includes(form.treatment_type);

  const handleSave = async () => {
    if (!form.treatment_type) return toast.error('Treatment type is required');
    if (!form.description) return toast.error('Description is required');

    setSaving(true);
    try {
      const payload = {
        er_visit_id: visit.er_visit_id,
        performed_by: currentUser?.staff_id,
        treatment_type: form.treatment_type,
        description: form.description,
        medication_name: isMedication ? form.medication_name || null : null,
        dosage: isMedication ? form.dosage || null : null,
        route: isMedication ? form.route || null : null,
        outcome: form.outcome || null,
        treatment_time: form.treatment_time
          ? new Date(form.treatment_time).toISOString()
          : new Date().toISOString(),
      };

      if (editingId) {
        await erService.updateTreatment(editingId, payload);
        toast.success('Treatment updated');
      } else {
        await erService.createTreatment(payload);
        toast.success('Treatment recorded');
      }

      await fetchTreatments();
      closeForm();
      onUpdated?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save treatment');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async treatmentId => {
    setDeletingId(treatmentId);
    try {
      await erService.deleteTreatment(treatmentId);
      toast.success('Treatment removed');
      await fetchTreatments();
      onUpdated?.();
    } catch {
      toast.error('Failed to delete treatment');
    } finally {
      setDeletingId(null);
    }
  };

  const Field = ({ label, required, children }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );

  const inputCls =
    'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent';

  const patientName = visit?.patient
    ? `${visit.patient.person?.first_name ?? ''} ${visit.patient.person?.last_name ?? ''}`.trim() ||
      'Unknown Patient'
    : 'Unknown Patient';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <Activity
                size={17}
                className="text-green-600 dark:text-green-400"
              />
            </div>
            <div>
              <h2 className="font-black text-slate-900 dark:text-slate-100">
                Treatment Record
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {visit?.er_number} · {patientName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!formOpen && (
              <button
                onClick={openNew}
                className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all hover:-translate-y-px"
              >
                <Plus size={14} /> Add Treatment
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {/* ── ADD / EDIT FORM ── */}
          {formOpen && (
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center justify-between mb-4">
                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                  {editingId ? 'Edit Treatment' : 'New Treatment'}
                </p>
                <button
                  onClick={closeForm}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <XCircle size={15} className="text-slate-400" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Treatment type */}
                <div className="col-span-2">
                  <Field label="Treatment Type" required>
                    <div className="relative">
                      <select
                        value={form.treatment_type}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            treatment_type: e.target.value,
                            medication_name: '',
                            dosage: '',
                            route: '',
                          }))
                        }
                        className={inputCls}
                      >
                        <option value="">Select type…</option>
                        {TREATMENT_TYPES.map(t => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </Field>
                </div>

                {/* Medication fields — only if type is Medication */}
                {isMedication && (
                  <>
                    <Field label="Medication Name">
                      <input
                        value={form.medication_name}
                        onChange={e =>
                          setForm(f => ({
                            ...f,
                            medication_name: e.target.value,
                          }))
                        }
                        placeholder="e.g. Paracetamol, Morphine"
                        className={inputCls}
                      />
                    </Field>
                    <Field label="Dosage">
                      <input
                        value={form.dosage}
                        onChange={e =>
                          setForm(f => ({ ...f, dosage: e.target.value }))
                        }
                        placeholder="e.g. 500mg, 10ml"
                        className={inputCls}
                      />
                    </Field>
                    <div className="col-span-2">
                      <Field label="Route">
                        <div className="relative">
                          <select
                            value={form.route}
                            onChange={e =>
                              setForm(f => ({ ...f, route: e.target.value }))
                            }
                            className={inputCls}
                          >
                            <option value="">Select route…</option>
                            {ROUTES.map(r => (
                              <option key={r} value={r}>
                                {r.charAt(0).toUpperCase() + r.slice(1)}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={14}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                          />
                        </div>
                      </Field>
                    </div>
                  </>
                )}

                {/* Description */}
                <div className="col-span-2">
                  <Field label="Description / Notes" required>
                    <textarea
                      value={form.description}
                      onChange={e =>
                        setForm(f => ({ ...f, description: e.target.value }))
                      }
                      placeholder="Describe what was done, any observations, patient response…"
                      rows={3}
                      className={inputCls + ' resize-none'}
                    />
                  </Field>
                </div>

                {/* Outcome */}
                <div className="col-span-2">
                  <Field label="Outcome">
                    <textarea
                      value={form.outcome}
                      onChange={e =>
                        setForm(f => ({ ...f, outcome: e.target.value }))
                      }
                      placeholder="Patient response, result of treatment…"
                      rows={2}
                      className={inputCls + ' resize-none'}
                    />
                  </Field>
                </div>

                {/* Time */}
                <div className="col-span-2">
                  <Field label="Treatment Time">
                    <input
                      type="datetime-local"
                      value={form.treatment_time}
                      onChange={e =>
                        setForm(f => ({ ...f, treatment_time: e.target.value }))
                      }
                      className={inputCls}
                    />
                  </Field>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:-translate-y-px disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}
                  {saving ? 'Saving…' : editingId ? 'Update' : 'Save Treatment'}
                </button>
              </div>
            </div>
          )}

          {/* ── TREATMENT LIST ── */}
          <div className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
                <Loader size={18} className="animate-spin" />
                <span className="text-sm">Loading treatments…</span>
              </div>
            ) : treatments.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Activity
                    size={22}
                    className="text-slate-300 dark:text-slate-600"
                  />
                </div>
                <p className="font-semibold text-slate-500 dark:text-slate-400">
                  No treatments recorded yet
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  Use the Add Treatment button above to record the first one.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  {treatments.length} Treatment
                  {treatments.length !== 1 ? 's' : ''}
                </p>
                {treatments.map(t => {
                  const performer = t.performedBy?.person;
                  const name = performer
                    ? `${performer.first_name} ${performer.last_name}`
                    : 'Staff';
                  const time = t.treatment_time
                    ? new Date(t.treatment_time).toLocaleString([], {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })
                    : '—';
                  const isMed = MEDICATION_TYPES.includes(t.treatment_type);
                  const isDeleting = deletingId === t.treatment_id;

                  return (
                    <div
                      key={t.treatment_id}
                      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 relative group"
                    >
                      {/* Type badge + actions */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full border border-green-200 dark:border-green-800">
                            {isMed ? (
                              <Pill size={12} />
                            ) : (
                              <Activity size={12} />
                            )}
                            <span className="text-xs font-bold">
                              {t.treatment_type}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => openEdit(t)}
                            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <Edit3 size={13} className="text-slate-400" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.treatment_id)}
                            disabled={isDeleting}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            {isDeleting ? (
                              <Loader
                                size={13}
                                className="text-red-400 animate-spin"
                              />
                            ) : (
                              <Trash2 size={13} className="text-red-400" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Medication details */}
                      {isMed && (t.medication_name || t.dosage || t.route) && (
                        <div className="flex flex-wrap gap-2 mb-2.5">
                          {t.medication_name && (
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">
                              {t.medication_name}
                            </span>
                          )}
                          {t.dosage && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 px-2 py-0.5 rounded">
                              {t.dosage}
                            </span>
                          )}
                          {t.route && (
                            <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded capitalize">
                              {t.route}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-2.5 leading-relaxed">
                        {t.description}
                      </p>

                      {/* Outcome */}
                      {t.outcome && (
                        <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-3 py-2 mb-2.5">
                          <CheckCircle
                            size={13}
                            className="text-blue-500 shrink-0 mt-0.5"
                          />
                          <p className="text-xs text-blue-700 dark:text-blue-300">
                            {t.outcome}
                          </p>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} />
                          <span>{time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User size={11} />
                          <span>{name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-400 dark:text-slate-500">
            {treatments.length} treatment{treatments.length !== 1 ? 's' : ''}{' '}
            recorded
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
