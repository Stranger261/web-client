import { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { PersonalInfoForm } from './personal-info-form';
import { AddressInfoForm } from './address-info-form';
import { EmergencyContactForm } from './emergency-contact-form';
import { IdentificationForm } from './identification-form';
import { CheckCircle } from 'lucide-react';

const ProfileCompletionForm = ({ ocrData, onComplete, onBack }) => {
  const { completePersonalInfo, currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Info (pre-filled from OCR if available)
    first_name: ocrData?.fields?.firstname || '',
    last_name: ocrData?.fields?.lastname || '',
    middle_name: ocrData?.fields?.middlename || '',
    suffix: ocrData?.fields?.suffix || '',
    date_of_birth: ocrData?.fields?.birthDate
      ? new Date(ocrData.fields.birthDate).toISOString().split('T')[0]
      : '',
    gender: ocrData?.fields?.sex
      ? ocrData.fields.sex.toLowerCase() === 'male'
        ? 'male'
        : ocrData.fields.sex.toLowerCase() === 'female'
        ? 'female'
        : ''
      : '',
    contact_number: currentUser.phone || '+63',
    email: currentUser?.email || '',

    // Address Info
    street: ocrData?.fields?.address || '',
    barangay_code: '',
    city_code: '',
    province_code: '',
    region_code: '',
    postal_code: '',

    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_number: '',
    emergency_contact_relationship: '',

    // Identification
    id_type: ocrData?.idType || '',
    id_number: ocrData?.fields?.idNumber || '',
    id_image: null,
  });

  const steps = [
    { name: 'Personal Info', title: 'Personal Information' },
    { name: 'Address', title: 'Address Information' },
    { name: 'Emergency Contact', title: 'Emergency Contact' },
    { name: 'Verification', title: 'Identity Verification' },
  ];

  const handleChange = updates => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await completePersonalInfo(formData);

      if (result.success) {
        toast.success('Profile completed successfully!');
        if (onComplete) {
          onComplete();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to complete profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Step Circles */}
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  index < currentStep
                    ? 'bg-blue-600 text-white'
                    : index === currentStep
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-400'
                }`}
              >
                {step.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {steps[currentStep].title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Step 1: Personal Info */}
        {currentStep === 0 && (
          <PersonalInfoForm
            data={formData}
            onChange={handleChange}
            onNext={handleNext}
          />
        )}

        {/* Step 2: Address */}
        {currentStep === 1 && (
          <AddressInfoForm
            data={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 3: Emergency Contact */}
        {currentStep === 2 && (
          <EmergencyContactForm
            data={formData}
            onChange={handleChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {/* Step 4: Identification */}
        {currentStep === 3 && (
          <IdentificationForm
            data={formData}
            onChange={handleChange}
            onNext={handleSubmit}
            onBack={handleBack}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileCompletionForm;
