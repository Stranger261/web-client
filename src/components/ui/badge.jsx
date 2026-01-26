const Badge = ({
  children,
  variant = 'default',
  className = '',
  icon: Icon = null,
  customConfig = null,
  showIcon = false,
}) => {
  // If custom config is provided, use it
  if (customConfig) {
    return (
      <span
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${className}`}
        style={{
          backgroundColor: customConfig.bgColor,
          color: customConfig.textColor,
        }}
      >
        {showIcon && customConfig.icon && (
          <customConfig.icon className="w-4 h-4" />
        )}
        {children || customConfig.label}
      </span>
    );
  }

  // Otherwise use variant mapping
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
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getVariantClasses(variant)} ${className}`}
    >
      {showIcon && Icon && <Icon className="w-4 h-4" />}
      {children}
    </span>
  );
};

export default Badge;
