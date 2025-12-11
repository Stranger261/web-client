import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, ArrowDown } from 'lucide-react';
import { COLORS } from '../../configs/CONST';

export const DynamicLink = ({
  children,
  to,
  href,
  variant = 'text',
  size = 'md',
  icon: Icon,
  external = false,
  newTab = false,
  download = false,
  className = '',
  onClick,
  ...props
}) => {
  const navigate = useNavigate();
  const isDarkMode = document.documentElement.classList.contains('dark');

  const baseClasses =
    'inline-flex items-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';

  const sizes = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  const textSizes = {
    sm: 'text-sm gap-1',
    md: 'text-base gap-1.5',
    lg: 'text-lg gap-2',
  };

  const sizeClasses = variant === 'text' ? textSizes[size] : sizes[size];

  // Get variant styles
  const getVariantStyles = variant => {
    const variants = {
      primary: {
        backgroundColor: COLORS.button.primary.bg,
        color: COLORS.button.primary.text,
        borderRadius: '0.5rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      secondary: {
        backgroundColor: COLORS.button.secondary.bg,
        color: COLORS.button.secondary.text,
        borderRadius: '0.5rem',
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      outline: {
        backgroundColor: isDarkMode
          ? COLORS.button.outline.bgDark
          : COLORS.button.outline.bg,
        color: isDarkMode
          ? COLORS.button.outline.textDark
          : COLORS.button.outline.text,
        border: `1px solid ${
          isDarkMode
            ? COLORS.button.outline.borderDark
            : COLORS.button.outline.border
        }`,
        borderRadius: '0.5rem',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: isDarkMode
          ? COLORS.button.ghost.textDark
          : COLORS.button.ghost.text,
        borderRadius: '0.5rem',
      },
      text: {
        backgroundColor: 'transparent',
        color: COLORS.info,
        textDecorationLine: 'none',
        textUnderlineOffset: '4px',
      },
    };

    return variants[variant] || variants.text;
  };

  const getHoverStyles = variant => {
    const hoverVariants = {
      primary: {
        backgroundColor: COLORS.button.primary.bgHover,
      },
      secondary: {
        backgroundColor: COLORS.button.secondary.bgHover,
      },
      outline: {
        backgroundColor: isDarkMode
          ? COLORS.button.outline.bgHoverDark
          : COLORS.button.outline.bgHover,
      },
      ghost: {
        backgroundColor: isDarkMode
          ? COLORS.button.ghost.bgHoverDark
          : COLORS.button.ghost.bgHover,
      },
      text: {
        textDecorationLine: 'underline',
        color: isDarkMode ? COLORS.info : '#1d4ed8', // Darker blue on hover
      },
    };

    return hoverVariants[variant] || {};
  };

  const linkStyles = getVariantStyles(variant);
  const hoverStyles = getHoverStyles(variant);

  // Smart link detection
  const detectLinkType = url => {
    if (!url) return 'button';

    if (
      url.startsWith('http') ||
      url.startsWith('//') ||
      url.startsWith('mailto:') ||
      url.startsWith('tel:') ||
      url.startsWith('https:') ||
      url.startsWith('http:')
    ) {
      return 'external';
    }

    if (
      url.startsWith('/downloads/') ||
      url.match(/\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i)
    ) {
      return 'download';
    }

    return 'internal';
  };

  const url = href || to;
  const linkType = detectLinkType(url);
  const isExternal = external || linkType === 'external' || newTab;
  const isDownload = download || linkType === 'download';

  // Content with smart icon
  const content = (
    <>
      {children}
      {isExternal && <ExternalLink className="w-4 h-4 ml-1" />}
      {isDownload && <ArrowDown className="w-4 h-4 ml-1" />}
      {Icon && !isExternal && !isDownload && <Icon className="w-4 h-4" />}
    </>
  );

  const handleClick = e => {
    if (onClick) {
      onClick(e);
    }

    if (href && linkType === 'internal' && !e.defaultPrevented) {
      e.preventDefault();
      navigate(href);
    }
  };

  const commonProps = {
    className: `${baseClasses} ${sizeClasses} ${className}`,
    style: linkStyles,
    onMouseEnter: e => Object.assign(e.currentTarget.style, hoverStyles),
    onMouseLeave: e => Object.assign(e.currentTarget.style, linkStyles),
  };

  // Render appropriate element based on link type
  switch (linkType) {
    case 'external':
      return (
        <a
          href={url}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          {...commonProps}
          {...props}
        >
          {content}
        </a>
      );

    case 'download':
      return (
        <a
          href={url}
          download={isDownload}
          onClick={handleClick}
          {...commonProps}
          {...props}
        >
          {content}
        </a>
      );

    case 'internal':
      if (to) {
        return (
          <RouterLink to={to} onClick={onClick} {...commonProps} {...props}>
            {content}
          </RouterLink>
        );
      }
      return (
        <a href={href} onClick={handleClick} {...commonProps} {...props}>
          {content}
        </a>
      );

    default:
      return (
        <button type="button" onClick={handleClick} {...commonProps} {...props}>
          {content}
        </button>
      );
  }
};
