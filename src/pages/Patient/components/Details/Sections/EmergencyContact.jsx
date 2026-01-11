import { AlertCircle, User, Users, Phone } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { EditableField } from '../EditableField';
import { RELATIONSHIP_OPTIONS } from '../constants/patientConstants';

export const EmergencyContact = ({ patientData, onFieldUpdate }) => {
  return (
    <div
      className="mt-8 pt-6 border-t"
      style={{ borderColor: COLORS.border.light }}
    >
      <h4
        className="text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2"
        style={{ color: COLORS.text.secondary }}
      >
        <AlertCircle size={16} style={{ color: COLORS.danger }} />
        Emergency Contact
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableField
          label="Contact Name"
          value={patientData.emergencyContactName}
          onSave={onFieldUpdate('emergencyContactName')}
          icon={User}
        />
        <EditableField
          label="Relationship"
          value={patientData.emergencyContactRelation}
          onSave={onFieldUpdate('emergencyContactRelation')}
          type="select"
          options={RELATIONSHIP_OPTIONS}
          icon={Users}
        />
        <EditableField
          label="Contact Number"
          value={patientData.emergencyContactNumber}
          onSave={onFieldUpdate('emergencyContactNumber')}
          type="tel"
          icon={Phone}
        />
      </div>
    </div>
  );
};
