import { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  ChevronDown,
  X,
} from 'lucide-react';
import ExportButton from '../../ui/ExportButton';

const PatientExportButton = ({ patients, isDarkMode, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Only show for admin and receptionist
  if (!['admin', 'receptionist'].includes(userRole)) {
    return null;
  }

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <Download size={18} />
        <span className="hidden sm:inline">Export Patients</span>
        <span className="sm:hidden">Export</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-20 overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Export Patient List
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {patients?.length || 0} patient
                {patients?.length !== 1 ? 's' : ''} total
              </p>
            </div>

            {/* Export Options */}
            <div className="p-2 space-y-1">
              {/* PDF Export */}
              <ExportButton
                endpoint="/exports/admin/patient-registration"
                format="pdf"
                params={{}}
                label="Export as PDF"
                variant="outline"
                size="md"
                icon={<FileText size={18} />}
                fullWidth={true}
                className="justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-0"
              />

              {/* CSV Export */}
              <ExportButton
                endpoint="/exports/admin/patient-registration"
                format="csv"
                params={{}}
                label="Export as CSV"
                variant="outline"
                size="md"
                icon={<FileSpreadsheet size={18} />}
                fullWidth={true}
                className="justify-start text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-0"
              />
            </div>

            {/* Footer Info */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Tip: Use filters before exporting to export specific patients
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PatientExportButton;
