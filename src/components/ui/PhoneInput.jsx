import { useState } from 'react';
import { CheckCircle, XCircle, Phone } from 'lucide-react';

export const PhoneInput = ({
  label,
  name,
  value,
  onChange,
  placeholder = '9XXXXXXXXX',
  required = false,
  error,
  countryCode = '+63',
  className = '',
  ...props
}) => {
  const [isTouched, setIsTouched] = useState(false);

  const phoneNumber = value.replace(countryCode, '');
  const isValidFormat = /^9\d{9}$/.test(phoneNumber);
  const hasValue = phoneNumber.length > 0;

  const handleChange = e => {
    const input = e.target.value;
    const numbersOnly = input.replace(/\D/g, '');
    setIsTouched(true);

    if (numbersOnly.length <= 10) {
      onChange({
        ...e,
        target: {
          ...e.target,
          name,
          value: numbersOnly,
          fullValue: numbersOnly ? `${countryCode}${numbersOnly}` : countryCode,
        },
      });
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  const getValidationMessage = () => {
    if (!hasValue || !isTouched) return null;

    if (phoneNumber.length < 10) {
      return {
        isValid: false,
        message: `${10 - phoneNumber.length} more digit${
          10 - phoneNumber.length > 1 ? 's' : ''
        } needed`,
      };
    }
    if (!phoneNumber.startsWith('9')) {
      return { isValid: false, message: 'Must start with 9' };
    }
    if (phoneNumber.length === 10 && isValidFormat) {
      return { isValid: true, message: 'Valid phone number' };
    }
    return { isValid: false, message: 'Invalid format' };
  };

  const validation = getValidationMessage();
  const showValidation = isTouched && hasValue && !error;

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

      <div className="relative flex">
        <div className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm font-medium">
          <Phone className="h-4 w-4 mr-2 text-gray-500" />
          {countryCode}
        </div>

        <input
          id={name}
          name={name}
          type="tel"
          value={phoneNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          maxLength={10}
          className={`
            block w-full rounded-r-lg border shadow-sm focus:ring-2 focus:ring-offset-1 transition-colors
            pl-4 pr-10 py-3 text-sm
            ${
              error
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : validation?.isValid
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                : hasValue && isTouched
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />

        {validation?.isValid && showValidation && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
        )}
      </div>

      {/* Real-time validation feedback */}
      {showValidation && validation && (
        <div className="flex items-center space-x-2 animate-in fade-in duration-200">
          {validation.isValid ? (
            <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          )}
          <span
            className={`text-xs ${
              validation.isValid ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {validation.message}
          </span>
        </div>
      )}

      {/* Server-side error (from form validation) */}
      {error && (
        <div className="flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};
