// src/components/ui/select.jsx
import React from 'react';
import { ChevronDown } from 'lucide-react';

// In your Select component, add loading prop
export const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  helperText,
  required = false,
  disabled = false,
  loading = false, // Add loading prop
  className = '',
  ...props
}) => {
  console.log(options);
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled || loading}
          className={`
            block w-full appearance-none rounded-lg border shadow-sm focus:ring-2 focus:ring-offset-1 transition-colors
            pl-4 pr-10 py-3 text-sm bg-white
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${
              disabled || loading
                ? 'bg-gray-100 cursor-not-allowed opacity-50'
                : ''
            }
          `}
          {...props}
        >
          <option value="">
            {loading ? 'Loading...' : 'Select an option'}
          </option>
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
