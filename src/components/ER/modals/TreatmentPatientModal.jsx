import React, { useState } from 'react';
import { X, Stethoscope, AlertCircle } from 'lucide-react';
import { erService } from '../../../services/erApi';

import { useAuth } from '../../../contexts/AuthContext';

const TreatmentModal = ({ isOpen, visit, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [treatmentData, setTreatmentData] = useState({
    performed_by: currentUser?.user_id,
    treatment_type: '',
    description: '',
    medication_name: '',
    dosage: '',
    route: '',
    outcome: '',
  });

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setTreatmentData({
      performed_by: 1,
      treatment_type: '',
      description: '',
      medication_name: '',
      dosage: '',
      route: '',
      outcome: '',
    });
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!treatmentData.treatment_type || !treatmentData.description) {
      setError('Treatment type and description are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await erService.createTreatment({
        er_visit_id: visit.er_visit_id,
        ...treatmentData,
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record treatment');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !visit) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Stethoscope size={24} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add Treatment</h2>
              <p className="text-sm text-gray-600">{visit.er_number}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-red-600 flex-shrink-0 mt-0.5"
            />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Treatment Type <span className="text-red-500">*</span>
              </label>
              <select
                value={treatmentData.treatment_type}
                onChange={e =>
                  setTreatmentData({
                    ...treatmentData,
                    treatment_type: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select type...</option>
                <option value="Medication Administration">
                  Medication Administration
                </option>
                <option value="IV Fluids">IV Fluids</option>
                <option value="Wound Care">Wound Care</option>
                <option value="Oxygen Therapy">Oxygen Therapy</option>
                <option value="Diagnostic Test">Diagnostic Test</option>
                <option value="Procedure">Procedure</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={treatmentData.description}
                onChange={e =>
                  setTreatmentData({
                    ...treatmentData,
                    description: e.target.value,
                  })
                }
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medication Name
                </label>
                <input
                  type="text"
                  value={treatmentData.medication_name}
                  onChange={e =>
                    setTreatmentData({
                      ...treatmentData,
                      medication_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  value={treatmentData.dosage}
                  onChange={e =>
                    setTreatmentData({
                      ...treatmentData,
                      dosage: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Route of Administration
              </label>
              <select
                value={treatmentData.route}
                onChange={e =>
                  setTreatmentData({ ...treatmentData, route: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select route...</option>
                <option value="oral">Oral</option>
                <option value="IV">IV (Intravenous)</option>
                <option value="IM">IM (Intramuscular)</option>
                <option value="subcutaneous">Subcutaneous</option>
                <option value="topical">Topical</option>
                <option value="inhalation">Inhalation</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Outcome/Response
              </label>
              <textarea
                value={treatmentData.outcome}
                onChange={e =>
                  setTreatmentData({
                    ...treatmentData,
                    outcome: e.target.value,
                  })
                }
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Patient's response to treatment..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 
                       disabled:bg-gray-400"
            >
              {loading ? 'Saving...' : 'Record Treatment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TreatmentModal;
