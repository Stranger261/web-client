import { useState } from 'react';
import {
  Save,
  X,
  CheckCircle,
  AlertCircle,
  User,
  ClipboardList,
  Search,
  Pill,
  FileText,
  FlaskConical,
  Home,
} from 'lucide-react';

import Modal from '../../../../../components/ui/Modal';
// tabs
import PatientInfoTab from './tabs/PatientInfoTab';
import AssessmentTab from './tabs/AssessmentTab';
import DiagnosisTab from './tabs/DiagnosisTab';
import TreatmentTab from './tabs/TreatmentTab';
import PrescriptionTab from './tabs/PrescriptionTab';
import OrdersTab from './tabs/OrdersTab';
import DispositionTab from './tabs/DispositionTab';

import { useDoctorConsultation } from '../../../../../hooks/useDoctorConsultation';
import { COLORS } from '../../../../../configs/CONST';

const DoctorConsultationModal = ({ isOpen, onClose, appointment }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [activeTab, setActiveTab] = useState(0);

  const {
    consultationData,
    diagnosisData,
    prescriptionData,
    errors,
    isSaving,
    saveSuccess,
    handleDiagnosisChange,
    handlePrescriptionChange,
    addMedication,
    removeMedication,
    handleSubmit,
    handleImagingOrderUpdate,
    handleLabOrderUpdate,
    handleOrderDetailsChange,
  } = useDoctorConsultation(appointment);

  const handleBedSelect = bed => {
    handleDiagnosisChange('selected_bed_id', bed.bed_id);
    handleDiagnosisChange('selected_bed_info', {
      bed_number: bed.bed_number,
      room_number: bed.room?.room_number,
      floor_number: bed.room?.floor_number,
      bed_type: bed.bed_type,
    });
  };

  const tabs = [
    { id: 0, label: 'Patient Info', icon: <User /> },
    { id: 1, label: 'Assessment', icon: <ClipboardList /> },
    { id: 2, label: 'Diagnosis', icon: <Search /> },
    { id: 3, label: 'Treatment', icon: <Pill /> },
    { id: 4, label: 'Prescriptions', icon: <FileText /> },
    { id: 5, label: 'Orders', icon: <FlaskConical /> },
    { id: 6, label: 'Disposition', icon: <Home /> },
  ];

  const handleSave = async () => {
    const success = await handleSubmit();
    if (success) {
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  const canGoNext = () => {
    // Basic validation for required tabs
    if (activeTab === 2 && !diagnosisData.primary_diagnosis.trim()) {
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (activeTab < tabs.length - 1 && canGoNext()) {
      setActiveTab(activeTab + 1);
    }
  };

  const handlePrevious = () => {
    if (activeTab > 0) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Doctor Consultation">
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div
          className="flex overflow-x-auto gap-2 pb-2 border-b"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap flex items-center gap-2 min-w-fit"
              style={{
                backgroundColor:
                  activeTab === tab.id
                    ? isDarkMode
                      ? COLORS.primary
                      : COLORS.primary
                    : isDarkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.lightHover,
                color:
                  activeTab === tab.id
                    ? COLORS.text.white
                    : isDarkMode
                      ? COLORS.text.light
                      : COLORS.text.secondary,
              }}
            >
              <span>{tab.icon}</span>
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 0 && (
            <PatientInfoTab
              appointment={appointment}
              vitals={consultationData?.vitals}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 1 && (
            <AssessmentTab
              data={diagnosisData}
              onChange={handleDiagnosisChange}
              errors={errors}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 2 && (
            <DiagnosisTab
              data={diagnosisData}
              onChange={handleDiagnosisChange}
              errors={errors}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 3 && (
            <TreatmentTab
              data={diagnosisData}
              onChange={handleDiagnosisChange}
              errors={errors}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 4 && (
            <PrescriptionTab
              medications={prescriptionData.medications}
              onAdd={addMedication}
              onRemove={removeMedication}
              onChange={handlePrescriptionChange}
              isDarkMode={isDarkMode}
            />
          )}
          {activeTab === 5 && (
            <OrdersTab
              data={diagnosisData}
              onChange={handleDiagnosisChange}
              handleImagingOrderUpdate={handleImagingOrderUpdate}
              handleLabOrderUpdate={handleLabOrderUpdate}
              handleOrderDetailsChange={handleOrderDetailsChange}
              isSavingOrder={isSavingOrder}
              isDarkMode={isDarkMode}
              appointment={appointment}
            />
          )}
          {activeTab === 6 && (
            <DispositionTab
              data={diagnosisData}
              onChange={handleDiagnosisChange}
              errors={errors}
              isDarkMode={isDarkMode}
              onBedSelect={handleBedSelect}
            />
          )}
        </div>

        {/* Messages */}
        {errors.submit && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: COLORS.badge.danger.bg,
              borderColor: COLORS.danger,
              color: COLORS.badge.danger.text,
              border: '1px solid',
            }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errors.submit}</span>
          </div>
        )}

        {saveSuccess && (
          <div
            className="flex items-center gap-2 p-3 rounded-lg text-sm"
            style={{
              backgroundColor: COLORS.badge.success.bg,
              borderColor: COLORS.success,
              color: COLORS.badge.success.text,
              border: '1px solid',
            }}
          >
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Consultation saved successfully!</span>
          </div>
        )}

        {/* Action Buttons */}
        <div
          className="flex justify-between items-center pt-4 border-t"
          style={{
            borderColor: isDarkMode ? COLORS.border.dark : COLORS.border.light,
          }}
        >
          <div className="flex gap-2">
            <button
              onClick={handlePrevious}
              disabled={activeTab === 0}
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor:
                  activeTab === 0
                    ? isDarkMode
                      ? COLORS.surface.darkHover
                      : COLORS.surface.lightHover
                    : isDarkMode
                      ? COLORS.button.secondary.bg
                      : COLORS.button.outline.bgHover,
                color:
                  activeTab === 0
                    ? COLORS.text.secondary
                    : isDarkMode
                      ? COLORS.text.white
                      : COLORS.text.primary,
                cursor: activeTab === 0 ? 'not-allowed' : 'pointer',
                opacity: activeTab === 0 ? 0.5 : 1,
              }}
            >
              Previous
            </button>

            {activeTab < tabs.length - 1 && (
              <button
                onClick={handleNext}
                disabled={!canGoNext()}
                className="px-4 py-2 rounded-lg font-medium transition-colors"
                style={{
                  backgroundColor: canGoNext()
                    ? COLORS.button.primary.bg
                    : COLORS.surface.darkHover,
                  color: COLORS.text.white,
                  cursor: canGoNext() ? 'pointer' : 'not-allowed',
                  opacity: canGoNext() ? 1 : 0.5,
                }}
              >
                Next
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{
                backgroundColor: isDarkMode
                  ? COLORS.surface.darkHover
                  : COLORS.button.outline.bgHover,
                color: isDarkMode ? COLORS.text.white : COLORS.text.primary,
              }}
            >
              <X className="w-5 h-5" />
              Cancel
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              style={{
                backgroundColor: isSaving
                  ? COLORS.text.secondary
                  : COLORS.button.edit.bg,
                color: COLORS.button.edit.text,
                opacity: isSaving ? 0.6 : 1,
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save & Complete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DoctorConsultationModal;
