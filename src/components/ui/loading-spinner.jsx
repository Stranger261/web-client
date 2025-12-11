import { Loader2 } from 'lucide-react';
import { COLORS } from '../../configs/CONST';

export const LoadingSpinner = ({
  size = 'md',
  color = COLORS.info,
  className = '',
}) => {
  const sizes = {
    sm: { width: '1rem', height: '1rem' }, // 16px
    md: { width: '2rem', height: '2rem' }, // 32px
    lg: { width: '3rem', height: '3rem' }, // 48px
  };

  return (
    <Loader2
      className={`animate-spin ${className}`}
      style={{
        ...sizes[size],
        color: color,
      }}
    />
  );
};
