import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';

const RegistrationLayout = () => {
  const { logout, currentUser } = useAuth();
  const navigate = useNavigate();

  const [isLoggingout, setIsLoggingout] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingout(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingout(true);
    }
  };

  const getProgress = () => {
    const steps = [
      'email_verification',
      'personal_info_verification',
      'face_verification',
      'completed',
    ];

    const currentIndex = steps.indexOf(currentUser.registration_status);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const getStepLabel = () => {
    const labels = {
      email_verification: 'Step 1 of 3: Email Verification',
      personal_info_verification: 'Step 2 of 3: Personal Information',
      face_verification: 'Step 3 of 3: Face Verification',
    };
    return (
      labels[currentUser?.registration_status] || 'Complete Your Registration'
    );
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Logout */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">HVill</h1>
            </div>

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700">
              {getStepLabel()}
            </p>
            <p className="text-sm text-gray-500">
              {Math.round(getProgress())}% Complete
            </p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getProgress()}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Footer (Optional) */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            Need help? Contact support@hvill.com
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RegistrationLayout;
