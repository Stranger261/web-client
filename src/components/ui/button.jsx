import { Loader2 } from 'lucide-react';
import { COLORS } from '../../configs/CONST';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconOnly = false,
  iconPosition = 'left', // New prop: 'left' or 'right'
  className = '',
  onClick,
  ...props
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: iconOnly ? 'p-1.5' : 'px-3 py-2 text-sm',
    md: iconOnly ? 'p-2' : 'px-4 py-3 text-sm',
    lg: iconOnly ? 'p-2.5' : 'px-6 py-3 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const getButtonStyles = variant => {
    const buttonColors = COLORS.button[variant];

    if (!buttonColors) return { normal: {}, hover: {} };

    // DELETE - Always visible background
    if (variant === 'delete') {
      return {
        normal: {
          backgroundColor: iconOnly
            ? 'rgba(239, 68, 68, 0.1)'
            : buttonColors.bg,
          color: buttonColors.bg,
        },
        hover: {
          backgroundColor: buttonColors.bg,
          color: '#ffffff',
        },
      };
    }

    // EDIT, VIEW - Transparent with colored icon
    if (iconOnly && ['view', 'edit'].includes(variant)) {
      return {
        normal: {
          backgroundColor: 'transparent',
          color: buttonColors.icon || buttonColors.bg,
        },
        hover: {
          backgroundColor: `${buttonColors.bg}15`,
          color: buttonColors.bg,
        },
      };
    }

    // GHOST variant
    if (variant === 'ghost') {
      return {
        normal: {
          backgroundColor: 'transparent',
          color: isDarkMode ? buttonColors.textDark : buttonColors.text,
        },
        hover: {
          backgroundColor: isDarkMode
            ? buttonColors.bgHoverDark
            : buttonColors.bgHover,
          color: isDarkMode ? buttonColors.textDark : buttonColors.text,
        },
      };
    }

    // OUTLINE variant
    if (variant === 'outline') {
      return {
        normal: {
          backgroundColor: buttonColors.bg,
          color: isDarkMode ? buttonColors.textDark : buttonColors.text,
          border: `1px solid ${
            isDarkMode ? buttonColors.borderDark : buttonColors.border
          }`,
        },
        hover: {
          backgroundColor: isDarkMode
            ? buttonColors.bgHoverDark
            : buttonColors.bgHover,
          color: isDarkMode ? buttonColors.textDark : buttonColors.text,
          border: `1px solid ${
            isDarkMode ? buttonColors.borderDark : buttonColors.border
          }`,
        },
      };
    }

    // SOLID variants (create, primary, secondary, etc.)
    return {
      normal: {
        backgroundColor: buttonColors.bg,
        color: buttonColors.text,
      },
      hover: {
        backgroundColor: buttonColors.bgHover,
        color: buttonColors.text,
      },
    };
  };

  const styles = getButtonStyles(variant);
  const iconClass = `${iconSizes[size]} ${!iconOnly && children && (iconPosition === 'right' ? 'ml-2' : 'mr-2')}`;

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizes[size]} group ${className}`}
      style={styles.normal}
      onMouseEnter={e => {
        Object.assign(e.currentTarget.style, styles.hover);
      }}
      onMouseLeave={e => {
        Object.assign(e.currentTarget.style, styles.normal);
      }}
      onClick={onClick}
    >
      {loading ? (
        <Loader2
          className={`${iconSizes[size]} ${!iconOnly && 'mr-2'} animate-spin`}
        />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className={iconClass} />}
          {!iconOnly && children}
          {Icon && iconPosition === 'right' && <Icon className={iconClass} />}
        </>
      )}
    </button>
  );
};
