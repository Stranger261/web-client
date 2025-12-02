// src/components/Form/OTPVerification.jsx
import React from 'react';
import { ArrowLeft } from 'lucide-react';

import { Button } from '../ui/button';
import { DynamicLink } from '../ui/link';
import OTPInput from './OTPInput';

const OTPVerification = ({
  email,
  otp,
  setOtp,
  isSubmitting,
  onVerify,
  onBack,
  onResend,
}) => {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center space-y-6">
      <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-[#172554] font-bold text-lg">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Verify your Email</h2>
      <p className="text-sm text-gray-600">
        We've sent a 6-digit OTP to <strong>{email}</strong>. Please check your
        inbox.
      </p>

      <div className="space-y-4">
        <OTPInput setOtp={setOtp} otp={otp} />

        <Button
          type="button"
          variant="primary"
          size="lg"
          onClick={onVerify}
          loading={isSubmitting}
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? 'Verifying...' : 'Verify Account'}
        </Button>

        <DynamicLink
          onClick={onBack}
          variant="outline"
          size="lg"
          icon={ArrowLeft}
          className="w-full justify-center"
        >
          Go Back
        </DynamicLink>

        <p className="text-sm text-gray-500">
          Didn't receive the OTP?{' '}
          <DynamicLink
            onClick={onResend}
            variant="text"
            size="sm"
            className="font-semibold"
          >
            Resend
          </DynamicLink>
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
