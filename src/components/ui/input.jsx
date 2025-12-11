import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { COLORS } from '../../configs/CONST';

export const Input = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error,
  helperText,
  icon: Icon,
  validationRules = [],
  showValidation = false,
  className = '',
  matchValue,
  matchLabel = 'Password',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const isDarkMode = document.documentElement.classList.contains('dark');

  const isPassword = type === 'password';
  const isEmailField = type === 'email';
  const emailIsValid =
    isEmailField && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const showEmailValidation = isEmailField && isTouched && value && !error;

  const getValidationResults = () => {
    if (!value || validationRules.length === 0) {
      return { results: [], allValid: false };
    }

    const results = validationRules.map(rule => ({
      ...rule,
      isValid: rule.validate(value),
    }));

    const allValid = results.every(r => r.isValid);
    return { results, allValid };
  };

  const passwordsMatch = matchValue !== undefined ? value === matchValue : true;
  const showMatchError =
    matchValue !== undefined && isTouched && value && !passwordsMatch;

  const { results: validationResults, allValid } = getValidationResults();
  const shouldShowValidation =
    showValidation && isTouched && validationRules.length > 0;

  const handleChange = e => {
    onChange(e);
    if (!isTouched) {
      setIsTouched(true);
    }
  };

  const handleBlur = () => {
    setIsTouched(true);
  };

  // Determine input border color
  const getBorderColor = () => {
    if (error || showMatchError) {
      return COLORS.danger;
    }
    if (
      (allValid && shouldShowValidation && passwordsMatch) ||
      (emailIsValid && showEmailValidation)
    ) {
      return COLORS.success;
    }
    return isDarkMode ? COLORS.input.borderDark : COLORS.input.border;
  };

  // Determine focus ring color
  const getFocusRingColor = () => {
    if (error || showMatchError) return COLORS.danger;
    if (
      (allValid && shouldShowValidation && passwordsMatch) ||
      (emailIsValid && showEmailValidation)
    ) {
      return COLORS.success;
    }
    return COLORS.input.focus;
  };

  const inputStyles = {
    width: '100%',
    borderRadius: '0.5rem',
    borderWidth: '1px',
    borderColor: getBorderColor(),
    backgroundColor: props.disabled
      ? isDarkMode
        ? COLORS.surface.darkHover
        : COLORS.input.background
      : isDarkMode
      ? COLORS.input.backgroundDark
      : COLORS.surface.light,
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
    padding: '0.75rem',
    paddingLeft: Icon ? '2.5rem' : '1rem',
    paddingRight:
      isPassword ||
      (allValid && shouldShowValidation && passwordsMatch) ||
      (emailIsValid && showEmailValidation)
        ? '2.5rem'
        : '1rem',
    fontSize: '0.875rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    cursor: props.disabled ? 'not-allowed' : 'text',
  };

  const labelStyles = {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
    marginBottom: '0.5rem',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={name} style={labelStyles}>
          {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              className="h-5 w-5"
              style={{ color: COLORS.text.secondary }}
            />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          style={inputStyles}
          onFocus={e => {
            e.target.style.outline = 'none';
            e.target.style.boxShadow = `0 0 0 3px ${getFocusRingColor()}20`;
            e.target.style.borderColor = getFocusRingColor();
          }}
          onBlur={e => {
            handleBlur();
            e.target.style.boxShadow = 'none';
            e.target.style.borderColor = getBorderColor();
          }}
          {...props}
        />

        {/* Validation Success Icon */}
        {((allValid && shouldShowValidation && passwordsMatch) ||
          (emailIsValid && showEmailValidation)) &&
          !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle
                className="h-5 w-5"
                style={{ color: COLORS.success }}
              />
            </div>
          )}

        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff
                className="h-5 w-5"
                style={{ color: COLORS.text.secondary }}
              />
            ) : (
              <Eye
                className="h-5 w-5"
                style={{ color: COLORS.text.secondary }}
              />
            )}
          </button>
        )}
      </div>

      {/* Password Match Error */}
      {showMatchError && (
        <div className="flex items-center space-x-2">
          <XCircle
            className="w-4 h-4 flex-shrink-0"
            style={{ color: COLORS.danger }}
          />
          <p className="text-sm" style={{ color: COLORS.danger }}>
            {matchLabel}s do not match
          </p>
        </div>
      )}

      {/* Real-time Validation Messages */}
      {shouldShowValidation &&
        validationResults.length > 0 &&
        !showMatchError && (
          <div className="space-y-1">
            {validationResults.map((rule, index) => (
              <div key={index} className="flex items-center space-x-2">
                {rule.isValid ? (
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
                    color: rule.isValid ? COLORS.success : COLORS.danger,
                  }}
                >
                  {rule.message}
                </span>
              </div>
            ))}
          </div>
        )}

      {/* Error Message */}
      {error && !showMatchError && (
        <div className="flex items-center space-x-2">
          <AlertCircle
            className="w-4 h-4 flex-shrink-0"
            style={{ color: COLORS.danger }}
          />
          <p className="text-sm" style={{ color: COLORS.danger }}>
            {error}
          </p>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && !shouldShowValidation && !showMatchError && (
        <p className="text-sm" style={{ color: COLORS.text.secondary }}>
          {helperText}
        </p>
      )}
    </div>
  );
};
