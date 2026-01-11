import { Heart, Droplet, Activity, AlertCircle } from 'lucide-react';
import { COLORS } from '../../../../../configs/CONST';
import { EditableField } from '../EditableField';
import { InsuranceInfo } from '../sections/InsuranceInfo';
import { AllergiesSection } from '../Sections/AllergySection';

export const MedicalTab = ({ patientData, onFieldUpdate }) => {
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
          <Heart size={24} style={{ color: COLORS.primary }} />
        </div>
        <div>
          <h3
            className="text-xl font-bold"
            style={{ color: COLORS.text.primary }}
          >
            Medical & Insurance
          </h3>
          <p className="text-sm" style={{ color: COLORS.text.secondary }}>
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
        />
        <EditableField
          label="Height (cm)"
          value={patientData.height}
          onSave={onFieldUpdate('height')}
          type="number"
          icon={Activity}
        />
        <EditableField
          label="Weight (kg)"
          value={patientData.weight}
          onSave={onFieldUpdate('weight')}
          type="number"
          icon={Activity}
        />
        <div className="md:col-span-2">
          <EditableField
            label="Known Allergies"
            value={patientData.allergies}
            onSave={onFieldUpdate('allergies')}
            icon={AlertCircle}
            multiline
          />
        </div>
        <div className="md:col-span-2">
          <EditableField
            label="Chronic Conditions"
            value={patientData.chronicConditions}
            onSave={onFieldUpdate('chronicConditions')}
            icon={Heart}
            multiline
          />
        </div>
        <div className="md:col-span-2">
          <EditableField
            label="Current Medications"
            value={patientData.currentMedications}
            onSave={onFieldUpdate('currentMedications')}
            icon={Activity}
            multiline
          />
        </div>
      </div>

      <AllergiesSection />

      <InsuranceInfo patientData={patientData} onFieldUpdate={onFieldUpdate} />
    </div>
  );
};
