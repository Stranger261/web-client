// components/ui/EmptyState.jsx
import React from 'react';
import { Calendar, FileText, Search } from 'lucide-react';

const EmptyState = ({
  title = 'No appointments found',
  message = 'There are no appointments scheduled at the moment.',
  icon: Icon = Calendar,
  actionButton,
  variant = 'default', // 'default', 'search', 'error'
}) => {
  const getVariantConfig = () => {
    switch (variant) {
      case 'search':
        return {
          icon: Search,
          title: 'No results found',
          message:
            "Try adjusting your search or filters to find what you're looking for.",
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
        };
      case 'error':
        return {
          icon: FileText,
          title: 'Unable to load appointments',
          message:
            'There was an error loading the appointments. Please try again.',
          iconColor: 'text-red-400',
          bgColor: 'bg-red-50 dark:bg-red-900/20',
        };
      default:
        return {
          icon: Icon,
          title,
          message,
          iconColor: 'text-gray-400',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
        };
    }
  };

  const config = getVariantConfig();
  const IconComponent = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div
        className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mb-6`}
      >
        <IconComponent className={`w-10 h-10 ${config.iconColor}`} />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {config.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {config.message}
      </p>
      {actionButton && <div className="mt-4">{actionButton}</div>}
    </div>
  );
};

export default EmptyState;
