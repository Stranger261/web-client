import { COLORS } from '../../configs/CONST';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const getVariantStyles = variant => {
    const colors = COLORS.badge[variant] || COLORS.badge.default;

    // Check if dark mode is active
    const isDarkMode = document.documentElement.classList.contains('dark');

    return {
      backgroundColor: isDarkMode ? colors.bgDark : colors.bg,
      color: isDarkMode ? colors.textDark : colors.text,
    };
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${className}`}
      style={getVariantStyles(variant)}
    >
      {children}
    </span>
  );
};

export default Badge;
