import React, { useState } from 'react';
import { X, Search, UserPlus, AlertCircle } from 'lucide-react';
import { erService } from '../../../services/erApi';
import patientApi from '../../../services/patientApi';

const RegisterPatientModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Search, 2: Arrival Info
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [arrivalData, setArrivalData] = useState({
    arrival_mode: 'walk_in',
    chief_complaint: '',
    accompanied_by: '',
    triage_level: 3,
    triage_nurse_id: 1, // This should come from logged-in user
  });

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep(1);
    setSearchQuery('');
    setSearchResults([]);
    setSelectedPatient(null);
    setArrivalData({
      arrival_mode: 'walk_in',
      chief_complaint: '',
      accompanied_by: '',
      triage_level: 3,
      triage_nurse_id: 1,
    });
    setError('');
  };

  // Search for patient (mock - replace with actual API call)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter MRN or patient name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await patientApi.getPatient(searchQuery);
      console.log(res);

      setSearchResults(res.data);
      if (res.data.length === 0) {
        setError('No patients found. Please try a different search.');
      }
    } catch (err) {
      setError('Failed to search patients. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPatient = patient => {
    setSelectedPatient(patient);
    setStep(2);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!arrivalData.chief_complaint.trim()) {
      setError('Chief complaint is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const visitData = {
        patient_id: selectedPatient.patient_id,
        ...arrivalData,
      };

      const response = await erService.createVisit(visitData);
      onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register patient');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <UserPlus size={24} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Register ER Patient
              </h2>
              <p className="text-sm text-gray-600">
                {step === 1
                  ? 'Search for existing patient'
                  : 'Enter arrival information'}
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

        {/* Step 1: Search Patient */}
        {step === 1 && (
          <div className="p-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patient by MRN or Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter MRN, first name, or last name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           transition-colors disabled:bg-gray-400 flex items-center gap-2"
                >
                  <Search size={18} />
                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Found {searchResults.length} patient(s):
                </p>
                {searchResults.map(patient => (
                  <div
                    key={patient.patient_id}
                    onClick={() => handleSelectPatient(patient)}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 
                             hover:border-blue-300 cursor-pointer transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {patient.person.first_name} {patient.person.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          MRN: {patient.mrn}
                        </p>
                        <p className="text-sm text-gray-600">
                          DOB:{' '}
                          {new Date(
                            patient.person.date_of_birth,
                          ).toLocaleDateString()}{' '}
                          • {patient.person.gender}
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                        Select
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Arrival Information */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6">
            {/* Selected Patient Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Selected Patient:
              </p>
              <p className="font-semibold text-gray-800">
                {selectedPatient.person.first_name}{' '}
                {selectedPatient.person.last_name}
              </p>
              <p className="text-sm text-gray-600">
                MRN: {selectedPatient.mrn}
              </p>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2"
              >
                Change Patient
              </button>
            </div>

            {/* Arrival Mode */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Arrival Mode <span className="text-red-500">*</span>
              </label>
              <select
                value={arrivalData.arrival_mode}
                onChange={e =>
                  setArrivalData({
                    ...arrivalData,
                    arrival_mode: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="walk_in">Walk-in</option>
                <option value="ambulance">Ambulance</option>
                <option value="police">Police</option>
                <option value="helicopter">Helicopter</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Chief Complaint */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chief Complaint <span className="text-red-500">*</span>
              </label>
              <textarea
                value={arrivalData.chief_complaint}
                onChange={e =>
                  setArrivalData({
                    ...arrivalData,
                    chief_complaint: e.target.value,
                  })
                }
                placeholder="Enter patient's main complaint..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Accompanied By */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Accompanied By
              </label>
              <input
                type="text"
                value={arrivalData.accompanied_by}
                onChange={e =>
                  setArrivalData({
                    ...arrivalData,
                    accompanied_by: e.target.value,
                  })
                }
                placeholder="e.g., Spouse, Friend, EMS..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Initial Triage Level */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Triage Level <span className="text-red-500">*</span>
              </label>
              <select
                value={arrivalData.triage_level}
                onChange={e =>
                  setArrivalData({
                    ...arrivalData,
                    triage_level: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                         focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value={1}>Level 1 - Resuscitation (Critical)</option>
                <option value={2}>Level 2 - Emergency</option>
                <option value={3}>Level 3 - Urgent</option>
                <option value={4}>Level 4 - Less Urgent</option>
                <option value={5}>Level 5 - Non-Urgent</option>
              </select>
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
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 font-medium transition-colors 
                         disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Registering...' : 'Register & Start Triage'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPatientModal;
