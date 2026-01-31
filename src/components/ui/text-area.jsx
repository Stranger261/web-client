import React from 'react';
import { COLORS } from '../../configs/CONST';

const TextArea = React.forwardRef(
  (
    {
      value,
      onChange,
      placeholder = '',
      rows = 3,
      required = false,
      disabled = false,
      error = false,
      success = false,
      className = '',
      isDarkMode = false,
      style = {},
      ...props
    },
    ref,
  ) => {
    const getBorderColor = () => {
      if (error) return COLORS.danger;
      if (success) return COLORS.success;
      if (isDarkMode) return COLORS.border.dark;
      return COLORS.border.light;
    };

    const getFocusColor = () => {
      if (error) return COLORS.danger;
      if (success) return COLORS.success;
      return COLORS.primary;
    };

    const getBackgroundColor = () => {
      if (disabled) {
        return isDarkMode ? COLORS.surface.darkHover : '#f9fafb';
      }
      return isDarkMode ? COLORS.surface.dark : COLORS.surface.light;
    };

    const getTextColor = () => {
      if (disabled) {
        return isDarkMode ? COLORS.text.secondary : '#6b7280';
      }
      return isDarkMode ? COLORS.text.white : COLORS.text.primary;
    };

    return (
      <div className="relative">
        <textarea
          ref={ref}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          required={required}
          disabled={disabled}
          className={`
          w-full px-3 py-2 
          border rounded-lg 
          focus:outline-none focus:ring-2 
          transition-all duration-200
          resize-y
          ${disabled ? 'opacity-60 cursor-not-allowed' : ''}
          ${className}
        `}
          style={{
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            color: getTextColor(),
            borderWidth: '1px',
            ...(props.readOnly && {
              backgroundColor: isDarkMode ? '#374151' : '#f3f4f6',
              cursor: 'default',
            }),
            ...style,
          }}
          onFocus={e => {
            e.target.style.borderColor = getFocusColor();
            e.target.style.boxShadow = `0 0 0 2px ${getFocusColor()}20`;
          }}
          onBlur={e => {
            e.target.style.borderColor = getBorderColor();
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />

        {/* Error/Success message */}
        {(error || success) && typeof error === 'string' && (
          <div
            className="mt-1 text-xs flex items-center gap-1"
            style={{
              color: error ? COLORS.danger : COLORS.success,
            }}
          >
            {error || success}
          </div>
        )}
      </div>
    );
  },
);

TextArea.displayName = 'TextArea';

export { TextArea };
