import { useEffect, useState } from 'react';

import { useAuth } from '../../../contexts/AuthContext';

import OTPVerification from '../../../components/Forms/OTPVerification';
import { useNavigate } from 'react-router';
import ProfileCompletionForm from '../components/ProfileCompletionForm';
import FaceCapture from '../../../components/Scanner/FaceCapture';

const RegistrationSteps = ({ currentUser }) => {
  const { logout, resendOTP, verifyOTP } = useAuth();
  const [currentStep, setCurrentStep] = useState(
    currentUser?.registration_status || 'email_verification'
  );
  const navigate = useNavigate();

  const handleEmailVerificationSuccess = data => {
    console.log('Email verified:', data);
    setCurrentStep('personal_info_verification');
  };

  useEffect(() => {
    if (currentUser?.registration_status === 'completed') {
      navigate('/patient/my-dashboard', { replace: true });
    } else {
      setCurrentStep(currentUser?.registration_status);
    }
  }, [currentUser?.registration_status, navigate]);

  const renderStep = () => {
    switch (currentStep) {
      case 'email_verification':
        return (
          <div className="max-w-md mx-auto p-6">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verify Your Email
              </h2>
              <p className="text-gray-600">
                We've sent a verification code to your email address
              </p>
            </div>

            <OTPVerification
              email={currentUser.email}
              purpose="email_verification"
              onVerify={verifyOTP}
              onResend={resendOTP}
              onSuccess={handleEmailVerificationSuccess}
              onBack={logout}
            />
          </div>
        );
      case 'personal_info_verification':
        return (
          <div>
            <ProfileCompletionForm />
          </div>
        );
      case 'face_verification':
        return <FaceCapture />;

      default:
        return (
          <div className="max-w-md mx-auto text-center">
            <p className="text-gray-600">Invalid registration step</p>
          </div>
        );
    }
  };
  return <div className="py-8">{renderStep()}</div>;
};

export default RegistrationSteps;
