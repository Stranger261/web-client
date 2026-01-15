import { useCallback, useEffect, useState } from 'react';
import { FileText, Search, Download } from 'lucide-react';

import { COLORS } from '../../../../../configs/CONST';
import { usePatient } from '../../../../../contexts/PatientContext';
import { Select } from '../../../../../components/ui/select';
import { RecordCard } from '../cards/RecordCard';
import { exportToCSV, exportToJSON, exportToPDF } from '../utils/exportHelper';

const PatientMedicalRecordTab = ({ patientUuid, isDarkMode }) => {
  const { getPatientMedRecords } = usePatient();

  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    record_type: 'all',
  });

  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchMedRecords = useCallback(async () => {
    const queryFilters = {
      ...(filters.record_type && { record_type: filters.record_type }),
      searchTerm: debouncedSearchTerm,
    };
    try {
      setIsLoading(true);
      const res = await getPatientMedRecords(patientUuid, queryFilters);

      setRecords(res.data || []);
    } catch (error) {
      console.error(error);
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    filters.record_type,
    debouncedSearchTerm,
    patientUuid,
    getPatientMedRecords,
  ]);

  useEffect(() => {
    fetchMedRecords();
  }, [fetchMedRecords]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filterChangeHandler = e => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4">
      {isLoading && (
        <div
          className="flex flex-col items-center justify-center py-12 rounded-lg"
          style={{
            backgroundColor: isDarkMode ? COLORS.surface.dark : 'white',
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="relative flex justify-center mb-4">
            <div
              className="w-12 h-12 border-4 border-solid rounded-full animate-spin"
              style={{
                borderColor: isDarkMode
                  ? `${COLORS.primary} transparent transparent transparent`
                  : `${COLORS.primary} transparent transparent transparent`,
              }}
            ></div>
          </div>
          <p
            className="text-sm font-medium"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Loading medical records...
          </p>
          <div className="flex justify-center space-x-1 mt-3">
            {[0, 1, 2].map(dot => (
              <div
                key={dot}
                className="w-2 h-2 rounded-full animate-bounce"
                style={{
                  backgroundColor: COLORS.primary,
                  animationDelay: `${dot * 0.2}s`,
                  animationDuration: '1.4s',
                }}
              />
            ))}
          </div>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              />
              <input
                type="text"
                placeholder="Search diagnosis or complaints..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border text-sm"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : 'white',
                  borderColor: isDarkMode
                    ? COLORS.border.dark
                    : COLORS.border.light,
                  color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select
                name="record_type"
                value={filters.record_type}
                onChange={filterChangeHandler}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'consultation', label: 'Consultation' },
                  { value: 'lab_result', label: 'Lab Result' },
                  { value: 'imaging', label: 'Imaging' },
                  { value: 'diagnosis', label: 'Diagnosis' },
                  { value: 'procedure', label: 'Procedure' },
                ]}
              />

              {/* Export Button with Dropdown */}
              <div className="relative">
                <button
                  className="px-4 py-2 rounded-lg text-sm whitespace-nowrap flex items-center gap-2"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: 'white',
                  }}
                  onClick={() => setShowExportMenu(!showExportMenu)}
                >
                  <Download size={18} />
                  Export
                </button>

                {/* Dropdown Menu */}
                {showExportMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 rounded-lg shadow-lg overflow-hidden z-50 min-w-[150px]"
                    style={{
                      backgroundColor: isDarkMode
                        ? COLORS.surface.dark
                        : 'white',
                      borderColor: isDarkMode
                        ? COLORS.border.dark
                        : COLORS.border.light,
                      border: '1px solid',
                    }}
                  >
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        exportToCSV(records);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-opacity-80 transition-colors"
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
                      Export as CSV
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        exportToJSON(records);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-opacity-80 transition-colors"
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
                      Export as JSON
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        exportToPDF(records);
                        setShowExportMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-opacity-80 transition-colors"
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
                      Export as PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Records List */}
          <div className="space-y-3">
            {records.length > 0 ? (
              records.map(record => (
                <RecordCard
                  key={record.record_id}
                  record={record}
                  isDarkMode={isDarkMode}
                />
              ))
            ) : (
              <div
                className="text-center py-12"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                <FileText size={48} className="mx-auto mb-3 opacity-50" />
                <p className="text-sm">No medical records found</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PatientMedicalRecordTab;
