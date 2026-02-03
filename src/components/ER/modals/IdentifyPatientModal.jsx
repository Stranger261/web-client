import React, { useState } from 'react';
import { X, User, Search, AlertCircle } from 'lucide-react';
import { erService } from '../../../services/erApi';
import patientService from '../../../services/patientApi';
import toast from 'react-hot-toast';

const IdentifyPatientModal = ({ isOpen, visit, onClose, onSuccess }) => {
  const [option, setOption] = useState('new'); // 'new' or 'existing'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const [personData, setPersonData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    email: '',
  });

  React.useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setOption('new');
    setSearchQuery('');
    setSearchResults([]);
    setPersonData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      phone: '',
      email: '',
    });
    setError('');
  };

  const handleSearch = async () => {
    // TODO: Implement actual patient search
    console.log('Searching for:', searchQuery);
    try {
      const resultPatient = await patientService.getPatient(searchQuery);
      console.log(resultPatient);

      setSearchResults(resultPatient.data);
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message || 'Failed to search patient.';
      toast.error(errorMsg);
    }
  };

  const handleSubmitNew = async e => {
    e.preventDefault();

    if (
      !personData.first_name ||
      !personData.last_name ||
      !personData.date_of_birth
    ) {
      setError('First name, last name, and date of birth are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await erService.identifyUnknownPatient(
        visit.patient.patient_id,
        null,
        personData,
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to identify patient');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkExisting = async patientId => {
    setLoading(true);
    setError('');

    try {
      await erService.identifyUnknownPatient(
        visit.patient.patient_id,
        patientId,
      );
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to link patient');
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
            <div className="bg-yellow-100 p-2 rounded-lg">
              <User size={24} className="text-yellow-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Identify Patient
              </h2>
              <p className="text-sm text-gray-600">
                Current MRN: {visit.patient?.mrn}
              </p>
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

        {/* Options */}
        <div className="p-6">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setOption('new')}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                option === 'new'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">Create New Patient Record</div>
              <div className="text-sm text-gray-600 mt-1">
                Enter patient details
              </div>
            </button>

            <button
              type="button"
              onClick={() => setOption('existing')}
              className={`flex-1 p-4 border-2 rounded-lg transition-all ${
                option === 'existing'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="font-medium">Link to Existing Patient</div>
              <div className="text-sm text-gray-600 mt-1">Search and link</div>
            </button>
          </div>

          {/* New Patient Form */}
          {option === 'new' && (
            <form onSubmit={handleSubmitNew}>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={personData.first_name}
                    onChange={e =>
                      setPersonData({
                        ...personData,
                        first_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={personData.last_name}
                    onChange={e =>
                      setPersonData({
                        ...personData,
                        last_name: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={personData.date_of_birth}
                    onChange={e =>
                      setPersonData({
                        ...personData,
                        date_of_birth: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={personData.gender}
                    onChange={e =>
                      setPersonData({ ...personData, gender: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={personData.phone}
                    onChange={e =>
                      setPersonData({ ...personData, phone: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={personData.email}
                    onChange={e =>
                      setPersonData({ ...personData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3">
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
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                           disabled:bg-gray-400"
                >
                  {loading ? 'Identifying...' : 'Create & Link Patient'}
                </button>
              </div>
            </form>
          )}

          {/* Existing Patient Search */}
          {option === 'existing' && (
            <div>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by MRN or name..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Search size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-500 text-center py-8">
                Search results will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IdentifyPatientModal;
