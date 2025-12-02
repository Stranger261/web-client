import { useState } from 'react';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

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
  matchValue, // For confirm password matching
  matchLabel = 'Password', // Label for what we're matching
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isTouched, setIsTouched] = useState(false);

  const isPassword = type === 'password';
  const isEmailField = type === 'email';
  const emailIsValid =
    isEmailField && value && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const showEmailValidation = isEmailField && isTouched && value && !error;

  // Calculate validation results on the fly
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

  // Check if passwords match (for confirm password field)
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
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          required={required}
          className={`
            block w-full rounded-lg border shadow-sm focus:ring-2 focus:ring-offset-1 transition-colors
            ${Icon ? 'pl-10' : 'pl-4'}
            ${isPassword ? 'pr-10' : 'pr-4'}
            ${
              (allValid && shouldShowValidation && passwordsMatch) ||
              (emailIsValid && showEmailValidation)
                ? 'pr-10'
                : ''
            }
            py-3 text-sm
            ${
              error || showMatchError
                ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                : (allValid && shouldShowValidation && passwordsMatch) ||
                  (emailIsValid && showEmailValidation)
                ? 'border-green-300 focus:border-green-500 focus:ring-green-500'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
            }
            ${props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />

        {/* Validation Success Icon */}
        {((allValid && shouldShowValidation && passwordsMatch) ||
          (emailIsValid && showEmailValidation)) &&
          !isPassword && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
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
              <EyeOff className="h-5 w-5 text-gray-400" />
            ) : (
              <Eye className="h-5 w-5 text-gray-400" />
            )}
          </button>
        )}
      </div>

      {/* Password Match Error (for confirm password) */}
      {showMatchError && (
        <div className="flex items-center space-x-2">
          <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{matchLabel}s do not match</p>
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
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                <span
                  className={`text-xs ${
                    rule.isValid ? 'text-green-600' : 'text-red-600'
                  }`}
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
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && !shouldShowValidation && !showMatchError && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};
