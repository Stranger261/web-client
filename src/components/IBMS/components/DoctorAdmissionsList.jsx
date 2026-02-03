import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  X,
  AlertCircle,
  BarChart3,
  Users,
  Calendar,
  Target,
  Stethoscope,
  CheckCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { COLORS } from '../../../configs/CONST';
import { doctorAdmissionFilterConfig } from '../../../configs/doctorAdmissionFilterConfig';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../../configs/socketEvents';

import DoctorAdmissionCard from '../components/cards/doctorAdmissionCard';
import DoctorAdmissionDetailsModal from './Modals/DoctorAdmissionDetailsModal';
import DoctorRoundNoteModal from './Modals/DoctorRoundNoteModal';
import DischargeRequestModal from './Modals/DischargeRequestModal';
import RoundsViewModal from './Modals/RoundsViewModal';
import DoctorStatsPanel from './DoctorStatsPanel';

import { useSocket } from '../../../contexts/SocketContext';
import doctorAdmissionApi from '../../../services/doctorAdmissionApi';

import Pagination from '../../ui/pagination';
import { Button } from '../../ui/button';
import { FilterPanel } from '../../ui/filter-panel';
import { LoadingSpinner } from '../../ui/loading-spinner';
import Tabs from '../../ui/tabs';

const DoctorAdmissionsList = ({ isDarkMode }) => {
  // State
  const [activeTab, setActiveTab] = useState('all');
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState(null);

  // Modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showDischargeModal, setShowDischargeModal] = useState(false);
  const [showRoundsModal, setShowRoundsModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    admission_type: '',
    from_date: '',
    to_date: '',
    floor: '',
    discharge_pending: false,
  });

  // Pagination
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
  });

  const { joinRoom, on, off } = useSocket();

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(
    v => v !== '' && v !== null && v !== false,
  ).length;

  // Fetch doctor's admissions
  const fetchDoctorAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      // Start with base pagination
      const apiFilters = {
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      // Apply FILTER PANEL filters first (if any exist)
      Object.keys(filters).forEach(key => {
        if (
          filters[key] !== '' &&
          filters[key] !== null &&
          filters[key] !== false
        ) {
          apiFilters[key] = filters[key];
        }
      });

      // Apply TAB-SPECIFIC filters (only if filter panel doesn't already have that filter)
      // This prevents tabs from overriding user's filter panel choices
      if (activeTab === 'rounds') {
        // Only set discharge_pending if not already set by filter panel
        if (!apiFilters.discharge_pending && !apiFilters.status) {
          apiFilters.discharge_pending = true;
        }
      } else if (activeTab === 'pending') {
        // Only set status if not already set by filter panel
        if (!apiFilters.status) {
          apiFilters.status = 'pending_discharge';
        }
      } else if (activeTab === 'discharged') {
        // Only set status if not already set by filter panel
        if (!apiFilters.status) {
          apiFilters.status = 'discharged';
        }
      }

      const response = await doctorAdmissionApi.getDoctorAdmissions(apiFilters);

      setAdmissions(response.data?.admissions || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.pagination?.total || 0,
        totalPages: response.data?.pagination?.totalPages || 0,
        currentPage: response.data?.pagination?.page || 1,
      }));
    } catch (error) {
      console.error('Error fetching doctor admissions:', error);
      toast.error('Failed to load admissions');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.limit, activeTab]);

  // Fetch doctor stats
  const fetchDoctorStats = async () => {
    try {
      const response =
        await doctorAdmissionApi.getDoctorAdmissionStats('month');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching doctor stats:', error);
    }
  };

  // Initial fetch and stats
  useEffect(() => {
    fetchDoctorStats();
    joinRoom(SOCKET_ROOMS.ADMISSIONS);
  }, []);

  // Fetch admissions when filters, pagination, or activeTab changes
  useEffect(() => {
    fetchDoctorAdmissions();
  }, [fetchDoctorAdmissions]);

  // Listen to real-time updates
  useEffect(() => {
    const handleAdmissionUpdated = () => {
      fetchDoctorAdmissions();
      fetchDoctorStats();
    };

    on(SOCKET_EVENTS.ADMISSION_CREATED, handleAdmissionUpdated);
    on(SOCKET_EVENTS.ADMISSION_DISCHARGED, handleAdmissionUpdated);
    on(SOCKET_EVENTS.BED_TRANSFERRED, handleAdmissionUpdated);

    return () => {
      off(SOCKET_EVENTS.ADMISSION_CREATED, handleAdmissionUpdated);
      off(SOCKET_EVENTS.ADMISSION_DISCHARGED, handleAdmissionUpdated);
      off(SOCKET_EVENTS.BED_TRANSFERRED, handleAdmissionUpdated);
    };
  }, [on, off, fetchDoctorAdmissions]);

  // Filter change handler - reset to "All" tab when using filter panel
  const handleFilterChange = newFilters => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setActiveTab('all'); // Reset to "All" tab when user uses filter panel
  };

  const handleClearFilters = clearedFilters => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    setActiveTab('all'); // Reset to "All" tab when clearing filters
  };

  // Pagination handlers
  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  const handleItemsPerPageChange = newLimit => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
  };

  // Modal handlers
  const handleViewDetails = admission => {
    setSelectedAdmission(admission);
    setShowDetailsModal(true);
  };

  const handleAddDoctorNote = admission => {
    setSelectedAdmission(admission);
    setShowNoteModal(true);
  };

  const handleRequestDischarge = admission => {
    setSelectedAdmission(admission);
    setShowDischargeModal(true);
  };

  const handleViewRounds = admission => {
    setSelectedAdmission(admission);
    setShowRoundsModal(true);
  };

  // Tab change handler - clear conflicting filters
  const handleTabChange = tab => {
    setActiveTab(tab);
    setPagination(prev => ({ ...prev, currentPage: 1 }));

    // Clear filters that would conflict with the selected tab
    const updatedFilters = { ...filters };

    switch (tab) {
      case 'rounds':
        // Clear status filter since rounds uses discharge_pending
        updatedFilters.status = '';
        // Don't clear discharge_pending - that's what the tab uses
        break;
      case 'pending':
        // Clear discharge_pending filter since pending uses status
        updatedFilters.discharge_pending = false;
        // Don't clear status - that's what the tab uses
        break;
      case 'discharged':
        // Clear discharge_pending filter
        updatedFilters.discharge_pending = false;
        // Don't clear status - that's what the tab uses
        break;
      case 'all':
        // Don't clear any filters for "All" tab
        break;
    }

    setFilters(updatedFilters);
  };

  // Get tab title
  const getTabTitle = () => {
    switch (activeTab) {
      case 'all':
        return 'All Patients';
      case 'rounds':
        return "Today's Rounds";
      case 'pending':
        return 'Pending Discharge';
      case 'discharged':
        return 'Discharged';
      default:
        return 'Patients';
    }
  };

  // Get filter status message
  const getFilterStatusMessage = () => {
    if (activeFiltersCount > 0) {
      return `${admissions.length} of ${pagination.total} patients (${activeFiltersCount} filter${activeFiltersCount !== 1 ? 's' : ''} applied)`;
    }

    switch (activeTab) {
      case 'rounds':
        return `${admissions.length} of ${pagination.total} patients (Today's rounds)`;
      case 'pending':
        return `${admissions.length} of ${pagination.total} patients (Pending discharge)`;
      case 'discharged':
        return `${admissions.length} of ${pagination.total} patients (Discharged)`;
      default:
        return `${admissions.length} of ${pagination.total} patients`;
    }
  };

  if (loading && admissions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 px-2 sm:px-0">
      {/* Modals */}
      {showDetailsModal && selectedAdmission && (
        <DoctorAdmissionDetailsModal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedAdmission(null);
          }}
          admission={selectedAdmission}
          isDarkMode={isDarkMode}
          onUpdate={() => {
            fetchDoctorAdmissions();
            fetchDoctorStats();
          }}
        />
      )}

      {showNoteModal && selectedAdmission && (
        <DoctorRoundNoteModal
          isOpen={showNoteModal}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedAdmission(null);
          }}
          admission={selectedAdmission}
          onSubmit={async noteData => {
            try {
              await doctorAdmissionApi.createDoctorRoundNote(
                selectedAdmission.admission_id,
                noteData,
              );
              toast.success('Doctor round note created successfully');
              fetchDoctorAdmissions();
              setShowNoteModal(false);
              setSelectedAdmission(null);
            } catch (error) {
              toast.error(
                error.response?.data?.message || 'Failed to create note',
              );
            }
          }}
        />
      )}

      {showDischargeModal && selectedAdmission && (
        <DischargeRequestModal
          isOpen={showDischargeModal}
          onClose={() => {
            setShowDischargeModal(false);
            setSelectedAdmission(null);
          }}
          admission={selectedAdmission}
          onSubmit={async dischargeData => {
            try {
              await doctorAdmissionApi.requestPatientDischarge(
                selectedAdmission.admission_id,
                dischargeData,
              );
              toast.success('Discharge request submitted successfully');
              fetchDoctorAdmissions();
              fetchDoctorStats();
              setShowDischargeModal(false);
              setSelectedAdmission(null);
            } catch (error) {
              toast.error(
                error.response?.data?.message || 'Failed to request discharge',
              );
            }
          }}
        />
      )}

      {showRoundsModal && selectedAdmission && (
        <RoundsViewModal
          isOpen={showRoundsModal}
          onClose={() => {
            setShowRoundsModal(false);
            setSelectedAdmission(null);
          }}
          admission={selectedAdmission}
          isDarkMode={isDarkMode}
        />
      )}

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-5 md:px-6 py-3 sm:py-4 gap-3">
          <div className="min-w-0 flex-1 w-full sm:w-auto">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-1">
              <Stethoscope
                className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                style={{ color: COLORS.primary }}
              />
              <h2
                className="text-lg sm:text-xl md:text-2xl font-bold truncate"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                {getTabTitle()}
              </h2>
            </div>
            <p
              className="text-xs sm:text-sm leading-relaxed"
              style={{ color: COLORS.text.secondary }}
            >
              {getFilterStatusMessage()}
              {stats &&
                activeTab === 'all' &&
                ` • ${stats.active_admissions || 0} currently admitted`}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
            <Button
              variant="outline"
              icon={BarChart3}
              onClick={() => setShowStats(!showStats)}
              className="flex-1 sm:flex-none text-xs sm:text-sm"
              size="sm"
            >
              <span>Stats</span>
            </Button>

            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none text-xs sm:text-sm relative"
              size="sm"
            >
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:static sm:ml-1.5 min-w-[18px] h-[18px] sm:min-w-[20px] sm:h-auto flex items-center justify-center px-1.5 sm:px-2 py-0.5 bg-teal-600 text-white text-[10px] sm:text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && stats && (
          <DoctorStatsPanel
            stats={stats}
            isDarkMode={isDarkMode}
            onClose={() => setShowStats(false)}
          />
        )}

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            filterConfig={doctorAdmissionFilterConfig}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            searchPlaceholder="Search patient, MRN, diagnosis..."
            title="Filter patients"
          />
        )}
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'all', label: 'All Patients', icon: Users },
          { id: 'rounds', label: "Today's Rounds", icon: Calendar },
          { id: 'pending', label: 'Pending Discharge', icon: Target },
          { id: 'discharged', label: 'Discharged', icon: CheckCircle },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Admissions Grid */}
      {admissions.length === 0 ? (
        <div
          className="text-center py-8 sm:py-12 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <AlertCircle
            className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3"
            style={{ color: COLORS.text.secondary }}
          />
          <p
            className="text-base sm:text-lg font-medium px-4"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            No patients found
          </p>
          <p
            className="text-xs sm:text-sm mt-1 px-4"
            style={{ color: COLORS.text.secondary }}
          >
            {activeFiltersCount > 0
              ? 'Try adjusting your filters'
              : activeTab === 'all'
                ? 'You have no patients assigned'
                : activeTab === 'rounds'
                  ? 'No patients need rounds today'
                  : activeTab === 'pending'
                    ? 'No patients pending discharge'
                    : 'No discharged patients found'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            {admissions.map(admission => (
              <DoctorAdmissionCard
                key={admission.admission_id}
                admission={admission}
                isDarkMode={isDarkMode}
                onViewDetails={handleViewDetails}
                onAddDoctorNote={handleAddDoctorNote}
                onUpdateDiagnosis={() => {}}
                onRequestDischarge={handleRequestDischarge}
                onViewRounds={handleViewRounds}
                stats={stats}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
              currentPage={pagination?.currentPage}
              totalItems={pagination.total}
              itemsPerPage={pagination.limit}
              totalPages={pagination.totalPages}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DoctorAdmissionsList;
