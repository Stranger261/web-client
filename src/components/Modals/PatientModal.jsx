import { useState, useEffect } from 'react';
import { X, User, Heart, Settings } from 'lucide-react';
import { formatDate, formatDateForInput } from '../../utils/dateFormatter';
import Spinner from '../generic/Spinner';

const PatientModal = ({
  mode = 'view',
  patient = {},
  onClose,
  onSubmit,
  isLoading = false,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  // Trigger animations when modal mounts
  useEffect(() => {
    setIsAnimating(true);
    // Small delay to trigger the transition
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  // Handle close with animation
  const handleClose = () => {
    if (isLoading) return;

    setIsVisible(false);

    // Shorter delay for better responsiveness
    setTimeout(() => {
      onClose();
    }, 200);
  };

  useEffect(() => {
    if (mode === 'create') {
      setFormData({
        // General Information
        firstname: null,
        middlename: null,
        lastname: null,
        dateOfBirth: null,
        gender: null,
        phone: null,
        email: null,
        address: null,
        city: null,
        zipCode: null,
        country: 'Philippines',
        // Medical Information
        medicalRecordNumber: null,
        bloodType: null,
        allergies: [],
        currentMedications: [],
        medicalConditions: [],
        insuranceProvider: null,
        emergencyContact: null,
        emergencyPhone: null,
        emergencyRelationship: null,
        // Other Information
        patientStatus: 'active',
        registrationType: 'walk-in',
        appointmentReminders: true,
        communicationPreferences: {
          email: true,
          sms: true,
          phone: true,
          mail: false,
        },
        isVIP: false,
        consentToTreatment: { given: false },
        privacyPolicyAccepted: { accepted: false },
        dataProcessingConsent: { given: false, purposes: [] },
      });
    } else {
      // Ensure nested objects exist when editing/viewing existing patient
      setFormData({
        ...patient,
        communicationPreferences: patient.communicationPreferences || {
          email: false,
          sms: false,
          phone: false,
          mail: false,
        },
        consentToTreatment: patient.consentToTreatment || { given: false },
        privacyPolicyAccepted: patient.privacyPolicyAccepted || {
          accepted: false,
        },
        dataProcessingConsent: patient.dataProcessingConsent || {
          given: false,
          purposes: [],
        },
      });
    }
  }, [mode, patient]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    // Convert date input back to ISO format for storage
    if (type === 'date' && value) {
      const date = new Date(value + 'T00:00:00.000Z');
      processedValue = date.toISOString();
    }

    if (name.includes('.')) {
      // Handle nested objects like communicationPreferences.email
      const keys = name.split('.');
      setFormData(prev => ({
        ...prev,
        [keys[0]]: {
          ...(prev[keys[0]] || {}), // Ensure parent object exists
          [keys[1]]: type === 'checkbox' ? checked : processedValue,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : processedValue,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleArrayChange = (fieldName, value) => {
    const array = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item);
    setFormData(prev => ({ ...prev, [fieldName]: array }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstname?.trim())
      newErrors.firstname = 'First name is required';
    if (!formData.lastname?.trim())
      newErrors.lastname = 'Last name is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.phone?.trim()) newErrors.phone = 'Phone is required';
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = 'Date of birth is required';

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async id => {
    if (validateForm() && onSubmit) {
      await onSubmit(mode, formData, id);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = e => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const isView = mode === 'view';
  const isCreate = mode === 'create';

  const tabs = [
    { id: 'general', label: 'General Details', icon: User },
    { id: 'medical', label: 'Medical Info', icon: Heart },
    { id: 'other', label: 'Additional', icon: Settings },
  ];

  const renderInput = (name, label, type = 'text', options = {}) => {
    const { placeholder, required, rows, isArray, readOnly } = options;

    let value;
    if (type === 'date') {
      value = formatDateForInput(formData[name]);
    } else if (isArray) {
      value = (formData[name] || []).join(', ');
    } else {
      value = formData[name] || '';
    }

    const inputClasses = `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-150 ${
      errors[name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
    } ${isView || readOnly ? 'bg-gray-50' : 'bg-white'}`;

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && !isView && <span className="text-red-500 ml-1">*</span>}
        </label>

        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={
              isArray
                ? e => handleArrayChange(name, e.target.value)
                : handleChange
            }
            placeholder={placeholder}
            rows={rows || 3}
            disabled={isView}
            readOnly={readOnly}
            className={inputClasses}
          />
        ) : type === 'select' ? (
          <select
            name={name}
            value={formData[name] || ''}
            onChange={handleChange}
            disabled={isView || readOnly}
            className={inputClasses}
          >
            {options.selectOptions?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={
              isArray
                ? e => handleArrayChange(name, e.target.value)
                : handleChange
            }
            placeholder={placeholder}
            disabled={isView}
            readOnly={readOnly}
            className={inputClasses}
          />
        )}

        {isView && type === 'date' && formData[name] && (
          <p className="text-sm text-gray-600 mt-1">
            {formatDate(formData[name])}
          </p>
        )}
        {errors[name] && <p className="text-red-500 text-sm">{errors[name]}</p>}
      </div>
    );
  };

  const renderCheckbox = (name, label) => {
    // Handle nested object values safely
    let checked = false;

    if (name.includes('.')) {
      const keys = name.split('.');
      const parentObj = formData[keys[0]];
      checked = parentObj && parentObj[keys[1]] ? true : false;
    } else {
      checked = formData[name] ? true : false;
    }

    return (
      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={handleChange}
          disabled={isView}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label className="text-sm font-medium text-gray-700">{label}</label>
      </div>
    );
  };

  const renderGeneralTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderInput('firstname', 'First Name', 'text', {
          required: true,
          placeholder: 'Enter first name',
        })}
        {renderInput('middlename', 'Middle Name', 'text', {
          placeholder: 'Enter middle name',
        })}
        {renderInput('lastname', 'Last Name', 'text', {
          required: true,
          placeholder: 'Enter last name',
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {renderInput('dateOfBirth', 'Date of Birth', 'date', {
          required: true,
          readOnly: !isCreate,
        })}

        {renderInput('gender', 'Gender', 'select', {
          required: true,
          selectOptions: [
            { value: '', label: 'Select Gender' },
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
          ],
        })}
        {renderInput('bloodType', 'Blood Type', 'select', {
          required: true,
          selectOptions: [
            { value: '', label: 'Select Blood Type' },
            { value: 'A+', label: 'A+' },
            { value: 'A-', label: 'A-' },
            { value: 'B+', label: 'B+' },
            { value: 'B-', label: 'B-' },
            { value: 'AB+', label: 'AB+' },
            { value: 'AB-', label: 'AB-' },
            { value: 'O+', label: 'O+' },
            { value: 'O-', label: 'O-' },
            { value: 'Unknown', label: 'Unknown' },
          ],
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput('phone', 'Phone', 'tel', {
          required: true,
          placeholder: '+63 9XX XXX XXXX',
        })}
        {renderInput('email', 'Email', 'email', {
          placeholder: 'email@example.com',
        })}
      </div>

      <div className="space-y-4">
        {renderInput('address', 'Address', 'text', {
          placeholder: 'Street address',
        })}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {renderInput('city', 'City', 'text', { placeholder: 'City' })}
          {renderInput('zipCode', 'ZIP Code', 'text', {
            placeholder: 'ZIP Code',
          })}
          {renderInput('country', 'Country', 'text', {
            placeholder: 'Country',
          })}
        </div>
      </div>
    </div>
  );

  const renderMedicalTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput('medicalRecordNumber', 'Medical Record Number', 'text', {
          placeholder: 'MRN-XXXX-XX-XXXXX',
          readOnly: true,
        })}
        {renderInput('insuranceProvider', 'Insurance Provider', 'text', {
          placeholder: 'PhilHealth, HMO, etc.',
        })}
      </div>

      <div className="space-y-4">
        {renderInput('allergies', 'Allergies', 'textarea', {
          placeholder: 'Enter allergies separated by commas',
          isArray: true,
          rows: 2,
        })}
        {renderInput('currentMedications', 'Current Medications', 'textarea', {
          placeholder: 'Enter current medications separated by commas',
          isArray: true,
          rows: 2,
        })}
        {renderInput('medicalConditions', 'Medical Conditions', 'textarea', {
          placeholder: 'Enter medical conditions separated by commas',
          isArray: true,
          rows: 2,
        })}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">Emergency Contact</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput('emergencyContact', 'Emergency Contact Name', 'text', {
            placeholder: 'Full name',
          })}
          {renderInput('emergencyPhone', 'Emergency Phone', 'tel', {
            placeholder: '+63 9XX XXX XXXX',
          })}
        </div>
        <div className="mt-4">
          {renderInput('emergencyRelationship', 'Relationship', 'select', {
            selectOptions: [
              { value: '', label: 'Select relationship' },
              { value: 'spouse', label: 'Spouse' },
              { value: 'parent', label: 'Parent' },
              { value: 'child', label: 'Child' },
              { value: 'sibling', label: 'Sibling' },
              { value: 'friend', label: 'Friend' },
              { value: 'other', label: 'Other' },
            ],
          })}
        </div>
      </div>
    </div>
  );

  const renderOtherTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderInput('patientStatus', 'Patient Status', 'select', {
          selectOptions: [
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ],
        })}
        {renderInput('registrationType', 'Registration Type', 'select', {
          selectOptions: [
            { value: 'walk-in', label: 'Walk-in' },
            { value: 'online', label: 'Appointment' },
            { value: 'referral', label: 'Referral' },
            { value: 'emergency', label: 'Emergency' },
          ],
        })}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-3">
          Communication Preferences
        </h4>
        {/* Debug info - remove this after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 mb-2">
            Debug: {JSON.stringify(formData.communicationPreferences)}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {renderCheckbox('communicationPreferences.email', 'Email')}
          {renderCheckbox('communicationPreferences.sms', 'SMS')}
          {renderCheckbox('communicationPreferences.phone', 'Phone')}
          {renderCheckbox('communicationPreferences.mail', 'Mail')}
        </div>
      </div>

      <div className="space-y-4">
        {renderCheckbox('appointmentReminders', 'Send appointment reminders')}
        {renderCheckbox('isVIP', 'VIP Patient')}
      </div>

      {!isView && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-3">Consent & Privacy</h4>
          <div className="space-y-3">
            {renderCheckbox('consentToTreatment.given', 'Consent to treatment')}
            {renderCheckbox(
              'privacyPolicyAccepted.accepted',
              'Privacy policy accepted'
            )}
            {renderCheckbox(
              'dataProcessingConsent.given',
              'Data processing consent'
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`fixed inset-0 z-50 p-4 transition-opacity duration-200 ease-out ${
        isVisible ? 'bg-black bg-opacity-50' : 'bg-black bg-opacity-0'
      }`}
      onClick={handleClose}
    >
      <div className="flex items-center justify-center min-h-full">
        <div
          className={`bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all duration-200 ease-out ${
            isVisible
              ? 'translate-y-0 scale-100 opacity-100'
              : 'translate-y-2 scale-98 opacity-0'
          }`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isCreate
                  ? 'Create New Patient'
                  : isView
                  ? 'Patient Details'
                  : 'Edit Patient'}
              </h2>
              {!isCreate && formData.fullName && (
                <p className="text-sm text-gray-600 mt-1">
                  {formData.fullName}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-150 p-2 hover:bg-gray-100 rounded-lg"
              disabled={isLoading}
            >
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 px-6 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors duration-150 whitespace-nowrap ${
                    isActive
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'general' && renderGeneralTab()}
            {activeTab === 'medical' && renderMedicalTab()}
            {activeTab === 'other' && renderOtherTab()}
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              {!isCreate && formData.medicalRecordNumber && (
                <span>MRN: {formData.medicalRecordNumber}</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                disabled={isLoading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-150 disabled:opacity-50"
              >
                Cancel
              </button>
              {!isView && (
                <button
                  onClick={() => handleSubmit(patient._id)}
                  disabled={isLoading || isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-150 disabled:opacity-50 flex items-center space-x-2"
                >
                  {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  <span>
                    {isCreate && isSubmitting ? (
                      <>
                        <Spinner /> Creating...
                      </>
                    ) : isSubmitting && !isCreate ? (
                      <>
                        <Spinner /> Saving...
                      </>
                    ) : isCreate ? (
                      'Create Patient'
                    ) : (
                      'Save Changes'
                    )}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientModal;
