import { useEffect, useState } from 'react';
import { AlertCircle, Camera, MapPin, Phone, User, X } from 'lucide-react';
import {
  BLOOD_TYPES,
  CIVIL_STATUS,
  GENDERS,
  RELATIONSHIPS,
} from '../../../../configs/CONST';
import TabButton from '../../../../components/ui/tab-button';
import { Input } from '../../../../components/ui/input';
import { Select } from '../../../../components/ui/select';
import { PhoneInput } from '../../../../components/ui/PhoneInput';
import { Button } from '../../../../components/ui/button';
import { useAuth } from '../../../../contexts/AuthContext';
import { addressAPI } from '../../../../services/addressApi';

const WalkInPatientRegistration = ({ isOpen, onClose, onSuccess }) => {
  const { registerWalkIn, currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // address code
  const [regions, setRegions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [cities, setCities] = useState([]);
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState({
    regions: false,
    provinces: false,
    cities: false,
    barangays: false,
  });

  // Form data
  const [formData, setFormData] = useState({
    // Basic Details
    first_name: '',
    last_name: '',
    middle_name: '',
    suffix: '',
    date_of_birth: '',
    gender: '',
    gender_specification: '',
    blood_type: '',
    nationality: 'Filipino',
    civil_status: '',
    occupation: '',
    religion: '',

    // Contact
    contact_number: '+63',
    email: '',

    // Emergency Contact
    emergency_contact_name: '',
    emergency_contact_number: '+63',
    emergency_contact_relationship: '',
    emergency_contact_relationship_specification: '',

    // Address
    street: '',
    subdivision_village: '',
    house_number: '',
    barangay_code: '',
    city_code: '',
    province_code: '',
    region_code: '',
    postal_code: '',

    // registration type
    registration_type: 'walk-in',
    staffId: currentUser.staff_id,
  });

  const tabs = [
    { id: 'basic', icon: User, label: 'Basic Details' },
    { id: 'contact', icon: Phone, label: 'Contact' },
    { id: 'emergency', icon: AlertCircle, label: 'Emergency' },
    { id: 'address', icon: MapPin, label: 'Address' },
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getTabErrors = tabId => {
    const tabFields = {
      basic: ['first_name', 'last_name', 'date_of_birth', 'gender'],
      contact: ['contact_number'],
      emergency: [
        'emergency_contact_name',
        'emergency_contact_number',
        'emergency_contact_relationship',
      ],
      address: ['region_code', 'province_code', 'city_code', 'barangay_code'],
    };

    return tabFields[tabId]?.some(field => errors[field]) || false;
  };

  const validateTab = tabId => {
    const newErrors = {};

    switch (tabId) {
      case 'basic':
        ['first_name', 'last_name', 'date_of_birth', 'gender'].forEach(
          field => {
            if (!formData[field]) {
              newErrors[field] = 'Required';
            }
          },
        );
        if (formData.gender === 'other' && !formData.gender_specification) {
          newErrors.gender_specification = 'Required';
        }
        break;

      case 'contact':
        if (!formData.contact_number || formData.contact_number === '+63') {
          newErrors.contact_number = 'Required';
        } else {
          const phoneNumber = formData.contact_number.replace('+63', '');
          if (!/^9\d{9}$/.test(phoneNumber)) {
            newErrors.contact_number = 'Invalid format';
          }
        }
        break;

      case 'emergency':
        if (!formData.emergency_contact_name) {
          newErrors.emergency_contact_name = 'Required';
        }
        if (
          !formData.emergency_contact_number ||
          formData.emergency_contact_number === '+63'
        ) {
          newErrors.emergency_contact_number = 'Required';
        }
        if (!formData.emergency_contact_relationship) {
          newErrors.emergency_contact_relationship = 'Required';
        }
        if (
          formData.emergency_contact_relationship === 'other' &&
          !formData.emergency_contact_relationship_specification
        ) {
          newErrors.emergency_contact_relationship_specification = 'Required';
        }
        break;

      case 'address':
        ['region_code', 'province_code', 'city_code', 'barangay_code'].forEach(
          field => {
            if (!formData[field]) {
              newErrors[field] = 'Required';
            }
          },
        );
        break;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validateAllTabs = () => {
    let allValid = true;
    ['basic', 'contact', 'emergency', 'address'].forEach(tabId => {
      if (!validateTab(tabId)) {
        allValid = false;
      }
    });
    return allValid;
  };

  const handleSubmit = async () => {
    if (!validateAllTabs()) {
      setErrors(prev => ({
        ...prev,
        submit: 'Please fill all required fields in all tabs',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      const newPatient = await registerWalkIn(formData);
      console.log(newPatient);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const mockResponse = {
        success: true,
        data: {
          person_id: Math.floor(Math.random() * 1000),
          patient_id: Math.floor(Math.random() * 1000),
          mrn: `MRN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
          message: 'Walk-in patient registered successfully',
        },
      };

      console.log('Form Data to Submit:', formData);

      if (onSuccess) {
        onSuccess(mockResponse.data);
      }

      // Reset form
      handleResetFormData();
      setActiveTab('basic');
      setErrors({});
      onClose();
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: error.message || 'Failed to register patient' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetFormData = () =>
    setFormData({
      first_name: '',
      last_name: '',
      middle_name: '',
      suffix: '',
      date_of_birth: '',
      gender: '',
      gender_specification: '',
      blood_type: '',
      nationality: 'Filipino',
      civil_status: '',
      occupation: '',
      religion: '',
      contact_number: '+63',
      email: '',
      emergency_contact_name: '',
      emergency_contact_number: '+63',
      emergency_contact_relationship: '',
      emergency_contact_relationship_specification: '',
      street: '',
      subdivision_village: '',
      house_number: '',
      barangay_code: '',
      city_code: '',
      province_code: '',
      region_code: '',
      postal_code: '',
      skip_face_registration: false,
      face_image: null,
    });

  const loadRegions = async () => {
    setLoading(prev => ({ ...prev, regions: true }));
    try {
      const response = await addressAPI.getRegions();

      let regionsArray = [];

      // FIXED: Access the data from response.data
      if (response && response.success && Array.isArray(response.data)) {
        regionsArray = response.data;
      } else if (Array.isArray(response)) {
        regionsArray = response;
      } else if (response && typeof response === 'object') {
        // Fallback: try to extract array from object
        regionsArray = Object.values(response).find(Array.isArray) || [];
      }

      // Format for Select component
      const formattedRegions = regionsArray.map(region => ({
        value: region.region_code,
        label: region.region_name,
      }));

      setRegions(formattedRegions);
    } catch (error) {
      console.error('Failed to load regions:', error);
      setErrors({ region_code: 'Failed to load regions' });
      setRegions([]);
    } finally {
      setLoading(prev => ({ ...prev, regions: false }));
    }
  };

  const loadProvinces = async regionCode => {
    setLoading(prev => ({ ...prev, provinces: true }));
    try {
      const response = await addressAPI.getProvinces(regionCode);

      let provincesArray = [];
      if (response && response.success && Array.isArray(response.data)) {
        provincesArray = response.data;
      } else if (Array.isArray(response)) {
        provincesArray = response;
      } else if (response && typeof response === 'object') {
        provincesArray = Object.values(response).find(Array.isArray) || [];
      }

      const formattedProvinces = provincesArray.map(province => ({
        value: province.province_code,
        label: province.province_name,
      }));

      setProvinces(formattedProvinces);

      if (
        formData.province_code &&
        !formattedProvinces.find(p => p.value === formData.province_code)
      ) {
        handleChange({ province_code: '', city_code: '', barangay_code: '' });
      }
    } catch (error) {
      console.error('Failed to load provinces:', error);
      setErrors({ province_code: 'Failed to load provinces' });
      setProvinces([]);
    } finally {
      setLoading(prev => ({ ...prev, provinces: false }));
    }
  };

  const loadCities = async provinceCode => {
    setLoading(prev => ({ ...prev, cities: true }));
    try {
      const response = await addressAPI.getCities(provinceCode);

      let citiesArray = [];
      if (response && response.success && Array.isArray(response.data)) {
        citiesArray = response.data;
      } else if (Array.isArray(response)) {
        citiesArray = response;
      } else if (response && typeof response === 'object') {
        citiesArray = Object.values(response).find(Array.isArray) || [];
      }

      const formattedCities = citiesArray.map(city => ({
        value: city.city_code,
        label: `${city.city_name} (${city.city_type || 'City'})`,
      }));

      setCities(formattedCities);

      if (
        formData.city_code &&
        !formattedCities.find(c => c.value === formData.city_code)
      ) {
        handleChange({ city_code: '', barangay_code: '' });
      }
    } catch (error) {
      console.error('Failed to load cities:', error);
      setErrors({ city_code: 'Failed to load cities' });
      setCities([]);
    } finally {
      setLoading(prev => ({ ...prev, cities: false }));
    }
  };

  const loadBarangays = async cityCode => {
    setLoading(prev => ({ ...prev, barangays: true }));
    try {
      const response = await addressAPI.getBarangays(cityCode);

      let barangaysArray = [];
      if (response && response.success && Array.isArray(response.data)) {
        barangaysArray = response.data;
      } else if (Array.isArray(response)) {
        barangaysArray = response;
      } else if (response && typeof response === 'object') {
        barangaysArray = Object.values(response).find(Array.isArray) || [];
      }

      const formattedBarangays = barangaysArray.map(barangay => ({
        value: barangay.barangay_code,
        label: barangay.barangay_name,
      }));

      setBarangays(formattedBarangays);

      if (
        formData.barangay_code &&
        !formattedBarangays.find(b => b.value === formData.barangay_code)
      ) {
        handleChange({ barangay_code: '' });
      }
    } catch (error) {
      console.error('Failed to load barangays:', error);
      setErrors({ barangay_code: 'Failed to load barangays' });
      setBarangays([]);
    } finally {
      setLoading(prev => ({ ...prev, barangays: false }));
    }
  };

  // Load regions on component mount
  useEffect(() => {
    loadRegions();
  }, []);

  // Load provinces when region changes
  useEffect(() => {
    if (formData.region_code) {
      loadProvinces(formData.region_code);
    } else {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
    }
  }, [formData.region_code]);

  // Load cities when province changes
  useEffect(() => {
    if (formData.province_code) {
      loadCities(formData.province_code);
    } else {
      setCities([]);
      setBarangays([]);
    }
  }, [formData.province_code]);

  // Load barangays when city changes
  useEffect(() => {
    if (formData.city_code) {
      loadBarangays(formData.city_code);
    } else {
      setBarangays([]);
    }
  }, [formData.city_code]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-white">
              Walk-in Patient Registration
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1">
              Fill in patient information
            </p>
          </div>
          <button
            onClick={() => {
              onClose();
              handleResetFormData();
            }}
            className="text-white hover:bg-white/20 rounded-lg p-1.5 sm:p-2 transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-b flex-shrink-0 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {tabs.map(tab => (
              <TabButton
                key={tab.id}
                active={activeTab === tab.id}
                icon={tab.icon}
                label={tab.label}
                onClick={() => setActiveTab(tab.id)}
                hasError={getTabErrors(tab.id)}
              />
            ))}
          </div>
        </div>

        {/* Form Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
          {/* Basic Details Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="First Name"
                  value={formData.first_name}
                  onChange={e => handleChange('first_name', e.target.value)}
                  error={errors.first_name}
                  required
                />

                <Input
                  label="Last Name"
                  value={formData.last_name}
                  onChange={e => handleChange('last_name', e.target.value)}
                  error={errors.last_name}
                  required
                />

                <Input
                  label="Middle Name"
                  value={formData.middle_name}
                  onChange={e => handleChange('middle_name', e.target.value)}
                />

                <Input
                  label="Suffix"
                  value={formData.suffix}
                  onChange={e => handleChange('suffix', e.target.value)}
                  placeholder="Jr., Sr., III"
                />

                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.date_of_birth}
                  onChange={e => handleChange('date_of_birth', e.target.value)}
                  error={errors.date_of_birth}
                  required
                />

                <Select
                  label="Gender"
                  value={formData.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                  options={GENDERS}
                  error={errors.gender}
                  required
                />

                {formData.gender === 'other' && (
                  <Input
                    label="Gender Specification"
                    value={formData.gender_specification}
                    onChange={e =>
                      handleChange('gender_specification', e.target.value)
                    }
                    error={errors.gender_specification}
                    required
                  />
                )}

                <Select
                  label="Blood Type"
                  value={formData.blood_type}
                  onChange={e => handleChange('blood_type', e.target.value)}
                  options={BLOOD_TYPES.map(type => ({
                    value: type,
                    label: type,
                  }))}
                />

                <Input
                  label="Nationality"
                  value={formData.nationality}
                  onChange={e => handleChange('nationality', e.target.value)}
                />

                <Select
                  label="Civil Status"
                  value={formData.civil_status}
                  onChange={e => handleChange('civil_status', e.target.value)}
                  options={CIVIL_STATUS}
                />

                <Input
                  label="Occupation"
                  value={formData.occupation}
                  onChange={e => handleChange('occupation', e.target.value)}
                />

                <Input
                  label="Religion"
                  value={formData.religion}
                  onChange={e => handleChange('religion', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Contact Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <PhoneInput
                  label="Phone Number"
                  value={formData.contact_number}
                  onChange={e => handleChange('contact_number', e.target.value)}
                  error={errors.contact_number}
                  placeholder="+639XXXXXXXXX"
                  required
                />

                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={e => handleChange('email', e.target.value)}
                  placeholder="optional@email.com"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mt-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Note:</strong> Phone number must be a valid Philippine
                  mobile number starting with 9 (e.g., +639171234567)
                </p>
              </div>
            </div>
          )}

          {/* Emergency Contact Tab */}
          {activeTab === 'emergency' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Emergency Contact
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="Contact Name"
                  value={formData.emergency_contact_name}
                  onChange={e =>
                    handleChange('emergency_contact_name', e.target.value)
                  }
                  error={errors.emergency_contact_name}
                  placeholder="Full name"
                  required
                />

                <PhoneInput
                  label="Contact Number"
                  value={formData.emergency_contact_number}
                  onChange={e =>
                    handleChange('emergency_contact_number', e.target.value)
                  }
                  error={errors.emergency_contact_number}
                  placeholder="+639XXXXXXXXX"
                  required
                />

                <Select
                  label="Relationship"
                  value={formData.emergency_contact_relationship}
                  onChange={e =>
                    handleChange(
                      'emergency_contact_relationship',
                      e.target.value,
                    )
                  }
                  options={RELATIONSHIPS}
                  error={errors.emergency_contact_relationship}
                  required
                />

                {formData.emergency_contact_relationship === 'other' && (
                  <Input
                    label="Specify Relationship"
                    value={
                      formData.emergency_contact_relationship_specification
                    }
                    onChange={e =>
                      handleChange(
                        'emergency_contact_relationship_specification',
                        e.target.value,
                      )
                    }
                    error={errors.emergency_contact_relationship_specification}
                    required
                  />
                )}
              </div>
            </div>
          )}

          {/* Address Tab */}
          {activeTab === 'address' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Address Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <Input
                  label="House Number"
                  value={formData.house_number}
                  onChange={e => handleChange('house_number', e.target.value)}
                  placeholder="e.g., 123"
                />

                <Input
                  label="Street"
                  value={formData.street}
                  onChange={e => handleChange('street', e.target.value)}
                  placeholder="Street name"
                />

                <Input
                  label="Subdivision/Village"
                  value={formData.subdivision_village}
                  onChange={e =>
                    handleChange('subdivision_village', e.target.value)
                  }
                  placeholder="e.g., Greenhills"
                />

                <Select
                  label="Region"
                  name="region_code"
                  value={formData.region_code || ''}
                  onChange={e => handleChange('region_code', e.target.value)}
                  options={regions}
                  error={errors.region_code}
                  loading={loading.regions}
                  placeholder="Select Region"
                  required
                />

                <Select
                  label="Province"
                  name="province_code"
                  value={formData.province_code || ''}
                  onChange={e => handleChange('province_code', e.target.value)}
                  options={provinces}
                  error={errors.province_code}
                  loading={loading.provinces}
                  disabled={!formData.region_code || regions.length === 0}
                  placeholder="Select Province"
                  required
                />

                <Select
                  label="City/Municipality"
                  name="city_code"
                  value={formData.city_code || ''}
                  onChange={e => handleChange('city_code', e.target.value)}
                  options={cities}
                  error={errors.city_code}
                  loading={loading.cities}
                  disabled={!formData.province_code || provinces.length === 0}
                  placeholder="Select City"
                  required
                />

                <Select
                  label="Barangay"
                  name="barangay_code"
                  value={formData.barangay_code || ''}
                  onChange={e => handleChange('barangay_code', e.target.value)}
                  options={barangays}
                  error={errors.barangay_code}
                  loading={loading.barangays}
                  disabled={!formData.city_code || cities.length === 0}
                  placeholder="Select Barangay"
                  required
                />

                <Input
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={e => handleChange('postal_code', e.target.value)}
                  placeholder="e.g., 1100"
                />
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-xs sm:text-sm text-red-800">
                  {errors.submit}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t flex items-center justify-between gap-3 flex-shrink-0">
          <Button
            variant="outline"
            onClick={() => {
              onClose();
              handleResetFormData();
            }}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            loading={isSubmitting}
            className="flex-1 sm:flex-initial"
          >
            {isSubmitting ? 'Registering...' : 'Register Patient'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalkInPatientRegistration;
