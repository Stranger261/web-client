import { User, Calendar, Users } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { EditableField } from '../EditableField';
import {
  GENDER_OPTIONS,
  CIVIL_STATUS_OPTIONS,
} from '../constants/patientConstants';
import { normalizedWord } from '../../../../../utils/normalizedWord';

export const BasicInfoTab = ({ patientData, onFieldUpdate }) => {
  return (
    <div>
      <div
        className="flex items-center gap-3 mb-6 pb-4 border-b"
        style={{ borderColor: COLORS.border.light }}
      >
        <div
          className="p-3 rounded-xl"
          style={{ backgroundColor: COLORS.primary + '20' }}
        >
          <User size={24} style={{ color: COLORS.primary }} />
        </div>
        <div>
          <h3
            className="text-xl font-bold"
            style={{ color: COLORS.text.primary }}
          >
            Basic Information
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
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
        />
        <EditableField
          label="Middle Name"
          value={patientData.middleName}
          onSave={onFieldUpdate('middleName')}
          locked
          icon={User}
        />
        <EditableField
          label="Last Name"
          value={patientData.lastName}
          onSave={onFieldUpdate('lastName')}
          locked
          icon={User}
        />
        <EditableField
          label="Birth Date"
          value={patientData.birthDate}
          onSave={onFieldUpdate('birthDate')}
          type="date"
          locked
          icon={Calendar}
        />
        <EditableField
          label="Gender"
          value={normalizedWord(patientData.gender)}
          onSave={onFieldUpdate('gender')}
          type="select"
          options={GENDER_OPTIONS}
          locked
          icon={User}
        />
        <EditableField
          label="Civil Status"
          value={normalizedWord(patientData.civilStatus)}
          onSave={onFieldUpdate('civilStatus')}
          type="select"
          options={CIVIL_STATUS_OPTIONS}
          icon={Users}
        />
        <EditableField
          label="Nationality"
          value={normalizedWord(patientData.nationality)}
          onSave={onFieldUpdate('nationality')}
          locked
          icon={User}
        />
      </div>
    </div>
  );
};
