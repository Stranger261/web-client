import React, { useState } from 'react';
import { X, Stethoscope, AlertCircle } from 'lucide-react';
import { erService } from '../../services/erApi';

const TriageDrawer = ({ isOpen, visit, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [triageData, setTriageData] = useState({
    assessed_by: 1, // Should come from logged-in user
    vital_signs: {
      blood_pressure: '',
      heart_rate: '',
      respiratory_rate: '',
      temperature: '',
      oxygen_saturation: '',
    },
    pain_scale: 0,
    consciousness_level: 'alert',
    presenting_symptoms: '',
    triage_category: 3,
    triage_color: 'yellow',
    immediate_interventions: '',
    notes: '',
  });

  React.useEffect(() => {
    if (isOpen && visit) {
      // Pre-fill with chief complaint
      setTriageData(prev => ({
        ...prev,
        presenting_symptoms: visit.chief_complaint || '',
        triage_category: visit.triage_level || 3,
      }));
    }
  }, [isOpen, visit]);

  const handleVitalSignChange = (field, value) => {
    setTriageData({
      ...triageData,
      vital_signs: {
        ...triageData.vital_signs,
        [field]: value,
      },
    });
  };

  const handleTriageCategoryChange = category => {
    const colorMap = {
      1: 'red',
      2: 'orange',
      3: 'yellow',
      4: 'green',
      5: 'blue',
    };

    setTriageData({
      ...triageData,
      triage_category: category,
      triage_color: colorMap[category],
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!triageData.presenting_symptoms.trim()) {
      setError('Presenting symptoms are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await erService.createTriage({
        er_visit_id: visit.er_visit_id,
        ...triageData,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save triage assessment',
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !visit) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Stethoscope size={24} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Triage Assessment
                </h2>
                <p className="text-sm text-gray-600">{visit.er_number}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Patient Info */}
          <div className="bg-blue-50 rounded-lg p-3 mt-4">
            <p className="font-semibold text-gray-800">
              {visit.patient?.person?.first_name || 'Unknown'}{' '}
              {visit.patient?.person?.last_name || 'Patient'}
            </p>
            <p className="text-sm text-gray-600">
              {visit.patient?.mrn && `MRN: ${visit.patient.mrn}`}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Vital Signs */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">Vital Signs</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Pressure (mmHg)
                </label>
                <input
                  type="text"
                  value={triageData.vital_signs.blood_pressure}
                  onChange={e =>
                    handleVitalSignChange('blood_pressure', e.target.value)
                  }
                  placeholder="120/80"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heart Rate (bpm)
                </label>
                <input
                  type="number"
                  value={triageData.vital_signs.heart_rate}
                  onChange={e =>
                    handleVitalSignChange('heart_rate', e.target.value)
                  }
                  placeholder="75"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respiratory Rate (/min)
                </label>
                <input
                  type="number"
                  value={triageData.vital_signs.respiratory_rate}
                  onChange={e =>
                    handleVitalSignChange('respiratory_rate', e.target.value)
                  }
                  placeholder="16"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperature (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={triageData.vital_signs.temperature}
                  onChange={e =>
                    handleVitalSignChange('temperature', e.target.value)
                  }
                  placeholder="37.0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Oxygen Saturation (%)
                </label>
                <input
                  type="number"
                  value={triageData.vital_signs.oxygen_saturation}
                  onChange={e =>
                    handleVitalSignChange('oxygen_saturation', e.target.value)
                  }
                  placeholder="98"
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Pain Scale */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pain Scale (0-10)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="10"
                value={triageData.pain_scale}
                onChange={e =>
                  setTriageData({
                    ...triageData,
                    pain_scale: parseInt(e.target.value),
                  })
                }
                className="flex-1"
              />
              <span className="text-2xl font-bold text-blue-600 min-w-[3rem] text-center">
                {triageData.pain_scale}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>No Pain</span>
              <span>Severe Pain</span>
            </div>
          </div>

          {/* Consciousness Level */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consciousness Level <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'alert', label: 'Alert', icon: '✓' },
                { value: 'verbal', label: 'Responds to Verbal', icon: '💬' },
                { value: 'pain', label: 'Responds to Pain', icon: '⚠️' },
                { value: 'unresponsive', label: 'Unresponsive', icon: '🔴' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setTriageData({
                      ...triageData,
                      consciousness_level: option.value,
                    })
                  }
                  className={`p-3 border-2 rounded-lg transition-all ${
                    triageData.consciousness_level === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="text-lg mr-2">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Presenting Symptoms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Presenting Symptoms <span className="text-red-500">*</span>
            </label>
            <textarea
              value={triageData.presenting_symptoms}
              onChange={e =>
                setTriageData({
                  ...triageData,
                  presenting_symptoms: e.target.value,
                })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Triage Category */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Triage Category <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              {[
                { level: 1, label: 'Resuscitation', color: 'red', icon: '🔴' },
                { level: 2, label: 'Emergency', color: 'orange', icon: '🟠' },
                { level: 3, label: 'Urgent', color: 'yellow', icon: '🟡' },
                { level: 4, label: 'Less Urgent', color: 'green', icon: '🟢' },
                { level: 5, label: 'Non-Urgent', color: 'blue', icon: '🔵' },
              ].map(option => (
                <button
                  key={option.level}
                  type="button"
                  onClick={() => handleTriageCategoryChange(option.level)}
                  className={`w-full p-3 border-2 rounded-lg transition-all text-left ${
                    triageData.triage_category === option.level
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <span className="text-lg mr-2">{option.icon}</span>
                  <span className="font-medium">
                    Level {option.level}:
                  </span>{' '}
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Immediate Interventions */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Immediate Interventions
            </label>
            <textarea
              value={triageData.immediate_interventions}
              onChange={e =>
                setTriageData({
                  ...triageData,
                  immediate_interventions: e.target.value,
                })
              }
              placeholder="e.g., Oxygen started, IV access, ECG ordered..."
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={triageData.notes}
              onChange={e =>
                setTriageData({ ...triageData, notes: e.target.value })
              }
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                       focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 pb-2 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg 
                       hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 font-medium transition-colors 
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save & Update Status'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default TriageDrawer;
