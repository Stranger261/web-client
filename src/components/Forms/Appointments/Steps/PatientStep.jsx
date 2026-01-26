// components/Steps/PatientStep.jsx
import { useState } from 'react';
import { Search, User, Phone, IdCard } from 'lucide-react';
import { calculateAge } from '../../../../utils/patientHelpers';
import toast from 'react-hot-toast';
import WalkInPatientRegistration from '../../../../pages/Receptionist/components/patientRegistration/WalkInPatientRegistration';

export const PatientStep = ({
  onSelect,
  selected,
  patients,
  searchTerm,
  onSearchChange,
  isLoadingHistory,
}) => {
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);

  const handleRegisterPatient = () => {
    toast.success('New patient registered.');
  };

  const handlePatientClick = patient => {
    onSelect(patient);
  };

  const PatientCard = ({ patient, isSelected }) => (
    <div
      onClick={() => handlePatientClick(patient)}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">
              {patient.fullName ||
                patient.displayName ||
                `${patient.person.first_name} ${patient.person.last_name}`}
            </h3>
          </div>

          <div className="space-y-1 text-sm text-gray-600">
            {patient.mrn && (
              <div className="flex items-center gap-2">
                <IdCard className="h-4 w-4" />
                <span className="font-mono">MRN: {patient.mrn}</span>
              </div>
            )}

            {patient.person?.user?.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{patient.person?.user?.phone}</span>
              </div>
            )}

            {patient.person?.user?.email && (
              <div className="text-gray-500">{patient.person?.user?.email}</div>
            )}

            {patient.person.date_of_birth && (
              <div className="text-gray-500">
                DOB:{' '}
                {new Date(patient.person.date_of_birth).toLocaleDateString()}
                {` (Age: ${calculateAge(patient.person.date_of_birth)})`}
              </div>
            )}
          </div>
        </div>

        {isSelected && (
          <div className="ml-4">
            {isLoadingHistory ? (
              <div className="flex items-center gap-2 text-blue-600">
                <Spinner size="small" />
                <span className="text-sm">Loading history...</span>
              </div>
            ) : (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <WalkInPatientRegistration
        isOpen={showNewPatientForm}
        onClose={() => setShowNewPatientForm(false)}
        onSuccess={handleRegisterPatient}
      />

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Patient
        </h2>
        <p className="text-gray-600">
          Search and select the patient for this appointment
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by name, MRN, phone, or email..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Results Info */}
      <div className="text-center text-sm text-gray-500">
        {searchTerm ? (
          <span>
            Found {patients.length} patient{patients.length !== 1 ? 's' : ''}{' '}
            matching "{searchTerm}"
          </span>
        ) : (
          <span>Showing all {patients.length} patients</span>
        )}
      </div>

      {/* Patient List */}
      <div className="max-h-96 overflow-y-auto">
        {patients.length > 0 ? (
          <div className="grid gap-4">
            {patients.map(patient => (
              <PatientCard
                key={patient.patient_id || patient.id}
                patient={patient}
                isSelected={
                  selected?._id === patient._id || selected?.id === patient.id
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No patients found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? `No patients match "${searchTerm}". Try a different search term.`
                : 'No patients available in the system.'}
            </p>

            {/* Option to create new patient */}
            <div className="mt-6">
              <button
                onClick={() => setShowNewPatientForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Create New Patient
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Selected Patient Summary */}
      {selected && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="font-medium text-green-900">Patient Selected</h3>
          </div>
          <p className="text-green-700">
            <strong>{selected.fullName || selected.displayName}</strong>
            {selected.mrn && (
              <span className="ml-2 font-mono">({selected.mrn})</span>
            )}
          </p>
          {isLoadingHistory && (
            <p className="text-sm text-green-600 mt-1">
              Checking appointment history...
            </p>
          )}
        </div>
      )}
    </div>
  );
};
