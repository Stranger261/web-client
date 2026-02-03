import { Calendar, User, Droplet, Activity } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';
import { calculateAge, getInitials } from './utils/patientHelpers';

export const PatientHeader = ({ patientData, isDarkMode = false }) => {
  return (
    <div
      className={`mb-6 rounded-lg border p-6 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold flex-shrink-0"
          style={{ backgroundColor: COLORS.primary, color: '#ffffff' }}
        >
          {getInitials(patientData.firstName, patientData.lastName)}
        </div>

        <div className="flex-1">
          <h1
            className={`text-3xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            {patientData.firstName} {patientData.middleName}{' '}
            {patientData.lastName}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: COLORS.primary }} />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {calculateAge(patientData.birthDate)} years old
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} style={{ color: COLORS.primary }} />
              <span className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                {patientData.gender}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet size={16} style={{ color: COLORS.danger }} />
              <span
                className={`font-semibold ${
                  isDarkMode ? 'text-gray-100' : 'text-gray-900'
                }`}
              >
                {patientData.bloodType}
              </span>
            </div>
          </div>
        </div>

        <div
          className={`px-4 py-2 rounded-lg ${
            isDarkMode
              ? 'bg-green-900/30 border border-green-700/50'
              : 'bg-green-50 border border-green-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Activity size={16} style={{ color: COLORS.success }} />
            <span
              className="text-sm font-semibold"
              style={{ color: COLORS.success }}
            >
              Active Patient
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
