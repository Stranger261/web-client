import {
  AlertTriangle,
  Shield,
  Clock,
  CheckCircle2,
  User,
  FileText,
  Camera,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const UnverifiedUserStatus = ({ userInfo }) => {
  const { currentUser } = useAuth();

  const verificationSteps = [
    {
      icon: FileText,
      title: 'Complete Profile',
      description: 'Fill in your personal information and upload ID photo',
      status: userInfo?.hasBasicInfo ? 'complete' : 'pending',
    },
    {
      icon: Camera,
      title: 'Face Verification',
      description: 'Verify your identity using live face recognition',
      status: userInfo?.isVerified ? 'complete' : 'pending',
    },
    {
      icon: Shield,
      title: 'Account Verified',
      description: 'Access all features and services securely',
      status: userInfo?.isVerified ? 'complete' : 'locked',
    },
  ];

  const getStepIcon = step => {
    const IconComponent = step.icon;
    if (step.status === 'complete') {
      return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    }
    if (step.status === 'locked') {
      return <IconComponent className="w-5 h-5 text-gray-400" />;
    }
    return <IconComponent className="w-5 h-5 text-blue-600" />;
  };

  const getStepStyles = step => {
    if (step.status === 'complete') {
      return 'border-green-200 bg-green-50';
    }
    if (step.status === 'locked') {
      return 'border-gray-200 bg-gray-50';
    }
    return 'border-blue-200 bg-blue-50';
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Main Status Card */}
      <div className="bg-white rounded-lg shadow-sm border border-orange-200 p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="bg-orange-100 rounded-full p-3">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Account Verification Required
            </h2>
            <p className="text-gray-600 mb-4">
              Your account is currently unverified. Complete the verification
              process to access all features and ensure account security.
            </p>

            {/* Status Summary */}
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-orange-500 mr-2" />
                <span className="text-gray-600">Status: </span>
                <span className="font-medium text-orange-600">
                  Pending Verification
                </span>
              </div>
              <div className="flex items-center">
                <User className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-gray-600">Access Level: </span>
                <span className="font-medium text-gray-700">Limited</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Verification Process
        </h3>

        <div className="space-y-4">
          {verificationSteps.map((step, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 transition-colors ${getStepStyles(
                step
              )}`}
            >
              <div className="flex items-center space-x-3">
                {getStepIcon(step)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{step.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    {step.description}
                  </p>
                </div>
                <div className="flex items-center">
                  {step.status === 'complete' && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                      Complete
                    </span>
                  )}
                  {step.status === 'pending' && (
                    <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Required
                    </span>
                  )}
                  {step.status === 'locked' && (
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      Locked
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Current Limitations */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-amber-800 mb-2">
          Current Account Limitations
        </h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• Limited access to sensitive features</li>
          <li>• Reduced transaction limits</li>
          <li>• Some services may be unavailable</li>
          <li>• Additional security checks may be required</li>
        </ul>
      </div>

      {/* Benefits After Verification */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-green-800 mb-2">
          Benefits of Verification
        </h4>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Full access to all platform features</li>
          <li>• Enhanced security and account protection</li>
          <li>• Higher transaction and usage limits</li>
          <li>• Priority customer support</li>
          <li>• Trusted account status</li>
        </ul>
      </div>

      {/* Action Button */}
      <div className="text-center">
        {!currentUser.isVerified && currentUser.role === 'patient' && (
          <Link
            to="/patient/my-details"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
          >
            Verify Now
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        )}
        <p className="text-xs text-gray-500 mt-2">
          Verification typically takes 2-5 minutes to complete
        </p>
      </div>

      {/* Help Section */}
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600">
          Need help with verification?
          <button className="text-blue-600 hover:text-blue-700 ml-1 underline">
            Contact Support
          </button>
        </p>
      </div>
    </div>
  );
};

const UnverifiedBanner = ({ onClick }) => {
  return (
    <div className="bg-orange-50 border-l-4 border-orange-400 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-orange-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-orange-800">
              Account verification required
            </p>
            <p className="text-sm text-orange-700">
              Complete verification to access all features
            </p>
          </div>
          <button
            onClick={onClick}
            className="ml-2 flex-shrink-0 bg-orange-100 text-orange-600 h-8 w-8 rounded-full grid place-items-center hover:bg-orange-200 hover:text-orange-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-orange-500 transition-colors"
            aria-label="Learn more about verification"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export { UnverifiedUserStatus, UnverifiedBanner };
