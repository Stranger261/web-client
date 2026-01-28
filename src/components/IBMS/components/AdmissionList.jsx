import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { COLORS } from '../../../configs/CONST';
import { admissionFilterConfig } from '../../../configs/admissionFilterConfig';
import { SOCKET_EVENTS, SOCKET_ROOMS } from '../../../configs/socketEvents';

import AdmissionDetailsModal from './Modals/AdmissionDetailsModal';
import TransferBedModal from './Modals/TransferBedModal';

import { useSocket } from '../../../contexts/SocketContext';
import bedAssignmentApi from '../../../services/bedAssignmentApi';
import progressNotesApi from '../../../services/progressNotesApi';

import AdmissionCard from './cards/AdmissionCard';

import Pagination from '../../ui/pagination';
import { Button } from '../../ui/button';
import { FilterPanel } from '../../ui/filter-panel';
import { LoadingSpinner } from '../../ui/loading-spinner';
import ProgressNoteModal from '../../ProgressNotes/components/modals/ProgressNoteModal';

const AdmissionsList = ({ isDarkMode, userRole }) => {
  // modals
  const [showAdmissionDetails, setShowAdmissionDetails] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);

  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    admission_type: '',
    admission_source: '',
    from_date: '',
    to_date: '',
    floor: '',
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const { joinRoom, on, off } = useSocket();

  // Count active filters
  const activeFiltersCount = Object.values(filters).filter(
    v => v !== '' && v !== null,
  ).length;

  // Fetch admissions with filters and pagination
  const fetchAdmissions = useCallback(async () => {
    setLoading(true);
    try {
      const apiFilter = {
        page: pagination.currentPage,
        limit: pagination.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.admission_type && {
          admission_type: filters.admission_type,
        }),
        ...(filters.admission_source && {
          admission_source: filters.admission_source,
        }),
        ...(filters.from_date && { from_date: filters.from_date }),
        ...(filters.to_date && { to_date: filters.to_date }),
        ...(filters.floor && { floor: filters.floor }),
      };

      const response = await bedAssignmentApi.getAdmissions(apiFilter);

      setAdmissions(response.data?.admissions || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.pagination?.total || 0,
        totalPages: response.data?.pagination?.totalPages || 0,
        currentPage: response.data?.pagination?.page || 1,
      }));
    } catch (error) {
      console.error('Error fetching admissions:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.limit]);

  // Initial fetch and socket setup
  useEffect(() => {
    fetchAdmissions();
    joinRoom(SOCKET_ROOMS.ADMISSIONS);
  }, [fetchAdmissions, joinRoom]);

  // Listen to real-time updates
  useEffect(() => {
    const handleAdmissionCreated = data => {
      fetchAdmissions();
    };

    const handleAdmissionDischarged = data => {
      fetchAdmissions();
    };

    const handleBedTransferred = data => {
      fetchAdmissions();
    };

    on(SOCKET_EVENTS.ADMISSION_CREATED, handleAdmissionCreated);
    on(SOCKET_EVENTS.ADMISSION_DISCHARGED, handleAdmissionDischarged);
    on(SOCKET_EVENTS.BED_TRANSFERRED, handleBedTransferred);

    return () => {
      off(SOCKET_EVENTS.ADMISSION_CREATED, handleAdmissionCreated);
      off(SOCKET_EVENTS.ADMISSION_DISCHARGED, handleAdmissionDischarged);
      off(SOCKET_EVENTS.BED_TRANSFERRED, handleBedTransferred);
    };
  }, [on, off, fetchAdmissions]);

  // Handle filter changes
  const handleFilterChange = newFilters => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = clearedFilters => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setFilters(clearedFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Pagination handlers
  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleItemsPerPageChange = newLimit => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  const handleViewDetails = admission => {
    setShowAdmissionDetails(true);
    setSelectedAdmission(admission);
  };

  const handleTransferBed = admission => {
    setShowTransferModal(true);
    setSelectedAdmission(admission);
  };

  const handleAddNote = admission => {
    setSelectedAdmission(admission);
    setShowNoteModal(true);
  };

  const handleCreateNote = async noteData => {
    setLoading(true);
    try {
      await progressNotesApi.createProgressNote(noteData);
      toast.success('Progress note created successfully');
      setShowNoteModal(false);
      setSelectedAdmission(null);
      // onUpdate?.(); // Refresh parent data
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create note');
    } finally {
      setLoading(false);
    }
  };

  if (loading && admissions.length === 0) {
    return <LoadingSpinner size="md" />;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Modals */}
      {showTransferModal && (
        <TransferBedModal
          isOpen={showTransferModal}
          isDarkMode={isDarkMode}
          onClose={() => {
            setShowTransferModal(false);
          }}
          admission={selectedAdmission}
          onTransferComplete={() => {
            fetchAdmissions();
            setShowTransferModal(false);
            setSelectedAdmission(null);
          }}
        />
      )}

      {showNoteModal && (
        <ProgressNoteModal
          isOpen={showNoteModal}
          onClose={() => {
            setShowNoteModal(false);
            setSelectedAdmission(null);
          }}
          admission={selectedAdmission}
          onSubmit={handleCreateNote}
          loading={loading}
        />
      )}

      {showAdmissionDetails && selectedAdmission && (
        <AdmissionDetailsModal
          isOpen={showAdmissionDetails}
          onClose={() => {
            setShowAdmissionDetails(false);
            setSelectedAdmission(null);
          }}
          admission={selectedAdmission}
          isDarkMode={isDarkMode}
          userRole={userRole}
          onUpdate={fetchAdmissions}
        />
      )}

      {/* Header with Search and Filters */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-4 gap-3 sm:gap-4">
          <div className="min-w-0 w-full sm:w-auto">
            <h2
              className="text-xl sm:text-2xl font-bold truncate"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              Active Admissions
            </h2>
            <p
              className="text-xs sm:text-sm mt-0.5 sm:mt-1"
              style={{ color: COLORS.text.secondary }}
            >
              Showing {admissions.length} of {pagination.total} admissions
            </p>
          </div>

          {/* Filters Button */}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
            >
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 sm:px-2.5 py-0.5 bg-teal-600 text-white text-xs font-bold rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            filterConfig={admissionFilterConfig}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            searchPlaceholder="Search details..."
            title="Filter admissions"
          />
        )}
      </div>

      {/* Admissions List */}
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
            No admissions found
          </p>
          <p
            className="text-xs sm:text-sm mt-1 px-4"
            style={{ color: COLORS.text.secondary }}
          >
            {activeFiltersCount > 0
              ? 'Try adjusting your filters'
              : 'No admissions match your criteria'}
          </p>
        </div>
      ) : (
        <>
          <AdmissionCard
            onTransferBed={handleTransferBed}
            onViewDetails={handleViewDetails}
            isDarkMode={isDarkMode}
            admissions={admissions}
            userRole={userRole}
            onAddNote={handleAddNote}
          />

          {/* Pagination */}
          <Pagination
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            currentPage={pagination?.currentPage}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            totalPages={pagination.totalPages}
          />
        </>
      )}
    </div>
  );
};

export default AdmissionsList;
