import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import Spinner from '../../components/generic/Spinner.jsx';

import RegistrationForm from '../../components/Form/RegistrationForm.jsx';
import OTPInput from '../../components/Form/OTPInput.jsx';

import { registerUser, verifyOtp } from '../../services/authApi.js';
import { useNavigate } from 'react-router';

const RegistrationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    middlename: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userId, setUserId] = useState(null);

  const canSubmit = useMemo(() => {
    const { middlename, ...requiredFields } = formData;

    // check if all required fields are filled (non-empty)
    const allFilled = Object.values(requiredFields).every(
      value => value && value.trim() !== ''
    );

    const passwordsMatch = formData.password === formData.confirmPassword;

    return allFilled && passwordsMatch && !loading;
  }, [formData, loading]);

  useEffect(() => {
    if (!step) setStep(1);
    setFormData({
      lastname: '',
      firstname: '',
      middlename: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setOtp(['', '', '', '', '', '']);
    setUserId(null);
  }, []);

  const onSubmit = async e => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('Passwords must be at least 6 Characters.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    setIsSubmitting(true);
    try {
      const apiCall = registerUser(formData);
      const delayPromise = new Promise(resolve => setTimeout(resolve, 800));

      const [apiCallResult] = await Promise.all([apiCall, delayPromise]);

      setUserId(apiCallResult.data.userId);

      toast.success(
        `Registration successful! Check your email for verification.`
      );
      setStep(2);
    } catch (e) {
      // Correctly access the error message
      console.log(e);
      const errorMessage =
        e?.response?.data.message ||
        e?.data?.data.message ||
        'An unknown error occurred.';
      toast.error(`Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      toast.error('Enter all 6 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      const verifyPromise = await verifyOtp(enteredOtp, userId);
      const delayPromise = new Promise(resolve => setTimeout(resolve, 800));
      const [apiResponse] = await Promise.all([verifyPromise, delayPromise]);

      if (!apiResponse.data.success) return toast.error('Verification failed.');

      if (apiResponse.data.success) {
        toast.success(apiResponse?.data?.message || 'Registered successfully');
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setStep(1);
        setOtp(['', '', '', '', '', '']);

        await new Promise(resolve => setTimeout(resolve, 300));

        navigate('/login');
      } else {
        toast.error(verifyPromise?.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.data?.data?.message ||
          'Something went wrong'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = e => {
    const { name, value } = e.target;
    setFormData(p => ({ ...p, [name]: value }));
  };

  const Step1 = (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 lg:p-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#172554] text-white font-bold text-lg">
          <img
            className="mx-auto h-12 w-auto"
            src="../../../public/images/logo.png"
            alt="St. Jude's Medical Logo"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl shadow-lg space-y-6">
        {/* The Registration Form section */}
        <RegistrationForm
          formData={formData}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={!canSubmit || loading}
          isSubmitting={isSubmitting}
        />

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200"
        >
          Login instead
        </button>
      </div>
    </div>
  );

  const Step2 = (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center space-y-6">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100 text-[#172554] font-bold text-lg">
          {/* You can use an icon here, like a mail icon */}
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
          We've sent a 6-digit OTP to <strong>{formData.email}</strong>. Please
          check your inbox.
        </p>

        <div className="space-y-4">
          <OTPInput setOtp={setOtp} otp={otp} />

          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={isSubmitting}
            className={`w-full bg-[#172554] text-white py-3 rounded-xl font-semibold transition-colors duration-200 ${
              isSubmitting
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <Spinner /> Verifying...
              </>
            ) : (
              'Verify Account'
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors duration-200"
          >
            Go Back
          </button>

          <p className="text-sm text-gray-500">
            Didn't receive the OTP?{' '}
            <a
              href="#"
              className="font-semibold text-blue-600 hover:text-blue-800"
            >
              Resend
            </a>
          </p>
        </div>
      </div>
    </div>
  );

  return <>{step === 1 ? Step1 : step === 2 ? Step2 : null}</>;
};

export default RegistrationPage;
