import { useState } from 'react';
import { CheckCircle, XCircle, Phone } from 'lucide-react';
import { COLORS } from '../../configs/CONST';

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
  const isDarkMode = document.documentElement.classList.contains('dark');

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

  // Determine border color
  const getBorderColor = () => {
    if (error) return COLORS.danger;
    if (validation?.isValid) return COLORS.success;
    if (hasValue && isTouched && !validation?.isValid) return COLORS.danger;
    return isDarkMode ? COLORS.input.borderDark : COLORS.input.border;
  };

  // Determine focus ring color
  const getFocusRingColor = () => {
    if (error || (hasValue && isTouched && !validation?.isValid))
      return COLORS.danger;
    if (validation?.isValid) return COLORS.success;
    return COLORS.input.focus;
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
    marginBottom: '0.5rem',
  };

  const borderColor = getBorderColor();

  // Fixed: Use individual border properties instead of mixing shorthand
  const countryCodeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    borderTopLeftRadius: '0.5rem',
    borderBottomLeftRadius: '0.5rem',
    borderTop: `1px solid ${borderColor}`,
    borderBottom: `1px solid ${borderColor}`,
    borderLeft: `1px solid ${borderColor}`,
    borderRight: 'none',
    backgroundColor: isDarkMode
      ? COLORS.surface.darkHover
      : COLORS.input.background,
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
    fontSize: '0.875rem',
    fontWeight: '500',
  };

  const inputStyles = {
    width: '100%',
    borderTopRightRadius: '0.5rem',
    borderBottomRightRadius: '0.5rem',
    borderTop: `1px solid ${borderColor}`,
    borderRight: `1px solid ${borderColor}`,
    borderBottom: `1px solid ${borderColor}`,
    borderLeft: `1px solid ${borderColor}`,
    backgroundColor: props.disabled
      ? isDarkMode
        ? COLORS.surface.darkHover
        : COLORS.input.background
      : isDarkMode
      ? COLORS.input.backgroundDark
      : COLORS.surface.light,
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
    padding: '0.75rem 2.5rem 0.75rem 1rem',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: props.disabled ? 'not-allowed' : 'text',
    outline: 'none',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={name} style={labelStyles}>
          {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
        </label>
      )}

      <div className="relative flex">
        <div style={countryCodeStyles}>
          <Phone
            className="h-4 w-4 mr-2"
            style={{ color: COLORS.text.secondary }}
          />
          {countryCode}
        </div>

        <input
          id={name}
          name={name}
          type="tel"
          value={phoneNumber}
          onChange={handleChange}
          onBlur={e => {
            handleBlur();
            e.target.style.boxShadow = 'none';
          }}
          placeholder={placeholder}
          required={required}
          maxLength={10}
          style={inputStyles}
          onFocus={e => {
            e.target.style.outline = 'none';
            e.target.style.boxShadow = `0 0 0 3px ${getFocusRingColor()}20`;
          }}
          {...props}
        />

        {validation?.isValid && showValidation && (
          <div
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            style={{ pointerEvents: 'none' }}
          >
            <CheckCircle
              className="h-5 w-5"
              style={{ color: COLORS.success }}
            />
          </div>
        )}
      </div>

      {/* Real-time validation feedback */}
      {showValidation && validation && (
        <div className="flex items-center space-x-2">
          {validation.isValid ? (
            <CheckCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: COLORS.success }}
            />
          ) : (
            <XCircle
              className="w-4 h-4 flex-shrink-0"
              style={{ color: COLORS.danger }}
            />
          )}
          <span
            className="text-xs"
            style={{
              color: validation.isValid ? COLORS.success : COLORS.danger,
            }}
          >
            {validation.message}
          </span>
        </div>
      )}

      {/* Server-side error (from form validation) */}
      {error && (
        <div className="flex items-center space-x-2">
          <XCircle
            className="w-4 h-4 flex-shrink-0"
            style={{ color: COLORS.danger }}
          />
          <p className="text-sm" style={{ color: COLORS.danger }}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};
