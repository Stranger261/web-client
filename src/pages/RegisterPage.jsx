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
import { LogIn } from 'lucide-react';
import { PhoneInput } from '../components/ui/PhoneInput';
import { useAuth } from '../contexts/AuthContext';

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

    return true;
  }, [formData, passwordValidation, emailValidation]);

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
    [errors, passwordValidators, emailValidators]
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, passwordValidation, emailValidation]);

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
              'Registered successfully. Please finish your account verifications.'
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
    [formData, validateForm, register]
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
    </div>
  );
};

export default RegisterPage;
