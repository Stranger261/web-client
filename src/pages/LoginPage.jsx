import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router';

import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { ArrowLeft, Lock } from 'lucide-react';
import { DynamicLink } from '../components/ui/link';
import { Button } from '../components/ui/button';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
    console.log(Object.keys(newErrors));
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async e => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await new Promise(res => setTimeout(res, 1000));
      const response = await login(formData);
      const delay = new Promise(res => setTimeout(res, 1000));

      console.log(response);
      // const [apiCallRes, ]
      toast.success(response?.message || 'Login successfully.');
      if (response.data.user.registration_status === 'completed') {
        navigate(
          `/${response.data.user.role}/${
            response.data.user.role === 'patient' ? 'my-' : ''
          }dashboard`
        );
      } else {
        navigate('/patient/complete-registration');
      }
    } catch (error) {
      await new Promise(res => setTimeout(res, 1000));
      const errorMessage =
        error?.response?.message || error?.message || 'Please try again later.';
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#172554] text-white font-bold text-lg">
          <img
            className="mx-auto h-12 w-auto"
            src="/images/logo.png"
            alt="St. Jude's Medical Logo"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Registration
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to continue your registration process
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

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#172554] focus:ring-[#172554] border-gray-300 rounded"
              />

              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
          </div>

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
            Dont have an account?{' '}
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
