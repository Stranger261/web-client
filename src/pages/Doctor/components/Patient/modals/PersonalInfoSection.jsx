import { COLORS } from '../../../../../configs/CONST';
import { calculateAge } from '../utils/patientHelpers';

const PersonalInfoSection = ({ patient, isDarkMode }) => {
  const fields = [
    {
      label: 'Full Name',
      value: `${patient.first_name} ${patient.middle_name || ''} ${
        patient.last_name
      } ${patient.suffix || ''}`.trim(),
    },
    { label: 'Patient ID', value: patient.patient_uuid },
    { label: 'MRN', value: patient.mrn },
    {
      label: 'Date of Birth',
      value: `${new Date(
        patient.date_of_birth
      ).toLocaleDateString()} (${calculateAge(
        patient.date_of_birth
      )} years old)`,
    },
    { label: 'Gender', value: patient.gender, capitalize: true },
    { label: 'Blood Type', value: patient.blood_type || 'N/A' },
    {
      label: 'Civil Status',
      value: patient.civil_status || 'N/A',
      capitalize: true,
    },
    { label: 'Occupation', value: patient.occupation || 'N/A' },
  ];

  return (
    <div>
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: isDarkMode ? COLORS.text.white : COLORS.text.primary }}
      >
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fields.map((field, index) => (
          <div key={index}>
            <p
              className="text-sm"
              style={{
                color: isDarkMode ? COLORS.text.light : COLORS.text.secondary,
              }}
            >
              {field.label}
            </p>
            <p
              className={`font-medium ${field.capitalize ? 'capitalize' : ''}`}
              style={{
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              {field.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PersonalInfoSection;
