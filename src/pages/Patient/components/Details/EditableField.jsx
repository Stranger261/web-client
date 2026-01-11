import { Lock, Edit2, Check, X } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';
import { useFieldUpdate } from './hooks/useFieldUpdate';
import { LoadingSpinner } from '../../../../components/ui/loading-spinner';
import { PhoneInput } from '../../../../components/ui/phoneInput';
import { Input } from '../../../../components/ui/input';

export const EditableField = ({
  label,
  value,
  onSave,
  type = 'text',
  locked = false,
  icon: Icon,
  options = [],
  multiline = false,
  // NEW: Component-specific props
  fieldType = 'default', // 'default' | 'phone' | 'email'
  countryCode = '+63',
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const {
    isEditing,
    editValue,
    isSaving,
    error,
    setEditValue,
    setError,
    handleSave,
    handleCancel,
    startEditing,
  } = useFieldUpdate(onSave, value);

  // Validate before saving
  const handleSaveWithValidation = async () => {
    // Email validation
    if (fieldType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editValue)) {
        setError('Please enter a valid email address');
        return;
      }
    }

    // Phone validation
    if (fieldType === 'phone') {
      const phoneRegex = /^\+639\d{9}$/;
      if (!phoneRegex.test(editValue)) {
        setError('Please enter a valid phone number (+639XXXXXXXXX)');
        return;
      }
    }

    // Clear error and proceed to save
    setError(null);
    await handleSave();
  };

  // Render different input components based on fieldType
  const renderEditInput = () => {
    // PHONE INPUT
    if (fieldType === 'phone') {
      return (
        <PhoneInput
          name={label.toLowerCase().replace(/\s+/g, '_')}
          value={editValue}
          onChange={e => {
            setEditValue(e.target.fullValue);
            setError(null); // Clear error on change
          }}
          countryCode={countryCode}
          disabled={isSaving}
          placeholder="9XXXXXXXXX"
          error={error}
        />
      );
    }

    // EMAIL INPUT WITH VALIDATION
    if (fieldType === 'email') {
      return (
        <Input
          name={label.toLowerCase().replace(/\s+/g, '_')}
          type="email"
          value={editValue}
          onChange={e => {
            setEditValue(e.target.value);
            setError(null); // Clear error on change
          }}
          disabled={isSaving}
          icon={Icon}
          placeholder="email@example.com"
          error={error}
        />
      );
    }

    // SELECT DROPDOWN
    if (type === 'select') {
      return (
        <select
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          disabled={isSaving}
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.input.backgroundDark
              : COLORS.input.background,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          {options.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    // TEXTAREA
    if (multiline) {
      return (
        <textarea
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          disabled={isSaving}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            backgroundColor: isDarkMode
              ? COLORS.input.backgroundDark
              : COLORS.input.background,
            color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            borderColor: error
              ? COLORS.danger
              : isDarkMode
              ? COLORS.border.dark
              : COLORS.border.light,
          }}
        />
      );
    }

    // DEFAULT INPUT (for tel, text, etc.)
    if (type === 'tel') {
      return (
        <PhoneInput
          name={label.toLowerCase().replace(/\s+/g, '_')}
          value={editValue}
          onChange={e => {
            setEditValue(e.target.fullValue);
            setError(null);
          }}
          countryCode={countryCode}
          disabled={isSaving}
          placeholder="9XXXXXXXXX"
          error={error}
        />
      );
    }

    // DEFAULT TEXT INPUT
    return (
      <input
        type={type}
        value={editValue}
        onChange={e => setEditValue(e.target.value)}
        disabled={isSaving}
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.input.backgroundDark
            : COLORS.input.background,
          color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
          borderColor: error
            ? COLORS.danger
            : isDarkMode
            ? COLORS.border.dark
            : COLORS.border.light,
        }}
      />
    );
  };

  // Format display value based on field type
  const getDisplayValue = () => {
    if (!value) return 'Not specified';
    return value;
  };

  return (
    <div className="mb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {Icon && (
              <div
                className="p-1.5 rounded-lg"
                style={{
                  backgroundColor: isDarkMode
                    ? COLORS.primary + '20'
                    : COLORS.primary + '15',
                }}
              >
                <Icon size={14} style={{ color: COLORS.primary }} />
              </div>
            )}
            <label
              className="text-xs font-semibold uppercase tracking-wide"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {label}
            </label>
            {locked && (
              <Lock
                size={12}
                style={{
                  color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
                }}
              />
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              {renderEditInput()}

              <div className="flex gap-2">
                <button
                  onClick={handleSaveWithValidation}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                  style={{
                    backgroundColor: COLORS.primary,
                    color: '#ffffff',
                    opacity: isSaving ? 0.7 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving ? (
                    <>
                      <LoadingSpinner size="sm" color="#ffffff" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={14} />
                      Save
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                  style={{
                    backgroundColor: isDarkMode
                      ? COLORS.surface.darkHover
                      : COLORS.background.main,
                    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
                    opacity: isSaving ? 0.5 : 1,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p
              className="text-base font-medium"
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {getDisplayValue()}
            </p>
          )}
        </div>

        {!locked && !isEditing && (
          <button
            onClick={startEditing}
            className="p-2 rounded-lg transition-colors"
            style={{
              backgroundColor: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = isDarkMode
                ? COLORS.surface.darkHover
                : COLORS.surface.lightHover;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Edit2
              size={16}
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            />
          </button>
        )}
      </div>

      {locked && (
        <p
          className="text-xs mt-2 italic"
          style={{
            color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
          }}
        >
          This field is locked. Please contact the receptionist to make changes.
        </p>
      )}
    </div>
  );
};
