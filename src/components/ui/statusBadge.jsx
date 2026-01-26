import Badge from './badge';

const StatusBadge = ({
  status = 'default',
  variant = 'default',
  size = 'md',
  showIcon = true,
  icon: Icon = null,
  customConfig = null,
  children,
}) => {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <Badge
      variant={variant}
      customConfig={customConfig}
      icon={Icon}
      showIcon={showIcon}
      className={`${sizeClasses[size]} ${variant === 'default' ? '' : 'border-0'}`}
    >
      {children}
    </Badge>
  );
};

export default StatusBadge;
