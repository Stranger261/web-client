import { COLORS } from '../../../../../configs/CONST';

const InsuranceInfoSection = ({ patient, isDarkMode }) => {
  if (!patient.insurance_provider) {
    return null;
  }

  return (
    <div>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        Insurance Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p
            className="text-sm"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Provider
          </p>
          <p
            className="font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {patient.insurance_provider}
          </p>
        </div>
        <div>
          <p
            className="text-sm"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Insurance Number
          </p>
          <p
            className="font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {patient.insurance_number}
          </p>
        </div>
        <div>
          <p
            className="text-sm"
            style={{
              color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
            }}
          >
            Expiry Date
          </p>
          <p
            className="font-medium"
            style={{
              color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
            }}
          >
            {new Date(patient.insurance_expiry).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default InsuranceInfoSection;
