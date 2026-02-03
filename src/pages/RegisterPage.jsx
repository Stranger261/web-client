import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  usePasswordValidators,
  useEmailValidators,
  validateValue,
} from '../utils/validators';
import { toast } from 'react-hot-toast';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { DynamicLink } from '../components/ui/link';
import { LogIn, ExternalLink, Check } from 'lucide-react';
import { PhoneInput } from '../components/ui/PhoneInput';
import { useAuth } from '../contexts/AuthContext';
import { TermsModal } from '../components/Modals/TermsModal';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    phone: '+63',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    results: [],
    isValid: false,
    allValid: false,
  });
  const [emailValidation, setEmailValidation] = useState({
    results: [],
    isValid: false,
    allValid: false,
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const passwordValidators = usePasswordValidators();
  const emailValidators = useEmailValidators();

  const canSubmit = useCallback(() => {
    const { email, phone, password, confirmPassword } = formData;

    const phoneNumber = formData.phone.replace('+63', '');

    if (!email || !phone || !password || !confirmPassword) return false;
    if (!/^9\d{9}$/.test(phoneNumber)) return false;
    if (!emailValidation.allValid) return false;
    if (!passwordValidation.allValid) return false;
    if (password !== confirmPassword) return false;
    if (!acceptedTerms) return false; // Added terms acceptance check

    return true;
  }, [formData, passwordValidation, emailValidation, acceptedTerms]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // Real-time validate email
      if (field === 'email') {
        const validation = validateValue(value, emailValidators);
        setEmailValidation(validation);
      }

      // Real-time validate password
      if (field === 'password') {
        const validation = validateValue(value, passwordValidators);
        setPasswordValidation(validation);
      }

      // Clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }

      // Clear confirm password error when password changes
      if (
        (field === 'password' || field === 'confirmPassword') &&
        errors.confirmPassword
      ) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    },
    [errors, passwordValidators, emailValidators],
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailValidation.allValid) {
      newErrors.email = 'Email is invalid';
    }

    const phoneNumber = formData.phone.replace('+63', '');
    if (!phoneNumber) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^9\d{9}$/.test(phoneNumber)) {
      newErrors.phone =
        'Invalid PH mobile number (should start with 9 and be 10 digits)';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordValidation.allValid) {
      newErrors.password = 'Password does not meet requirements';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'You must accept the Terms and Conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, passwordValidation, emailValidation, acceptedTerms]);

  const onSubmitForm = useCallback(
    async e => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const response = await register({
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        if (response.success) {
          toast.success(
            response.message ||
              'Registered successfully. Please finish your account verifications.',
          );
        }
        navigate('/patient/complete-registration');
      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          'Registration failed. Please try again.';

        toast.error(errorMessage);
        setErrors({ submit: errorMessage });
        await new Promise(res => setTimeout(res, 1000));
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, register],
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 lg:p-6">
      {/* header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="">
          <img
            className="mx-auto h-12 w-auto"
            src="/images/logo.png"
            alt="St. Jude's Medical Logo"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email and password to get started
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl shadow-lg space-y-6">
        <form className="space-y-4" onSubmit={onSubmitForm}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            placeholder="you@example.com"
            required
            error={errors.email}
            validationRules={emailValidators}
            showValidation={true}
          />

          <PhoneInput
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={e =>
              handleInputChange('phone', e.target.fullValue || '+63')
            }
            placeholder="9XXXXXXXXX"
            required
            error={errors.phone}
            countryCode="+63"
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={e => handleInputChange('password', e.target.value)}
            placeholder="Enter password here"
            required
            error={errors.password}
            validationRules={passwordValidators}
            showValidation={true}
          />

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            required
            error={errors.confirmPassword}
            matchValue={formData.password}
            matchLabel="Password"
          />

          {/* Terms and Conditions Checkbox */}
          <div className="pt-2">
            <div className="flex items-start space-x-3">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={e => setAcceptedTerms(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700">
                  I accept the Terms and Conditions & Privacy Policy
                </label>
                <p className="text-gray-600 mt-1">
                  By checking this box, you acknowledge that you have read,
                  understood, and agree to our hospital management system
                  policies, including that authorized doctors may access your
                  medical records for treatment purposes.
                </p>
                <button
                  type="button"
                  onClick={() => setShowTermsModal(true)}
                  className="inline-flex items-center mt-2 text-blue-600 hover:text-blue-800 font-medium"
                >
                  <span>View full Terms and Conditions</span>
                  <ExternalLink className="ml-1 h-4 w-4" />
                </button>
                {errors.terms && (
                  <p className="mt-2 text-sm text-red-600">{errors.terms}</p>
                )}
              </div>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{errors.submit}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting || !canSubmit()}
            className="w-full"
          >
            {isSubmitting ? 'Creating new Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <DynamicLink
              to="/login"
              variant="text"
              size="sm"
              icon={LogIn}
              className="font-semibold"
            >
              Sign in
            </DynamicLink>
          </p>
        </div>
      </div>

      {showTermsModal && (
        <TermsModal
          showTermsModal={showTermsModal}
          setShowTermsModal={setShowTermsModal}
          setAcceptedTerms={setAcceptedTerms}
        />
      )}
    </div>
  );
};

export default RegisterPage;
