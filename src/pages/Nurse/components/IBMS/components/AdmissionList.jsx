import { useState, useEffect, useCallback } from 'react';
import {
  User,
  Calendar,
  BedDouble,
  Clock,
  ArrowRight,
  Search,
  Filter,
  X,
  MapPin,
  Stethoscope,
  AlertCircle,
  Heart,
  Scale,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import {
  SOCKET_EVENTS,
  SOCKET_ROOMS,
} from '../../../../../configs/socketEvents';
import bedAssignmentApi from '../../../../../services/bedAssignmentApi';
import { useSocket } from '../../../../../contexts/SocketContext';
import AdmissionDetailsModal from './Modals/AdmissionDetailsModal';

// Filter configuration
const admissionFilterConfig = [
  {
    type: 'search',
    name: 'search',
    placeholder: 'Search by patient name, MRN, admission #, or bed...',
  },
  {
    type: 'select',
    name: 'status',
    label: 'Admission Status',
    options: [
      { value: '', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'pending_discharge', label: 'Pending Discharge' },
      { value: 'discharged', label: 'Discharged' },
    ],
  },
  {
    type: 'select',
    name: 'admission_type',
    label: 'Admission Type',
    options: [
      { value: '', label: 'All Types' },
      { value: 'elective', label: 'Elective' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'transfer', label: 'Transfer' },
      { value: 'delivery', label: 'Delivery' },
    ],
  },
  {
    type: 'select',
    name: 'admission_source',
    label: 'Admission Source',
    options: [
      { value: '', label: 'All Sources' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'outpatient', label: 'Outpatient' },
      { value: 'transfer', label: 'Transfer' },
      { value: 'referral', label: 'Referral' },
    ],
  },
  {
    type: 'date',
    name: 'from_date',
    label: 'Admitted From',
  },
  {
    type: 'date',
    name: 'to_date',
    label: 'Admitted To',
  },
  {
    type: 'select',
    name: 'floor',
    label: 'Floor',
    options: [
      { value: '', label: 'All Floors' },
      { value: '1', label: 'Floor 1' },
      { value: '2', label: 'Floor 2' },
      { value: '3', label: 'Floor 3' },
      { value: '4', label: 'Floor 4' },
    ],
  },
];

const AdmissionsList = ({ isDarkMode, userRole }) => {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdmissionDetails, setShowAdmissionDetails] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);

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

    return () => {
      // Cleanup if needed
    };
  }, [fetchAdmissions, joinRoom]);

  // Listen to real-time updates
  useEffect(() => {
    const handleAdmissionCreated = data => {
      console.log('🔴 New admission:', data);
      fetchAdmissions();
    };

    const handleAdmissionDischarged = data => {
      console.log('🔴 Admission discharged:', data);
      fetchAdmissions();
    };

    const handleBedTransferred = data => {
      console.log('🔴 Bed transferred:', data);
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
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value,
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: '',
      admission_type: '',
      admission_source: '',
      from_date: '',
      to_date: '',
      floor: '',
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Pagination handlers
  const handlePageChange = newPage => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = newLimit => {
    setPagination(prev => ({ ...prev, limit: newLimit, currentPage: 1 }));
  };

  // Helper functions
  const getCurrentBed = admission => {
    return admission.bedAssignments?.find(assignment => assignment.is_current)
      ?.bed;
  };

  const getPatientName = admission => {
    const person = admission.patient?.person;
    return (
      `${person?.first_name || ''} ${person?.middle_name ? person.middle_name + ' ' : ''}${person?.last_name || ''}`.trim() ||
      'Unknown Patient'
    );
  };

  const getDoctorName = admission => {
    const doctor = admission.attendingDoctor;
    if (!doctor) return null;
    const person = doctor.person;
    return `Dr. ${person?.first_name || ''} ${person?.last_name || ''}`.trim();
  };

  const calculateLengthOfStay = admissionDate => {
    if (!admissionDate) return 0;
    const now = new Date();
    const admitted = new Date(admissionDate);
    const diffTime = Math.abs(now - admitted);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getAdmissionTypeColor = type => {
    switch (type?.toLowerCase()) {
      case 'elective':
        return COLORS.info;
      case 'emergency':
        return COLORS.danger;
      case 'transfer':
        return COLORS.warning;
      case 'delivery':
        return COLORS.success;
      case 'urgent':
        return COLORS.warning;
      default:
        return COLORS.text.secondary;
    }
  };

  const getAdmissionSourceColor = source => {
    switch (source?.toLowerCase()) {
      case 'emergency':
        return COLORS.danger;
      case 'outpatient':
        return COLORS.info;
      case 'transfer':
        return COLORS.warning;
      case 'referral':
        return COLORS.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewDetails = admission => {
    setShowAdmissionDetails(true);
    setSelectedAdmission(admission);
  };

  const handleTransferBed = admission => {
    // Implementation for transferring bed
    console.log('Transfer bed:', admission);
  };

  if (loading && admissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: COLORS.primary }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2
            className="text-2xl font-bold"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            Active Admissions
          </h2>
          <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
            Showing {admissions.length} of {pagination.total} admissions
          </p>
        </div>

        <div className="flex gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
              style={{ color: COLORS.text.secondary }}
            />
            <input
              type="text"
              placeholder="Search admissions..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              className="pl-10 pr-4 py-2 rounded-lg border w-64"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.input.backgroundDark
                  : COLORS.input.background,
                borderColor: isDarkMode
                  ? COLORS.input.borderDark
                  : COLORS.input.border,
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            />
            {filters.search && (
              <button
                onClick={() => handleFilterChange('search', '')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X
                  className="w-4 h-4"
                  style={{ color: COLORS.text.secondary }}
                />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 relative"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.darkHover
                : COLORS.surface.lightHover,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
            }}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center"
                style={{
                  backgroundColor: COLORS.primary,
                  color: COLORS.text.white,
                }}
              >
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Clear Filters Button */}
          {activeFiltersCount > 0 && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: COLORS.badge.warning.bg,
                color: COLORS.badge.warning.text,
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {admissionFilterConfig.map(filter => {
              if (filter.type === 'search') return null;

              if (filter.type === 'select') {
                return (
                  <div key={filter.name}>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {filter.label}
                    </label>
                    <select
                      value={filters[filter.name] || ''}
                      onChange={e =>
                        handleFilterChange(filter.name, e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.input.backgroundDark
                          : COLORS.input.background,
                        borderColor: isDarkMode
                          ? COLORS.input.borderDark
                          : COLORS.input.border,
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {filter.options.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (filter.type === 'date') {
                return (
                  <div key={filter.name}>
                    <label
                      className="block text-sm font-medium mb-1"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    >
                      {filter.label}
                    </label>
                    <input
                      type="date"
                      value={filters[filter.name] || ''}
                      onChange={e =>
                        handleFilterChange(filter.name, e.target.value)
                      }
                      className="w-full px-3 py-2 rounded-lg border text-sm"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.input.backgroundDark
                          : COLORS.input.background,
                        borderColor: isDarkMode
                          ? COLORS.input.borderDark
                          : COLORS.input.border,
                        color: isDarkMode
                          ? COLORS.text.white
                          : COLORS.text.primary,
                      }}
                    />
                  </div>
                );
              }

              return null;
            })}
          </div>
        </div>
      )}

      {/* Admissions List */}
      {admissions.length === 0 ? (
        <div
          className="text-center py-12 rounded-lg border"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <AlertCircle
            className="w-12 h-12 mx-auto mb-3"
            style={{ color: COLORS.text.secondary }}
          />
          <p
            className="text-lg font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            No admissions found
          </p>
          <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
            {activeFiltersCount > 0
              ? 'Try adjusting your filters'
              : 'No admissions match your criteria'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {admissions.map(admission => {
              const currentBed = getCurrentBed(admission);
              const patientName = getPatientName(admission);
              const doctorName = getDoctorName(admission);
              const los = calculateLengthOfStay(admission.admission_date);

              return (
                <div
                  key={admission.admission_id}
                  className="p-4 rounded-lg border-2 transition-all hover:shadow-lg"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.dark
                      : COLORS.surface.light,
                    borderColor: isDarkMode
                      ? COLORS.border.dark
                      : COLORS.border.light,
                  }}
                >
                  {/* Admission Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: COLORS.primary + '20' }}
                      >
                        <User
                          className="w-6 h-6"
                          style={{ color: COLORS.primary }}
                        />
                      </div>
                      <div>
                        <h3
                          className="font-bold text-lg"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {patientName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <p
                            className="text-sm"
                            style={{ color: COLORS.text.secondary }}
                          >
                            #{admission.admission_number}
                          </p>
                          <span
                            className="text-xs px-1 py-0.5 rounded"
                            style={{
                              backgroundColor: isDarkMode
                                ? COLORS.surface.darkHover
                                : COLORS.surface.lightHover,
                              color: COLORS.text.secondary,
                            }}
                          >
                            {admission.patient?.mrn || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 items-end">
                      <div
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor:
                            getAdmissionTypeColor(admission.admission_type) +
                            '20',
                          color: getAdmissionTypeColor(
                            admission.admission_type,
                          ),
                        }}
                      >
                        {admission.admission_type || 'N/A'}
                      </div>

                      <div
                        className="px-2 py-1 rounded-full text-xs font-medium capitalize"
                        style={{
                          backgroundColor:
                            getAdmissionSourceColor(
                              admission.admission_source,
                            ) + '20',
                          color: getAdmissionSourceColor(
                            admission.admission_source,
                          ),
                        }}
                      >
                        {admission.admission_source || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Patient Info */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: COLORS.info + '20' }}
                      >
                        <Heart
                          className="w-3 h-3"
                          style={{ color: COLORS.info }}
                        />
                      </div>
                      <div>
                        <p style={{ color: COLORS.text.secondary }}>
                          Blood Type
                        </p>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {admission.patient?.person?.blood_type || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: COLORS.success + '20' }}
                      >
                        <Scale
                          className="w-3 h-3"
                          style={{ color: COLORS.success }}
                        />
                      </div>
                      <div>
                        <p style={{ color: COLORS.text.secondary }}>Vitals</p>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {admission.patient?.height || 'N/A'}cm /{' '}
                          {admission.patient?.weight || 'N/A'}kg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bed Info */}
                  {currentBed ? (
                    <div
                      className="p-3 rounded-lg mb-3"
                      style={{
                        backgroundColor: isDarkMode
                          ? COLORS.surface.darkHover
                          : COLORS.surface.lightHover,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <BedDouble
                          className="w-4 h-4"
                          style={{ color: COLORS.success }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          Bed {currentBed.bed_number}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span style={{ color: COLORS.text.secondary }}>
                          Type: {currentBed.bed_type}
                        </span>
                        <div
                          className="px-1 py-0.5 rounded font-medium capitalize"
                          style={{
                            backgroundColor:
                              currentBed.bed_status === 'occupied'
                                ? COLORS.danger + '20'
                                : COLORS.success + '20',
                            color:
                              currentBed.bed_status === 'occupied'
                                ? COLORS.danger
                                : COLORS.success,
                          }}
                        >
                          {currentBed.bed_status}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="p-3 rounded-lg mb-3"
                      style={{
                        backgroundColor: COLORS.danger + '10',
                        border: `1px solid ${COLORS.danger}20`,
                      }}
                    >
                      <p
                        className="text-sm font-medium"
                        style={{ color: COLORS.danger }}
                      >
                        ⚠️ No bed assigned
                      </p>
                    </div>
                  )}

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar
                        className="w-4 h-4"
                        style={{ color: COLORS.text.secondary }}
                      />
                      <div>
                        <p style={{ color: COLORS.text.secondary }}>Admitted</p>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {formatDate(admission.admission_date)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock
                        className="w-4 h-4"
                        style={{ color: COLORS.text.secondary }}
                      />
                      <div>
                        <p style={{ color: COLORS.text.secondary }}>LOS</p>
                        <p
                          className="font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {los} day{los !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Doctor Info */}
                  {doctorName && (
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: COLORS.info + '20' }}
                      >
                        <Stethoscope
                          className="w-4 h-4"
                          style={{ color: COLORS.info }}
                        />
                      </div>
                      <div className="flex-1">
                        <p
                          className="text-sm font-medium"
                          style={{
                            color: isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.primary,
                          }}
                        >
                          {doctorName}
                        </p>
                        <p
                          className="text-xs"
                          style={{ color: COLORS.text.secondary }}
                        >
                          {admission.attendingDoctor?.specialization ||
                            'Physician'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDetails(admission)}
                      className="flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                      style={{
                        backgroundColor: COLORS.button.primary.bg,
                        color: COLORS.button.primary.text,
                      }}
                    >
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    {['nurse', 'admin'].includes(userRole) && currentBed && (
                      <button
                        onClick={() => handleTransferBed(admission)}
                        className="px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                        style={{
                          backgroundColor: isDarkMode
                            ? COLORS.surface.darkHover
                            : COLORS.button.outline.bgHover,
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                          border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
                        }}
                      >
                        <MapPin className="w-4 h-4" />
                        Transfer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
            {/* Items per page selector */}
            <div className="flex items-center gap-2">
              <span
                className="text-sm"
                style={{ color: COLORS.text.secondary }}
              >
                Show
              </span>
              <select
                value={pagination.limit}
                onChange={e => handleItemsPerPageChange(Number(e.target.value))}
                className="px-2 py-1 rounded border text-sm"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.input.backgroundDark
                    : COLORS.input.background,
                  borderColor: isDarkMode
                    ? COLORS.input.borderDark
                    : COLORS.input.border,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span
                className="text-sm"
                style={{ color: COLORS.text.secondary }}
              >
                per page
              </span>
            </div>

            {/* Page info */}
            <div className="text-sm" style={{ color: COLORS.text.secondary }}>
              Showing {(pagination.currentPage - 1) * pagination.limit + 1} to{' '}
              {Math.min(
                pagination.currentPage * pagination.limit,
                pagination.total,
              )}{' '}
              of {pagination.total} entries
            </div>

            {/* Page navigation */}
            <div className="flex gap-1">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.surface.lightHover,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
                }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from(
                { length: Math.min(5, pagination.totalPages) },
                (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (
                    pagination.currentPage >=
                    pagination.totalPages - 2
                  ) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className="w-10 h-10 rounded-lg font-medium transition-colors"
                      style={{
                        backgroundColor:
                          pagination.currentPage === pageNum
                            ? COLORS.primary
                            : isDarkMode
                              ? COLORS.surface.darkHover
                              : COLORS.surface.lightHover,
                        color:
                          pagination.currentPage === pageNum
                            ? COLORS.text.white
                            : isDarkMode
                              ? COLORS.text.white
                              : COLORS.text.secondary,
                        border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                },
              )}

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.surface.lightHover,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
                }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            {/* Modals */}
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
          </div>
        </>
      )}
    </div>
  );
};

export default AdmissionsList;
