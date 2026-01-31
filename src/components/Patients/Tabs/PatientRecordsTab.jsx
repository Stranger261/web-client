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
import { patientRecordConfig } from '../../../configs/patientRecordFilterConfig';
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

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: '',
    startDate: '',
    endDate: '',
    visitType: '',
    status: '',
  });
  const [summary, setSummary] = useState({
    totalRecords: 0,
    totalMedicalRecords: 0,
    totalAppointments: 0,
    totalAdmissions: 0,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Debounce filters to avoid too many API calls
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 500);

    return () => clearTimeout(timer);
  }, [filters]);

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

      // Fetch ALL records
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

      // Prepare comprehensive data
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

      // Export with enhanced service
      switch (format) {
        case 'CSV':
          exportService.exportToCSV(
            allRecords, // Pass original records with nested data
            `patient-${patientId}-medical-records`,
          );
          toast.success('✅ CSV exported successfully!');
          break;

        case 'JSON':
          exportService.exportToJSON(
            exportData, // Pass prepared data
            `patient-${patientId}-medical-records`,
          );
          toast.success('✅ JSON exported successfully!');
          break;

        case 'PDF':
          exportService.exportToPDF(
            allRecords, // Pass original records for comprehensive PDF
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
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Fetch medical records
  const fetchMedicalRecords = useCallback(async () => {
    if (!patientId) return;

    try {
      setIsLoading(true);

      // Clean filters - only send non-empty values
      const cleanFilters = Object.entries(debouncedFilters).reduce(
        (acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      const response = await MedicalRecordsService.getPatientMedicalRecords(
        patientId,
        cleanFilters,
      );

      setRecords(response.timeline || []);
      setSummary(response.summary || {});

      // Update pagination from API response
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
  }, [patientId, debouncedFilters]);

  useEffect(() => {
    fetchMedicalRecords();
  }, [fetchMedicalRecords]);

  const handleFilterChange = newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      search: '',
      startDate: '',
      endDate: '',
      visitType: '',
      status: '',
    });
  };

  const handlePageChange = newPage => {
    setFilters(prev => ({ ...prev, page: newPage }));

    // Scroll to top of the records container
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
    let count = 0;
    if (filters.search) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.visitType) count++;
    if (filters.status) count++;
    return count;
  };

  const handleToggleRecord = recordId => {
    setExpandedRecordId(prev => (prev === recordId ? null : recordId));
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                {summary.totalRecords}
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
                {summary.totalAppointments}
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
                {summary.totalAdmissions}
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
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          }}
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} className="text-white opacity-80" />
              <div className="text-3xl font-bold text-white">
                {records.length}
              </div>
            </div>
            <div className="text-sm font-medium text-white opacity-90">
              Current Page
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 text-6xl">
            🔍
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
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={clearFilters}
            filterConfig={patientRecordConfig}
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
