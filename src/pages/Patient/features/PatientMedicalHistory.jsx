import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FileText,
  Download,
  Filter,
  Calendar,
  Building2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Card, { CardHeader, CardBody } from '../../../components/ui/card';
import Pagination from '../../../components/ui/pagination';
import { FilterPanel } from '../../../components/ui/filter-panel';
import { Button } from '../../../components/ui/button';
import { LoadingSpinner } from '../../../components/ui/loading-spinner';

import TimelineCard from '../../../components/Patients/cards/TimelineCard';
import RecordDetailModal from '../components/MedicalHistory/RecordDetailModal';

import { COLORS } from '../../../configs/CONST';
import medicalRecordsService from '../../../services/medicalRecordApi';
import exportService from '../../../services/exportService';
import { getDateRangeText } from '../../../components/Patients/utils/getDateRangeText';
import { useAuth } from '../../../contexts/AuthContext';

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

  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    startDate: '',
    endDate: '',
    recordType: '',
    status: '',
  });

  // Debounce filters
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

  // Fetch records
  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      // Clean filters - remove empty values
      const cleanFilters = Object.entries(debouncedFilters).reduce(
        (acc, [key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {},
      );

      const response =
        await medicalRecordsService.getMyMedicalRecords(cleanFilters);

      setRecords(response.timeline || []);
      setSummary(response.summary || {});
    } catch (error) {
      console.error('Error fetching medical records:', error);
      toast.error('Failed to load medical records');
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

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

  const handleFilterChange = newFilters => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      search: '',
      startDate: '',
      endDate: '',
      recordType: '',
      status: '',
    });
  };

  // Enhanced export functionality
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

      const response =
        await medicalRecordsService.getMyMedicalRecords(exportFilters);
      const allRecords = response.timeline || [];

      if (allRecords.length === 0) {
        toast.error('No records to export');
        return;
      }

      // Prepare comprehensive data
      const exportData = exportService.prepareMedicalRecordsForExport(
        allRecords,
        {
          name: 'My Medical Records',
          dateRange: getDateRangeText(filters),
        },
      );

      // Export with enhanced service
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
      }
    } catch (error) {
      console.error('Export failed:', error);
      toast.error(`❌ Export failed: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.recordType) count++;
    if (filters.status) count++;
    return count;
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
      ],
    },
    {
      type: 'select',
      name: 'status',
      label: 'Status',
      options: [
        { value: '', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'active', label: 'Active' },
        { value: 'discharged', label: 'Discharged' },
        { value: 'cancelled', label: 'Cancelled' },
      ],
    },
  ];

  const activeFiltersCount = getActiveFiltersCount();
  const totalPages = Math.ceil((summary.totalRecords || 0) / filters.limit);

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader
          title="My Medical History"
          subtitle="View your past medical records and consultations"
          action={
            <div className="flex items-center gap-3">
              {/* Filter Button - Consistent with PatientRecordsTab */}
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

              {/* Export Button - Consistent with PatientRecordsTab */}
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

        {/* Summary Stats - Consistent with PatientRecordsTab */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-6 py-4">
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

        {/* Filter Panel - Consistent with PatientRecordsTab */}
        {showFilters && (
          <div className="px-6 pb-4">
            <FilterPanel
              filters={filters}
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
                  style={{
                    backgroundColor: COLORS.primary,
                    color: 'white',
                  }}
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
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 px-4 pb-4">
                  <Pagination
                    currentPage={filters.page}
                    totalPages={totalPages}
                    totalItems={summary.totalRecords || 0}
                    itemsPerPage={filters.limit}
                    onPageChange={handlePageChange}
                    onItemsPerPageChange={handleItemsPerPageChange}
                  />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* Detail Modal */}
      <RecordDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        record={selectedRecord}
      />
    </div>
  );
};

export default PatientMedicalHistory;
