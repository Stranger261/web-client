import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { COLORS } from '../../configs/CONST';
import { LoadingSpinner } from '../ui/loading-spinner';

export const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'info'
  isLoading = false,
  itemName = '',
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const variantStyles = {
    danger: {
      color: COLORS.danger,
      icon: Trash2,
      bgColor: isDarkMode
        ? 'rgba(239, 68, 68, 0.1)'
        : 'rgba(239, 68, 68, 0.05)',
    },
    warning: {
      color: COLORS.warning,
      icon: AlertTriangle,
      bgColor: isDarkMode
        ? 'rgba(245, 158, 11, 0.1)'
        : 'rgba(245, 158, 11, 0.05)',
    },
    info: {
      color: COLORS.info,
      icon: AlertTriangle,
      bgColor: isDarkMode
        ? 'rgba(6, 182, 212, 0.1)'
        : 'rgba(6, 182, 212, 0.05)',
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  if (!isOpen) return null;

  const handleBackdropClick = e => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-md rounded-xl shadow-2xl animate-scale-in"
        style={{
          backgroundColor: isDarkMode
            ? COLORS.surface.dark
            : COLORS.surface.light,
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg transition-colors"
          style={{
            backgroundColor: 'transparent',
            opacity: isLoading ? 0.5 : 1,
          }}
          onMouseEnter={e => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = isDarkMode
                ? COLORS.surface.darkHover
                : COLORS.background.main;
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <X
            size={20}
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          />
        </button>

        {/* Icon */}
        <div className="flex justify-center pt-6 pb-4">
          <div
            className="p-4 rounded-full"
            style={{
              backgroundColor: style.bgColor,
            }}
          >
            <Icon size={32} style={{ color: style.color }} />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 text-center">
          <h3
            className="text-xl font-bold mb-2"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {title}
          </h3>
          <p
            className="text-sm mb-1"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            {message}
          </p>

          {itemName && (
            <p
              className="text-base font-semibold mt-3 px-4 py-2 rounded-lg inline-block"
              style={{
                color: style.color,
                backgroundColor: style.bgColor,
              }}
            >
              "{itemName}"
            </p>
          )}

          {variant === 'danger' && (
            <p
              className="text-xs mt-4 italic"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              This action cannot be undone.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: isDarkMode
                ? COLORS.surface.darkHover
                : COLORS.background.main,
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
            style={{
              backgroundColor: style.color,
              color: '#ffffff',
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" color="#ffffff" />
                Deleting...
              </>
            ) : (
              <>
                <Icon size={16} />
                {confirmText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
