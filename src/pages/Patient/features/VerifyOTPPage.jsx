import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import { useAuth } from '../../../contexts/AuthContext';
import { Button } from '../../../components/ui/button';
import { DynamicLink } from '../../../components/ui/link';
import OTPVerification from '../../../components/Forms/OTPVerification';
import LoadingOverlay from '../../../components/shared/LoadingOverlay';

const VerifyOTPPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTPAndLogin, resendOTPLogin } = useAuth();

  const [email, setEmail] = useState('');
  const [deviceFingerprint, setDeviceFingerprint] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [trustDevice, setTrustDevice] = useState(false);
  const [mfaMethod, setMfaMethod] = useState('email');

  useEffect(() => {
    // Get data from navigation state
    const stateData = location.state;

    if (!stateData?.email) {
      toast.error('Invalid access. Please login again.');
      navigate('/login', { replace: true });
      return;
    }

    setEmail(stateData.email);
    setDeviceFingerprint(stateData.deviceFingerprint || '');
    setRememberMe(stateData.rememberMe || false);
    setMfaMethod(stateData.mfaMethod || 'email');
  }, [location.state, navigate]);

  const handleVerify = async otpCode => {
    try {
      const response = await verifyOTPAndLogin({
        email,
        otpCode,
        trustDevice,
        rememberMe,
        deviceFingerprint,
      });

      toast.success('Login successful!');

      // Navigate based on registration status
      if (response.data.user.registration_status === 'completed') {
        const targetPath = `/${response.data.user.role}/${
          response.data.user.role === 'patient' ? 'my-' : ''
        }dashboard`;
        navigate(targetPath, { replace: true });
      } else {
        navigate('/patient/complete-registration', { replace: true });
      }

      return response;
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        error?.message ||
        'OTP Verification failed.';
      toast.error(errorMsg);
      throw error;
    }
  };

  const handleResend = async () => {
    try {
      await resendOTPLogin(email);
      return { success: true };
    } catch (error) {
      toast.error('Failed to resend OTP.');
      throw error;
    }
  };

  const handleBack = () => {
    navigate('/login', { replace: true });
  };

  if (!email) {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#172554] text-white font-bold text-lg">
          <img
            className="mx-auto h-12 w-auto"
            src="/images/logo.png"
            alt="Hospital Logo"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Two-Factor Authentication
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Verify your identity to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl shadow-lg space-y-6">
        <OTPVerification
          email={email}
          purpose="2fa"
          onVerify={handleVerify}
          onResend={handleResend}
          onLogout={handleBack}
          title="Enter Verification Code"
          subtitle={`We sent a 6-digit code to your ${mfaMethod}`}
        />

        {/* Trust Device Option */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center">
            <input
              id="trust-device"
              name="trust-device"
              type="checkbox"
              checked={trustDevice}
              onChange={e => setTrustDevice(e.target.checked)}
              className="h-4 w-4 text-[#172554] focus:ring-[#172554] border-gray-300 rounded"
            />
            <label
              htmlFor="trust-device"
              className="ml-2 block text-sm text-gray-900"
            >
              Trust this device for 7 days
            </label>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            You won't need to verify again on this device for 7 days
          </p>
        </div>

        <div className="text-center">
          <DynamicLink
            to="/login"
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            className="justify-center"
          >
            Back to Login
          </DynamicLink>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTPPage;
