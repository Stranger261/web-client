import { COLORS } from '../../configs/CONST';

const Card = ({ children, className = '', onClick, hover = false }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const cardStyles = {
    backgroundColor: isDarkMode ? COLORS.surface.dark : COLORS.surface.light,
    borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
    borderWidth: '1px',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    transition: hover ? 'box-shadow 0.2s' : 'none',
  };

  const hoverStyles = hover
    ? {
        boxShadow:
          '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      }
    : {};

  return (
    <div
      className={className}
      style={cardStyles}
      onClick={onClick}
      onMouseEnter={e =>
        hover && Object.assign(e.currentTarget.style, hoverStyles)
      }
      onMouseLeave={e =>
        hover && Object.assign(e.currentTarget.style, cardStyles)
      }
    >
      {children}
    </div>
  );
};

export const CardHeader = ({
  children,
  className = '',
  title,
  subtitle,
  action,
}) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  const headerStyles = {
    padding: '1.5rem',
    borderBottom: `1px solid ${
      isDarkMode ? COLORS.border.dark : COLORS.border.light
    }`,
  };

  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
  };

  const subtitleStyles = {
    fontSize: '0.875rem',
    color: COLORS.text.secondary,
    marginTop: '0.25rem',
  };

  return (
    <div
      className={`flex items-center justify-between ${className}`}
      style={headerStyles}
    >
      <div>
        {title && <h2 style={titleStyles}>{title}</h2>}
        {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export const CardBody = ({ children, className = '', padding = true }) => {
  const bodyStyles = {
    padding: padding ? '1.5rem' : '0',
  };

  return (
    <div className={className} style={bodyStyles}>
      {children}
    </div>
  );
};

export default Card;
