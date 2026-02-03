import { Heart, Droplet, Activity, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { EditableField } from '../EditableField';
import { InsuranceInfo } from '../Sections/InsuranceInfo';
import { AllergiesSection } from '../Sections/AllergySection';

export const MedicalTab = ({
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
          <Heart size={24} style={{ color: COLORS.primary }} />
        </div>
        <div>
          <h3
            className={`text-xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
          >
            Medical & Insurance
          </h3>
          <p
            className={`text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}
          >
            Health information and insurance details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EditableField
          label="Blood Type"
          value={patientData.bloodType}
          onSave={onFieldUpdate('bloodType')}
          locked
          icon={Droplet}
          isDarkMode={isDarkMode}
        />
        <EditableField
          label="Height (cm)"
          value={patientData.height}
          onSave={onFieldUpdate('height')}
          type="number"
          icon={Activity}
          isDarkMode={isDarkMode}
        />
        <EditableField
          label="Weight (kg)"
          value={patientData.weight}
          onSave={onFieldUpdate('weight')}
          type="number"
          icon={Activity}
          isDarkMode={isDarkMode}
        />
        <div className="md:col-span-2">
          <EditableField
            label="Known Allergies"
            value={patientData.allergies}
            onSave={onFieldUpdate('allergies')}
            icon={AlertCircle}
            multiline
            isDarkMode={isDarkMode}
          />
        </div>
        <div className="md:col-span-2">
          <EditableField
            label="Chronic Conditions"
            value={patientData.chronicConditions}
            onSave={onFieldUpdate('chronicConditions')}
            icon={Heart}
            multiline
            isDarkMode={isDarkMode}
          />
        </div>
        <div className="md:col-span-2">
          <EditableField
            label="Current Medications"
            value={patientData.currentMedications}
            onSave={onFieldUpdate('currentMedications')}
            icon={Activity}
            multiline
            isDarkMode={isDarkMode}
          />
        </div>
      </div>

      <AllergiesSection isDarkMode={isDarkMode} />

      <InsuranceInfo
        patientData={patientData}
        onFieldUpdate={onFieldUpdate}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};
