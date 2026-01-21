import { Building, Clock } from 'lucide-react';

export const DepartmentStep = ({
  onSelect,
  selected,
  departments,
  isFollowUp = false,
  previousAppointments = [],
}) => {
  // Get recommended department from previous appointments
  const getRecommendedDepartment = () => {
    if (!isFollowUp || !previousAppointments.length) return null;
    return previousAppointments[0]?.department;
  };

  const recommendedDept = getRecommendedDepartment();

  const handleDepartmentClick = department => {
    onSelect(department);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isFollowUp ? 'Select Department for Follow-up' : 'Select Department'}
        </h2>
        <p className="text-gray-600">
          {isFollowUp
            ? 'Choose the department for this follow-up appointment'
            : 'Choose the medical department for this appointment'}
        </p>
      </div>

      {/* Follow-up Recommendation */}
      {isFollowUp && recommendedDept && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-1">
                Recommended for Follow-up
              </h3>
              <p className="text-sm text-blue-800">
                Based on previous appointment:{' '}
                <strong>{recommendedDept.name}</strong>
              </p>
              <button
                onClick={() => handleDepartmentClick(recommendedDept)}
                className="mt-2 inline-flex items-center px-3 py-1 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-white hover:bg-blue-50"
              >
                Select Recommended Department
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments.map(department => {
          const isRecommended = recommendedDept?._id === department._id;
          const isSelected = selected?._id === department._id;

          return (
            <div
              key={department._id}
              onClick={() => handleDepartmentClick(department)}
              className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : isRecommended
                  ? 'border-blue-300 bg-blue-25 hover:border-blue-400'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-2 -right-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Recommended
                  </span>
                </div>
              )}

              <div className="flex items-center mb-3">
                <Building className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {department.department_name}
                </h3>
              </div>

              {department.department_code && (
                <p className="text-gray-600 text-sm mb-3">
                  {department.department_code}
                </p>
              )}

              {department.department_location && (
                <p className="text-gray-600 text-sm mb-3">
                  {department.department_location}
                </p>
              )}

              {department.headOfDepartment && (
                <p className="text-xs text-gray-500">
                  Head: Dr. {department.headOfDepartment.first_name}{' '}
                  {department.headOfDepartment.last_name}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Selection Summary */}
      {selected && (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">
            <strong>Selected:</strong> {selected.name}
            {isFollowUp && recommendedDept?._id === selected._id && (
              <span className="ml-2 text-green-600">
                (Recommended follow-up department)
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
