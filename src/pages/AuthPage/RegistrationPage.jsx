import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import UploadScanner from '../../components/Scanner/UploadScanner.jsx';
import StatusBanner from '../../components/generic/StatusBanner.jsx';
import OcrResults from '../../components/generic/OcrResults.jsx';
import Spinner from '../../components/generic/Spinner.jsx';

import RegistrationForm from '../../components/Form/RegistrationForm.jsx';
import OTPInput from '../../components/Form/OTPInput.jsx';
import FaceRecognition from '../../components/Scanner/FaceRecognition.jsx';

import {
  postImageForOcr,
  registerUser,
  verifyOtp,
  verifyUser,
} from '../../services/authApi.js';
import SimpleFaceRecognition from '../../components/Scanner/SimpleFaceRecognition.jsx';
import DebugFaceRecognition from '../../components/Scanner/DebugFaceRecognition.jsx';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [status, setStatus] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userId, setUserId] = useState(null);

  const canSubmit = useMemo(() => !!ocrData && !loading, [ocrData, loading]);

  useEffect(() => {
    if (!step) setStep(1);
    setFormData({
      fullname: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    });
    setOtp(['', '', '', '', '', '']);
    setUserId(null);
    setOcrData(null);
    setImageFile(null), setImagePreviewUrl('');
    setStatus(null);
  }, []);

  const onSubmit = async e => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    // if (
    //   !ocrData ||
    //   !ocrData['Apelyido/Last Name'] ||
    //   !ocrData['Mga Pangalan/Given Names'] ||
    //   !ocrData['Petsa ng Kapanganakan/Date of Birth']
    // ) {
    //   toast.error('Please upload a valid ID with all required information.');
    //   return;
    // }

    if (!imageFile) {
      toast.error('Please scan or upload your ID first.');
      return;
    }

    setLoading(true);
    setStatus(null);
    setIsSubmitting(true);
    try {
      const apiCall = await registerUser(formData, imageFile);
      const delayPromise = new Promise(resolve => setTimeout(resolve, 800));

      const [apiCallResult] = await Promise.all([apiCall, delayPromise]);

      setUserId(apiCallResult.data.userId);

      setStatus({
        message: 'Registration successful! Check your email for verification.',
        isError: false,
      });
      toast.success(
        `Registration successful! Check your email for verification.`
      );
      setStep(2);
    } catch (e) {
      // Correctly access the error message
      console.log(e);
      const errorMessage =
        e?.data?.data.message || 'An unknown error occurred.';
      setStatus({
        message: `Registration failed: ${errorMessage}`,
        isError: true,
      });
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

      console.log(apiResponse);

      if (!apiResponse.data.success) return toast.error('Verification failed.');

      if (verifyPromise.data.success) {
        toast.success('Account verified & registered!');
        setFormData({
          firstname: '',
          lastname: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setStep(3);
        setOtp(['', '', '', '', '', '']);
      } else {
        toast.error(verifyPromise?.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFaceScanComplete = async id => {
    try {
      const res = await verifyUser(id);
      console.log(res);
    } catch (error) {
      toast.error(error?.message);
    }
    toast.success('Face verified successfully! Registration is complete.');
  };

  const processImage = async file => {
    setLoading(true);
    setStatus(null);
    setOcrData(null);
    try {
      setImageFile(file);
      const data = await postImageForOcr(file);
      setOcrData(data.extracted_info);
      if (data.face_encoding) {
        setStatus({
          message:
            'ID scanned successfully. Click "Register and Verify" to continue.',
          isError: false,
        });
      } else if (data.face_error) {
        setStatus({
          message: `Face enrollment failed: ${data.face_error}`,
          isError: true,
        });
      }
    } catch (e) {
      setStatus({ message: `ID scan failed: ${e.message}`, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const onFileFromUpload = async file => {
    const reader = new FileReader();
    reader.onloadend = () => setImagePreviewUrl(reader.result);
    reader.readAsDataURL(file);
    await processImage(file);
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
        <p className="mt-2 text-center text-gray-600">
          Please provide your details and upload your ID.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl shadow-lg space-y-6">
        {/* The Upload ID section */}
        <div className="border border-gray-300 rounded-md p-4">
          <StatusBanner message={status?.message} isError={status?.isError} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Upload Your ID
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Please upload a clear image of your identification card.
          </p>
          <UploadScanner onFile={onFileFromUpload} />
          <OcrResults data={ocrData} />
          {/* Optional: Add a separator */}
          <hr className="my-4" />
        </div>

        {/* The Registration Form section */}
        <RegistrationForm
          formData={formData}
          onChange={onChange}
          onSubmit={onSubmit}
          disabled={!canSubmit || loading}
          isSubmitting={isSubmitting}
        />
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
          We've sent a 6-digit OTP to **{formData.email}**. Please check your
          inbox.
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

  const Step3 = (
    <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl shadow-lg space-y-6 z-20">
      <SimpleFaceRecognition
        onResult={handleFaceScanComplete}
        usedAt="register"
      />
    </div>
  );

  return (
    <>{step === 1 ? Step1 : step === 2 ? Step2 : step === 3 ? Step3 : null}</>
  );
};

export default RegistrationPage;
