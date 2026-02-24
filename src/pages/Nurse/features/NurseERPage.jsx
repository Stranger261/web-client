import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  UserX,
  Search,
  Activity,
  Users,
  Filter,
  X,
  Clock,
  Stethoscope,
  RefreshCw,
  Zap,
  Bed,
  TrendingUp,
  Shield,
  User,
  Clock3,
  CheckCircle,
  LayoutList,
  AlertCircle,
  UserCheck,
  LogOut,
  ArrowRightLeft,
  HeartPulse,
} from 'lucide-react';
import toast from 'react-hot-toast';

import RegisterPatientModal from '../../../components/ER/modals/RegisterPatientModal';
import UnknownPatientModal from '../../../components/ER/modals/UnknownPatientModal';
import IdentifyPatientModal from '../../../components/ER/modals/IdentifyPatientModal';
import TreatmentModal from '../../../components/ER/modals/TreatmentModal';
import TriageDrawer from '../../../components/ER/TriageDrawer';
import ERFaceRecognitionModal from '../../../components/ER/modals/FaceRecognitionModal';
import AssignDoctorModal from '../../../components/ER/modals/AssignDoctorModal';
import DispositionModal from '../../../components/ER/modals/DispositionModal';
import { erService } from '../../../services/erApi';

// ─── Triage config ────────────────────────────────────────────────────────────
const TRIAGE = {
  1: {
    label: 'Resuscitation',
    short: 'RESUS',
    color: '#ef4444',
    lightPill: 'bg-red-100 text-red-700 border-red-200',
    darkPill: 'dark:bg-red-950 dark:text-red-300 dark:border-red-800',
    dot: 'bg-red-500',
    ring: 'border-l-red-500',
    pulse: true,
  },
  2: {
    label: 'Emergency',
    short: 'EMERG',
    color: '#f97316',
    lightPill: 'bg-orange-100 text-orange-700 border-orange-200',
    darkPill: 'dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800',
    dot: 'bg-orange-500',
    ring: 'border-l-orange-500',
    pulse: true,
  },
  3: {
    label: 'Urgent',
    short: 'URGNT',
    color: '#eab308',
    lightPill: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    darkPill: 'dark:bg-yellow-950 dark:text-yellow-600 dark:border-yellow-800',
    dot: 'bg-yellow-500',
    ring: 'border-l-yellow-500',
    pulse: false,
  },
  4: {
    label: 'Less Urgent',
    short: 'LESS',
    color: '#22c55e',
    lightPill: 'bg-green-100 text-green-700 border-green-200',
    darkPill: 'dark:bg-green-950 dark:text-green-300 dark:border-green-800',
    dot: 'bg-green-500',
    ring: 'border-l-green-500',
    pulse: false,
  },
  5: {
    label: 'Non-Urgent',
    short: 'NON-U',
    color: '#3b82f6',
    lightPill: 'bg-blue-100 text-blue-700 border-blue-200',
    darkPill: 'dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    dot: 'bg-blue-500',
    ring: 'border-l-blue-500',
    pulse: false,
  },
};

