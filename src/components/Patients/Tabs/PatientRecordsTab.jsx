import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Download,
  Calendar,
  Building2,
  AlertCircle,
  Filter,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import MedicalRecordsService from '../../../services/medicalRecordApi';
import exportService from '../../../services/exportService';

import TimelineCard from '../cards/TimelineCard';
import { Button } from '../../ui/button';
import { LoadingSpinner } from '../../ui/loading-spinner';
import { FilterPanel } from '../../ui/filter-panel';
import Pagination from '../../ui/pagination';

import { COLORS } from '../../../configs/CONST';
import { getDateRangeText } from '../utils/getDateRangeText';
import { useAuth } from '../../../contexts/AuthContext';

const PatientRecordsTab = ({ patientId, isDarkMode, patientInfo = {} }) => {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRecordId, setExpandedRecordId] = useState(null);

  // exports
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const exportMenuRef = useRef(null);

  // FIX: Changed visitType to recordType to match backend expectations
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    startDate: '',
    endDate: '',
    recordType: '', // Changed from visitType
    status: '',
  });

  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalMedicalRecords: 0,
    totalAppointments: 0,
    totalAdmissions: 0,
    totalLabOrders: 0,
    totalImagingStudies: 0,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // FIX: Single debounce with ref-based timer (same as PatientMedicalHistory)
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

  const handleExport = async format => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);

      const exportFilters = {
        ...filters,
        page: 1,
        limit: 1000,
      };

      const response = await MedicalRecordsService.getPatientMedicalRecords(
        patientId,
        exportFilters,
      );

      const allRecords = response.timeline || [];

      if (allRecords.length === 0) {
        toast.error('No records to export');
        return;
      }

      const exportData = exportService.prepareMedicalRecordsForExport(
        allRecords,
        {
          name: patientInfo?.name || `Patient ${patientId}`,
          mrn: patientInfo?.mrn || patientId,
          dob: patientInfo?.dob,
          gender: patientInfo?.gender,
          dateRange: getDateRangeText(filters),
        },
      );

      switch (format) {
        case 'CSV':
          exportService.exportToCSV(
            allRecords,
            `patient-${patientId}-medical-records`,
          );
          toast.success('✅ CSV exported successfully!');
          break;

        case 'JSON':
          exportService.exportToJSON(
            exportData,
            `patient-${patientId}-medical-records`,
          );
          toast.success('✅ JSON exported successfully!');
          break;

        case 'PDF':
          exportService.exportToPDF(
            allRecords,
            {
              name: patientInfo?.name || `Patient ${patientId}`,
              mrn: patientInfo?.mrn || patientId,
              dob: patientInfo?.dob,
              gender: patientInfo?.gender,
              dateRange: getDateRangeText(filters),
            },
            `patient-${patientId}-medical-records`,
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

  // Fetch medical records with single debounce
  const fetchMedicalRecords = useCallback(
    async currentFilters => {
      if (!patientId) return;

      try {
        setIsLoading(true);

        // Clean filters - only send non-empty values
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
        console.log('calling get patient medical record');

        const response = await MedicalRecordsService.getPatientMedicalRecords(
          patientId,
          cleanFilters,
        );

        setRecords(response.timeline || []);
        setSummary(response.summary || {});

        if (response.pagination) {
          setPagination({
            page: response.pagination.page,
            limit: response.pagination.limit,
            total: response.pagination.total,
            totalPages: response.pagination.totalPages,
          });
        }
      } catch (error) {
        console.error('Error fetching medical records:', error);
        toast.error(error?.message || 'Failed to load medical records');
      } finally {
        setIsLoading(false);
      }
    },
    [patientId],
  );

  // FIX: Single debounce effect (same pattern as PatientMedicalHistory)
  useEffect(() => {
    const isSearchChange =
      lastFetchedFilters.current !== null &&
      filters.search !== lastFetchedFilters.current?.search &&
      JSON.stringify({ ...filters, search: '' }) ===
        JSON.stringify({ ...lastFetchedFilters.current, search: '' });

    const delay = isSearchChange ? 500 : 0;

    clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = setTimeout(() => {
      fetchMedicalRecords(filters);
    }, delay);

    return () => clearTimeout(fetchTimerRef.current);
  }, [filters, fetchMedicalRecords]);

  // FIX: Auto-clear status when recordType changes
  const handleFilterChange = newFilters => {
    let adjustedFilters = { ...newFilters };

    if (
      'recordType' in newFilters &&
      newFilters.recordType !== filters.recordType
    ) {
      adjustedFilters.status = '';
    }

    setFilters(prev => ({
      ...prev,
      ...adjustedFilters,
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      startDate: '',
      endDate: '',
      recordType: '',
      status: '',
    });
  };

  const handlePageChange = newPage => {
    setFilters(prev => ({ ...prev, page: newPage }));

    setTimeout(() => {
      const container = document.querySelector('.space-y-3');
      if (container) {
        container.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        });
      }
    }, 100);
  };

  const handleItemsPerPageChange = newLimit => {
    setFilters(prev => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const getActiveFiltersCount = () => {
    const filterKeys = [
      'search',
      'startDate',
      'endDate',
      'recordType',
      'status',
    ];
    return filterKeys.filter(key => filters[key] && filters[key] !== '').length;
  };

  const handleToggleRecord = recordId => {
    setExpandedRecordId(prev => (prev === recordId ? null : recordId));
  };

  // FIX: Dynamic status options based on recordType
  const getStatusOptions = () => {
    const recordType = filters.recordType;

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

    if (recordType === 'admission') {
      return [
        { value: '', label: 'All Status' },
        { value: 'active', label: 'Active' },
        { value: 'discharged', label: 'Discharged' },
        { value: 'cancelled', label: 'Cancelled' },
      ];
    }

    if (recordType === 'laboratory') {
      return [
        { value: '', label: 'All Status' },
        { value: 'pending', label: 'Pending' },
        { value: 'in_progress', label: 'In Progress' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' },
      ];
    }

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

    if (recordType === 'medical_record') {
      return [
        { value: '', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'in_progress', label: 'In Progress' },
      ];
    }

    return [{ value: '', label: 'All Status' }];
  };

  // FIX: Updated filter config with recordType and dynamic status
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
      hidden: !filters.recordType,
      helperText: 'Select a record type first to filter by status',
    },
  ];

  // Filter-only values for FilterPanel (no page/limit)
  const filterPanelValues = {
    search: filters.search,
    startDate: filters.startDate,
    endDate: filters.endDate,
    recordType: filters.recordType,
    status: filters.status,
  };

  if (isLoading && records.length === 0) {
    return (
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
    );
  }

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
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

      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 sm:px-6 py-4 gap-4">
          <div className="min-w-0 flex-shrink">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Patient medical records
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage patient medical records
            </p>
          </div>

          <div className="flex flex-wrap gap-3 w-full sm:w-auto flex-shrink-0">
            <Button
              variant="outline"
              icon={Filter}
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1 sm:flex-none"
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
                    backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
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
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <FilterPanel
            filters={filterPanelValues}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            filterConfig={filterConfig}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            searchPlaceholder="Search in diagnosis, treatment, notes..."
            title="Filter Medical Records"
          />
        )}
      </div>

      {/* Medical Records Timeline */}
      <div className="space-y-3">
        {records.length > 0 ? (
          <>
            <div className="space-y-3">
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
                />
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-6">
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
        ) : (
          <div
            className="text-center py-16 rounded-xl border-2 border-dashed"
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
                : 'This patient has no medical records yet.'}
            </p>
            {(activeFiltersCount > 0 || filters.search) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: COLORS.primary,
                  color: 'white',
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecordsTab;
