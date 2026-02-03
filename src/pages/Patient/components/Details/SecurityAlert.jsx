import { AlertCircle } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';

export const SecurityAlert = ({ isDarkMode = false }) => {
  return (
    <div
      className={`mb-6 p-4 rounded-lg flex items-start gap-3 transition-colors duration-200 ${
        isDarkMode
          ? 'bg-yellow-900/20 border border-yellow-700/50'
          : 'bg-yellow-50 border border-yellow-200'
      }`}
    >
      <AlertCircle
        size={20}
        style={{ color: COLORS.warning }}
        className="flex-shrink-0 mt-0.5"
      />
      <div>
        <p
          className={`text-sm font-medium mb-1 ${
            isDarkMode ? 'text-yellow-200' : 'text-yellow-900'
          }`}
        >
          Some fields are locked for security
        </p>
        <p
          className={`text-xs ${
            isDarkMode ? 'text-yellow-300' : 'text-yellow-700'
          }`}
        >
          Personal information like name and birthdate cannot be edited online.
          Please visit the receptionist for any changes.
        </p>
      </div>
    </div>
  );
};
