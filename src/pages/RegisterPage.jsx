import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router';
import { usePasswordValidators, validateValue } from '../utils/validators';
import { toast } from 'react-hot-toast';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { DynamicLink } from '../components/ui/link';
import { LogIn } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();

  const registerUser = () => {};

  const [formData, setFormData] = useState({
    email: '',
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

  const passwordValidators = usePasswordValidators();

  const canSubmit = useCallback(() => {
    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return false;
    if (!passwordValidation.allValid) return false;
    if (password !== confirmPassword) return false;

    return true;
  }, [formData, passwordValidation]);

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData(prev => ({ ...prev, [field]: value }));

      // real-time validate password
      if (field === 'password') {
        const validation = validateValue(value, passwordValidators);
        console.log(validation);
        setPasswordValidation(validation);
      }

      // clear field-specific error when user starts typing
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }

      // clear confirm password error when password changes
      if (
        (field === 'password' || field === 'confirmPassword') &&
        errors.confirmPassword
      ) {
        setErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    },
    [errors, passwordValidators]
  );

  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
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
  }, [formData, passwordValidation]);

  const onSubmitForm = useCallback(
    async e => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsSubmitting(true);
      try {
        const response = await registerUser({
          email: formData.email,
          password: formData.password,
        });

        if (response.data.success) {
          toast.success(
            'Registered successfully. Please finish your account verifications.'
          );

          // would redirect to patient dashboard
          // setTimeout(() => {
          //   navigate('/login');
          // }, 2000);
        }
      } catch (error) {
        console.error('Registration error:', error);
        const errorMessage =
          error?.response?.data?.message ||
          'Registration failed. Please try again.';

        toast.error(errorMessage);
        setErrors({ submit: errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm]
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
          />

          <div className="space-y-2">
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={e => handleInputChange('password', e.target.value)}
              placeholder="Enter password here"
              required
              error={errors.password}
            />

            {formData.password && (
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-700">
                  Password must contain:
                </p>
                <div className="space-y-1">
                  {passwordValidation.results.map((validator, index) => (
                    <div key={index} className="flex items-center text-xs">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          validator.isValid ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                      <span
                        className={
                          validator.isValid ? 'text-green-600' : 'text-gray-500'
                        }
                      >
                        {validator.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={e => handleInputChange('confirmPassword', e.target.value)}
            placeholder="Confirm your password"
            required
            error={errors.confirmPassword}
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
