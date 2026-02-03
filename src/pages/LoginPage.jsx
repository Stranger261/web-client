// pages/LoginPage.jsx
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { ArrowLeft, Lock } from 'lucide-react';
import { DynamicLink } from '../components/ui/link';
import { Button } from '../components/ui/button';
import LoadingOverlay from '../components/shared/LoadingOverlay';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, authState } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async e => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login(formData);
      console.log(response);
      // Check if OTP is required for 2FA
      if (response?.data?.requiresOtp) {
        toast.success(response.data.message || '2FA code sent to your email.');
        navigate('/verify-otp', {
          state: {
            email: formData.email,
            deviceFingerprint: response.data.deviceFingerprint,
            mfaMethod: response.data.mfaMethod,
          },
          replace: true,
        });
        return;
      }

      toast.success(response?.message || 'Login successful.');

      // Navigate based on registration status
      if (response.data.user.registration_status === 'completed') {
        const targetPath = `/${response.data.user.role}/${
          response.data.user.role === 'patient' ? 'my-' : ''
        }dashboard`;
        navigate(targetPath, { replace: true });
      } else {
        navigate('/patient/complete-registration', { replace: true });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeHandler = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (authState === 'INITIALIZING') {
    return <LoadingOverlay />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#172554] text-white font-bold text-lg">
          <img
            className="mx-auto h-12 w-auto"
            src="/images/logo.png"
            alt="Hospital Logo"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Access your healthcare portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md bg-white p-8 rounded-3xl shadow-lg space-y-6">
        <form className="space-y-4" onSubmit={handleLogin}>
          <Input
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={e => changeHandler('email', e.target.value)}
            placeholder="you@example.com"
            required
            error={errors.email}
            icon={null}
          />

          <Input
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={e => changeHandler('password', e.target.value)}
            placeholder="Enter password here"
            required
            error={errors.password}
            icon={Lock}
          />

          <DynamicLink
            to="/forgot-password"
            variant="text"
            size="sm"
            className="font-medium"
          >
            Forgot your password?
          </DynamicLink>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <DynamicLink
              to="/register"
              variant="text"
              size="sm"
              className="font-medium"
            >
              Create new account
            </DynamicLink>
          </p>

          <DynamicLink
            to="/"
            variant="outline"
            size="sm"
            icon={ArrowLeft}
            className="justify-center"
          >
            Back to Home
          </DynamicLink>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
