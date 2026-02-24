import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, AlertCircle, ChevronLeft } from 'lucide-react';
import { erService } from '../../../services/erApi';
import patientApi from '../../../services/patientApi';

const ARRIVAL_MODES = [
  { value: 'walk_in', label: 'Walk-in' },
  { value: 'ambulance', label: 'Ambulance' },
  { value: 'police', label: 'Police' },
  { value: 'helicopter', label: 'Helicopter' },
  { value: 'other', label: 'Other' },
];

const TRIAGE_OPTIONS = [
  {
    value: 1,
    label: 'Level 1 — Resuscitation',
    color: 'text-red-700 bg-red-50 border-red-200',
  },
  {
    value: 2,
    label: 'Level 2 — Emergency',
    color: 'text-orange-700 bg-orange-50 border-orange-200',
  },
  {
    value: 3,
    label: 'Level 3 — Urgent',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200',
  },
  {
    value: 4,
    label: 'Level 4 — Less Urgent',
    color: 'text-green-700 bg-green-50 border-green-200',
  },
  {
    value: 5,
    label: 'Level 5 — Non-Urgent',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
];

const defaultVisitData = {
  arrival_mode: 'walk_in',
  chief_complaint: '',
  accompanied_by: '',
  triage_level: 3,
  triage_nurse_id: 1, // Replace with currentUser.staff_id
};

const defaultNewPatient = {
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'male',
  gender_specification: '',
  blood_type: '',
  phone: '',
  email: '',
  allergies: '',
};

const RegisterPatientModal = ({ isOpen, onClose, onSuccess }) => {
  // Step: 'find' | 'visit'
  const [step, setStep] = useState('find');
  // Mode: 'search' | 'new'
  const [mode, setMode] = useState('search');

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searching, setSearching] = useState(false);

  const [visitData, setVisitData] = useState(defaultVisitData);
  const [newPatient, setNewPatient] = useState(defaultNewPatient);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  const resetForm = () => {
    setStep('find');
    setMode('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPatient(null);
    setVisitData(defaultVisitData);
    setNewPatient(defaultNewPatient);
    setError('');
  };

  // ── Search ──────────────────────────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a name or MRN');
      return;
    }
    setSearching(true);
    setError('');
    try {
      const res = await patientApi.getPatient(searchQuery);
      setSearchResults(res.data || []);
      if (!res.data?.length)
        setError(
          'No patients found. Try a different search or register as new.',
        );
    } catch {
      setError('Failed to search patients.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectPatient = patient => {
    setSelectedPatient(patient);
    setError('');
    setStep('visit');
  };

  // ── Validation ───────────────────────────────────────────────────────────────
  const canProceedToVisit = () => {
    if (mode === 'search') return !!selectedPatient;
    return (
      newPatient.first_name && newPatient.last_name && newPatient.date_of_birth
    );
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    if (!visitData.chief_complaint.trim()) {
      setError('Chief complaint is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;

      if (mode === 'search' && selectedPatient) {
        // Existing patient
        result = await erService.registerKnownPatient(
          { ...visitData, patient_id: selectedPatient.patient_id },
          null,
          null,
        );
      } else {
        // New patient
        result = await erService.registerKnownPatient(
          visitData,
          newPatient,
          null,
        );
      }

      onSuccess(result.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register patient');
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
            {step === 'visit' && (
              <button
                onClick={() => setStep('find')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-500" />
              </button>
            )}
            <div className="bg-blue-100 p-2 rounded-xl">
              <UserPlus size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Register ER Patient
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {step === 'find'
                  ? 'Step 1 of 2 — Find or enter patient'
                  : 'Step 2 of 2 — Visit details'}
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

        {/* Step indicator */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {['find', 'visit'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    step === s || s === 'find' ? 'bg-blue-500' : 'bg-gray-200'
                  } ${step === 'visit' && s === 'visit' ? 'bg-blue-500' : ''}`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── STEP 1: Find Patient ── */}
        {step === 'find' && (
          <div className="p-6">
            {/* Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {[
                { key: 'search', label: '🔍 Search Existing' },
                { key: 'new', label: '➕ New Patient' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => {
                    setMode(key);
                    setSelectedPatient(null);
                    setError('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    mode === key
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Search Mode */}
            {mode === 'search' && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Search by name or MRN…"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSearch}
                    disabled={searching}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
                  >
                    <Search size={16} />
                    {searching ? 'Searching…' : 'Search'}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map(patient => (
                      <div
                        key={patient.patient_id}
                        onClick={() => handleSelectPatient(patient)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedPatient?.patient_id === patient.patient_id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {patient.person.first_name}{' '}
                              {patient.person.middle_name}{' '}
                              {patient.person.last_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {patient.mrn} ·{' '}
                              {new Date(
                                patient.person.date_of_birth,
                              ).toLocaleDateString()}{' '}
                              · {patient.person.gender}
                            </p>
                          </div>
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedPatient?.patient_id === patient.patient_id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}
                          >
                            {selectedPatient?.patient_id ===
                              patient.patient_id && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* New Patient Mode */}
            {mode === 'new' && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input
                    value={newPatient.first_name}
                    onChange={e =>
                      setNewPatient(p => ({ ...p, first_name: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="First name"
                  />
                </Field>
                <Field label="Middle Name">
                  <input
                    value={newPatient.middle_name}
                    onChange={e =>
                      setNewPatient(p => ({
                        ...p,
                        middle_name: e.target.value,
                      }))
                    }
                    className={inputCls}
                    placeholder="Middle name"
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    value={newPatient.last_name}
                    onChange={e =>
                      setNewPatient(p => ({ ...p, last_name: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="Last name"
                  />
                </Field>
                <Field label="Date of Birth" required>
                  <input
                    type="date"
                    value={newPatient.date_of_birth}
                    onChange={e =>
                      setNewPatient(p => ({
                        ...p,
                        date_of_birth: e.target.value,
                      }))
                    }
                    className={inputCls}
                  />
                </Field>
                <Field label="Gender" required>
                  <select
                    value={newPatient.gender}
                    onChange={e =>
                      setNewPatient(p => ({
                        ...p,
                        gender: e.target.value,
                        gender_specification: '',
                      }))
                    }
                    className={inputCls}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer to specify</option>
                  </select>
                </Field>
                {newPatient.gender === 'other' ? (
                  <Field label="Please Specify">
                    <input
                      value={newPatient.gender_specification}
                      onChange={e =>
                        setNewPatient(p => ({
                          ...p,
                          gender_specification: e.target.value,
                        }))
                      }
                      className={inputCls}
                      placeholder="e.g. Non-binary, Transgender…"
                    />
                  </Field>
                ) : (
                  <Field label="Blood Type">
                    <select
                      value={newPatient.blood_type}
                      onChange={e =>
                        setNewPatient(p => ({
                          ...p,
                          blood_type: e.target.value,
                        }))
                      }
                      className={inputCls}
                    >
                      <option value="">Unknown</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(
                        bt => (
                          <option key={bt} value={bt}>
                            {bt}
                          </option>
                        ),
                      )}
                    </select>
                  </Field>
                )}
                <Field label="Phone">
                  <input
                    value={newPatient.phone}
                    onChange={e =>
                      setNewPatient(p => ({ ...p, phone: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="+63 9XX XXX XXXX"
                  />
                </Field>
                <Field label="Email">
                  <input
                    type="email"
                    value={newPatient.email}
                    onChange={e =>
                      setNewPatient(p => ({ ...p, email: e.target.value }))
                    }
                    className={inputCls}
                    placeholder="email@example.com"
                  />
                </Field>
                <div className="col-span-2">
                  <Field label="Known Allergies" hint="Separate with commas">
                    <input
                      value={newPatient.allergies}
                      onChange={e =>
                        setNewPatient(p => ({
                          ...p,
                          allergies: e.target.value,
                        }))
                      }
                      className={inputCls}
                      placeholder="e.g. Penicillin, Aspirin"
                    />
                  </Field>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={onClose} className={ghostBtn}>
                Cancel
              </button>
              <button
                onClick={() => {
                  setError('');
                  setStep('visit');
                }}
                disabled={!canProceedToVisit()}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  canProceedToVisit()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Visit Details ── */}
        {step === 'visit' && (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Selected patient banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                  Patient
                </p>
                {selectedPatient ? (
                  <>
                    <p className="font-semibold text-gray-900">
                      {selectedPatient.person.first_name}{' '}
                      {selectedPatient.person.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedPatient.mrn}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">
                      {newPatient.first_name} {newPatient.last_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      New patient — MRN will be assigned
                    </p>
                  </>
                )}
              </div>
              <button
                type="button"
                onClick={() => setStep('find')}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              >
                Change
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Arrival Mode" required>
                  <select
                    value={visitData.arrival_mode}
                    onChange={e =>
                      setVisitData(v => ({
                        ...v,
                        arrival_mode: e.target.value,
                      }))
                    }
                    className={inputCls}
                  >
                    {ARRIVAL_MODES.map(m => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Accompanied By">
                  <input
                    value={visitData.accompanied_by}
                    onChange={e =>
                      setVisitData(v => ({
                        ...v,
                        accompanied_by: e.target.value,
                      }))
                    }
                    className={inputCls}
                    placeholder="Name / relationship"
                  />
                </Field>
              </div>

              <Field label="Chief Complaint" required>
                <textarea
                  value={visitData.chief_complaint}
                  onChange={e =>
                    setVisitData(v => ({
                      ...v,
                      chief_complaint: e.target.value,
                    }))
                  }
                  rows={3}
                  required
                  placeholder="Describe the patient's main complaint…"
                  className={`${inputCls} resize-none`}
                />
              </Field>

              <Field label="Triage Level" required>
                <div className="grid grid-cols-5 gap-2 mt-1">
                  {TRIAGE_OPTIONS.map(t => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() =>
                        setVisitData(v => ({ ...v, triage_level: t.value }))
                      }
                      className={`py-3 rounded-xl border-2 text-center transition-all ${
                        visitData.triage_level === t.value
                          ? t.color + ' border-current'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-lg font-bold">L{t.value}</div>
                      <div className="text-[10px] font-medium leading-tight mt-0.5 px-1">
                        {t.label.split('—')[1]?.trim()}
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="flex gap-3 mt-6">
              <button type="button" onClick={onClose} className={ghostBtn}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !visitData.chief_complaint.trim()}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  !loading && visitData.chief_complaint.trim()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Registering…
                  </>
                ) : (
                  'Register & Start Triage'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const inputCls =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
const ghostBtn =
  'px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors';

const Field = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <span className="text-xs text-gray-400">{hint}</span>}
  </div>
);

export default RegisterPatientModal;
