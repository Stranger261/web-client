// components/Settings/TwoFactorSettings.jsx
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Smartphone, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import ConfirmationModal from './modals/ConfirmationModal';
import authApi from '../../services/authApi';

const TwoFactorSettings = () => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [mfaMethod, setMfaMethod] = useState('disabled');
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [error, setError] = useState(null);

  // Modal states
  const [showDisable2FAModal, setShowDisable2FAModal] = useState(false);
  const [showRevokeDeviceModal, setShowRevokeDeviceModal] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([load2FAStatus(), loadTrustedDevices()]);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setError('Failed to load security settings. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const load2FAStatus = async () => {
    try {
      const response = await authApi.get2FAStatus();
      console.log('2FA Status:', response.data);

      setIs2FAEnabled(response.data.enabled || false);
      setMfaMethod(response.data.method || 'disabled');
    } catch (error) {
      console.error('Failed to load 2FA status:', error);
      if (error.response?.status !== 404) {
        throw error;
      }
    }
  };

  const loadTrustedDevices = async () => {
    try {
      const response = await authApi.getTrustedDevices();
      console.log('Trusted Devices:', response.data);

      setTrustedDevices(response.data || []);
    } catch (error) {
      console.error('Failed to load trusted devices:', error);
      if (error.response?.status !== 404) {
        setTrustedDevices([]);
      }
    }
  };

  const handleToggle2FA = async () => {
    if (is2FAEnabled) {
      // Show confirmation modal for disabling
      setShowDisable2FAModal(true);
    } else {
      // Enable directly
      await enable2FA();
    }
  };

  const enable2FA = async () => {
    setIsToggling(true);
    try {
      await authApi.enable2FA('email');
      toast.success(
        '2FA enabled successfully. You will need to verify with a code on your next login.',
      );
      setIs2FAEnabled(true);
      setMfaMethod('email');
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to enable 2FA. Please try again.';
      toast.error(errorMessage);
      console.error('Enable 2FA error:', error);
    } finally {
      setIsToggling(false);
    }
  };

  const disable2FA = async () => {
    setIsConfirming(true);
    try {
      await authApi.disable2FA();
      toast.success('2FA disabled successfully');
      setIs2FAEnabled(false);
      setMfaMethod('disabled');
      setTrustedDevices([]);
      setShowDisable2FAModal(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to disable 2FA. Please try again.';
      toast.error(errorMessage);
      console.error('Disable 2FA error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRevokeDeviceClick = deviceId => {
    setSelectedDeviceId(deviceId);
    setShowRevokeDeviceModal(true);
  };

  const revokeDevice = async () => {
    if (!selectedDeviceId) return;

    setIsConfirming(true);
    try {
      await authApi.revokeTrustedDevice(selectedDeviceId);
      toast.success('Device removed successfully');
      await loadTrustedDevices();
      setShowRevokeDeviceModal(false);
      setSelectedDeviceId(null);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        'Failed to remove device. Please try again.';
      toast.error(errorMessage);
      console.error('Revoke device error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleRefresh = () => {
    loadAllSettings();
  };

  const getSelectedDeviceName = () => {
    const device = trustedDevices.find(d => d.device_id === selectedDeviceId);
    return device ? device.device_type.replace(/_/g, ' ') : 'this device';
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading security settings...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow border border-red-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900">
              Error Loading Settings
            </h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="mt-3"
            >
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* 2FA Toggle */}
        <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-gray-600">
                  Add an extra layer of security to your account
                </p>
              </div>
            </div>
            <Button
              onClick={handleToggle2FA}
              loading={isToggling}
              disabled={isToggling}
              variant={is2FAEnabled ? 'outline' : 'primary'}
              className={
                is2FAEnabled
                  ? 'border-red-300 text-red-600 hover:bg-red-50'
                  : ''
              }
            >
              {isToggling
                ? is2FAEnabled
                  ? 'Disabling...'
                  : 'Enabling...'
                : is2FAEnabled
                  ? 'Disable 2FA'
                  : 'Enable 2FA'}
            </Button>
          </div>

          {/* Status Badge */}
          {is2FAEnabled ? (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-6 w-6 rounded-full bg-green-100">
                    <span className="text-green-600 font-bold text-sm">✓</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-green-900">
                    Two-Factor Authentication is Active
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    Authentication method:{' '}
                    <span className="font-semibold capitalize">
                      {mfaMethod}
                    </span>
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    You will be asked to enter a verification code sent to your{' '}
                    {mfaMethod} when logging in from new devices.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">
                    Two-Factor Authentication is Disabled
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Your account is less secure without 2FA. Enable it to
                    protect your account from unauthorized access.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trusted Devices */}
        {is2FAEnabled && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold">Trusted Devices</h3>
                  <p className="text-sm text-gray-600">
                    {trustedDevices.length === 0
                      ? 'No trusted devices yet'
                      : `${trustedDevices.length} trusted ${trustedDevices.length === 1 ? 'device' : 'devices'}`}
                  </p>
                </div>
              </div>
              {trustedDevices.length > 0 && (
                <Button onClick={loadTrustedDevices} variant="ghost" size="sm">
                  Refresh
                </Button>
              )}
            </div>

            {trustedDevices.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <Smartphone className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium">No trusted devices</p>
                <p className="text-sm text-gray-500 mt-1">
                  When you check "Trust this device" during login, it will
                  appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {trustedDevices.map(device => {
                  const isExpired = new Date(device.expires_at) < new Date();
                  const expiresIn = Math.ceil(
                    (new Date(device.expires_at) - new Date()) /
                      (1000 * 60 * 60 * 24),
                  );

                  return (
                    <div
                      key={device.device_id}
                      className={`
                      flex items-center justify-between p-4 border rounded-lg transition-colors
                      ${isExpired ? 'border-red-200 bg-red-50' : 'border-gray-200 hover:bg-gray-50'}
                    `}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`
                        p-2 rounded-full
                        ${isExpired ? 'bg-red-100' : 'bg-gray-100'}
                      `}
                        >
                          <Smartphone
                            className={`h-5 w-5 ${isExpired ? 'text-red-600' : 'text-gray-600'}`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium capitalize">
                              {device.device_type.replace(/_/g, ' ')}
                            </p>
                            {isExpired && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                Expired
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {device.ip_address}
                          </p>
                          <div className="flex items-center space-x-4 mt-1">
                            <p className="text-xs text-gray-500">
                              Last used:{' '}
                              {new Date(device.last_used_at).toLocaleDateString(
                                'en-US',
                                {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                },
                              )}
                            </p>
                            {!isExpired && (
                              <p className="text-xs text-green-600 font-medium">
                                Expires in {expiresIn}{' '}
                                {expiresIn === 1 ? 'day' : 'days'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleRevokeDeviceClick(device.device_id)
                        }
                        className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove device"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">How does 2FA work?</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>
                  When you login from a new device, you'll receive a code via
                  email
                </li>
                <li>Enter the code to complete your login</li>
                <li>
                  You can trust devices for 7 days to skip 2FA verification
                </li>
                <li>Trusted devices are automatically removed after 7 days</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Disable 2FA Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDisable2FAModal}
        onClose={() => !isConfirming && setShowDisable2FAModal(false)}
        onConfirm={disable2FA}
        title="Disable Two-Factor Authentication?"
        message="Are you sure you want to disable 2FA? This will remove all trusted devices and make your account less secure."
        confirmText="Disable 2FA"
        cancelText="Cancel"
        variant="danger"
        isLoading={isConfirming}
      />

      {/* Revoke Device Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRevokeDeviceModal}
        onClose={() => !isConfirming && setShowRevokeDeviceModal(false)}
        onConfirm={revokeDevice}
        title="Remove Trusted Device?"
        message={`Are you sure you want to remove ${getSelectedDeviceName()}? You will need to verify with 2FA the next time you login from this device.`}
        confirmText="Remove Device"
        cancelText="Cancel"
        variant="warning"
        isLoading={isConfirming}
      />
    </>
  );
};

export default TwoFactorSettings;
