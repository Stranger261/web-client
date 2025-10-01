// components/generic/ReceptionistInstructionBanner.jsx
import React from 'react';
import {
  UserIcon,
  Building,
  Users,
  Calendar,
  FileText,
  CheckCircle,
} from 'lucide-react';

const ReceptionistInstructionBanner = ({
  currentStep,
  isFollowUp = false,
  patientName = null,
}) => {
  const steps = [
    {
      id: 0,
      title: 'Select Patient',
      description: 'Search and select the patient',
      icon: UserIcon,
    },
    {
      id: 1,
      title: 'Department',
      description: 'Choose medical department',
      icon: Building,
    },
    {
      id: 2,
      title: 'Doctor',
      description: 'Select attending physician',
      icon: Users,
    },
    {
      id: 3,
      title: 'Schedule',
      description: 'Pick date and time',
      icon: Calendar,
    },
    {
      id: 4,
      title: 'Details',
      description: 'Add reason and notes',
      icon: FileText,
    },
    {
      id: 5,
      title: 'Confirmation',
      description: 'Review and confirm',
      icon: CheckCircle,
    },
  ];

  const getStepStatus = stepId => {
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'current';
    return 'upcoming';
  };

  const getStepClasses = status => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500 text-white';
      case 'current':
        return 'bg-blue-500 border-blue-500 text-white';
      case 'upcoming':
        return 'bg-gray-200 border-gray-300 text-gray-500';
      default:
        return 'bg-gray-200 border-gray-300 text-gray-500';
    }
  };

  const getConnectorClasses = stepId => {
    return stepId < currentStep ? 'bg-green-500' : 'bg-gray-300';
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Schedule Patient Appointment
          </h1>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-600">
            {patientName && (
              <>
                <span>
                  Patient: <strong>{patientName}</strong>
                </span>
                {isFollowUp && (
                  <>
                    <span>•</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Follow-up
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;

            return (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${getStepClasses(
                      status
                    )}`}
                  >
                    {status === 'completed' ? (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="mt-2 text-center">
                    <div
                      className={`text-xs font-medium ${
                        status === 'current'
                          ? 'text-blue-600'
                          : status === 'completed'
                          ? 'text-green-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1 max-w-20">
                      {step.description}
                    </div>
                  </div>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${getConnectorClasses(
                      step.id
                    )}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Current Step Info */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              {React.createElement(steps[currentStep]?.icon, {
                className: 'w-4 h-4 text-blue-600',
              })}
              <span className="text-sm font-medium text-blue-900">
                Step {currentStep + 1} of {steps.length}:{' '}
                {steps[currentStep]?.title}
              </span>
            </div>
          </div>
        </div>

        {/* Follow-up Notice */}
        {isFollowUp && currentStep > 0 && (
          <div className="mt-4 text-center">
            <div className="inline-flex items-center px-3 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-800">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Follow-up appointment - Previous appointments may influence
              selections
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistInstructionBanner;
