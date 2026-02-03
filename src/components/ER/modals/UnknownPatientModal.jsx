import React, { useState } from 'react';
import { X, UserX, AlertCircle } from 'lucide-react';
import { erService } from '../../../services/erApi';
import toast from 'react-hot-toast';

const UnknownPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    temporaryInfo: {
      estimatedAge: '',
      gender: 'male',
      description: '',
    },
    visitData: {
      arrival_mode: 'ambulance',
      chief_complaint: '',
      accompanied_by: 'EMS',
      triage_level: 1,
      triage_nurse_id: 1, // Should come from logged-in user
    },
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setFormData({
      temporaryInfo: {
        estimatedAge: '',
        gender: 'male',
        description: '',
      },
      visitData: {
        arrival_mode: 'ambulance',
        chief_complaint: '',
        accompanied_by: 'EMS',
        triage_level: 1,
        triage_nurse_id: 1,
      },
    });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.visitData.chief_complaint.trim()) {
      setError('Chief complaint is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await erService.createUnknownPatient(formData);
      onSuccess(response.data);
      console.log(response);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to register unknown patient',
      );
      toast.error(err.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const updateTemporaryInfo = (field, value) => {
    setFormData({
      ...formData,
      temporaryInfo: {
        ...formData.temporaryInfo,
        [field]: value,
      },
    });
  };

  const updateVisitData = (field, value) => {
    setFormData({
      ...formData,
      visitData: {
        ...formData.visitData,
        [field]: value,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <UserX size={24} className="text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Register Unknown Patient
              </h2>
              <p className="text-sm text-gray-600">
                Create temporary record for unidentified patient
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Warning Alert */}
        <div className="mx-6 mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle
            size={20}
            className="text-yellow-600 flex-shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Patient Identity Unknown
            </p>
            <p className="text-sm text-yellow-800 mt-1">
              A temporary record will be created with a TEMP MRN. Please
              identify the patient as soon as possible.
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
          {/* Temporary Patient Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                Temporary Information
              </span>
            </h3>

            <div className="space-y-4">
              {/* Estimated Age */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Age (years)
                </label>
                <input
                  type="number"
                  value={formData.temporaryInfo.estimatedAge}
                  onChange={e =>
                    updateTemporaryInfo('estimatedAge', e.target.value)
                  }
                  placeholder="Approximate age..."
                  min="0"
                  max="120"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-yellow-500 focus:border-transparent"
                />
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  value={formData.temporaryInfo.gender}
                  onChange={e => updateTemporaryInfo('gender', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-yellow-500 focus:border-transparent"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other/Unknown</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Physical Description / Notes
                </label>
                <textarea
                  value={formData.temporaryInfo.description}
                  onChange={e =>
                    updateTemporaryInfo('description', e.target.value)
                  }
                  placeholder="Approximate height, weight, hair color, clothing, identifying marks, found location, etc..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-yellow-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Arrival Information */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                Arrival Information
              </span>
            </h3>

            <div className="space-y-4">
              {/* Arrival Mode */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Mode <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.visitData.arrival_mode}
                  onChange={e =>
                    updateVisitData('arrival_mode', e.target.value)
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="ambulance">Ambulance</option>
                  <option value="police">Police</option>
                  <option value="helicopter">Helicopter</option>
                  <option value="walk_in">Walk-in</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Chief Complaint */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chief Complaint / Condition{' '}
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.visitData.chief_complaint}
                  onChange={e =>
                    updateVisitData('chief_complaint', e.target.value)
                  }
                  placeholder="e.g., Unconscious, found on street; Multiple trauma; Altered mental status..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Describe the patient's condition and circumstances
                </p>
              </div>

              {/* Found/Brought By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Found/Brought By
                </label>
                <input
                  type="text"
                  value={formData.visitData.accompanied_by}
                  onChange={e =>
                    updateVisitData('accompanied_by', e.target.value)
                  }
                  placeholder="e.g., EMS, Police, Bystander..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Initial Triage Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Initial Triage Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.visitData.triage_level}
                  onChange={e =>
                    updateVisitData('triage_level', parseInt(e.target.value))
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value={1}>
                    🔴 Level 1 - Resuscitation (Critical)
                  </option>
                  <option value={2}>🟠 Level 2 - Emergency</option>
                  <option value={3}>🟡 Level 3 - Urgent</option>
                  <option value={4}>🟢 Level 4 - Less Urgent</option>
                  <option value={5}>🔵 Level 5 - Non-Urgent</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Unknown patients typically arrive as Level 1 or 2
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-medium">Next Steps:</span> After creating
              this record, you'll be able to:
            </p>
            <ul className="text-sm text-blue-800 mt-2 ml-4 list-disc space-y-1">
              <li>Complete triage assessment</li>
              <li>Provide emergency treatment</li>
              <li>Identify the patient when information becomes available</li>
              <li>Merge records with real patient data</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
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
              className="flex-1 px-6 py-3 bg-yellow-600 text-white rounded-lg 
                       hover:bg-yellow-700 font-medium transition-colors 
                       disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Temporary Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnknownPatientModal;
