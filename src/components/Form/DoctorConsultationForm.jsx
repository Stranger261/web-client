import { useState } from 'react';
import {
  Plus,
  X,
  Save,
  FileText,
  Pill,
  TestTube,
  UserCheck,
} from 'lucide-react';

const DoctorConsultationForm = ({
  patientId = 'patient123',
  appointmentId = 'appt456',
  billId = 'bill789',
  onComplete,
}) => {
  const [formData, setFormData] = useState({
    // Vital Signs
    vitalSigns: {
      temperature: '',
      systolic: '',
      diastolic: '',
      heartRate: '',
      respiratoryRate: '',
      oxygenSaturation: '',
      weight: '',
      height: '',
    },

    // Chief Complaint & History
    chiefComplaint: '',
    historyOfPresentIllness: '',

    // Physical Examination
    physicalExam: {
      general: '',
      heent: '',
      cardiovascular: '',
      respiratory: '',
      abdomen: '',
      extremities: '',
    },

    // Diagnosis
    diagnosis: {
      primary: '',
      secondary: [],
    },

    // Treatment Plan
    prescriptions: [],
    labOrders: [],
    instructions: '',

    // Follow-up
    followUpRequired: false,
    followUpDate: '',
    followUpReason: '',
  });

  const [currentPrescription, setCurrentPrescription] = useState({
    medication: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    price: '',
    instructions: '',
  });

  const [currentLabOrder, setCurrentLabOrder] = useState({
    testName: '',
    priority: 'Routine',
    price: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('vitals');

  const handleVitalSignsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      vitalSigns: { ...prev.vitalSigns, [field]: value },
    }));
  };

  const handlePhysicalExamChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      physicalExam: { ...prev.physicalExam, [field]: value },
    }));
  };

  const addPrescription = () => {
    if (!currentPrescription.medication || !currentPrescription.dosage) {
      alert('Please fill medication and dosage');
      return;
    }

    setFormData(prev => ({
      ...prev,
      prescriptions: [...prev.prescriptions, { ...currentPrescription }],
    }));

    setCurrentPrescription({
      medication: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: '',
      price: '',
      instructions: '',
    });
  };

  const removePrescription = index => {
    setFormData(prev => ({
      ...prev,
      prescriptions: prev.prescriptions.filter((_, i) => i !== index),
    }));
  };

  const addLabOrder = () => {
    if (!currentLabOrder.testName) {
      alert('Please enter test name');
      return;
    }

    setFormData(prev => ({
      ...prev,
      labOrders: [...prev.labOrders, { ...currentLabOrder }],
    }));

    setCurrentLabOrder({ testName: '', priority: 'Routine', price: '' });
  };

  const removeLabOrder = index => {
    setFormData(prev => ({
      ...prev,
      labOrders: prev.labOrders.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.chiefComplaint || !formData.diagnosis.primary) {
      alert(
        'Please fill required fields: Chief Complaint and Primary Diagnosis'
      );
      return;
    }

    setSubmitting(true);
    try {
      // REAL API CALL - uncomment when ready:
      // const recordData = {
      //   patientId,
      //   doctorId: currentUser.id,
      //   appointmentId,
      //   visitType: 'OPD',
      //   vitalSigns: formData.vitalSigns,
      //   chiefComplaint: formData.chiefComplaint,
      //   historyOfPresentIllness: formData.historyOfPresentIllness,
      //   physicalExamination: formData.physicalExam,
      //   diagnosis: formData.diagnosis,
      //   treatmentPlan: {
      //     instructions: formData.instructions,
      //   },
      //   followUp: {
      //     required: formData.followUpRequired,
      //     date: formData.followUpDate,
      //     reason: formData.followUpReason,
      //   },
      // };

      // const response = await medicalRecordService.createMedicalRecord(recordData);
      // const recordId = response.data._id;

      // // Add prescriptions
      // for (const prescription of formData.prescriptions) {
      //   await medicalRecordService.addPrescription(recordId, prescription, billId);
      // }

      // // Add lab orders
      // for (const labOrder of formData.labOrders) {
      //   await medicalRecordService.addLabOrder(recordId, labOrder, billId);
      // }

      // // Complete medical record
      // await medicalRecordService.completeMedicalRecord(recordId, currentUser.id);

      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));

      alert('Consultation completed successfully! Bill has been updated.');
      if (onComplete) onComplete();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const tabs = [
    { id: 'vitals', name: 'Vital Signs', icon: UserCheck },
    { id: 'history', name: 'History & Exam', icon: FileText },
    { id: 'diagnosis', name: 'Diagnosis', icon: TestTube },
    { id: 'treatment', name: 'Treatment', icon: Pill },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <h1 className="text-2xl font-bold">Doctor Consultation Form</h1>
          <p className="text-sm mt-1 opacity-90">
            Complete patient consultation and prescribe treatment
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-gray-50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <tab.icon size={18} />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Vital Signs Tab */}
          {activeTab === 'vitals' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-800">Vital Signs</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitalSigns.temperature}
                    onChange={e =>
                      handleVitalSignsChange('temperature', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="37.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Pressure (mmHg)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.vitalSigns.systolic}
                      onChange={e =>
                        handleVitalSignsChange('systolic', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="120"
                    />
                    <span className="self-center">/</span>
                    <input
                      type="number"
                      value={formData.vitalSigns.diastolic}
                      onChange={e =>
                        handleVitalSignsChange('diastolic', e.target.value)
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="80"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heart Rate (bpm)
                  </label>
                  <input
                    type="number"
                    value={formData.vitalSigns.heartRate}
                    onChange={e =>
                      handleVitalSignsChange('heartRate', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="72"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Respiratory Rate
                  </label>
                  <input
                    type="number"
                    value={formData.vitalSigns.respiratoryRate}
                    onChange={e =>
                      handleVitalSignsChange('respiratoryRate', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="16"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    O2 Saturation (%)
                  </label>
                  <input
                    type="number"
                    value={formData.vitalSigns.oxygenSaturation}
                    onChange={e =>
                      handleVitalSignsChange('oxygenSaturation', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="98"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.vitalSigns.weight}
                    onChange={e =>
                      handleVitalSignsChange('weight', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.vitalSigns.height}
                    onChange={e =>
                      handleVitalSignsChange('height', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="170"
                  />
                </div>
              </div>
            </div>
          )}

          {/* History & Exam Tab */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chief Complaint <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.chiefComplaint}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      chiefComplaint: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="e.g., Fever and cough for 3 days"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  History of Present Illness
                </label>
                <textarea
                  value={formData.historyOfPresentIllness}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      historyOfPresentIllness: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Detailed description of symptoms and progression"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mt-6">
                Physical Examination
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    General Appearance
                  </label>
                  <input
                    value={formData.physicalExam.general}
                    onChange={e =>
                      handlePhysicalExamChange('general', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Alert and oriented"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HEENT
                  </label>
                  <input
                    value={formData.physicalExam.heent}
                    onChange={e =>
                      handlePhysicalExamChange('heent', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Head, Eyes, Ears, Nose, Throat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cardiovascular
                  </label>
                  <input
                    value={formData.physicalExam.cardiovascular}
                    onChange={e =>
                      handlePhysicalExamChange('cardiovascular', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Regular rate and rhythm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Respiratory
                  </label>
                  <input
                    value={formData.physicalExam.respiratory}
                    onChange={e =>
                      handlePhysicalExamChange('respiratory', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Clear breath sounds bilaterally"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Abdomen
                  </label>
                  <input
                    value={formData.physicalExam.abdomen}
                    onChange={e =>
                      handlePhysicalExamChange('abdomen', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Soft, non-tender"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Extremities
                  </label>
                  <input
                    value={formData.physicalExam.extremities}
                    onChange={e =>
                      handlePhysicalExamChange('extremities', e.target.value)
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="No edema, full range of motion"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Diagnosis Tab */}
          {activeTab === 'diagnosis' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary Diagnosis <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.diagnosis.primary}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      diagnosis: { ...prev.diagnosis, primary: e.target.value },
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Acute Pharyngitis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lab Orders
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      value={currentLabOrder.testName}
                      onChange={e =>
                        setCurrentLabOrder(prev => ({
                          ...prev,
                          testName: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Test Name"
                    />
                    <select
                      value={currentLabOrder.priority}
                      onChange={e =>
                        setCurrentLabOrder(prev => ({
                          ...prev,
                          priority: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option>Routine</option>
                      <option>Urgent</option>
                      <option>STAT</option>
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={currentLabOrder.price}
                        onChange={e =>
                          setCurrentLabOrder(prev => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Price"
                      />
                      <button
                        type="button"
                        onClick={addLabOrder}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add
                      </button>
                    </div>
                  </div>
                </div>

                {formData.labOrders.length > 0 && (
                  <div className="space-y-2">
                    {formData.labOrders.map((order, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {order.testName}
                          </p>
                          <p className="text-sm text-gray-600">
                            Priority: {order.priority} • ₱{order.price}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeLabOrder(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Treatment Tab */}
          {activeTab === 'treatment' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescriptions
                </label>
                <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <input
                      value={currentPrescription.medication}
                      onChange={e =>
                        setCurrentPrescription(prev => ({
                          ...prev,
                          medication: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Medication Name"
                    />
                    <input
                      value={currentPrescription.dosage}
                      onChange={e =>
                        setCurrentPrescription(prev => ({
                          ...prev,
                          dosage: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Dosage (e.g., 500mg)"
                    />
                    <input
                      value={currentPrescription.frequency}
                      onChange={e =>
                        setCurrentPrescription(prev => ({
                          ...prev,
                          frequency: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Frequency (e.g., 3x daily)"
                    />
                    <input
                      value={currentPrescription.duration}
                      onChange={e =>
                        setCurrentPrescription(prev => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Duration (e.g., 7 days)"
                    />
                    <input
                      type="number"
                      value={currentPrescription.quantity}
                      onChange={e =>
                        setCurrentPrescription(prev => ({
                          ...prev,
                          quantity: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Quantity"
                    />
                    <input
                      type="number"
                      value={currentPrescription.price}
                      onChange={e =>
                        setCurrentPrescription(prev => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Price per unit"
                    />
                  </div>
                  <input
                    value={currentPrescription.instructions}
                    onChange={e =>
                      setCurrentPrescription(prev => ({
                        ...prev,
                        instructions: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-3"
                    placeholder="Special Instructions"
                  />
                  <button
                    type="button"
                    onClick={addPrescription}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Plus size={18} />
                    Add Prescription
                  </button>
                </div>

                {formData.prescriptions.length > 0 && (
                  <div className="space-y-2">
                    {formData.prescriptions.map((rx, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between p-4 bg-green-50 rounded-lg border border-green-200"
                      >
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {rx.medication} - {rx.dosage}
                          </p>
                          <p className="text-sm text-gray-600">
                            {rx.frequency} for {rx.duration}
                          </p>
                          <p className="text-sm text-gray-600">
                            Quantity: {rx.quantity} • ₱{rx.price} each
                          </p>
                          {rx.instructions && (
                            <p className="text-sm text-blue-600 mt-1">
                              {rx.instructions}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removePrescription(index)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  General Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      instructions: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Rest, increase fluid intake, etc."
                />
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="followUp"
                    checked={formData.followUpRequired}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        followUpRequired: e.target.checked,
                      }))
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <label
                    htmlFor="followUp"
                    className="text-sm font-medium text-gray-700"
                  >
                    Follow-up Required
                  </label>
                </div>

                {formData.followUpRequired && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        value={formData.followUpDate}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            followUpDate: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason
                      </label>
                      <input
                        value={formData.followUpReason}
                        onChange={e =>
                          setFormData(prev => ({
                            ...prev,
                            followUpReason: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Check progress"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>
              <span className="text-red-500">*</span> Required fields
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 border rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`px-6 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <Save size={18} />
              {submitting ? 'Saving...' : 'Complete Consultation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorConsultationForm;
