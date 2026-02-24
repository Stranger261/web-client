import { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  AlertCircle,
  Loader,
  Stethoscope,
  Clock,
  CheckCircle,
  User,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { erService } from '../../../services/erApi';
import toast from 'react-hot-toast';

/**
 * AssignDoctorModal
 *
 * Opened automatically after triage is saved.
 *
 * L1 (Resuscitation):
 *   - Shows CRITICAL alert
 *   - Auto-assigns immediately on mount — no nurse selection needed
 *   - Displays who was assigned
 *
 * L2–L5:
 *   - Lists on-shift doctors (available = green, busy = grey)
 *   - Nurse selects one
 *   - Visit → in_treatment
 *
 * Props:
 *   isOpen      boolean
 *   onClose     fn
 *   visit       { er_visit_id, er_number, triage_level, patient, ... }
 *   onAssigned  fn(assignedDoctor) — called after successful assignment
 */
export default function AssignDoctorModal({
  isOpen,
  onClose,
  visit,
  onAssigned,
}) {
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('loading'); // loading | select | assigning | done | error
  const [assignedDoc, setAssignedDoc] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loadingDocs, setLoadingDocs] = useState(false);

  const isL1 = visit?.triage_level === 1;
  const isL2 = visit?.triage_level === 2;

  useEffect(() => {
    if (!isOpen || !visit) return;
    setSelected(null);
    setAssignedDoc(null);
    setErrorMsg('');

    if (isL1) {
      // Auto-assign immediately for L1
      setPhase('assigning');
      handleAutoAssign();
    } else {
      // Load on-shift doctors for nurse to pick
      loadDoctors();
    }
  }, [isOpen, visit]);

  const loadDoctors = async () => {
    setLoadingDocs(true);
    setPhase('loading');
    try {
      const res = await erService.getAllERDoctors();
      const list = res?.data ?? res ?? [];
      setDoctors(list);
      setPhase('select');
    } catch {
      setErrorMsg('Failed to load doctors. Please try again.');
      setPhase('error');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleAutoAssign = async () => {
    try {
      const res = await erService.autoAssignDoctor(visit.er_visit_id);
      const doc = res?.data ?? res;
      setAssignedDoc(doc);
      setPhase('done');
      toast.success(`Dr. ${doctorName(doc)} assigned — patient in treatment`);
      onAssigned?.(doc);
    } catch (err) {
      const msg =
        err.response?.data?.message || 'No available doctors on shift.';
      setErrorMsg(msg);
      setPhase('error');
      toast.error(msg);
    }
  };

  const handleManualAssign = async () => {
    if (!selected) return;
    setPhase('assigning');
    try {
      const res = await erService.assignDoctor(visit.er_visit_id, selected);
      const doc = res?.data ?? res;
      setAssignedDoc(doc);
      setPhase('done');
      toast.success(`Dr. ${doctorName(doc)} assigned`);
      onAssigned?.(doc);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Assignment failed. Doctor may no longer be available.';
      setErrorMsg(msg);
      setPhase('error');
      toast.error(msg);
    }
  };

  const doctorName = doc => {
    const p = doc?.staff?.person ?? doc?.person;
    if (!p) return 'Unknown';
    return `${p.first_name} ${p.last_name}`;
  };

  const triageColor =
    {
      1: {
        ring: 'border-red-500',
        bg: 'bg-red-50 dark:bg-red-950/40',
        text: 'text-red-700 dark:text-red-300',
        badge: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
      },
      2: {
        ring: 'border-orange-500',
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-300',
        badge:
          'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
      },
      3: {
        ring: 'border-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-950/40',
        text: 'text-yellow-700 dark:text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-700',
      },
      4: {
        ring: 'border-green-500',
        bg: 'bg-green-50 dark:bg-green-950/40',
        text: 'text-green-700 dark:text-green-300',
        badge:
          'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
      },
      5: {
        ring: 'border-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        badge:
          'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
      },
    }[visit?.triage_level] ?? {};

  if (!isOpen) return null;

  const patientName = visit?.patient
    ? `${visit.patient.person?.first_name ?? ''} ${visit.patient.person?.last_name ?? ''}`.trim() ||
      'Unknown Patient'
    : 'Unknown Patient';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border-2 ${triageColor.ring ?? 'border-slate-200 dark:border-slate-700'} flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between ${triageColor.bg ?? ''} border-b border-slate-200 dark:border-slate-700`}
        >
          <div className="flex items-center gap-3">
            {isL1 ? (
              <Zap size={20} className="text-red-500 animate-pulse" />
            ) : (
              <Stethoscope
                size={20}
                className="text-slate-600 dark:text-slate-400"
              />
            )}
            <div>
              <h2 className="font-black text-slate-900 dark:text-slate-100 text-base">
                {isL1
                  ? 'IMMEDIATE — Auto-Assigning Doctor'
                  : 'Assign ER Doctor'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {visit?.er_number} · {patientName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {/* Triage level badge */}
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${triageColor.bg} ${triageColor.ring}`}
          >
            {isL1 && (
              <div className="w-3 h-3 rounded-full bg-red-500 animate-ping shrink-0" />
            )}
            <div>
              <p className={`font-black text-sm ${triageColor.text}`}>
                Level {visit?.triage_level} —{' '}
                {
                  [
                    '',
                    'Resuscitation',
                    'Emergency',
                    'Urgent',
                    'Less Urgent',
                    'Non-Urgent',
                  ][visit?.triage_level]
                }
              </p>
              {isL1 && (
                <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
                  Immediate response required — doctor goes to patient
                </p>
              )}
              {isL2 && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                  Assign within 15 minutes
                </p>
              )}
            </div>
          </div>

          {/* ── LOADING ── */}
          {phase === 'loading' && (
            <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
              <Loader size={20} className="animate-spin" />
              <span className="text-sm font-medium">Loading doctors…</span>
            </div>
          )}

          {/* ── AUTO-ASSIGNING (L1) ── */}
          {phase === 'assigning' && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 rounded-full border-4 border-red-100 dark:border-red-900" />
                <div className="absolute inset-0 rounded-full border-4 border-t-red-500 animate-spin" />
                <Zap
                  size={20}
                  className="absolute inset-0 m-auto text-red-500"
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Assigning available doctor…
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  This happens automatically for Level 1 patients
                </p>
              </div>
            </div>
          )}

          {/* ── SELECT DOCTOR (L2–L5) ── */}
          {phase === 'select' && (
            <>
              {doctors.length === 0 ? (
                <div className="flex flex-col items-center py-8 gap-3 text-center">
                  <AlertCircle size={32} className="text-amber-400" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No doctors found
                  </p>
                  <p className="text-sm text-slate-400">
                    No ER doctors are registered in the system yet.
                  </p>
                  <button
                    onClick={loadDoctors}
                    className="mt-2 flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <RefreshCw size={14} /> Refresh
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                      All Doctors
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {doctors.map(doc => {
                        const name = doctorName(doc);
                        const avail = doc.is_available && doc.is_on_shift;
                        const onShift = doc.is_on_shift;
                        const isSelected = selected === doc.er_doctor_id;
                        const curPatient =
                          doc.currentVisit ?? doc.currentPatient;

                        return (
                          <button
                            key={doc.er_doctor_id}
                            onClick={() => setSelected(doc.er_doctor_id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : avail
                                  ? 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                          >
                            {/* Avatar */}
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-black text-sm ${avail ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                            >
                              {name.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                Dr. {name}
                              </p>
                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                                {doc.staff?.specialization ??
                                  'Emergency Medicine'}
                              </p>
                              {!onShift && (
                                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                                  Off shift
                                </p>
                              )}
                              {onShift && !avail && curPatient && (
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                                  Busy — {curPatient.er_number} (L
                                  {curPatient.triage_level})
                                </p>
                              )}
                            </div>

                            <div
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${avail ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : onShift ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                            >
                              <div
                                className={`w-1.5 h-1.5 rounded-full ${avail ? 'bg-emerald-500' : onShift ? 'bg-amber-500' : 'bg-slate-400'}`}
                              />
                              {avail
                                ? 'Available'
                                : onShift
                                  ? 'Busy'
                                  : 'Off shift'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleManualAssign}
                      disabled={!selected}
                      className={`flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        selected
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 hover:-translate-y-px'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      <UserCheck size={15} />
                      Assign Doctor
                    </button>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── DONE ── */}
          {phase === 'done' && assignedDoc && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle
                  size={28}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div className="text-center">
                <p className="font-black text-lg text-slate-800 dark:text-slate-200">
                  Doctor Assigned
                </p>
                <p className="font-bold text-slate-600 dark:text-slate-400 mt-1">
                  Dr. {doctorName(assignedDoc)}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {assignedDoc.staff?.specialization ?? 'Emergency Medicine'}
                </p>
              </div>
              <div className="w-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3 text-center">
                <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                  Visit status updated to <strong>In Treatment</strong>
                </p>
                {isL1 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                    Doctor is proceeding to patient immediately
                  </p>
                )}
              </div>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          )}

          {/* ── ERROR ── */}
          {phase === 'error' && (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle size={24} className="text-red-500" />
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  Assignment Failed
                </p>
                <p className="text-sm text-slate-400 mt-1 max-w-xs">
                  {errorMsg}
                </p>
              </div>
              <div className="flex gap-3 w-full">
                <button
                  onClick={isL1 ? handleAutoAssign : loadDoctors}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} /> Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
