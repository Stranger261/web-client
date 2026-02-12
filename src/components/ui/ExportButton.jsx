import { useState } from 'react';
import axios from 'axios';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import { DEVELOPMENT_BASE_URL } from '../../configs/CONST';

const ExportButton = ({
  endpoint,
  filename = 'export',
  format = 'csv',
  params = {},
  label,
  variant = 'primary',
  size = 'md',
  icon = true,
  fullWidth = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const queryParams = new URLSearchParams({
        format,
        ...params,
      });

      const response = await axios.get(
        `${DEVELOPMENT_BASE_URL}${endpoint}?${queryParams.toString()}`,
        {
          withCredentials: true,
          responseType: 'blob', // ⚠️ CRITICAL: Must be 'blob' for PDF/CSV binary files!
          headers: {
            'x-internal-api-key': 'core-1-secret-key',
          },
        },
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      const contentDisposition = response.headers['content-disposition'];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const downloadFilename = filenameMatch
        ? filenameMatch[1]
        : `${filename}.${format}`;

      link.setAttribute('download', downloadFilename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('❌ Export error:', err);
      console.error('Error response:', err.response);

      // Try to read error from blob if it's JSON
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const errorData = JSON.parse(text);
          setError(errorData.message || 'Failed to export file');
        } catch {
          setError('Failed to export file. Please check server logs.');
        }
      } else {
        setError(
          err.response?.data?.message || err.message || 'Failed to export file',
        );
      }

      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    if (!icon) return null;
    if (loading) return <Loader2 className="w-4 h-4 animate-spin" />;
    if (format === 'pdf') return <FileText className="w-4 h-4" />;
    if (format === 'csv') return <FileSpreadsheet className="w-4 h-4" />;
    return <Download className="w-4 h-4" />;
  };

  const variants = {
    primary:
      'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40',
    success:
      'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40',
    danger:
      'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/30 hover:shadow-red-500/40',
    purple:
      'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/40',
    orange:
      'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40',
    teal: 'bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white shadow-lg shadow-teal-500/30 hover:shadow-teal-500/40',
    outline:
      'border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseClass = `
        inline-flex items-center justify-center gap-2.5 
        font-medium rounded-lg 
        transition-all duration-200 
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transform hover:scale-105 active:scale-95
        ${fullWidth ? 'w-full' : ''}
    `;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      <button
        onClick={handleExport}
        disabled={loading}
        className={`${baseClass} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      >
        {getIcon()}
        <span className="font-semibold">
          {loading
            ? 'Exporting...'
            : success
              ? 'Downloaded!'
              : label || `Export ${format.toUpperCase()}`}
        </span>
      </button>

      {error && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ExportButton;
