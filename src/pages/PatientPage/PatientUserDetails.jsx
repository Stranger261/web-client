import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';

import LoadingOverlay from '../../components/generic/LoadingOverlay';

import UserInfoVerificationForm from '../../components/Form/UserInfoVerificationForm';
import SimpleFaceRecognition from '../../components/Scanner/SimpleFaceRecognition';

import { useAuth } from '../../context/AuthContext';
import { postImageForOcr } from '../../services/userVerificationApi';
import AWSFaceVerify from '../../components/Scanner/LiveFaceVerification';

const PatientUserDetails = () => {
  const {
    currentUser,
    isLoading,
    verifyUserInfo,
    completeVerification,
    updateUserInfo,
  } = useAuth();

  // Use useMemo for isStep1Complete to improve performance
  const isStep1Complete = useMemo(() => {
    return currentUser?.faceEnrollmentStatus === 'completed';
  }, [currentUser?.faceEnrollmentStatus]);

  const fileInputRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittingStep1, setIsSubmittingStep1] = useState(false);

  // ID upload state
  const [idPhoto, setIdPhoto] = useState(null);
  const [idPhotoPreview, setIdPhotoPreview] = useState(null);
  const [OCRData, setOCRData] = useState({
    idType: '',
    lastname: '',
    firstname: '',
    middlename: '',
    dateOfBirth: '',
    address: '',
  });
  const [OCROpen, setOCROpen] = useState(false);
  const [isOCRLoading, setIsOCRLoading] = useState(false);
  const [extractDataError, setExtractDataError] = useState(null);

  // Form validation
  const [errors, setErrors] = useState({});
  const [direction, setDirection] = useState(0);

  const [formData, setFormData] = useState({
    firstname: currentUser?.firstname || '',
    lastname: currentUser?.lastname || '',
    middlename: currentUser?.middlename || '',
    email: currentUser?.email || '',
    gender: currentUser?.gender || '',
    phone: currentUser?.phone || '',
    dateOfBirth: currentUser?.dateOfBirth || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    zipCode: currentUser?.zipCode || '',
    emergencyContact: currentUser?.emergencyContact || '',
    emergencyPhone: currentUser?.emergencyPhone || '',
    isVerified: currentUser?.isVerified,
    faceEnrollmentStatus: currentUser?.faceEnrollmentStatus || 'pending',
  });

  const canSubmit = useMemo(() => {
    const requiredFieldsFilled =
      formData.firstname.trim() !== '' &&
      formData.lastname.trim() !== '' &&
      formData.email.trim() !== '';

    const verificationFieldsValid =
      !!idPhoto &&
      OCRData.lastname.trim() !== '' &&
      OCRData.firstname.trim() !== '' &&
      !extractDataError;

    if (currentUser?.isVerified) {
      const originalData = {
        firstname: currentUser.firstname || '',
        lastname: currentUser.lastname || '',
        middlename: currentUser.middlename || '',
        email: currentUser.email || '',
        gender: currentUser.gender || '',
        phone: currentUser.phone || '',
        dateOfBirth: currentUser.dateOfBirth || '',
        address: currentUser.address || '',
        city: currentUser.city || '',
        zipCode: currentUser.zipCode || '',
        emergencyContact: currentUser.emergencyContact || '',
        emergencyPhone: currentUser.emergencyPhone || '',
      };

      const formSubset = Object.fromEntries(
        Object.keys(originalData).map(key => [key, formData[key] || ''])
      );

      const hasChanges =
        JSON.stringify(originalData) !== JSON.stringify(formSubset);

      return requiredFieldsFilled && hasChanges;
    }

    return requiredFieldsFilled && verificationFieldsValid;
  }, [formData, idPhoto, OCRData, extractDataError, currentUser]);

  const dateOfBirthValue = useMemo(() => {
    if (!formData.dateOfBirth) {
      return '';
    }
    return formData.dateOfBirth.slice(0, 10);
  }, [formData.dateOfBirth]);

  const handleInputChange = e => {
    const { name, value } = e.target;

    let newValue = value;

    if (name === 'phone ' || name === 'emergencyPhone') {
      newValue = value.replace(/[^0-9]/g, '');

      if (!newValue.startsWith('63')) {
        newValue = '63' + newValue;
      }
      newValue = '+' + newValue;
    }

    setFormData(prev => ({
      ...prev,
      [name]: newValue,
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFaceScanComplete = async userId => {
    try {
      console.log('Face scan completed for user ID:', userId);

      const response = await completeVerification(userId);

      if (!response?.data?.success) {
        toast.error(
          response?.data?.message ||
            'Verification unsuccessful. Please try again.'
        );
        return;
      }

      toast.success(
        response.data.message ||
          'Face verified successfully with AWS Rekognition! Verification is complete.'
      );
    } catch (error) {
      console.error('Error in handleFaceScanComplete:', error);

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Verification failed. Please try again.';

      toast.error(errorMessage);
    }
  };

  const handleIdPhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setIdPhoto(file);
      const reader = new FileReader();
      reader.onload = e => {
        setIdPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      processImage(file);
    }
  };

  const processImage = async file => {
    setIsOCRLoading(true);
    setOCROpen(true);
    try {
      setExtractDataError(null);
      const data = await postImageForOcr(file);
      if (
        !data.idType &&
        !data.fields.lastname &&
        !data.fields.firstname &&
        !data.fields.birthDate
      ) {
        setExtractDataError('Failed to extract Lastname and Firstname.');
        setIdPhoto(null);
      }

      setOCRData({
        idType: data.idType,
        lastname: data.fields.lastname || '',
        firstname: data.fields.firstname || '',
        middlename: data.fields.middlename || '',
        dateOfBirth: data.fields.birthDate || '',
        address: data.fields.address || '',
      });
    } catch (error) {
      setExtractDataError('Failed to extract data. Please try again.');
      setIdPhoto(null);
      toast.error(error.message);
    } finally {
      setIsOCRLoading(false);
    }
  };

  const handleUpdateSubmit = async () => {
    setIsSubmittingStep1(true);
    try {
      const apiCall = updateUserInfo(currentUser._id, formData);
      const delayTime = new Promise(resolve => setTimeout(resolve, 1200));

      const [apiCallResult] = await Promise.all([apiCall, delayTime]);

      if (!apiCallResult.data.success) {
        throw new Error(
          apiCallResult.response.data.message || 'Failed to update details.'
        );
      }

      toast.success('Your details have been updated successfully!');
    } catch (error) {
      console.error('Update submission error:', error);
      toast.error(error);
    } finally {
      setIsSubmittingStep1(false);
    }
  };

  // Corrected function
  const handleStep1Submit = async () => {
    if (!validateStep1() && !currentUser?.isVerified) {
      return;
    }

    if (currentUser?.isVerified) {
      await handleUpdateSubmit();
      return;
    }

    setIsSubmittingStep1(true);

    try {
      const formDataToSubmit = new FormData();

      Object.keys(formData).forEach(key => {
        formDataToSubmit.append(key, formData[key]);
      });

      formDataToSubmit.append('idPhoto', idPhoto);

      const apiCall = verifyUserInfo(formData, idPhoto);
      const delayTime = new Promise(resolve => setTimeout(resolve, 1200));

      const [apiCallResult] = await Promise.all([apiCall, delayTime]);
      console.log(apiCallResult);

      if (!apiCallResult?.success) {
        // Throw a proper Error object with a message
        throw new Error(
          apiCallResult?.response?.data?.message ||
            'Step 1 Verification failed.'
        );
      }

      toast.success(apiCallResult?.message);
      setDirection(1);
      setCurrentStep(2);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        error ||
        'An unknown error occurred.';

      toast.error(errorMessage);
    } finally {
      setIsSubmittingStep1(false);
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.firstname.trim())
      newErrors.firstname = 'First name is required';
    if (!formData.lastname.trim()) newErrors.lastname = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = 'Date of birth is required';
    if (!idPhoto) newErrors.idPhoto = 'ID photo is required';

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+63\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone must be in format +63XXXXXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && !isStep1Complete) return;
    setDirection(1);
    setCurrentStep(2);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentStep(1);
  };

  const slideVariants = {
    enter: direction => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: direction => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
  };

  const Header = () => (
    <>
      <div className="flex items-center justify-between px-16 py-4 border-b bg-base-100 border-base-300 shadow">
        <h1 className="text-2xl font-bold text-base-content py-1">
          Account Verification
        </h1>
      </div>

      <div className="mb-8">
        <div className="flex items-center py-10 justify-center space-x-4">
          <p className="text-gray-600">
            Complete your profile and verify your identity
          </p>
        </div>
        <div className="flex items-center justify-center space-x-4">
          <div
            className={`flex items-center ${
              currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {currentUser?.faceEnrollmentStatus === 'completed' ||
              isStep1Complete ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                '1'
              )}
            </div>
            <span className="ml-2 text-sm font-medium">Information</span>
          </div>

          <div
            className={`w-16 h-0.5 ${
              currentStep >= 2
                ? 'bg-blue-600'
                : currentUser?.isVerified
                ? 'bg-blue-600'
                : 'bg-gray-300'
            }`}
          ></div>

          <div
            className={`flex items-center ${
              currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep >= 2
                  ? 'bg-blue-600 text-white'
                  : currentUser?.isVerified
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {currentUser?.isVerified ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                '2'
              )}
            </div>
            <span
              className={`ml-2 text-sm font-medium ${
                currentUser?.isVerified ? 'text-blue-600' : ''
              }`}
            >
              Verification
            </span>
          </div>
        </div>
      </div>
    </>
  );

  const RenderStep2 = () => {
    return (
      <div className="bg-slate-100 p-4 sm:p-6 lg:p-8 rounded-xl w-full">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800">
              AWS Face Verification
            </h2>
            <p className="text-slate-600 mt-2">
              Please position your face in the camera frame for AWS Rekognition
              verification.
            </p>

            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700">
                🔒 Powered by AWS Rekognition for secure, enterprise-grade face
                verification
              </p>
            </div>
          </div>

          <AWSFaceVerify
            usedAt="register"
            onResult={handleFaceScanComplete}
            className="mx-auto"
          />

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>Having trouble? Make sure you have:</p>
            <ul className="mt-2 space-y-1">
              <li>• Good lighting on your face</li>
              <li>• Removed sunglasses</li>
              <li>• Positioned face clearly in frame</li>
              <li>• Stable internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) return <LoadingOverlay />;

  return (
    <div className="min-h-screen bg-white">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
            scale: { duration: 0.2 },
          }}
          className="bg-white min-h-screen"
        >
          <Header />
          {currentStep === 1 ? (
            <UserInfoVerificationForm
              userData={currentUser}
              currentStep={currentStep}
              formData={formData}
              idPhotoPreview={idPhotoPreview}
              handleIdPhotoChange={handleIdPhotoChange}
              fileInputRef={fileInputRef}
              handleInputChange={handleInputChange}
              dateOfBirthValue={dateOfBirthValue}
              extractedData={OCRData}
              isStep1Complete={isStep1Complete}
              extractDataError={extractDataError}
              errors={errors}
              OCROpen={OCROpen}
              onSubmit={handleStep1Submit}
              canSubmit={canSubmit}
              isSubmitting={isSubmittingStep1}
              isOCRLoading={isOCRLoading}
            />
          ) : (
            <RenderStep2 />
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8 flex justify-center min-w-full">
        {!currentUser?.isVerified && (
          <div className="flex justify-center items-center w-auto mb-10">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center mx-10 gap-2 px-5 py-2 bg-white text-gray-700 font-semibold rounded-lg shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <span className="text-sm font-medium text-gray-500">
              Step {currentStep} of 2
            </span>
            <button
              onClick={handleNext}
              disabled={
                currentStep === 2 || !isStep1Complete || currentUser?.isVerified
              }
              className="flex items-center mx-10 gap-2 px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientUserDetails;
