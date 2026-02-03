import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  UserX,
  Search,
  Activity,
  Users,
  Filter,
  ChevronRight,
  X,
  Clock,
  AlertCircle,
  User,
  Stethoscope,
  Bell,
  RefreshCw,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

import ERPatientCard from '../../../components/ER/cards/ERPatientCard';
import StatisticsCards from '../../../components/ER/cards/StatisticsCards';
import RegisterPatientModal from '../../../components/ER/modals/RegisterPatientModal';
import UnknownPatientModal from '../../../components/ER/modals/UnknownPatientModal';
import IdentifyPatientModal from '../../../components/ER/modals/IdentifyPatientModal';
import TreatmentModal from '../../../components/ER/modals/TreatmentPatientModal';
import TriageDrawer from '../../../components/ER/TriageDrawer';
import { erService } from '../../../services/erApi';

const NurseERPage = () => {
  const [visits, setVisits] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('waiting');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [modals, setModals] = useState({
    registerPatient: false,
    unknownPatient: false,
    triage: false,
    identifyPatient: false,
    treatment: false,
  });

  const [selectedVisit, setSelectedVisit] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const fetchDashboardData = async () => {
    try {
      const [visitsRes, statsRes] = await Promise.all([
        erService.getAllVisits({
          status: activeTab === 'all' ? undefined : activeTab,
        }),
        erService.getDashboardStats(),
      ]);

      setVisits(visitsRes.data.visits || visitsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Failed to load ER dashboard');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchDashboardData();
    toast.success('Dashboard refreshed');
  };

  const openModal = (name, visit = null) => {
    setSelectedVisit(visit);
    setModals(prev => ({ ...prev, [name]: true }));
  };

  const closeModal = name => {
    setModals(prev => ({ ...prev, [name]: false }));
    setSelectedVisit(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPriorityFilter('all');
  };

  const getPriorityName = level => {
    const names = {
      1: 'Critical',
      2: 'Emergency',
      3: 'Urgent',
      4: 'Less Urgent',
      5: 'Non-Urgent',
    };
    return names[level] || names[5];
  };

  // Enhanced search function
  const filteredVisits = visits
    .filter(v => (activeTab === 'all' ? true : v.er_status === activeTab))
    .filter(v => {
      // If no search query and no priority filter, show all
      if (!searchQuery && priorityFilter === 'all') return true;
      console.log(v);

      const query = searchQuery.toLowerCase();

      // Check if matches any search criteria
      const matchesSearch = searchQuery
        ? (v?.patient?.person?.first_name &&
            v?.patient?.person?.first_name.toLowerCase().includes(query)) ||
          (v?.patient?.person?.last_name &&
            v?.patient?.person?.last_name.toLowerCase().includes(query)) ||
          (v?.patient?.patient_id &&
            v?.patient?.patient_id.toString().includes(query)) ||
          (v?.patient?.mrn && v?.patient?.mrn.includes(query)) ||
          (v.chief_complaint &&
            v.chief_complaint.toLowerCase().includes(query)) ||
          (v.triage_level &&
            getPriorityName(v.triage_level).toLowerCase().includes(query)) ||
          (v.triage_level && query.includes(`level ${v.triage_level}`)) ||
          (v.triage_level && query.includes(`level ${v.triage_level}`)) ||
          (v.er_visit_id && v.er_visit_id.toString().includes(query))
        : true;

      // Check priority filter
      const matchesPriority =
        priorityFilter === 'all' || v.triage_level == priorityFilter;

      return matchesSearch && matchesPriority;
    });

  const groupedVisits = filteredVisits.reduce((acc, v) => {
    const level = v.triage_level || 5;
    acc[level] = acc[level] || [];
    acc[level].push(v);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
            <Activity className="h-full w-full animate-spin text-blue-600 p-5" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-800">
              Loading ER Dashboard
            </h3>
            <p className="text-sm text-slate-500">
              Please wait while we fetch patient data...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                ER Nurse Station
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Live Emergency Room Patient Overview
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, ID, complaint, triage level (e.g., 'level 1', 'urgent')..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full"
              >
                <X className="h-4 w-4 text-slate-500" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.total || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                  <span>{stats.waiting || 0} waiting</span>
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">
                    Critical Cases
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {stats.critical || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 text-sm text-red-600 font-medium">
                  <Clock className="h-3 w-3" />
                  <span>Immediate attention needed</span>
                </div>
              </div>
            </div>
            {console.log(stats)}
          </div>
        )}

        {/* Action Bar & Filters */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => openModal('registerPatient')}
                className="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <UserPlus
                  size={18}
                  className="group-hover:scale-110 transition-transform"
                />
                Register Patient
              </button>

              <button
                onClick={() => openModal('unknownPatient')}
                className="group flex items-center gap-2 px-5 py-3 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all"
              >
                <UserX size={18} />
                Unknown Patient
              </button>

              <button
                onClick={refreshData}
                className="flex items-center gap-2 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl text-sm font-medium hover:border-blue-300 hover:text-blue-700 hover:bg-blue-50 transition-all group"
              >
                <RefreshCw size={18} className="group-hover:animate-spin" />
                Refresh
              </button>
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">Priority:</span>
              <div className="flex items-center gap-1">
                {['all', '1', '2', '3', '4', '5'].map(level => (
                  <button
                    key={level}
                    onClick={() => setPriorityFilter(level)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      priorityFilter === level
                        ? level === 'all'
                          ? 'bg-slate-800 text-white'
                          : level === '1'
                            ? 'bg-red-600 text-white'
                            : level === '2'
                              ? 'bg-orange-600 text-white'
                              : level === '3'
                                ? 'bg-yellow-600 text-white'
                                : level === '4'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-green-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {level === 'all' ? 'All' : `Level ${level}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex">
            {[
              {
                key: 'waiting',
                label: 'Waiting Room',
                icon: '⏳',
                count: stats?.waiting || 0,
              },
              {
                key: 'triage',
                label: 'In Triage',
                icon: '📋',
                count: stats?.triage || 0,
              },
              {
                key: 'treatment',
                label: 'In Treatment',
                icon: '🏥',
                count: stats?.treatment || 0,
              },
              {
                key: 'discharged',
                label: 'Discharged',
                icon: '✅',
                count: stats?.discharged || 0,
              },
              {
                key: 'all',
                label: 'All Patients',
                icon: '👥',
                count: stats?.total || 0,
              },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`group flex-1 px-6 py-4 text-sm font-medium transition-all duration-300 relative
                  ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-blue-50 to-blue-100/50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }
                `}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {tab.count}
                  </span>
                  <ChevronRight
                    size={16}
                    className={`transition-transform duration-300 ${activeTab === tab.key ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                  />
                </div>
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Patient Groups */}
        <div className="space-y-8">
          {[1, 2, 3, 4, 5].map(level => {
            const patients = groupedVisits[level];
            if (!patients?.length) return null;

            const levelNames = {
              1: {
                name: 'Critical',
                color: 'from-red-500 to-red-600',
                bg: 'bg-red-50',
                text: 'text-red-700',
                border: 'border-red-200',
                icon: '🚨',
              },
              2: {
                name: 'Emergency',
                color: 'from-orange-500 to-orange-600',
                bg: 'bg-orange-50',
                text: 'text-orange-700',
                border: 'border-orange-200',
                icon: '⚠️',
              },
              3: {
                name: 'Urgent',
                color: 'from-amber-500 to-amber-600',
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                border: 'border-amber-200',
                icon: '🟡',
              },
              4: {
                name: 'Less Urgent',
                color: 'from-blue-500 to-blue-600',
                bg: 'bg-blue-50',
                text: 'text-blue-700',
                border: 'border-blue-200',
                icon: '🔵',
              },
              5: {
                name: 'Non-Urgent',
                color: 'from-green-500 to-green-600',
                bg: 'bg-green-50',
                text: 'text-green-700',
                border: 'border-green-200',
                icon: '🟢',
              },
            };

            const config = levelNames[level];

            return (
              <div key={level} className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`px-4 py-2 rounded-xl ${config.bg} ${config.border} border flex items-center gap-2`}
                    >
                      <span className="text-lg">{config.icon}</span>
                      <span className={`text-sm font-semibold ${config.text}`}>
                        Level {level} • {config.name}
                      </span>
                    </div>
                    <div className="h-8 w-px bg-slate-200"></div>
                    <h2 className="text-sm uppercase tracking-wider text-slate-600 font-medium">
                      {patients.length} Patient
                      {patients.length !== 1 ? 's' : ''}
                    </h2>
                  </div>
                  {level <= 3 && (
                    <div
                      className={`text-xs px-3 py-1.5 rounded-full ${config.bg} ${config.text} font-medium animate-pulse`}
                    >
                      ⚠️ Priority Attention
                    </div>
                  )}
                </div>

                {patients.map(visit => (
                  <ERPatientCard
                    key={visit.er_visit_id}
                    visit={visit}
                    onTriage={() => openModal('triage', visit)}
                    onTreatment={() => openModal('treatment', visit)}
                    onIdentify={() => openModal('identifyPatient', visit)}
                    triageLevel={level}
                  />
                ))}
              </div>
            );
          })}

          {filteredVisits.length === 0 && (
            <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-2xl py-20 text-center shadow-sm">
              <div className="relative inline-block mb-4">
                <Users size={48} className="text-slate-300" />
                <div className="absolute -inset-4 bg-gradient-to-r from-transparent via-blue-50/30 to-transparent rounded-full animate-pulse"></div>
              </div>
              <h3 className="text-lg font-medium text-slate-700 mb-2">
                No Patients Found
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                {searchQuery || priorityFilter !== 'all'
                  ? 'No patients match your search criteria. Try adjusting your search or filters.'
                  : activeTab === 'waiting'
                    ? 'The waiting room is currently empty. All patients have been attended to.'
                    : 'No patients match the current criteria.'}
              </p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                {(searchQuery || priorityFilter !== 'all') && (
                  <button
                    onClick={clearSearch}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-all duration-300"
                  >
                    <X size={16} />
                    Clear Search
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status Footer */}
      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-slate-200 px-6 py-3">
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>System Status: Active</span>
            </div>
            <span>•</span>
            <span>Total Patients Today: {stats?.total || 0}</span>
            <span>•</span>
            <span>Auto-refresh: 30s</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>
              Updated:{' '}
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Modals */}
      <RegisterPatientModal
        isOpen={modals.registerPatient}
        onClose={() => closeModal('registerPatient')}
        onSuccess={visit => {
          closeModal('registerPatient');
          fetchDashboardData();
          toast.success('Patient registered');
          setTimeout(() => openModal('triage', visit), 300);
        }}
      />

      <UnknownPatientModal
        isOpen={modals.unknownPatient}
        onClose={() => closeModal('unknownPatient')}
        onSuccess={res => {
          closeModal('unknownPatient');
          fetchDashboardData();
          toast.success('Unknown patient registered');
          setTimeout(() => openModal('triage', res.erVisit), 300);
        }}
      />

      <TriageDrawer
        isOpen={modals.triage}
        visit={selectedVisit}
        onClose={() => closeModal('triage')}
        onSuccess={() => {
          closeModal('triage');
          fetchDashboardData();
          toast.success('Triage completed');
        }}
      />

      <IdentifyPatientModal
        isOpen={modals.identifyPatient}
        visit={selectedVisit}
        onClose={() => closeModal('identifyPatient')}
        onSuccess={() => {
          closeModal('identifyPatient');
          fetchDashboardData();
          toast.success('Patient identified');
        }}
      />

      <TreatmentModal
        isOpen={modals.treatment}
        visit={selectedVisit}
        onClose={() => closeModal('treatment')}
        onSuccess={() => {
          closeModal('treatment');
          fetchDashboardData();
          toast.success('Treatment recorded');
        }}
      />
    </div>
  );
};

export default NurseERPage;
