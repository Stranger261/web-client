import { User, Calendar, Users } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { EditableField } from '../EditableField';
import {
  GENDER_OPTIONS,
  CIVIL_STATUS_OPTIONS,
} from '../constants/patientConstants';
import { normalizedWord } from '../../../../../utils/normalizedWord';

export const BasicInfoTab = ({
  patientData,
  onFieldUpdate,
  isDarkMode = false,
}) => {
  return (
    <div>
      <div
        className={`flex items-center gap-3 mb-6 pb-4 border-b transition-colors duration-200 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div
          className={`p-3 rounded-xl ${
            isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
          }`}
        >
          <User size={24} style={{ color: COLORS.primary }} />
        </div>
        <div>
          <h3
            className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Basic Information
          </h3>
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Personal details and identification
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableField
          label="First Name"
          value={patientData.firstName}
          onSave={onFieldUpdate('firstName')}
          locked
          icon={User}
          isDarkMode={isDarkMode}
        />
        <EditableField
          label="Middle Name"
          value={patientData.middleName}
          onSave={onFieldUpdate('middleName')}
          locked
          icon={User}
          isDarkMode={isDarkMode}
        />
        <EditableField
          label="Last Name"
          value={patientData.lastName}
          onSave={onFieldUpdate('lastName')}
          locked
          icon={User}
          isDarkMode={isDarkMode}
        />
        <EditableField
          label="Birth Date"
          value={patientData.birthDate}
          onSave={onFieldUpdate('birthDate')}
          type="date"
          locked
          icon={Calendar}
          isDarkMode={isDarkMode}
        />
        <EditableField
          label="Gender"
          value={normalizedWord(patientData.gender)}
          onSave={onFieldUpdate('gender')}
          type="select"
          options={GENDER_OPTIONS}
          locked
          icon={User}
          isDarkMode={isDarkMode}
        />
        <EditableField
          label="Civil Status"
          value={normalizedWord(patientData.civilStatus)}
          onSave={onFieldUpdate('civilStatus')}
          type="select"
          options={CIVIL_STATUS_OPTIONS}
          icon={Users}
          isDarkMode={isDarkMode}
        />
        <EditableField
          label="Nationality"
          value={normalizedWord(patientData.nationality)}
          onSave={onFieldUpdate('nationality')}
          locked
          icon={User}
          isDarkMode={isDarkMode}
        />
      </div>
    </div>
  );
};