const STATUS_TABS = [
  { key: 'waiting', label: 'Waiting', Icon: Clock3, statKey: 'waiting' },
  {
    key: 'in_treatment',
    label: 'In Treatment',
    Icon: Stethoscope,
    statKey: 'inTreatment',
  },
  { key: 'admitted', label: 'Admitted', Icon: Bed, statKey: 'admitted' },
  {
    key: 'discharged',
    label: 'Discharged',
    Icon: CheckCircle,
    statKey: 'discharged',
  },
  { key: 'all', label: 'All', Icon: LayoutList, statKey: 'totalToday' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtWait = mins => {
  if (mins == null) return '—';
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};
const fmtTime = dt =>
  dt
    ? new Date(dt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
const calcWait = t => Math.floor((Date.now() - new Date(t)) / 60000);

const doctorName = visit => {
  const p = visit?.erDoctor?.staff?.person;
  if (!p) return null;
  return `Dr. ${p.first_name} ${p.last_name}`;
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, Icon, iconBg, iconColor, pulse }) => (
  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">
          {label}
        </p>
        <p className="text-3xl font-black text-slate-900 dark:text-slate-50 leading-none tabular-nums">
          {value ?? '—'}
        </p>
      </div>
      <div
        className={`relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}
      >
        <Icon size={20} className={iconColor} />
        {pulse && value > 0 && (
          <span
            className={`absolute inset-0 rounded-xl ${iconBg} animate-ping opacity-60`}
          />
        )}
      </div>
    </div>
    {sub && (
      <p className="text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-2.5">
        {sub}
      </p>
    )}
  </div>
);

const TriageBar = ({ visits }) => {
  const total = visits.length || 1;
  return (
    <div className="flex gap-1 h-2 rounded-full overflow-hidden">
      {[1, 2, 3, 4, 5].map(lv => {
        const count = visits.filter(v => v.triage_level === lv).length;
        const pct = (count / total) * 100;
        return pct > 0 ? (
          <div
            key={lv}
            style={{ flex: pct, background: TRIAGE[lv].color }}
            title={`L${lv}: ${count}`}
            className="rounded-sm"
          />
        ) : null;
      })}
    </div>
  );
};

const LevelHeader = ({ level, count }) => {
  const t = TRIAGE[level];
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-700 sticky top-0 z-10">
      <span
        className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.dot} ${t.pulse ? 'animate-pulse' : ''}`}
      />
      <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
        Level {level} — {t.label}
      </span>
      <span
        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${t.lightPill} ${t.darkPill}`}
      >
        {count} {count === 1 ? 'patient' : 'patients'}
      </span>
    </div>
  );
};

const RowBtn = ({ onClick, cls, icon, label, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${cls}`}
  >
    {icon}
    {label}
  </button>
);

// ─── PatientRow ───────────────────────────────────────────────────────────────
const PatientRow = ({
  visit,
  onTriage,
  onAssignDoctor,
  onTreatment,
  onDisposition,
  onIdentify,
  isNew,
}) => {
  const t = TRIAGE[visit.triage_level] || TRIAGE[5];
  const isTemp = visit.patient?.mrn?.startsWith('TEMP-');
  const name = visit.patient
    ? `${visit.patient.person?.first_name ?? ''} ${visit.patient.person?.last_name ?? ''}`.trim() ||
      'Unknown Patient'
    : 'Unknown Patient';
  const waiting = visit.current_waiting_time ?? calcWait(visit.arrival_time);
  const isUrgent = visit.triage_level <= 2;
  const docName = doctorName(visit);

  const waitColor =
    waiting > 60
      ? 'text-red-600 dark:text-red-400'
      : waiting > 30
        ? 'text-orange-500 dark:text-orange-400'
        : 'text-slate-500 dark:text-slate-400';

  // ── What actions to show per status ─────────────────────────────────────
  const showTriage = visit.er_status === 'waiting' && !visit.triage;
  const showAssign =
    visit.er_status === 'waiting' && visit.triage && !visit.erDoctor;
  const showTreatment = visit.er_status === 'in_treatment';
  const showDisposition = ['waiting', 'in_treatment'].includes(visit.er_status);
  const showIdentify = isTemp && visit.er_status !== 'admitted';

  return (
    <div
      className={`grid items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700/60 border-l-4 ${t.ring} transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40 ${isNew ? 'bg-blue-50/60 dark:bg-blue-900/10' : ''} ${isUrgent && !isNew ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}
      style={{ gridTemplateColumns: '140px 1fr 160px 120px 80px 95px 180px' }}
    >
      {/* ER Number */}
      <div className="min-w-0">
        <span className="font-mono text-xs text-slate-400 dark:text-slate-500 tracking-tight">
          {visit.er_number}
        </span>
        {isTemp && (
          <div className="mt-1">
            <span className="text-[10px] font-black px-1.5 py-0.5 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700 rounded">
              TEMP
            </span>
          </div>
        )}
      </div>

      {/* Patient / Complaint */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
            {name}
          </span>
          {isUrgent && (
            <span className="text-[10px] font-black text-red-600 dark:text-red-400 shrink-0 animate-pulse">
              CRITICAL
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5 max-w-xs">
          {visit.chief_complaint || 'No complaint recorded'}
        </p>
      </div>

      {/* Triage level */}
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${t.dot} ${t.pulse ? 'animate-pulse' : ''}`}
        />
        <span
          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${t.lightPill} ${t.darkPill}`}
        >
          L{visit.triage_level} {t.short}
        </span>
      </div>

      {/* Assigned doctor */}
      <div className="min-w-0">
        {docName ? (
          <div className="flex items-center gap-1.5">
            <UserCheck size={12} className="text-green-500 shrink-0" />
            <span className="text-xs text-slate-600 dark:text-slate-400 truncate font-medium">
              {docName}
            </span>
          </div>
        ) : visit.er_status === 'waiting' && visit.triage ? (
          <span className="text-[11px] text-amber-500 dark:text-amber-400 font-semibold">
            Unassigned
          </span>
        ) : visit.er_status === 'waiting' ? (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Pending triage
          </span>
        ) : (
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            —
          </span>
        )}
      </div>

      {/* Wait time */}
      <div className="text-right">
        {['waiting', 'in_treatment'].includes(visit.er_status) ? (
          <>
            <span className={`text-sm font-bold tabular-nums ${waitColor}`}>
              {fmtWait(waiting)}
            </span>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              waiting
            </p>
          </>
        ) : (
          <span className="text-xs text-slate-400 dark:text-slate-500 capitalize">
            {visit.er_status?.replace('_', ' ')}
          </span>
        )}
      </div>

      {/* Arrived */}
      <div className="text-center">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {fmtTime(visit.arrival_time)}
        </span>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 capitalize">
          {visit.arrival_mode?.replace('_', ' ')}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1.5 justify-end flex-wrap">
        {/* Step 1: Triage (waiting, no triage yet) */}
        {showTriage && (
          <RowBtn
            onClick={onTriage}
            cls="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 hover:bg-blue-100"
            icon={<Stethoscope size={13} />}
            label="Triage"
          />
        )}

        {/* Step 2: Assign doctor (triaged, no doctor yet) */}
        {showAssign && (
          <RowBtn
            onClick={onAssignDoctor}
            cls="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700 hover:bg-violet-100"
            icon={<UserCheck size={13} />}
            label="Assign"
          />
        )}

        {/* Step 3: Treatment (in_treatment) */}
        {showTreatment && (
          <RowBtn
            onClick={onTreatment}
            cls="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 hover:bg-green-100"
            icon={<Activity size={13} />}
            label="Treat"
          />
        )}

        {/* Step 4: Disposition (waiting or in_treatment) */}
        {showDisposition && (
          <RowBtn
            onClick={onDisposition}
            cls="text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 hover:bg-slate-100"
            icon={<LogOut size={13} />}
            label="Dispose"
          />
        )}

        {/* Identify temp patient */}
        {showIdentify && (
          <RowBtn
            onClick={onIdentify}
            cls="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 hover:bg-amber-100"
            icon={<User size={13} />}
            label="ID"
          />
        )}
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const NurseERPage = () => {
  // ── Auth / current user ────────────────────────────────────────────────────
  // Replace with your actual auth hook/context
  const currentUser = {
    staff_id: 1,
    person: { first_name: 'Nurse', last_name: 'On Duty' },
  };

  // ── State ──────────────────────────────────────────────────────────────────
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('waiting');
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [newVisitIds, setNewVisitIds] = useState(new Set());
  const [selectedVisit, setSelectedVisit] = useState(null);

  // Face recognition pending data
  const [pendingFaceMatch, setPendingFaceMatch] = useState(null);
  const [pendingFaceNoMatch, setPendingFaceNoMatch] = useState(null);

  // After triage saved — which visit needs doctor assignment next
  const [pendingAssignVisit, setPendingAssignVisit] = useState(null);

  const [modals, setModals] = useState({
    registerPatient: false,
    faceRecognition: false,
    unknownPatient: false,
    triage: false,
    assignDoctor: false,
    identifyPatient: false,
    treatment: false,
    disposition: false,
  });

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      try {
        const [visitsRes, statsRes] = await Promise.all([
          erService.getAllVisits({
            status: activeTab === 'all' ? undefined : activeTab,
            limit: 200,
          }),
          erService.getDashboardStats(),
        ]);
        const incoming =
          visitsRes.data?.visits ?? visitsRes.visits ?? visitsRes.data ?? [];

        if (isRefresh && visits.length > 0) {
          const existingIds = new Set(visits.map(v => v.er_visit_id));
          const fresh = incoming
            .filter(v => !existingIds.has(v.er_visit_id))
            .map(v => v.er_visit_id);
          if (fresh.length) {
            setNewVisitIds(new Set(fresh));
            setTimeout(() => setNewVisitIds(new Set()), 4000);
            // toast.success(
            //   `${fresh.length} new arrival${fresh.length > 1 ? 's' : ''}`,
            // );
          }
        }

        setVisits(incoming);
        setStats(statsRes.data ?? statsRes);
        setLastUpdated(new Date());
      } catch {
        toast.error('Failed to load ER data');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [activeTab],
  );

  useEffect(() => {
    fetchData();
  }, [activeTab]);
  useEffect(() => {
    const iv = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(iv);
  }, [fetchData]);

  // ── Modal helpers ─────────────────────────────────────────────────────────
  const openModal = (name, visit = null) => {
    setSelectedVisit(visit);
    setModals(m => ({ ...m, [name]: true }));
  };
  const closeModal = name => {
    setModals(m => ({ ...m, [name]: false }));
  };

  // ── Face recognition outcomes ─────────────────────────────────────────────
  const handleFaceMatchFound = ({ patient, faceData }) => {
    setPendingFaceMatch({ patient, faceData });
    setModals(m => ({ ...m, faceRecognition: false, registerPatient: true }));
  };

  const handleFaceNoMatch = ({ faceData }) => {
    setPendingFaceNoMatch({ faceData });
    setModals(m => ({ ...m, faceRecognition: false, unknownPatient: true }));
  };

  // ── Triage saved → immediately open AssignDoctorModal ─────────────────────
  // L1: auto-assigns on backend, AssignDoctorModal shows the result
  // L2–L5: nurse picks a doctor
  const handleTriageSuccess = visit => {
    closeModal('triage');
    fetchData(true);
    toast.success('Triage assessment saved');
    // Small delay so the triage drawer closes cleanly before the next modal opens
    setTimeout(() => {
      setPendingAssignVisit(visit ?? selectedVisit);
      setModals(m => ({ ...m, assignDoctor: true }));
    }, 350);
  };

  // ── Doctor assigned → board refreshes ────────────────────────────────────
  const handleDoctorAssigned = assignedDoctor => {
    setPendingAssignVisit(null);
    closeModal('assignDoctor');
    fetchData(true);
  };

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = visits
    .filter(
      v => levelFilter === 'all' || v.triage_level === parseInt(levelFilter),
    )
    .filter(v => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        v.patient?.person?.first_name?.toLowerCase().includes(q) ||
        v.patient?.person?.last_name?.toLowerCase().includes(q) ||
        v.patient?.mrn?.toLowerCase().includes(q) ||
        v.er_number?.toLowerCase().includes(q) ||
        v.chief_complaint?.toLowerCase().includes(q)
      );
    });

  const grouped = filtered.reduce((acc, v) => {
    const lv = v.triage_level || 5;
    acc[lv] = acc[lv] || [];
    acc[lv].push(v);
    return acc;
  }, {});
  const criticalCount = visits.filter(
    v =>
      v.triage_level <= 2 && ['waiting', 'in_treatment'].includes(v.er_status),
  ).length;

  // ── Loading screen ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-5 bg-slate-50 dark:bg-slate-950">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-2 border-slate-200 dark:border-slate-700" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 animate-spin" />
          <Activity
            size={20}
            className="absolute inset-0 m-auto text-blue-500"
          />
        </div>
        <div className="text-center">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Loading ER Dashboard
          </p>
          <p className="text-sm text-slate-400 mt-1">Fetching patient data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* ── NAV ── */}
      <div className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-md shadow-red-500/30">
              <Activity size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 dark:text-slate-50 tracking-tight leading-none">
                ER Command Center
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[11px] text-slate-400">
                  Live · Auto-refresh 30s
                </span>
              </div>
            </div>
          </div>

          {criticalCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl">
              <Zap size={13} className="text-red-500 animate-pulse" />
              <span className="text-xs font-black text-red-600 dark:text-red-400 tracking-wide">
                {criticalCount} CRITICAL{' '}
                {criticalCount === 1 ? 'CASE' : 'CASES'} ACTIVE
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            {lastUpdated && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden lg:block">
                Updated{' '}
                {lastUpdated.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </span>
            )}
            <button
              onClick={() => fetchData(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw
                size={13}
                className={refreshing ? 'animate-spin' : ''}
              />
              Refresh
            </button>

            {/* Responsive patient */}
            <button
              onClick={() => openModal('registerPatient')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm shadow-blue-500/30 transition-all hover:-translate-y-px"
            >
              <UserPlus size={13} />
              Register Patient
            </button>

            {/* Unresponsive — face scan first */}
            <button
              onClick={() => openModal('faceRecognition')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-500/30 transition-all hover:-translate-y-px"
            >
              <UserX size={13} />
              Unknown Patient
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {/* ── STATS ── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            <StatCard
              label="Today Total"
              value={stats.totalToday}
              Icon={Users}
              iconBg="bg-blue-100 dark:bg-blue-900/40"
              iconColor="text-blue-600 dark:text-blue-400"
              sub={`${stats.waiting ?? 0} still active`}
            />
            <StatCard
              label="Waiting"
              value={stats.waiting}
              Icon={Clock}
              iconBg="bg-amber-100 dark:bg-amber-900/40"
              iconColor="text-amber-600 dark:text-amber-400"
              sub="in queue"
              pulse
            />
            <StatCard
              label="In Treatment"
              value={stats.inTreatment}
              Icon={Stethoscope}
              iconBg="bg-green-100 dark:bg-green-900/40"
              iconColor="text-green-600 dark:text-green-400"
              sub="being treated"
            />
            <StatCard
              label="Admitted"
              value={stats.admitted}
              Icon={Bed}
              iconBg="bg-purple-100 dark:bg-purple-900/40"
              iconColor="text-purple-600 dark:text-purple-400"
              sub="moved to ward"
            />
            <StatCard
              label="Discharged"
              value={stats.discharged}
              Icon={TrendingUp}
              iconBg="bg-cyan-100 dark:bg-cyan-900/40"
              iconColor="text-cyan-600 dark:text-cyan-400"
              sub="today"
            />
            <StatCard
              label="Critical"
              value={stats.criticalCases}
              Icon={Shield}
              iconBg="bg-red-100 dark:bg-red-900/40"
              iconColor="text-red-600 dark:text-red-400"
              sub="L1–L2 active"
              pulse
            />
          </div>
        )}

        {/* ── TRIAGE MIX ── */}
        {filtered.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-5 py-3.5 flex items-center gap-4 shadow-sm">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest shrink-0">
              Triage Mix
            </span>
            <div className="flex-1">
              <TriageBar visits={filtered} />
            </div>
            <div className="flex gap-4 shrink-0">
              {[1, 2, 3, 4, 5].map(lv => {
                const cnt = filtered.filter(v => v.triage_level === lv).length;
                return cnt > 0 ? (
                  <div key={lv} className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full ${TRIAGE[lv].dot}`}
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      L{lv}:{' '}
                      <strong className="text-slate-600 dark:text-slate-300">
                        {cnt}
                      </strong>
                    </span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* ── BOARD ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
          {/* Status tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            {STATUS_TABS.map(({ key, label, Icon, statKey }) => {
              const count = stats?.[statKey] ?? 0;
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 min-w-fit flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${active ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full tabular-nums ${active ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search + filter */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-slate-700/60">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, MRN, ER number, complaint…"
                className="w-full pl-9 pr-8 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter size={13} className="text-slate-400" />
              {['all', '1', '2', '3', '4', '5'].map(lv => {
                const t = lv !== 'all' ? TRIAGE[parseInt(lv)] : null;
                const active = levelFilter === lv;
                return (
                  <button
                    key={lv}
                    onClick={() => setLevelFilter(lv)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all ${active && lv === 'all' ? 'bg-slate-800 dark:bg-slate-100 border-slate-800 dark:border-slate-100 text-white dark:text-slate-900' : !active ? 'border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500' : ''}`}
                    style={
                      active && t
                        ? {
                            color: t.color,
                            borderColor: t.color,
                            background: `${t.color}18`,
                          }
                        : {}
                    }
                  >
                    {t && (
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: t.color }}
                      />
                    )}
                    {lv === 'all' ? 'All' : `L${lv}`}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">
              {filtered.length} / {visits.length} shown
            </span>
          </div>

          {/* Table header — 7 columns now (added Doctor) */}
          <div
            className="grid px-5 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-700"
            style={{
              gridTemplateColumns: '140px 1fr 160px 120px 80px 95px 180px',
            }}
          >
            {[
              'ER Number',
              'Patient / Complaint',
              'Triage',
              'Doctor',
              'Wait',
              'Arrived',
              'Actions',
            ].map(h => (
              <span
                key={h}
                className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest"
              >
                {h}
              </span>
            ))}
          </div>

          {/* Rows */}
          <div
            className="overflow-y-auto"
            style={{ maxHeight: 'calc(100vh - 420px)' }}
          >
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Users
                  size={40}
                  className="text-slate-200 dark:text-slate-700 mb-4"
                />
                <p className="font-semibold text-slate-500 dark:text-slate-400">
                  No patients found
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                  {searchQuery || levelFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'The queue is currently empty'}
                </p>
                {(searchQuery || levelFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setLevelFilter('all');
                    }}
                    className="mt-4 px-4 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              [1, 2, 3, 4, 5].map(level => {
                const patients = grouped[level];
                if (!patients?.length) return null;
                return (
                  <div key={level}>
                    <LevelHeader level={level} count={patients.length} />
                    {patients.map(visit => (
                      <PatientRow
                        key={visit.er_visit_id}
                        visit={visit}
                        isNew={newVisitIds.has(visit.er_visit_id)}
                        onTriage={() => openModal('triage', visit)}
                        onAssignDoctor={() => {
                          setSelectedVisit(visit);
                          setPendingAssignVisit(visit);
                          setModals(m => ({ ...m, assignDoctor: true }));
                        }}
                        onTreatment={() => openModal('treatment', visit)}
                        onDisposition={() => openModal('disposition', visit)}
                        onIdentify={() => openModal('identifyPatient', visit)}
                      />
                    ))}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="sticky bottom-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-5 text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            System active
          </div>
          <span>
            Avg wait:{' '}
            <strong className="tabular-nums">
              {fmtWait(stats?.averageWaitingTime)}
            </strong>
          </span>
          <span>
            Today:{' '}
            <strong className="tabular-nums">{stats?.totalToday ?? 0}</strong>
          </span>
        </div>

        {/* Process legend */}
        <div className="hidden lg:flex items-center gap-4 text-[10px] text-slate-400 dark:text-slate-500">
          <span className="font-black uppercase tracking-widest">Flow:</span>
          {[
            { color: 'bg-blue-500', label: 'Register' },
            { color: 'bg-yellow-500', label: 'Triage' },
            { color: 'bg-violet-500', label: 'Assign Dr' },
            { color: 'bg-green-500', label: 'Treat' },
            { color: 'bg-slate-500', label: 'Dispose' },
          ].map(({ color, label }, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span>{label}</span>
              </div>
              {i < 4 && (
                <span className="text-slate-300 dark:text-slate-600">→</span>
              )}
            </React.Fragment>
          ))}
        </div>

        <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
          {lastUpdated ? lastUpdated.toLocaleTimeString() : '—'}
        </span>
      </div>

      {/* ══ MODALS ══════════════════════════════════════════════════════════════ */}

      {/* Face recognition — always mounted, visibility via CSS */}
      <ERFaceRecognitionModal
        isOpen={modals.faceRecognition}
        onClose={() => closeModal('faceRecognition')}
        onMatchFound={handleFaceMatchFound}
        onNoMatch={handleFaceNoMatch}
      />

      {/* Register known/responsive patient */}
      <RegisterPatientModal
        isOpen={modals.registerPatient}
        onClose={() => {
          closeModal('registerPatient');
          setPendingFaceMatch(null);
        }}
        prefillPatient={pendingFaceMatch?.patient ?? null}
        prefillFaceData={pendingFaceMatch?.faceData ?? null}
        onSuccess={visit => {
          closeModal('registerPatient');
          setPendingFaceMatch(null);
          fetchData(true);
          toast.success(`Patient registered — ${visit?.er_number ?? ''}`);
          setTimeout(() => openModal('triage', visit), 350);
        }}
      />

      {/* Register unknown/unresponsive patient */}
      <UnknownPatientModal
        isOpen={modals.unknownPatient}
        onClose={() => {
          closeModal('unknownPatient');
          setPendingFaceNoMatch(null);
        }}
        prefillFaceData={pendingFaceNoMatch?.faceData ?? null}
        onSuccess={res => {
          closeModal('unknownPatient');
          setPendingFaceNoMatch(null);
          fetchData(true);
          toast.success(
            `Unknown patient registered — ${res?.erVisit?.er_number ?? ''}`,
          );
          setTimeout(() => openModal('triage', res?.erVisit), 350);
        }}
      />

      {/* Triage drawer — on success, opens AssignDoctorModal */}
      <TriageDrawer
        isOpen={modals.triage}
        visit={selectedVisit}
        onClose={() => closeModal('triage')}
        onSuccess={handleTriageSuccess}
      />

      {/* Assign Doctor — opens right after triage, or manually from row */}
      <AssignDoctorModal
        isOpen={modals.assignDoctor}
        visit={pendingAssignVisit ?? selectedVisit}
        onClose={() => {
          closeModal('assignDoctor');
          setPendingAssignVisit(null);
        }}
        onAssigned={handleDoctorAssigned}
      />

      {/* Treatment — record treatments for in_treatment visits */}
      <TreatmentModal
        isOpen={modals.treatment}
        visit={selectedVisit}
        currentUser={currentUser}
        onClose={() => closeModal('treatment')}
        onUpdated={() => fetchData(true)}
      />

      {/* Disposition — discharge, admit, transfer, left AMA, deceased */}
      <DispositionModal
        isOpen={modals.disposition}
        visit={selectedVisit}
        onClose={() => closeModal('disposition')}
        onSuccess={result => {
          closeModal('disposition');
          fetchData(true);
          const labels = {
            discharged: 'Patient discharged',
            admitted: 'Patient admitted to ward',
            transferred: 'Patient transferred',
            left_ama: 'Patient left AMA',
            deceased: 'Record updated',
          };
          toast.success(labels[result?.newStatus] ?? 'Disposition saved');
        }}
      />

      {/* Identify unknown patient */}
      <IdentifyPatientModal
        isOpen={modals.identifyPatient}
        visit={selectedVisit}
        onClose={() => closeModal('identifyPatient')}
        onSuccess={() => {
          closeModal('identifyPatient');
          fetchData(true);
          toast.success('Patient identified');
        }}
      />
    </div>
  );
};

export default NurseERPage;
