import React, { useState, useEffect } from 'react';
import { X, UserX, AlertCircle, Camera } from 'lucide-react';
import { erService } from '../../../services/erApi';
import toast from 'react-hot-toast';

const ARRIVAL_MODES = [
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'police', label: 'Police' },
  { value: 'helicopter', label: 'Helicopter' },
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'other', label: 'Other' },
];

const defaultForm = {
  temporaryInfo: {
    estimatedAge: '',
    gender: 'other',
    gender_specification: '',
    description: '',
  },
  visitData: {
    arrival_mode: 'ambulance',
    chief_complaint: '',
    accompanied_by: 'EMS',
    triage_level: 1,
    triage_nurse_id: 1, // Replace with currentUser.staff_id
  },
};

const UnknownPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!isOpen) {
      setForm(defaultForm);
      setError('');
    }
  }, [isOpen]);

  const setTemp = (field, value) =>
    setForm(f => ({
      ...f,
      temporaryInfo: { ...f.temporaryInfo, [field]: value },
    }));
  const setVisit = (field, value) =>
    setForm(f => ({ ...f, visitData: { ...f.visitData, [field]: value } }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.visitData.chief_complaint.trim()) {
      setError('Chief complaint is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await erService.registerUnknownPatient(
        form.visitData,
        form.temporaryInfo,
        null, // faceData — pass from face capture if used
      );
      onSuccess(response.data);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to register unknown patient';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl">
              <UserX size={22} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Unknown Patient
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Create temporary record for unidentified patient
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Warning banner */}
        <div className="mx-6 mt-5 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Temporary Record
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              A <strong>TEMP MRN</strong> will be assigned. Identify the patient
              as soon as possible to merge with their real record.
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* ── Temporary Patient Info ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Physical Description
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Estimated Age">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={form.temporaryInfo.estimatedAge}
                  onChange={e => setTemp('estimatedAge', e.target.value)}
                  placeholder="Approximate age…"
                  className={inputCls}
                />
              </Field>

              <Field label="Apparent Gender">
                <select
                  value={form.temporaryInfo.gender}
                  onChange={e =>
                    setTemp('gender', e.target.value) ||
                    setTemp('gender_specification', '')
                  }
                  className={inputCls}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Unknown / Other</option>
                </select>
              </Field>

              {/* Gender specification — only when 'other' selected */}
              {form.temporaryInfo.gender === 'other' && (
                <div className="col-span-2">
                  <Field label="Specify Gender (if apparent)">
                    <input
                      value={form.temporaryInfo.gender_specification}
                      onChange={e =>
                        setTemp('gender_specification', e.target.value)
                      }
                      placeholder="If discernible, specify gender identity…"
                      className={inputCls}
                    />
                  </Field>
                </div>
              )}

              <div className="col-span-2">
                <Field label="Physical Description / Notes">
                  <textarea
                    value={form.temporaryInfo.description}
                    onChange={e => setTemp('description', e.target.value)}
                    rows={3}
                    placeholder="Height, weight, hair color, clothing, identifying marks, where found…"
                    className={`${inputCls} resize-none`}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* ── Arrival Info ── */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
                Arrival Information
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Arrival Mode" required>
                <select
                  value={form.visitData.arrival_mode}
                  onChange={e => setVisit('arrival_mode', e.target.value)}
                  className={inputCls}
                  required
                >
                  {ARRIVAL_MODES.map(m => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Found / Brought By">
                <input
                  value={form.visitData.accompanied_by}
                  onChange={e => setVisit('accompanied_by', e.target.value)}
                  placeholder="EMS, Police, Bystander…"
                  className={inputCls}
                />
              </Field>

              <div className="col-span-2">
                <Field label="Chief Complaint / Condition" required>
                  <textarea
                    value={form.visitData.chief_complaint}
                    onChange={e => setVisit('chief_complaint', e.target.value)}
                    rows={3}
                    required
                    placeholder="e.g. Unconscious, found on sidewalk; Multiple trauma; Altered mental status…"
                    className={`${inputCls} resize-none`}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Describe condition and circumstances of discovery
                  </p>
                </Field>
              </div>

              <div className="col-span-2">
                <Field label="Triage Level" required>
                  <div className="grid grid-cols-5 gap-2 mt-1">
                    {[
                      {
                        v: 1,
                        label: 'Resuscitation',
                        cls: 'text-red-700 bg-red-50 border-red-300',
                      },
                      {
                        v: 2,
                        label: 'Emergency',
                        cls: 'text-orange-700 bg-orange-50 border-orange-300',
                      },
                      {
                        v: 3,
                        label: 'Urgent',
                        cls: 'text-yellow-700 bg-yellow-50 border-yellow-300',
                      },
                      {
                        v: 4,
                        label: 'Less Urgent',
                        cls: 'text-green-700 bg-green-50 border-green-300',
                      },
                      {
                        v: 5,
                        label: 'Non-Urgent',
                        cls: 'text-blue-700 bg-blue-50 border-blue-300',
                      },
                    ].map(t => (
                      <button
                        key={t.v}
                        type="button"
                        onClick={() => setVisit('triage_level', t.v)}
                        className={`py-3 rounded-xl border-2 text-center transition-all ${
                          form.visitData.triage_level === t.v
                            ? t.cls + ' border-current'
                            : 'border-gray-200 text-gray-400 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg font-bold">L{t.v}</div>
                        <div className="text-[10px] font-medium leading-tight mt-0.5 px-0.5">
                          {t.label}
                        </div>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Unknown patients typically arrive as Level 1 or 2
                  </p>
                </Field>
              </div>
            </div>
          </section>

          {/* Next steps info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-800 mb-2">
              After creating this record you can:
            </p>
            <ul className="text-xs text-blue-700 space-y-1 ml-3 list-disc">
              <li>Complete the triage assessment</li>
              <li>Provide emergency treatment</li>
              <li>Use facial recognition to attempt re-identification</li>
              <li>
                Manually link to a real patient record when identity is
                confirmed
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className={ghostBtn}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !form.visitData.chief_complaint.trim()}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                !loading && form.visitData.chief_complaint.trim()
                  ? 'bg-amber-600 text-white hover:bg-amber-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Temporary Record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputCls =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
const ghostBtn =
  'px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors';

const Field = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <span className="text-xs text-gray-400">{hint}</span>}
  </div>
);

export default UnknownPatientModal;
