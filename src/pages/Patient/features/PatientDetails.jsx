import { useState } from 'react';
import { toast } from 'react-hot-toast';

import { COLORS } from '../../../configs/CONST';

import { usePatientData } from '../components/Details/hooks/usePatientData';
import { PATIENT_TABS } from '../components/Details/constants/patientConstants';
// Components
import { PatientHeader } from '../components/Details/PatientHeader';
import { SecurityAlert } from '../components/Details/SecurityAlert';
import { TabNavigation } from '../components/Details/TabNavigation';

import { BasicInfoTab } from '../components/Details/Tabs/BasicInfoTab';
import { ContactTab } from '../components/Details/Tabs/ContactTab';
import { MedicalTab } from '../components/Details/Tabs/MedicalTab';
import LoadingOverlay from '../../../components/shared/LoadingOverlay';

const PatientDetails = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const { patientData, loadingData, updateField, updateFields } =
    usePatientData();
  const isDarkMode = document.documentElement.classList.contains('dark');

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
            isDarkMode={isDarkMode}
          />
        );
      case 'contact':
        return (
          <ContactTab
            patientData={patientData}
            onFieldUpdate={handleFieldUpdate}
            onFieldsUpdate={handleFieldsUpdate}
            isDarkMode={isDarkMode}
          />
        );
      case 'medical':
        return (
          <MedicalTab
            patientData={patientData}
            onFieldUpdate={handleFieldUpdate}
            isDarkMode={isDarkMode}
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
      className={`min-h-screen p-6 transition-colors duration-200 ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <PatientHeader patientData={patientData} isDarkMode={isDarkMode} />
        <SecurityAlert isDarkMode={isDarkMode} />

        <div
          className={`mb-6 rounded-lg border overflow-hidden transition-colors duration-200 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700'
              : 'bg-white border-gray-200'
          }`}
        >
          <TabNavigation
            tabs={PATIENT_TABS}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isDarkMode={isDarkMode}
          />

          <div className="p-6">{renderTabContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetails;
