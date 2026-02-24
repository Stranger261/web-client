import { useState } from 'react';
import { Shield, Lock, Smartphone } from 'lucide-react';
import TwoFactorSettings from '../../../components/Settings/TwoFactorSettings';
import ChangePasswordModal from '../../../components/Settings/modals/ChangePasswordModal';
import { useAuth } from '../../../contexts/AuthContext';

const PatientSettings = () => {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const { currentUser } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <>
      <div
        className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-6 transition-colors duration-200`}
      >
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1
              className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
            >
              Settings
            </h1>
            <p
              className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
            >
              Manage your account security and preferences
            </p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-8">
            {/* Security Section */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
                <h2
                  className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Security Settings
                </h2>
              </div>

              {/* Two-Factor Authentication */}
              <TwoFactorSettings isDarkMode={isDarkMode} />
            </section>

            {/* Password Section */}
            <section>
              <div className="flex items-center space-x-2 mb-4">
                <Lock className="h-6 w-6 text-blue-600" />
                <h2
                  className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                >
                  Password
                </h2>
              </div>

              <div
                className={`p-6 rounded-lg shadow border ${
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3
                      className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
                    >
                      Change Password
                    </h3>
                    <p
                      className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}
                    >
                      Update your password to keep your account secure
                    </p>
                    <p
                      className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
                    >
                      Password must be at least 8 characters with uppercase,
                      lowercase, and numbers
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPasswordModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        userUuid={currentUser?.user_uuid}
        isDarkMode={isDarkMode}
      />
    </>
  );
};

export default PatientSettings;
