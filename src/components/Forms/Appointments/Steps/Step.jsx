import { Check } from 'lucide-react';

export const Step = ({
  number,
  title,
  subtitle,
  isActive,
  isCompleted,
  showText = true,
}) => {
  const getNumberClasses = () => {
    if (isActive) return 'bg-blue-500 text-white';
    if (isCompleted) return 'bg-green-500 text-white';
    return 'bg-gray-300 text-gray-700';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Circle */}
      <div
        className={`flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full ${getNumberClasses()} font-bold text-lg transition-colors duration-300`}
      >
        {isCompleted ? <Check size={20} /> : number}
      </div>

      {/* Labels (optional) */}
      {showText && (
        <div className="mt-2 text-center">
          <div
            className={`text-sm font-semibold ${
              isActive
                ? 'text-blue-600'
                : isCompleted
                ? 'text-green-700'
                : 'text-gray-900'
            }`}
          >
            {title}
          </div>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
      )}
    </div>
  );
};
