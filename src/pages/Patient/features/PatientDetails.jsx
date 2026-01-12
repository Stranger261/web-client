import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { COLORS } from '../../../configs/CONST';

import { usePatientData } from '../components/Details/hooks/usePatientData';
import { PATIENT_TABS } from '../components/Details/constants/patientConstants';
// Components
import { PatientHeader } from '../components/Details/PatientHeader';
import { SecurityAlert } from '../components/Details/SecurityAlert';
import { TabNavigation } from '../components/Details/TabNavigation';

import { BasicInfoTab } from '../components/Details/tabs/BasicInfoTab';
import { ContactTab } from '../components/Details/tabs/ContactTab';
import { MedicalTab } from '../components/Details/tabs/MedicalTab';
import LoadingOverlay from '../../../components/shared/LoadingOverlay';

const PatientDetails = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const { patientData, loadingData, updateField, updateFields } =
    usePatientData();

  const handleFieldUpdate = field => async newValue => {
    const result = await updateField(field, newValue);

    if (result.success) {
      toast.success(`User data updated successfully.`);
    } else {
      toast.error(`Failed to update ${field}`);
    }
  };

  const handleFieldsUpdate = async fieldsData => {
    const result = await updateFields(fieldsData);

    if (result.success) {
      toast.success('User data updated successfully.');
    } else {
      toast.error('Failed to update address');
    }

    return result;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <BasicInfoTab
            patientData={patientData}
            onFieldUpdate={handleFieldUpdate}
          />
        );
      case 'contact':
        return (
          <ContactTab
            patientData={patientData}
            onFieldUpdate={handleFieldUpdate}
            onFieldsUpdate={handleFieldsUpdate}
          />
        );
      case 'medical':
        return (
          <MedicalTab
            patientData={patientData}
            onFieldUpdate={handleFieldUpdate}
          />
        );
      default:
        return null;
    }
  };

  if (!patientData || loadingData) {
    return <LoadingOverlay message="Fetching data..." />;
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{ backgroundColor: COLORS.background.main }}
    >
      <div className="max-w-6xl mx-auto">
        <PatientHeader patientData={patientData} />
        <SecurityAlert />

        <div
          className="mb-6 rounded-lg border overflow-hidden"
          style={{
            backgroundColor: COLORS.surface.light,
            borderColor: COLORS.border.light,
          }}
        >
          <TabNavigation
            tabs={PATIENT_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
