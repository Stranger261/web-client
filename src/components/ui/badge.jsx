// File: /src/components/ui/badge.jsx
const Badge = ({ children, variant = 'default', className = '' }) => {
  const getVariantClasses = variant => {
    const variantMap = {
      default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      primary:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      success:
        'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      warning:
        'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      info: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    };

    return variantMap[variant] || variantMap.default;
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
