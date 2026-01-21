import STEPS from '../../../../../configs/STEP';
import { Step } from './Steps';

const InstructionBanner = ({ currentStep }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-4 md:p-6 bg-white rounded-2xl shadow-md">
      <h2 className="text-xl md:text-2xl font-bold text-center text-gray-800 mb-6">
        Book an Appointment
      </h2>

      {/* Mobile view: show circle + labels together (No changes here) */}
      <div className="flex flex-col space-y-6 md:hidden">
        {STEPS.map((step, index) => (
          <Step
            key={index}
            number={step.number}
            title={step.title}
            subtitle={step.subtitle}
            isActive={currentStep === index}
            isCompleted={currentStep > index}
            showText={true}
          />
        ))}
      </div>

      {/* Desktop view: circles with connectors + labels below (Corrected) */}
      <div className="hidden md:flex flex-col items-center w-full">
        {/* Circles row */}
        <div className="flex items-center justify-between w-full relative">
          {STEPS.map((step, index) => (
            <div
              key={index}
              className="flex-1 flex items-center justify-center relative"
            >
              {/* Added a wrapper div to control stacking order */}
              <div className="relative z-10">
                <Step
                  number={step.number}
                  title={step.title}
                  subtitle={step.subtitle}
                  isActive={currentStep === index}
                  isCompleted={currentStep > index}
                  showText={false} // 👈 only circle here
                />
              </div>

              {/* Connector Line Logic */}
              {index < STEPS.length - 1 && (
                // Changed left-full to left-1/2 to start the line from the center
                <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gray-300 -translate-y-1/2">
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{ width: currentStep > index ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Labels row (No changes here) */}
        <div className="flex justify-between w-full mt-3">
          {STEPS.map((step, index) => (
            <div key={index} className="flex-1 text-center">
              <div
                className={`text-sm font-semibold ${
                  currentStep === index
                    ? 'text-blue-600'
                    : currentStep > index
                    ? 'text-green-700'
                    : 'text-gray-900'
                }`}
              >
                {step.title}
              </div>
              <div className="text-xs text-gray-500">{step.subtitle}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InstructionBanner;
