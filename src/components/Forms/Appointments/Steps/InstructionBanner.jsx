import { Step } from './Step';

const InstructionBanner = ({
  currentStep,
  totalSteps,
  userRole = 'patient',
  isFollowUp = false,
}) => {
  // Get step configuration based on role
  const getSteps = () => {
    if (userRole === 'receptionist') {
      return [
        { number: 1, title: 'Patient', subtitle: 'Select patient' },
        { number: 2, title: 'Department', subtitle: 'Choose department' },
        { number: 3, title: 'Doctor', subtitle: 'Select doctor' },
        { number: 4, title: 'Date & Time', subtitle: 'Pick schedule' },
        { number: 5, title: 'Details', subtitle: 'Add appointment details' },
        { number: 6, title: 'Confirm', subtitle: 'Review & confirm' },
      ];
    } else {
      // Patient, Doctor, Nurse
      return [
        { number: 1, title: 'Department', subtitle: 'Choose department' },
        { number: 2, title: 'Doctor', subtitle: 'Select doctor' },
        { number: 3, title: 'Date & Time', subtitle: 'Pick schedule' },
        { number: 4, title: 'Details', subtitle: 'Add appointment details' },
        { number: 5, title: 'Confirm', subtitle: 'Review & confirm' },
      ];
    }
  };

  const steps = getSteps();

  return (
    <div className="w-full p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-bold text-center text-gray-800 mb-4">
        {isFollowUp ? 'Schedule Follow-up Appointment' : 'Book Appointment'}
        {userRole === 'receptionist' && ' for Patient'}
      </h2>

      {/* Mobile view */}
      <div className="flex flex-col space-y-4 md:hidden">
        {steps.map((step, index) => (
          <Step
            key={index}
            number={step.number}
            title={step.title}
            subtitle={step.subtitle}
            isActive={currentStep === step.number}
            isCompleted={currentStep > step.number}
            showText={true}
          />
        ))}
      </div>

      {/* Desktop view */}
      <div className="hidden md:flex flex-col items-center w-full">
        {/* Circles row */}
        <div className="flex items-center justify-between w-full relative">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex-1 flex items-center justify-center relative"
            >
              <div className="relative z-10">
                <Step
                  number={step.number}
                  title={step.title}
                  subtitle={step.subtitle}
                  isActive={currentStep === step.number}
                  isCompleted={currentStep > step.number}
                  showText={false}
                />
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gray-300 -translate-y-1/2">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: currentStep > step.number ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Labels row */}
        <div className="flex justify-between w-full mt-3">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 text-center px-1">
              <div
                className={`text-sm font-semibold ${
                  currentStep === step.number
                    ? 'text-blue-600'
                    : currentStep > step.number
                    ? 'text-green-700'
                    : 'text-gray-900'
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {step.subtitle}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructionBanner;
