// src/components/ui/link.jsx
import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ArrowRight, ExternalLink, ArrowDown } from 'lucide-react';

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
  const baseClasses =
    'inline-flex items-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer';

  const variants = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm rounded-lg',
    secondary:
      'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500 shadow-sm rounded-lg',
    outline:
      'border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 focus:ring-blue-500 rounded-lg',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-blue-500 rounded-lg',
    text: 'text-blue-600 hover:text-blue-800 focus:ring-blue-500 underline-offset-4 hover:underline',
  };

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
  const finalClassName = `${baseClasses} ${variants[variant]} ${sizeClasses} ${className}`;

  // Smart link detection
  const detectLinkType = url => {
    if (!url) return 'button';

    // External URLs
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

    // File downloads
    if (
      url.startsWith('/downloads/') ||
      url.match(/\.(pdf|doc|docx|xls|xlsx|zip|rar)$/i)
    ) {
      return 'download';
    }

    // Internal links (React Router)
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

    // Only handle special cases for non-RouterLink scenarios
    if (href && linkType === 'internal' && !e.defaultPrevented) {
      // For href-based internal links, prevent default and use navigate
      e.preventDefault();
      navigate(href);
    }
  };

  // Render appropriate element based on link type
  switch (linkType) {
    case 'external':
      return (
        <a
          href={url}
          className={finalClassName}
          target={isExternal ? '_blank' : '_self'}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          onClick={handleClick}
          {...props}
        >
          {content}
        </a>
      );

    case 'download':
      return (
        <a
          href={url}
          className={finalClassName}
          download={isDownload}
          onClick={handleClick}
          {...props}
        >
          {content}
        </a>
      );

    case 'internal':
      // Use RouterLink for internal navigation with 'to' prop
      if (to) {
        return (
          <RouterLink
            to={to}
            className={finalClassName}
            onClick={onClick} // Just pass through onClick for RouterLink
            {...props}
          >
            {content}
          </RouterLink>
        );
      }
      // Use regular anchor with navigate for href-based internal links
      return (
        <a
          href={href}
          className={finalClassName}
          onClick={handleClick}
          {...props}
        >
          {content}
        </a>
      );

    default:
      return (
        <button
          type="button" // Always specify type for buttons
          className={finalClassName}
          onClick={handleClick}
          {...props}
        >
          {content}
        </button>
      );
  }
};
