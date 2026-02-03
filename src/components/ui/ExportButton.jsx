import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileJson, File } from 'lucide-react';
import { exportPatients } from '../../utils/exportUtil';
import { COLORS } from '../../configs/CONST';
import toast from 'react-hot-toast';

const ExportButton = ({ patients, isDarkMode, userRole }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef(null);

  // Only show export button for admin and receptionist roles
  const canExport = ['admin', 'receptionist'].includes(userRole);

  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = async format => {
    setIsExporting(true);
    setIsDropdownOpen(false);

    try {
      // Small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 300));

      exportPatients(patients, format);
      toast.success(
        `Successfully exported ${patients.length} patients as ${format.toUpperCase()}`,
      );
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export patient data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (!canExport) {
    return null;
  }

  const exportOptions = [
    {
      id: 'csv',
      label: 'Export as CSV',
      icon: FileText,
      description: 'Spreadsheet format',
    },
    {
      id: 'json',
      label: 'Export as JSON',
      icon: FileJson,
      description: 'Structured data',
    },
    {
      id: 'pdf',
      label: 'Export as PDF',
      icon: File,
      description: 'Document format',
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={isExporting || !patients || patients.length === 0}
        className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isDarkMode ? COLORS.surface.dark : COLORS.primary,
          color: COLORS.text.white,
        }}
      >
        <Download className="w-4 h-4" />
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
      </button>

      {isDropdownOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg z-50 overflow-hidden"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
          }}
        >
          <div
            className="px-3 py-2 border-b"
            style={{
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
              backgroundColor: isDarkMode
                ? COLORS.surface.darker
                : COLORS.surface.lighter,
            }}
          >
            <p
              className="text-xs font-semibold"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              Export {patients?.length || 0} patients
            </p>
          </div>

          <div className="py-1">
            {exportOptions.map(option => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleExport(option.id)}
                  className="w-full px-3 py-2.5 flex items-start gap-3 transition-colors duration-150"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = isDarkMode
                      ? COLORS.surface.darker
                      : COLORS.surface.lighter;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium">{option.label}</span>
                    <span
                      className="text-xs"
                      style={{
                        color: isDarkMode
                          ? COLORS.text.light
                          : COLORS.text.secondary,
                      }}
                    >
                      {option.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div
            className="px-3 py-2 border-t"
            style={{
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
              backgroundColor: isDarkMode
                ? COLORS.surface.darker
                : COLORS.surface.lighter,
            }}
          >
            <p
              className="text-xs"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              All patient data will be exported
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
