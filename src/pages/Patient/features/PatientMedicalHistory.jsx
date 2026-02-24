// components/Patients/MedicalHistory/PatientMedicalHistory.js
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Building2,
  AlertCircle,
  TrendingUp,
  Eye,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card, { CardHeader, CardBody } from '../../../components/ui/card';
import Pagination from '../../../components/ui/pagination';
import { FilterPanel } from '../../../components/ui/filter-panel';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';
import TimelineCard from '../../../components/Patients/cards/TimelineCard';
import RecordDetailsModal from '../components/modals/RecordDetailsModal';
import { COLORS } from '../../../configs/CONST';
import medicalRecordsService from '../../../services/medicalRecordApi';
import exportService from '../../../services/exportService';
import { getDateRangeText } from '../../../components/Patients/utils/getDateRangeText';
import { useAuth } from '../../../contexts/AuthContext';

// Keys that are pagination/meta — not user-facing filters
const PAGINATION_KEYS = ['page', 'limit'];

const PatientMedicalHistory = () => {
  const { currentUser } = useAuth();
  const isDarkMode = document.documentElement.classList.contains('dark');

  // State
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Export state
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Filters — single source of truth. No separate debounce state.
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    startDate: '',
    endDate: '',
    recordType: '',
    status: '',
  });

  // FIX 1: Single debounce — only delay the API call for search changes.
  // We store what was last *fetched* so we can skip redundant calls.
  const fetchTimerRef = useRef(null);
  const lastFetchedFilters = useRef(null);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = event => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target)
      ) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FIX 1 (cont): Debounce only search; all other filter changes fire immediately.
  useEffect(() => {
    const isSearchChange =
      lastFetchedFilters.current !== null &&
      filters.search !== lastFetchedFilters.current?.search &&
      // Make sure nothing else changed
      JSON.stringify({ ...filters, search: '' }) ===
        JSON.stringify({ ...lastFetchedFilters.current, search: '' });

    const delay = isSearchChange ? 500 : 0;

    clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      fetchRecords(filters);
    }, delay);

    return () => clearTimeout(fetchTimerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Fetch records
  const fetchRecords = useCallback(async currentFilters => {
    setLoading(true);
    try {
      // Clean filters — remove empty values
      const cleanFilters = Object.entries(currentFilters).reduce(
        (acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      lastFetchedFilters.current = currentFilters;

      const response =
        await medicalRecordsService.getMyMedicalRecords(cleanFilters);

      setRecords(response.timeline || []);
      setSummary(response.summary || {});
      setPagination({
        page: response.pagination?.page || 1,
        limit: response.pagination?.limit || 20,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
      });
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleRecord = recordId => {
    setExpandedRecordId(prev => (prev === recordId ? null : recordId));
  };

  const handleViewDetails = record => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  const handlePageChange = newPage => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = newLimit => {
    setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // FIX 2: FilterPanel only sends filter fields (no page/limit in its scope).
  // We merge here and always reset to page 1 on a filter change.
  const handleFilterChange = newFilters => {
    // If recordType changed, also clear status to avoid invalid combinations
    let adjustedFilters = { ...newFilters };

    if (
      'recordType' in newFilters &&
      newFilters.recordType !== filters.recordType
    ) {
      adjustedFilters.status = ''; // Clear status when record type changes
    }

    setFilters(prev => ({
      ...prev, // keep page, limit, and any existing filters
      ...adjustedFilters, // overlay only what FilterPanel knows about
      page: 1, // always reset to page 1
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20, // preserve limit
      search: '',
      startDate: '',
      endDate: '',
      recordType: '',
      status: '',
    });
  };

  // Export functionality
  const handleExport = async format => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      const exportFilters = { ...filters, page: 1, limit: 1000 };
      const response =
        await medicalRecordsService.getMyMedicalRecords(exportFilters);
      const allRecords = response.timeline || [];

      if (allRecords.length === 0) {
        toast.error('No records to export');
        return;
      }

      const exportData = exportService.prepareMedicalRecordsForExport(
        allRecords,
        {
          name: 'My Medical Records',
          dateRange: getDateRangeText(filters),
        },
      );

      switch (format) {
        case 'CSV':
          exportService.exportToCSV(allRecords, `my-medical-records`);
          toast.success('✅ CSV exported successfully!');
          break;
        case 'JSON':
          exportService.exportToJSON(exportData, `my-medical-records`);
          toast.success('✅ JSON exported successfully!');
          break;
        case 'PDF':
          exportService.exportToPDF(
            allRecords,
            {
              name: 'My Medical Records',
              dateRange: getDateRangeText(filters),
            },
            `my-medical-records`,
          );
          toast.success('✅ PDF exported successfully!');
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // FIX 4: Only count actual filter fields, not pagination meta keys.
  const getActiveFiltersCount = () => {
    const filterOnlyKeys = [
      'search',
      'startDate',
      'endDate',
      'recordType',
      'status',
    ];
    return filterOnlyKeys.filter(key => filters[key] && filters[key] !== '')
      .length;
  };

  // Dynamic status options based on selected recordType
  const getStatusOptions = () => {
    const recordType = filters.recordType;

    // No record type selected → show all possible statuses
    if (!recordType) {
      return [
        { value: '', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'active', label: 'Active' },
        { value: 'discharged', label: 'Discharged' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'reported', label: 'Reported' },
      ];
    }

    // Appointment-specific statuses
    if (recordType === 'appointment') {
      return [
        { value: '', label: 'All Status' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'completed', label: 'Completed' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'no_show', label: 'No Show' },
      ];
    }

    // Admission-specific statuses
    if (recordType === 'admission') {
      return [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'discharged', label: 'Discharged' },
        { value: 'cancelled', label: 'Cancelled' },
      ];
    }

    // Laboratory-specific statuses
    if (recordType === 'laboratory') {
      return [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ];
    }

    // Imaging-specific statuses
    if (recordType === 'imaging') {
      return [
        { value: '', label: 'All Status' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'reported', label: 'Reported' },
        { value: 'cancelled', label: 'Cancelled' },
      ];
    }

    // Medical record - typically completed/finalized
    if (recordType === 'medical_record') {
      return [
        { value: '', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'in_progress', label: 'In Progress' },
      ];
    }

    return [{ value: '', label: 'All Status' }];
  };

  const filterConfig = [
    {
      type: 'search',
      name: 'search',
      label: 'Search',
      placeholder: 'Search in diagnosis, treatment, notes...',
    },
    {
      type: 'date',
      name: 'startDate',
      label: 'Start Date',
    },
    {
      type: 'date',
      name: 'endDate',
      label: 'End Date',
    },
    {
      type: 'select',
      name: 'recordType',
      label: 'Record Type',
      options: [
        { value: '', label: 'All Types' },
        { value: 'appointment', label: 'Appointments' },
        { value: 'admission', label: 'Admissions' },
        { value: 'medical_record', label: 'Medical Records' },
        { value: 'laboratory', label: 'Laboratory Tests' },
        { value: 'imaging', label: 'Imaging Studies' },
      ],
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: getStatusOptions(),
      // Hide status filter when no recordType selected to avoid confusion
      hidden: !filters.recordType,
      helperText: 'Select a record type first to filter by status',
    },
  ];

  const activeFiltersCount = getActiveFiltersCount();

  // Derive the filter-only slice to pass to FilterPanel (no page/limit)
  const filterPanelValues = {
    search: filters.search,
    startDate: filters.startDate,
    endDate: filters.endDate,
    recordType: filters.recordType,
    status: filters.status,
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader
          title="My Medical History"
          subtitle="View your past medical records and consultations"
          action={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                icon={Filter}
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2.5"
              >
                <span className="hidden sm:inline">Filters</span>
                <span className="sm:hidden">Filter</span>
                {activeFiltersCount > 0 && (
                  <span className="ml-1 px-2.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>

              <div className="relative">
                <Button
                  className="px-4 py-2.5 rounded-lg text-sm whitespace-nowrap flex items-center gap-2"
                  style={{ backgroundColor: COLORS.primary, color: 'white' }}
                  onClick={() =>
                    !isExporting && setShowExportMenu(!showExportMenu)
                  }
                  disabled={isExporting}
                >
                  {isExporting ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="hidden sm:inline">Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download size={16} />
                      <span className="hidden sm:inline">Export</span>
                    </>
                  )}
                </Button>

                {showExportMenu && !isExporting && (
                  <div
                    ref={exportMenuRef}
                    className="absolute right-0 top-full mt-2 rounded-lg shadow-lg overflow-hidden z-50 min-w-[200px]"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.dark
                        : 'white',
                      border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
                    }}
                  >
                    {['CSV', 'JSON', 'PDF'].map(format => (
                      <Button
                        key={format}
                        onClick={() => handleExport(format)}
                        className="w-full px-4 py-3 text-left text-sm hover:bg-opacity-90 transition-colors flex items-center gap-3"
                        style={{
                          color: isDarkMode
                            ? COLORS.text.white
                            : COLORS.text.primary,
                          backgroundColor: 'transparent',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.backgroundColor = isDarkMode
                            ? COLORS.surface.darkHover
                            : '#f3f4f6';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor:
                              format === 'PDF'
                                ? '#e74c3c'
                                : format === 'CSV'
                                  ? '#27ae60'
                                  : '#3498db',
                          }}
                        >
                          <FileText size={14} className="text-white" />
                        </div>
                        <div>
                          <div className="font-medium">Export as {format}</div>
                          <div className="text-xs opacity-70">
                            {format === 'PDF'
                              ? 'Printable document'
                              : format === 'CSV'
                                ? 'Spreadsheet format'
                                : 'Raw data format'}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          }
        />

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 px-6 py-4">
          <div
            className="relative overflow-hidden rounded-xl p-4 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <FileText size={24} className="text-white opacity-80" />
                <div className="text-3xl font-bold text-white">
                  {summary.totalRecords || 0}
                </div>
              </div>
              <div className="text-sm font-medium text-white opacity-90">
                Total Records
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 text-6xl">
              📋
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-xl p-4 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Calendar size={24} className="text-white opacity-80" />
                <div className="text-3xl font-bold text-white">
                  {summary.totalAppointments || 0}
                </div>
              </div>
              <div className="text-sm font-medium text-white opacity-90">
                Appointments
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 text-6xl">
              📅
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-xl p-4 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <Building2 size={24} className="text-white opacity-80" />
                <div className="text-3xl font-bold text-white">
                  {summary.totalAdmissions || 0}
                </div>
              </div>
              <div className="text-sm font-medium text-white opacity-90">
                Admissions
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 text-6xl">
              🏥
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-xl p-4 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <FileText size={24} className="text-white opacity-80" />
                <div className="text-3xl font-bold text-white">
                  {summary.totalMedicalRecords || 0}
                </div>
              </div>
              <div className="text-sm font-medium text-white opacity-90">
                Medical Records
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 text-6xl">
              📝
            </div>
          </div>

          <div
            className="relative overflow-hidden rounded-xl p-4 shadow-sm"
            style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            }}
          >
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp size={24} className="text-white opacity-80" />
                <div className="text-3xl font-bold text-white">
                  {(summary.totalLabOrders || 0) +
                    (summary.totalImagingStudies || 0)}
                </div>
              </div>
              <div className="text-sm font-medium text-white opacity-90">
                Labs & Imaging
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 text-6xl">
              🔬
            </div>
          </div>
        </div>

        {/* FIX 2: Pass only filter-scoped values to FilterPanel, not page/limit */}
        {showFilters && (
          <div className="px-6 pb-4">
            <FilterPanel
              filters={filterPanelValues}
              onFilterChange={handleFilterChange}
              onClearFilters={handleClearFilters}
              filterConfig={filterConfig}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
              searchPlaceholder="Search in diagnosis, treatment, notes..."
              title="Filter Medical Records"
            />
          </div>
        )}

        <CardBody padding={false}>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <LoadingSpinner size="lg" />
              <p
                className="mt-4 text-sm font-medium"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                Loading medical records...
              </p>
            </div>
          ) : records.length === 0 ? (
            <div
              className="text-center py-16 rounded-xl border-2 border-dashed mx-4 my-4"
              style={{
                backgroundColor: isDarkMode ? COLORS.surface.dark : '#fafbfc',
                borderColor: isDarkMode ? COLORS.border.dark : '#e1e4e8',
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  backgroundColor: isDarkMode
                    ? 'rgba(59, 130, 246, 0.1)'
                    : 'rgba(59, 130, 246, 0.05)',
                }}
              >
                <AlertCircle
                  size={40}
                  style={{ color: isDarkMode ? '#60a5fa' : '#3b82f6' }}
                />
              </div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              >
                No Records Found
              </h3>
              <p className="text-sm mb-4">
                {activeFiltersCount > 0 || filters.search
                  ? "We couldn't find any records matching your search or filters."
                  : 'You have no medical records yet.'}
              </p>
              {(activeFiltersCount > 0 || filters.search) && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: COLORS.primary, color: 'white' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Timeline Cards */}
              <div className="p-4 space-y-3">
                {records.map((record, index) => (
                  <TimelineCard
                    key={`${record.type}-${record.id}-${index}`}
                    record={record}
                    isDarkMode={isDarkMode}
                    isExpanded={
                      expandedRecordId === `${record.type}-${record.id}`
                    }
                    onToggle={() =>
                      handleToggleRecord(`${record.type}-${record.id}`)
                    }
                    userRole={currentUser?.role}
                    onViewDetails={() => handleViewDetails(record)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="mt-6 px-4 pb-4">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.total}
                    itemsPerPage={pagination.limit}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Record Details Modal */}
      <RecordDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        record={selectedRecord}
        userRole={currentUser?.role}
      />
    </div>
  );
};

export default PatientMedicalHistory;
