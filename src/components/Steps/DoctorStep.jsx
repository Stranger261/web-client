// components/Steps/DoctorStep.jsx
import { User, Star, Clock } from 'lucide-react';

export const DoctorStep = ({
  onSelect,
  doctors,
  selectedDoctor,
  selectedDept,
  isFollowUp = false,
  previousAppointments = [],
}) => {
  // Get recommended doctor from previous appointments
  const getRecommendedDoctor = () => {
    if (!isFollowUp || !previousAppointments.length) return null;
    const lastAppt = previousAppointments[0];
    return lastAppt?.doctor;
  };

  const recommendedDoctor = getRecommendedDoctor();

  const handleDoctorClick = doctor => {
    onSelect(doctor);
  };

  const handleAnyDoctorClick = () => {
    onSelect(null); // null means "any doctor"
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isFollowUp ? 'Select Doctor for Follow-up' : 'Select Doctor'}
        </h2>
        <p className="text-gray-600">
          Choose a doctor from <strong>{selectedDept?.name}</strong>
          {isFollowUp && ' for this follow-up appointment'}
        </p>
      </div>

      {/* Follow-up Recommendation */}
      {isFollowUp && recommendedDoctor && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Recommended for Follow-up
              </h3>
              <p className="text-sm text-blue-800 mb-2">
                Previous doctor:{' '}
                <strong>
                  Dr. {recommendedDoctor.firstname} {recommendedDoctor.lastname}
                </strong>
                {recommendedDoctor.specialization && (
                  <span> - {recommendedDoctor.specialization}</span>
                )}
              </p>
              <button
                onClick={() => handleDoctorClick(recommendedDoctor)}
                className="inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
              >
                Continue with Same Doctor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Any Doctor Option */}
      <div
        onClick={handleAnyDoctorClick}
        className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
          selectedDoctor === null
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-200 hover:border-blue-300'
        }`}
      >
        <div className="flex items-center">
          <User className="h-6 w-6 text-gray-500 mr-3" />
          <div>
            <h3 className="font-medium text-gray-900">Any Available Doctor</h3>
            <p className="text-sm text-gray-600">
              We'll assign the next available doctor in {selectedDept?.name}
            </p>
          </div>
        </div>
      </div>

      {/* Doctor List */}
      <div className="space-y-4">
        {/* Recommended Doctor First (if exists and not already selected via quick button) */}
        {recommendedDoctor && selectedDoctor?._id !== recommendedDoctor._id && (
          <div className="border-2 border-blue-300 rounded-lg p-1 bg-gradient-to-r from-blue-50 to-blue-25">
            <div
              onClick={() => handleDoctorClick(recommendedDoctor)}
              className="relative p-4 bg-white rounded-lg cursor-pointer transition-all hover:shadow-md border border-blue-200 hover:border-blue-400"
            >
              <div className="absolute -top-2 -right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500 text-white shadow-sm">
                  <Star className="h-3 w-3 mr-1" />
                  Recommended
                </span>
              </div>

              <div className="flex items-start">
                <div className="p-2 bg-blue-100 rounded-lg mr-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">
                    Dr. {recommendedDoctor.firstname}{' '}
                    {recommendedDoctor.lastname}
                  </h3>

                  {recommendedDoctor.specialization && (
                    <p className="text-blue-600 font-semibold">
                      {recommendedDoctor.specialization}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-sm">
                    {recommendedDoctor.experience && (
                      <span className="text-gray-600">
                        {recommendedDoctor.experience} years experience
                      </span>
                    )}

                    {recommendedDoctor.availableToday && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Available Today
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm text-blue-700 bg-blue-50 rounded p-2">
                    <strong>Why recommended:</strong> This doctor treated the
                    patient in their previous appointment
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {doctors.map(doctor => {
            // Skip recommended doctor if already shown above
            if (recommendedDoctor && doctor._id === recommendedDoctor._id) {
              return null;
            }

            const isSelected = selectedDoctor?._id === doctor._id;

            return (
              <div
                key={doctor._id}
                onClick={() => handleDoctorClick(doctor)}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-start">
                  <div className="p-2 bg-gray-100 rounded-lg mr-3">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      Dr. {doctor.firstname} {doctor.lastname}
                    </h3>

                    {doctor.specialization && (
                      <p className="text-sm text-blue-600 font-medium">
                        {doctor.specialization}
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-2">
                      {doctor.experience && (
                        <span className="text-xs text-gray-500">
                          {doctor.experience} years exp.
                        </span>
                      )}

                      {doctor.availableToday && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Available Today
                        </span>
                      )}

                      {doctor.rating && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          ⭐ {doctor.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="ml-2">
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
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* No Doctors Available */}
      {doctors.length === 0 && (
        <div className="text-center py-8">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No doctors available
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            No doctors found in {selectedDept?.name}. Please select a different
            department.
          </p>
        </div>
      )}

      {/* Selection Summary */}
      {selectedDoctor !== undefined && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            <strong>Selected:</strong>{' '}
            {selectedDoctor === null ? (
              'Any Available Doctor'
            ) : (
              <>
                Dr. {selectedDoctor.firstname} {selectedDoctor.lastname}
                {selectedDoctor.specialization &&
                  ` - ${selectedDoctor.specialization}`}
                {isFollowUp &&
                  recommendedDoctor?._id === selectedDoctor._id && (
                    <span className="ml-2 text-green-600">
                      (Same as previous appointment)
                    </span>
                  )}
              </>
            )}
          </p>
        </div>
      )}

      {/* Follow-up Continuity Note */}
      {isFollowUp &&
        selectedDoctor &&
        recommendedDoctor &&
        selectedDoctor._id === recommendedDoctor._id && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Continuity of Care:</strong> Continuing with the same
              doctor ensures better follow-up care and familiarity with the
              patient's medical history.
            </p>
          </div>
        )}
    </div>
  );
};
