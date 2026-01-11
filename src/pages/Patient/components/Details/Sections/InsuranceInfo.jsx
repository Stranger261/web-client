import { Shield, Calendar } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { EditableField } from '../EditableField';

export const InsuranceInfo = ({ patientData, onFieldUpdate }) => {
  return (
    <div
      className="mt-8 pt-6 border-t"
      style={{ borderColor: COLORS.border.light }}
    >
      <h4
        className="text-sm font-semibold uppercase tracking-wide mb-4 flex items-center gap-2"
        style={{ color: COLORS.text.secondary }}
      >
        <Shield size={16} style={{ color: COLORS.info }} />
        Insurance Information
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableField
          label="Insurance Provider"
          value={patientData.insuranceProvider}
          onSave={onFieldUpdate('insuranceProvider')}
          icon={Shield}
        />
        <EditableField
          label="Insurance Number"
          value={patientData.insuranceNumber}
          onSave={onFieldUpdate('insuranceNumber')}
          icon={Shield}
        />
        <EditableField
          label="Insurance Expiry"
          value={patientData.insuranceExpiry}
          onSave={onFieldUpdate('insuranceExpiry')}
          type="date"
          icon={Calendar}
        />
      </div>
    </div>
  );
};
