import React, { useState, useEffect } from 'react';
import { X, User, Search, AlertCircle } from 'lucide-react';
import { erService } from '../../../services/erApi';
import patientApi from '../../../services/patientApi';
import toast from 'react-hot-toast';

const defaultPersonData = {
  first_name: '',
  middle_name: '',
  last_name: '',
  date_of_birth: '',
  gender: 'male',
  gender_specification: '',
  phone: '',
  email: '',
  blood_type: '',
  nationality: '',
};

const IdentifyPatientModal = ({ isOpen, visit, onClose, onSuccess }) => {
  // 'new' = not yet in system, 'existing' = already registered
  const [option, setOption] = useState('new');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [personData, setPersonData] = useState(defaultPersonData);

  useEffect(() => {
    if (!isOpen) {
      setOption('new');
      setSearchQuery('');
      setSearchResults([]);
      setPersonData(defaultPersonData);
      setError('');
    }
  }, [isOpen]);

  const setPerson = (field, value) =>
    setPersonData(p => ({ ...p, [field]: value }));

  // ── Search existing patients ──────────────────────────────────────────────
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    setError('');
    try {
      const res = await patientApi.getPatient(searchQuery);
      setSearchResults(res.data || []);
      if (!res.data?.length) setError('No patients found.');
    } catch {
      toast.error('Failed to search patients.');
    } finally {
      setSearching(false);
    }
  };

  // ── CASE B: Not in system — update temp record in place ───────────────────
  const handleSubmitNew = async e => {
    e.preventDefault();
    if (
      !personData.first_name ||
      !personData.last_name ||
      !personData.date_of_birth
    ) {
      setError('First name, last name, and date of birth are required');
      return;
    }
    setLoading(true);
    setError('');
    console.log(personData);
    try {
      await erService.identifyUnknownPatient(visit.patient.patient_id, {
        realPersonData: personData,
      });
      toast.success('Patient record updated with real details');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to identify patient';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── CASE A: Already registered — transfer ER visits, deactivate temp ──────
  const handleLinkExisting = async realPatientId => {
    setLoading(true);
    setError('');
    try {
      await erService.identifyUnknownPatient(visit.patient.patient_id, {
        realPatientId,
      });
      toast.success('ER visits transferred to existing patient record');
      onSuccess();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to link patient';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !visit) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-xl">
              <User size={22} className="text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Identify Patient
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Temp MRN:{' '}
                <span className="font-mono font-semibold text-amber-700">
                  {visit.patient?.mrn}
                </span>
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

        {/* What will happen info */}
        <div className="mx-6 mt-5 grid grid-cols-2 gap-3">
          <div
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
              option === 'new'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              setOption('new');
              setError('');
            }}
          >
            <p className="text-sm font-semibold text-gray-800">Not in system</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Enter patient details — temp record updated in place, real MRN
              assigned
            </p>
          </div>
          <div
            className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
              option === 'existing'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => {
              setOption('existing');
              setError('');
            }}
          >
            <p className="text-sm font-semibold text-gray-800">
              Already registered
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Search and link — ER visits transferred, temp record deactivated
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* ── CASE B: New patient details form ── */}
        {option === 'new' && (
          <form onSubmit={handleSubmitNew} className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <Field label="First Name" required>
                <input
                  value={personData.first_name}
                  onChange={e => setPerson('first_name', e.target.value)}
                  className={inputCls}
                  required
                />
              </Field>
              <Field label="Middle Name">
                <input
                  value={personData.middle_name}
                  onChange={e => setPerson('middle_name', e.target.value)}
                  className={inputCls}
                />
              </Field>
              <Field label="Last Name" required>
                <input
                  value={personData.last_name}
                  onChange={e => setPerson('last_name', e.target.value)}
                  className={inputCls}
                  required
                />
              </Field>
              <Field label="Date of Birth" required>
                <input
                  type="date"
                  value={personData.date_of_birth}
                  onChange={e => setPerson('date_of_birth', e.target.value)}
                  className={inputCls}
                  required
                />
              </Field>

              {/* Gender with conditional specification */}
              <Field label="Gender" required>
                <select
                  value={personData.gender}
                  onChange={e => {
                    setPerson('gender', e.target.value);
                    setPerson('gender_specification', '');
                  }}
                  className={inputCls}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Prefer to specify</option>
                </select>
              </Field>
              {personData.gender === 'other' ? (
                <Field label="Please Specify">
                  <input
                    value={personData.gender_specification}
                    onChange={e =>
                      setPerson('gender_specification', e.target.value)
                    }
                    className={inputCls}
                    placeholder="e.g. Non-binary, Transgender…"
                  />
                </Field>
              ) : (
                <Field label="Blood Type">
                  <select
                    value={personData.blood_type}
                    onChange={e => setPerson('blood_type', e.target.value)}
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
                  type="tel"
                  value={personData.phone}
                  onChange={e => setPerson('phone', e.target.value)}
                  className={inputCls}
                  placeholder="+63 9XX XXX XXXX"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={personData.email}
                  onChange={e => setPerson('email', e.target.value)}
                  className={inputCls}
                  placeholder="email@example.com"
                />
              </Field>
              <Field label="Nationality">
                <input
                  value={personData.nationality}
                  onChange={e => setPerson('nationality', e.target.value)}
                  className={inputCls}
                  placeholder="e.g. Filipino"
                />
              </Field>
            </div>

            <div className="mt-5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs text-blue-700">
                <strong>What happens:</strong> The temporary person record will
                be overwritten with these details. A new real MRN will be
                assigned. The ER visit stays linked to the same patient record —
                no duplicates created.
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button type="button" onClick={onClose} className={ghostBtn}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  loading
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Identifying…
                  </>
                ) : (
                  'Update & Assign Real MRN'
                )}
              </button>
            </div>
          </form>
        )}

        {/* ── CASE A: Link existing patient ── */}
        {option === 'existing' && (
          <div className="p-6">
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search by MRN or name…"
                className={inputCls}
              />
              <button
                onClick={handleSearch}
                disabled={searching}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-1.5 text-sm font-medium"
              >
                <Search size={16} />
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>

            {searchResults.length > 0 ? (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {searchResults.map(patient => (
                  <div
                    key={patient.patient_id}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {patient.person.first_name} {patient.person.last_name}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {patient.mrn} ·{' '}
                          {new Date(
                            patient.person.date_of_birth,
                          ).toLocaleDateString()}{' '}
                          · {patient.person.gender}
                        </p>
                      </div>
                      <button
                        onClick={() => handleLinkExisting(patient.patient_id)}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                      >
                        {loading ? 'Linking…' : 'Link'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-gray-400">
                <Search size={32} className="mx-auto mb-3 opacity-40" />
                <p className="text-sm">Search results will appear here</p>
              </div>
            )}

            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <p className="text-xs text-amber-700">
                <strong>What happens:</strong> All ER visits will be transferred
                to the selected patient. The temporary TEMP record will be
                deactivated. The real patient's history is preserved.
              </p>
            </div>

            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className={ghostBtn}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const inputCls =
  'w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';
const ghostBtn =
  'px-5 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors';

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export default IdentifyPatientModal;
