import { Shield, Lock, Smartphone } from 'lucide-react';
import TwoFactorSettings from '../../../components/Settings/TwoFactorSettings';

const PatientSettings = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your account security and preferences
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-8">
          {/* Security Section */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Security Settings
              </h2>
            </div>

            {/* Two-Factor Authentication - This will fetch data on mount */}
            <TwoFactorSettings />
          </section>

          {/* Additional Settings Sections (Optional) */}
          <section>
            <div className="flex items-center space-x-2 mb-4">
              <Lock className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Password</h2>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Change Password</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Update your password to keep your account secure
                  </p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
                  Change Password
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PatientSettings;
