import { Calendar, User, Droplet, Activity } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';
import { calculateAge, getInitials } from './utils/patientHelpers';

export const PatientHeader = ({ patientData }) => {
  return (
    <div
      className="mb-6 rounded-lg border p-6"
      style={{
        backgroundColor: COLORS.surface.light,
        borderColor: COLORS.border.light,
      }}
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
            className="text-3xl font-bold mb-2"
            style={{ color: COLORS.text.primary }}
          >
            {patientData.firstName} {patientData.middleName}{' '}
            {patientData.lastName}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} style={{ color: COLORS.primary }} />
              <span style={{ color: COLORS.text.secondary }}>
                {calculateAge(patientData.birthDate)} years old
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} style={{ color: COLORS.primary }} />
              <span style={{ color: COLORS.text.secondary }}>
                {patientData.gender}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Droplet size={16} style={{ color: COLORS.danger }} />
              <span
                className="font-semibold"
                style={{ color: COLORS.text.primary }}
              >
                {patientData.bloodType}
              </span>
            </div>
          </div>
        </div>

        <div
          className="px-4 py-2 rounded-lg"
          style={{ backgroundColor: COLORS.success + '20' }}
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
