import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { useAuth } from '../../../contexts/AuthContext';

import OTPVerification from '../../../components/Forms/OTPVerification';
import ProfileCompletionForm from '../components/registration/ProfileCompletionForm';
import FaceCapture from '../../../components/Scanner/FaceCapture';
import LoadingOverlay from '../../../components/shared/LoadingOverlay';
import toast from 'react-hot-toast';

const RegistrationSteps = () => {
  // Get currentUser directly from context, not as a prop
  const { currentUser, logout, resendOTP, verifyOTP, isLoading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState('email_verification');

  useEffect(() => {
    if (currentUser?.registration_status) {
      setStep(currentUser.registration_status);
    }
  }, [currentUser?.registration_status]);

  // useEffect(() => {
  //   if (currentUser?.registration_status === 'completed') {
  //     navigate('/patient/my-dashboard', { replace: true });
  //   }
  // }, [currentUser?.registration_status, navigate]);

  const handleEmailVerificationSuccess = () => {
    setStep('personal_info_verification');
  };

  const handlePersonalInfoSuccess = () => {
    toast.success('Personal info completed.');
    setStep('face_verification');
  };

  const handleFaceVerificationSuccess = async response => {
    // Show success message
    toast.success('Face verification completed! Redirecting to login...', {
      duration: 2000,
    });

    // ✅ Logout immediately - this clears auth state and prevents any more API calls
    setTimeout(() => {
      logout(); // This will clear tokens and redirect to login
    }, 1500);
  };

  useEffect(() => {
    if (currentUser?.registration_status === 'completed') {
      navigate('/patient/my-dashboard', { replace: true });
    }
  }, [currentUser?.registration_status, navigate]);

  // Show loading only when actively loading
  if (isLoading) {
    return <LoadingOverlay showLogo={true} message="Loading..." />;
  }

  // Show loading if no user data yet
  if (!currentUser) {
    return <LoadingOverlay showLogo={true} message="Loading user data..." />;
  }

  const renderStep = () => {
    switch (step) {
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
            <ProfileCompletionForm onComplete={handlePersonalInfoSuccess} />
          </div>
        );
      case 'face_verification':
        return <FaceCapture onSuccess={handleFaceVerificationSuccess} />;

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
