// components/Settings/ChangePasswordModal.jsx
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Lock, X, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import authApi from '../../../services/authApi';
import {
  usePasswordValidators,
  validateValue,
} from '../../../utils/validators';
import { COLORS } from '../../../configs/CONST';

const ChangePasswordModal = ({ isOpen, onClose, userUuid, isDarkMode }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({
    newPassword: false,
    confirmPassword: false,
  });
  const [passwordValidation, setPasswordValidation] = useState({
    results: [],
    isValid: false,
    allValid: false,
  });

  const passwordValidators = usePasswordValidators();

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrors({});
      setTouched({
        newPassword: false,
        confirmPassword: false,
      });
      setPasswordValidation({
        results: [],
        isValid: false,
        allValid: false,
      });
    }
  }, [isOpen]);

  const passwordsMatch = formData.newPassword === formData.confirmPassword;
  const shouldShowMatchValidation =
    touched.confirmPassword && formData.confirmPassword.length > 0;

  const getValidations = useCallback(() => {
    const validations = [];

    // Add password validators (show as soon as new password is touched)
    if (touched.newPassword && passwordValidation.results.length > 0) {
      validations.push(
        ...passwordValidation.results.map(r => ({
          ...r,
          category: 'password',
        })),
      );
    }

    // Add password match validation (only show after confirm password is touched)
    if (shouldShowMatchValidation) {
      validations.push({
        message: 'Passwords match',
        validate: () => passwordsMatch,
        isValid: passwordsMatch,
        category: 'match',
      });
    }

    return validations;
  }, [
    passwordValidation.results,
    passwordsMatch,
    touched.newPassword,
    shouldShowMatchValidation,
  ]);

  const canSubmit = useCallback(() => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) return false;
    if (!passwordValidation.allValid) return false;
    if (!passwordsMatch) return false;

    return true;
  }, [formData, passwordValidation.allValid, passwordsMatch]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Real-time validate new password as soon as user types
      if (field === 'newPassword') {
        const validation = validateValue(value, passwordValidators);
        setPasswordValidation(validation);
        // Auto-touch new password when user starts typing
        if (!touched.newPassword && value.length > 0) {
          setTouched(prev => ({ ...prev, newPassword: true }));
        }
      }

      // Auto-touch confirm password when user starts typing
      if (
        field === 'confirmPassword' &&
        !touched.confirmPassword &&
        value.length > 0
      ) {
        setTouched(prev => ({ ...prev, confirmPassword: true }));
      }

      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    },
    [errors, passwordValidators, touched.newPassword, touched.confirmPassword],
  );

  const handleBlur = useCallback(field => {
    setTouched(prev => ({ ...prev, [field]: true }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // components/Settings/ChangePasswordModal.jsx (updated error handling)

  const handleSubmit = async e => {
    e.preventDefault();

    if (!validateForm()) return;
    if (!canSubmit()) return;

    setIsLoading(true);
    try {
      await authApi.updatePassword(userUuid, {
        currentPassword: formData.currentPassword,
        password: formData.newPassword,
      });

      toast.success('Password updated successfully!');
      onClose();
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to update password';
      toast.error(errorMessage);

      // Handle specific error for current password mismatch
      if (error.response?.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      }
      // Handle specific error for same password
      else if (
        error.response?.status === 400 &&
        error.response?.data?.message?.includes('same as your current password')
      ) {
        setErrors({
          newPassword: 'New password must be different from current password',
          confirmPassword: '',
        });

        // Also update the validation to show this requirement
        setPasswordValidation(prev => ({
          ...prev,
          results: [
            ...prev.results,
            {
              message: 'Different from current password',
              validate: () => false,
              isValid: false,
            },
          ],
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const validations = getValidations();
  const showValidations = touched.newPassword || touched.confirmPassword;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div
          className={`inline-block align-bottom rounded-3xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
          style={{
            backgroundColor: isDarkMode
              ? COLORS.surface.dark
              : COLORS.surface.light,
            border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
          }}
        >
          {/* Header */}
          <div
            className="px-6 py-4 border-b flex items-center justify-between"
            style={{
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <div className="flex items-center space-x-3">
              <div
                className="p-2 rounded-xl"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.primary + '20'
                    : COLORS.primary + '10',
                }}
              >
                <Lock className="h-5 w-5" style={{ color: COLORS.primary }} />
              </div>
              <div>
                <h3
                  className="text-lg font-semibold"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Change Password
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
                  }}
                >
                  Update your password to keep your account secure
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = isDarkMode
                  ? COLORS.surface.darkHover
                  : COLORS.surface.hover)
              }
              onMouseLeave={e =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Current Password */}
            <Input
              label="Current Password"
              name="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={e =>
                handleInputChange('currentPassword', e.target.value)
              }
              placeholder="Enter your current password"
              required
              error={errors.currentPassword}
              icon={Lock}
            />

            {/* New Password */}
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={e => handleInputChange('newPassword', e.target.value)}
              onBlur={() => handleBlur('newPassword')}
              placeholder="Enter new password"
              required
              error={errors.newPassword}
              icon={Lock}
              showValidation={false} // Hide individual validation, show all at bottom
            />

            {/* Confirm Password */}
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={e =>
                handleInputChange('confirmPassword', e.target.value)
              }
              onBlur={() => handleBlur('confirmPassword')}
              placeholder="Confirm your new password"
              required
              error={errors.confirmPassword}
              icon={Lock}
              matchValue={undefined} // Hide individual match validation
            />

            {/* Live Validations Section */}
            {showValidations && (
              <div
                className="p-4 rounded-xl space-y-3"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.surface.darkHover
                    : COLORS.background.main,
                  border: `1px solid ${isDarkMode ? COLORS.border.dark : COLORS.border.light}`,
                }}
              >
                <p
                  className="text-sm font-medium"
                  style={{
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                  }}
                >
                  Password Requirements:
                </p>
                <div className="space-y-2">
                  {/* Password validations - show as soon as new password is typed */}
                  {touched.newPassword &&
                    passwordValidation.results.map((validation, index) => (
                      <div
                        key={`password-${index}`}
                        className="flex items-start space-x-2"
                      >
                        {validation.isValid ? (
                          <CheckCircle
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: COLORS.success }}
                          />
                        ) : (
                          <XCircle
                            className="w-4 h-4 flex-shrink-0 mt-0.5"
                            style={{ color: COLORS.danger }}
                          />
                        )}
                        <span
                          className="text-xs"
                          style={{
                            color: validation.isValid
                              ? COLORS.success
                              : isDarkMode
                                ? COLORS.text.light
                                : COLORS.text.secondary,
                          }}
                        >
                          {validation.message}
                        </span>
                      </div>
                    ))}

                  {/* Password match validation - only show after confirm password is typed */}
                  {shouldShowMatchValidation && (
                    <div className="flex items-start space-x-2">
                      {passwordsMatch ? (
                        <CheckCircle
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: COLORS.success }}
                        />
                      ) : (
                        <XCircle
                          className="w-4 h-4 flex-shrink-0 mt-0.5"
                          style={{ color: COLORS.danger }}
                        />
                      )}
                      <span
                        className="text-xs"
                        style={{
                          color: passwordsMatch
                            ? COLORS.success
                            : isDarkMode
                              ? COLORS.text.light
                              : COLORS.text.secondary,
                        }}
                      >
                        Passwords match
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Security Note */}
            <div
              className="p-4 rounded-xl flex items-start space-x-3"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.info + '10'
                  : COLORS.info + '5',
                border: `1px solid ${isDarkMode ? COLORS.info + '30' : COLORS.info + '15'}`,
              }}
            >
              <Shield
                className="h-5 w-5 flex-shrink-0 mt-0.5"
                style={{ color: COLORS.info }}
              />
              <p
                className="text-xs"
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              >
                <span className="font-medium" style={{ color: COLORS.info }}>
                  Security Note:
                </span>{' '}
                After changing your password, you'll be logged out from all
                other devices for security reasons. You'll need to log in again
                on those devices.
              </p>
            </div>
          </form>

          {/* Footer */}
          <div
            className="px-6 py-4 border-t flex justify-end space-x-3"
            style={{
              borderColor: isDarkMode
                ? COLORS.border.dark
                : COLORS.border.light,
            }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleSubmit}
              loading={isLoading}
              disabled={isLoading || !canSubmit()}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
