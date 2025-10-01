import React, { useState, useEffect } from 'react';
import {
  X,
  Save,
  Eye,
  Edit,
  Plus,
  AlertTriangle,
  Clock,
  User,
  FileText,
  Activity,
} from 'lucide-react';

const MedicalRecordModal = ({
  isOpen,
  onClose,
  mode = 'view', // 'create', 'edit', 'view'
  recordData = null,
  patientData = null,
  onSave,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    patient: '',
    doctor: '',
    visitType: 'routine-checkup',
    visitDate: new Date().toISOString().split('T')[0],
    appointmentType: 'scheduled',
    chiefComplaint: '',
    historyOfPresentIllness: '',

    // Review of Systems
    reviewOfSystems: {
      constitutional: { symptoms: [], notes: '' },
      cardiovascular: { symptoms: [], notes: '' },
      respiratory: { symptoms: [], notes: '' },
      gastrointestinal: { symptoms: [], notes: '' },
      genitourinary: { symptoms: [], notes: '' },
      musculoskeletal: { symptoms: [], notes: '' },
      neurological: { symptoms: [], notes: '' },
      psychiatric: { symptoms: [], notes: '' },
      endocrine: { symptoms: [], notes: '' },
      hematologic: { symptoms: [], notes: '' },
      allergicImmunologic: { symptoms: [], notes: '' },
    },

    // Vitals
    vitals: {
      bodyTemperature: { value: '', unit: 'C' },
      bloodPressure: { systolic: '', diastolic: '', unit: 'mmHg' },
      heartRate: { value: '', unit: 'bpm' },
      respiratoryRate: { value: '', unit: '/min' },
      oxygenSaturation: { value: '', unit: '%' },
      height: { value: '', unit: 'cm' },
      weight: { value: '', unit: 'kg' },
      painScale: '',
    },

    // Physical Examination
    physicalExamination: {
      general: '',
      head: '',
      eyes: '',
      ears: '',
      nose: '',
      throat: '',
      neck: '',
      cardiovascular: '',
      respiratory: '',
      abdomen: '',
      extremities: '',
      neurological: '',
      psychiatric: '',
      skin: '',
      other: '',
    },

    // Assessment
    assessment: {
      primaryDiagnosis: '',
      secondaryDiagnoses: [],
      icdCodes: [{ code: '', description: '' }],
      differentialDiagnoses: [],
    },

    // Plan
    plan: {
      treatments: [],
      medications: [],
      followUp: '',
      patientEducation: '',
      lifestyle: '',
      diagnosticTests: [],
      referrals: [],
      returnToWork: {
        status: '',
        restrictions: '',
        duration: '',
      },
    },

    notes: '',
    summary: '',
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (recordData && (mode === 'edit' || mode === 'view')) {
      setFormData(recordData);
    } else if (mode === 'create') {
      setFormData(prev => ({
        ...prev,
        doctor: currentUser?.id || '',
        patient: patientData?.id || '',
      }));
    }
  }, [recordData, mode, patientData, currentUser]);

  const visitTypes = [
    { value: 'routine-checkup', label: 'Routine Check-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'follow-up', label: 'Follow-up' },
    { value: 'consultation', label: 'Consultation' },
    { value: 'surgery', label: 'Surgery' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'preventive', label: 'Preventive Care' },
  ];

  const rosSymptoms = {
    constitutional: [
      'Fever',
      'Chills',
      'Weight Loss',
      'Weight Gain',
      'Fatigue',
      'Night Sweats',
    ],
    cardiovascular: [
      'Chest Pain',
      'Palpitations',
      'Shortness of Breath',
      'Swelling',
      'Syncope',
    ],
    respiratory: [
      'Cough',
      'Shortness of Breath',
      'Wheezing',
      'Chest Pain',
      'Sputum',
    ],
    gastrointestinal: [
      'Nausea',
      'Vomiting',
      'Diarrhea',
      'Constipation',
      'Abdominal Pain',
      'Loss of Appetite',
    ],
    genitourinary: [
      'Dysuria',
      'Frequency',
      'Urgency',
      'Hematuria',
      'Incontinence',
    ],
    musculoskeletal: [
      'Joint Pain',
      'Muscle Pain',
      'Stiffness',
      'Weakness',
      'Back Pain',
    ],
    neurological: [
      'Headache',
      'Dizziness',
      'Seizures',
      'Numbness',
      'Tingling',
      'Vision Changes',
    ],
    psychiatric: [
      'Depression',
      'Anxiety',
      'Sleep Problems',
      'Memory Issues',
      'Mood Changes',
    ],
    endocrine: ['Polyuria', 'Polydipsia', 'Heat/Cold Intolerance', 'Hair Loss'],
    hematologic: [
      'Easy Bruising',
      'Bleeding',
      'Fatigue',
      'Lymph Node Swelling',
    ],
    allergicImmunologic: [
      'Rashes',
      'Hives',
      'Allergic Reactions',
      'Frequent Infections',
    ],
  };

  const isReadOnly = mode === 'view';
  const isEditing = mode === 'edit';
  const isCreating = mode === 'create';

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayInput = (path, index, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      if (!current[keys[keys.length - 1]]) {
        current[keys[keys.length - 1]] = [];
      }

      current[keys[keys.length - 1]][index] = value;
      return newData;
    });
  };

  const addArrayItem = path => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }

      if (!current[keys[keys.length - 1]]) {
        current[keys[keys.length - 1]] = [];
      }

      current[keys[keys.length - 1]].push('');
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]].splice(index, 1);
      return newData;
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.chiefComplaint?.trim()) {
      newErrors.chiefComplaint = 'Chief complaint is required';
    }

    if (!formData.assessment?.primaryDiagnosis?.trim()) {
      newErrors.primaryDiagnosis = 'Primary diagnosis is required';
    }

    if (!formData.visitDate) {
      newErrors.visitDate = 'Visit date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dataToSave = {
      ...formData,
      lastUpdatedBy: currentUser?.id,
      status: 'completed',
    };

    onSave(dataToSave, mode);
    onClose();
  };

  const getModalTitle = () => {
    const titles = {
      create: 'Create Medical Record',
      edit: 'Edit Medical Record',
      view: 'View Medical Record',
    };
    return titles[mode];
  };

  const getModalIcon = () => {
    const icons = {
      create: <Plus className="w-5 h-5" />,
      edit: <Edit className="w-5 h-5" />,
      view: <Eye className="w-5 h-5" />,
    };
    return icons[mode];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            {getModalIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getModalTitle()}
              </h2>
              {patientData && (
                <p className="text-sm text-gray-600 mt-1">
                  Patient: {patientData.firstname} {patientData.lastname} | MRN:{' '}
                  {patientData.medicalRecordNumber}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Navigation Tabs */}
          <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {[
                {
                  id: 'basic',
                  label: 'Basic Information',
                  icon: <FileText className="w-4 h-4" />,
                },
                {
                  id: 'vitals',
                  label: 'Vital Signs',
                  icon: <Activity className="w-4 h-4" />,
                },
                {
                  id: 'ros',
                  label: 'Review of Systems',
                  icon: <User className="w-4 h-4" />,
                },
                {
                  id: 'examination',
                  label: 'Physical Exam',
                  icon: <User className="w-4 h-4" />,
                },
                {
                  id: 'assessment',
                  label: 'Assessment',
                  icon: <AlertTriangle className="w-4 h-4" />,
                },
                {
                  id: 'plan',
                  label: 'Plan',
                  icon: <Clock className="w-4 h-4" />,
                },
                {
                  id: 'notes',
                  label: 'Notes & Summary',
                  icon: <FileText className="w-4 h-4" />,
                },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {tab.icon}
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              {/* Basic Information Tab */}
              {activeTab === 'basic' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visit Type *
                      </label>
                      <select
                        value={formData.visitType}
                        onChange={e =>
                          handleInputChange('visitType', e.target.value)
                        }
                        disabled={isReadOnly}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      >
                        {visitTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Visit Date *
                      </label>
                      <input
                        type="date"
                        value={formData.visitDate}
                        onChange={e =>
                          handleInputChange('visitDate', e.target.value)
                        }
                        disabled={isReadOnly}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                          errors.visitDate
                            ? 'border-red-500'
                            : 'border-gray-300'
                        }`}
                      />
                      {errors.visitDate && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.visitDate}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chief Complaint *
                    </label>
                    <textarea
                      value={formData.chiefComplaint}
                      onChange={e =>
                        handleInputChange('chiefComplaint', e.target.value)
                      }
                      disabled={isReadOnly}
                      rows={3}
                      placeholder="Patient's primary concern or reason for visit"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                        errors.chiefComplaint
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.chiefComplaint && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.chiefComplaint}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      History of Present Illness
                    </label>
                    <textarea
                      value={formData.historyOfPresentIllness}
                      onChange={e =>
                        handleInputChange(
                          'historyOfPresentIllness',
                          e.target.value
                        )
                      }
                      disabled={isReadOnly}
                      rows={4}
                      placeholder="Detailed description of the current condition and its progression"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Vital Signs Tab */}
              {activeTab === 'vitals' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Vital Signs
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Body Temperature
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.vitals.bodyTemperature.value}
                          onChange={e =>
                            handleInputChange(
                              'vitals.bodyTemperature.value',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="36.5"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <select
                          value={formData.vitals.bodyTemperature.unit}
                          onChange={e =>
                            handleInputChange(
                              'vitals.bodyTemperature.unit',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          className="w-16 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="C">°C</option>
                          <option value="F">°F</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Blood Pressure
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={formData.vitals.bloodPressure.systolic}
                          onChange={e =>
                            handleInputChange(
                              'vitals.bloodPressure.systolic',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="120"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <span className="self-center text-gray-500">/</span>
                        <input
                          type="number"
                          value={formData.vitals.bloodPressure.diastolic}
                          onChange={e =>
                            handleInputChange(
                              'vitals.bloodPressure.diastolic',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="80"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <span className="self-center text-sm text-gray-500">
                          mmHg
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Heart Rate
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={formData.vitals.heartRate.value}
                          onChange={e =>
                            handleInputChange(
                              'vitals.heartRate.value',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="72"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <span className="self-center text-sm text-gray-500">
                          bpm
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Respiratory Rate
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          value={formData.vitals.respiratoryRate.value}
                          onChange={e =>
                            handleInputChange(
                              'vitals.respiratoryRate.value',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="16"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <span className="self-center text-sm text-gray-500">
                          /min
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Oxygen Saturation
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.vitals.oxygenSaturation.value}
                          onChange={e =>
                            handleInputChange(
                              'vitals.oxygenSaturation.value',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="98"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <span className="self-center text-sm text-gray-500">
                          %
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pain Scale (0-10)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        value={formData.vitals.painScale}
                        onChange={e =>
                          handleInputChange('vitals.painScale', e.target.value)
                        }
                        disabled={isReadOnly}
                        placeholder="0"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Height
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.vitals.height.value}
                          onChange={e =>
                            handleInputChange(
                              'vitals.height.value',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="170"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <select
                          value={formData.vitals.height.unit}
                          onChange={e =>
                            handleInputChange(
                              'vitals.height.unit',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          className="w-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="cm">cm</option>
                          <option value="ft">ft</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Weight
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          value={formData.vitals.weight.value}
                          onChange={e =>
                            handleInputChange(
                              'vitals.weight.value',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          placeholder="70"
                          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        />
                        <select
                          value={formData.vitals.weight.unit}
                          onChange={e =>
                            handleInputChange(
                              'vitals.weight.unit',
                              e.target.value
                            )
                          }
                          disabled={isReadOnly}
                          className="w-20 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                        >
                          <option value="kg">kg</option>
                          <option value="lbs">lbs</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Assessment Tab */}
              {activeTab === 'assessment' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Assessment & Diagnosis
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Primary Diagnosis *
                    </label>
                    <input
                      type="text"
                      value={formData.assessment.primaryDiagnosis}
                      onChange={e =>
                        handleInputChange(
                          'assessment.primaryDiagnosis',
                          e.target.value
                        )
                      }
                      disabled={isReadOnly}
                      placeholder="Enter primary diagnosis"
                      className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 ${
                        errors.primaryDiagnosis
                          ? 'border-red-500'
                          : 'border-gray-300'
                      }`}
                    />
                    {errors.primaryDiagnosis && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.primaryDiagnosis}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secondary Diagnoses
                    </label>
                    <div className="space-y-2">
                      {formData.assessment.secondaryDiagnoses.map(
                        (diagnosis, index) => (
                          <div key={index} className="flex space-x-2">
                            <input
                              type="text"
                              value={diagnosis}
                              onChange={e =>
                                handleArrayInput(
                                  'assessment.secondaryDiagnoses',
                                  index,
                                  e.target.value
                                )
                              }
                              disabled={isReadOnly}
                              placeholder="Secondary diagnosis"
                              className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                            />
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeArrayItem(
                                    'assessment.secondaryDiagnoses',
                                    index
                                  )
                                }
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )
                      )}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() =>
                            addArrayItem('assessment.secondaryDiagnoses')
                          }
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          + Add Secondary Diagnosis
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ICD Codes
                    </label>
                    <div className="space-y-3">
                      {formData.assessment.icdCodes.map((icd, index) => (
                        <div key={index} className="grid grid-cols-3 gap-3">
                          <input
                            type="text"
                            value={icd.code}
                            onChange={e => {
                              const newIcdCodes = [
                                ...formData.assessment.icdCodes,
                              ];
                              newIcdCodes[index] = {
                                ...newIcdCodes[index],
                                code: e.target.value,
                              };
                              handleInputChange(
                                'assessment.icdCodes',
                                newIcdCodes
                              );
                            }}
                            disabled={isReadOnly}
                            placeholder="ICD Code"
                            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                          <input
                            type="text"
                            value={icd.description}
                            onChange={e => {
                              const newIcdCodes = [
                                ...formData.assessment.icdCodes,
                              ];
                              newIcdCodes[index] = {
                                ...newIcdCodes[index],
                                description: e.target.value,
                              };
                              handleInputChange(
                                'assessment.icdCodes',
                                newIcdCodes
                              );
                            }}
                            disabled={isReadOnly}
                            placeholder="Description"
                            className="col-span-2 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Plan Tab */}
              {activeTab === 'plan' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Treatment Plan
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treatments
                    </label>
                    <div className="space-y-2">
                      {formData.plan.treatments.map((treatment, index) => (
                        <div key={index} className="flex space-x-2">
                          <input
                            type="text"
                            value={treatment}
                            onChange={e =>
                              handleArrayInput(
                                'plan.treatments',
                                index,
                                e.target.value
                              )
                            }
                            disabled={isReadOnly}
                            placeholder="Treatment plan item"
                            className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                          />
                          {!isReadOnly && (
                            <button
                              type="button"
                              onClick={() =>
                                removeArrayItem('plan.treatments', index)
                              }
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => addArrayItem('plan.treatments')}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          + Add Treatment
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Follow-up Instructions
                    </label>
                    <textarea
                      value={formData.plan.followUp}
                      onChange={e =>
                        handleInputChange('plan.followUp', e.target.value)
                      }
                      disabled={isReadOnly}
                      rows={3}
                      placeholder="When to return, what to monitor, etc."
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Patient Education
                    </label>
                    <textarea
                      value={formData.plan.patientEducation}
                      onChange={e =>
                        handleInputChange(
                          'plan.patientEducation',
                          e.target.value
                        )
                      }
                      disabled={isReadOnly}
                      rows={3}
                      placeholder="Information provided to patient"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}

              {/* Notes Tab */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Notes & Summary
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Clinical Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={e => handleInputChange('notes', e.target.value)}
                      disabled={isReadOnly}
                      rows={6}
                      placeholder="Additional clinical notes, observations, or comments"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Summary
                    </label>
                    <textarea
                      value={formData.summary}
                      onChange={e =>
                        handleInputChange('summary', e.target.value)
                      }
                      disabled={isReadOnly}
                      rows={4}
                      placeholder="Brief summary of the visit and key points"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            {recordData && (
              <div className="text-sm text-gray-500">
                <span className="inline-flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Last updated:{' '}
                  {new Date(recordData.updatedAt).toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            {!isReadOnly && (
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{isCreating ? 'Create Record' : 'Save Changes'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalRecordModal;
