import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';

const OTPVerification = ({
  email,
  purpose = 'email_verification',
  onVerify,
  onResend,
  onSuccess,
  onLogout,
  title,
  subtitle,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);
  const cooldownIntervalRef = useRef(null);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Cleanup interval on unmount
    return () => {
      if (cooldownIntervalRef.current) {
        clearInterval(cooldownIntervalRef.current);
      }
    };
  }, []);

  // Start cooldown timer
  const startCooldown = (seconds = 60) => {
    setResendCooldown(seconds);

    cooldownIntervalRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(cooldownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = e => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);

    if (/^\d+$/.test(pasteData)) {
      const newOtp = pasteData.split('').slice(0, 6);
      while (newOtp.length < 6) {
        newOtp.push('');
      }

      setOtp(newOtp);

      const nextIndex = Math.min(pasteData.length, 5);
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      // Minimum 1 second delay for better UX (so user sees the loading state)
      const [data] = await Promise.all([
        onVerify(otpCode),
        new Promise(resolve => setTimeout(resolve, 1000)),
      ]);

      toast.success('OTP verified successfully!');

      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Invalid OTP. Please try again.'
      );
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;

    setIsResending(true);

    try {
      // Minimum delay for UX consistency
      await Promise.all([
        onResend(),
        new Promise(resolve => setTimeout(resolve, 800)),
      ]);

      toast.success('OTP has been resent to your email!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0].focus();

      // Start 60 second cooldown
      startCooldown(60);
    } catch (error) {
      // Ensure minimum delay even on error for consistent UX
      await new Promise(resolve => setTimeout(resolve, 800));

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          'Failed to resend OTP. Please try again.'
      );
    } finally {
      setIsResending(false);
    }
  };

  const defaultTitles = {
    email_verification: 'Verify Your Email',
    password_reset: 'Reset Your Password',
    '2fa': 'Two-Factor Authentication',
    '2fa_trusted': 'Verify Trusted Device',
  };

  const defaultSubtitles = {
    email_verification: 'Enter the 6-digit code sent to',
    password_reset: 'Enter the 6-digit code sent to',
    '2fa': 'Enter the 6-digit code from your authenticator app or email',
    '2fa_trusted': 'Enter the 6-digit code to mark this device as trusted',
  };

  // Format cooldown time as MM:SS
  const formatCooldown = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        {title && (
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        )}
        <p className="text-sm text-gray-600">
          {subtitle || defaultSubtitles[purpose]}
        </p>
        <p className="font-medium text-gray-900 mt-1">{email}</p>
      </div>

      {/* OTP Input Fields */}
      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={e => handleChange(index, e.target.value)}
            onKeyDown={e => handleKeyDown(index, e)}
            onPaste={handlePaste}
            className="w-12 h-12 text-center text-xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <Button
          type="button"
          onClick={handleVerifyOTP}
          disabled={isSubmitting || otp.join('').length !== 6}
          className={`w-full transition-colors ${
            isSubmitting
              ? 'bg-blue-400 hover:bg-blue-400 cursor-not-allowed'
              : ''
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner size="sm" variant="minimal" message="" />
              Verifying...
            </span>
          ) : (
            'Verify OTP'
          )}
        </Button>

        <div className="text-center space-y-2">
          <div>
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={isSubmitting || isResending || resendCooldown > 0}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
            >
              {isResending ? (
                <>
                  <LoadingSpinner size="xs" variant="minimal" message="" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                `Resend OTP in ${formatCooldown(resendCooldown)}`
              ) : (
                'Resend OTP'
              )}
            </button>
          </div>

          {onLogout && (
            <div>
              <button
                type="button"
                onClick={onLogout}
                disabled={isSubmitting || isResending}
                className="text-gray-600 hover:text-gray-800 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
