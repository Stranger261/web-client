import { AlertCircle } from 'lucide-react';
import { COLORS } from '../../../../configs/CONST';

export const SecurityAlert = () => {
  return (
    <div
      className="mb-6 p-4 rounded-lg flex items-start gap-3"
      style={{
        backgroundColor: COLORS.warning + '15',
        border: `1px solid ${COLORS.warning}30`,
      }}
    >
      <AlertCircle
        size={20}
        style={{ color: COLORS.warning }}
        className="flex-shrink-0 mt-0.5"
      />
      <div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: COLORS.text.primary }}
        >
          Some fields are locked for security
        </p>
        <p className="text-xs" style={{ color: COLORS.text.secondary }}>
          Personal information like name and birthdate cannot be edited online.
          Please visit the receptionist for any changes.
        </p>
      </div>
    </div>
  );
};
