import { useState } from 'react';

import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';
import { GENDERS, CIVIL_STATUS, BLOOD_TYPES } from '../../../configs/CONST';

import { PhoneInput } from '../../../components/ui/PhoneInput';

export const PersonalInfoForm = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    onChange({ [field]: value });

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const required = [
      'first_name',
      'last_name',
      'date_of_birth',
      'gender',
      'contact_number',
    ];

    required.forEach(field => {
      if (!data[field]) {
        newErrors[field] = 'This field is required';
      }
    });

    const phoneNumber = data.contact_number.replace('+63', '');
    if (!phoneNumber) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^9\d{9}$/.test(phoneNumber)) {
      newErrors.phone =
        'Invalid PH mobile number (should start with 9 and be 10 digits)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (validateForm()) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Personal Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          name="first_name"
          value={data.first_name}
          onChange={e => handleChange('first_name', e.target.value)}
          error={errors.first_name}
          required
        />

        <Input
          label="Last Name"
          name="last_name"
          value={data.last_name}
          onChange={e => handleChange('last_name', e.target.value)}
          error={errors.last_name}
          required
        />

        <Input
          label="Middle Name"
          name="middle_name"
          value={data.middle_name}
          onChange={e => handleChange('middle_name', e.target.value)}
        />

        <Input
          label="Suffix"
          name="suffix"
          value={data.suffix}
          onChange={e => handleChange('suffix', e.target.value)}
          placeholder="Jr., Sr., II, III, etc."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Date of Birth"
          name="date_of_birth"
          type="date"
          value={data.date_of_birth}
          onChange={e => handleChange('date_of_birth', e.target.value)}
          error={errors.date_of_birth}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Gender"
          name="gender"
          value={data.gender}
          onChange={e => handleChange('gender', e.target.value)}
          options={GENDERS}
          error={errors.gender}
          required
        />

        {data.gender === 'other' && (
          <Input
            label="Gender Specification"
            name="gender_specification"
            value={data.gender_specification}
            onChange={e => handleChange('gender_specification', e.target.value)}
            required={data.gender === 'other'}
          />
        )}

        <Select
          label="Civil Status"
          name="civil_status"
          value={data.civil_status}
          onChange={e => handleChange('civil_status', e.target.value)}
          options={CIVIL_STATUS}
        />

        <Input
          label="Nationality"
          name="nationality"
          value={data.nationality}
          onChange={e => handleChange('nationality', e.target.value)}
          defaultValue="Filipino"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PhoneInput
          label="Phone Number"
          name="contact_number"
          value={data.contact_number}
          onChange={e =>
            handleChange('contact_number', e.target.fullValue || '+63')
          }
          placeholder="9XXXXXXXXX"
          required
          error={errors.contact_number}
          countryCode="+63"
          disabled={true}
        />

        <Input
          label="Email Address"
          name="email"
          type="email"
          value={data.email}
          onChange={e => handleChange('email', e.target.value)}
          placeholder="your@email.com"
          disabled={true}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Blood Type"
          name="blood_type"
          value={data.blood_type}
          onChange={e => handleChange('blood_type', e.target.value)}
          options={BLOOD_TYPES.map(type => ({ value: type, label: type }))}
        />

        <Input
          label="Occupation"
          name="occupation"
          value={data.occupation}
          onChange={e => handleChange('occupation', e.target.value)}
        />

        <Input
          label="Religion"
          name="religion"
          value={data.religion}
          onChange={e => handleChange('religion', e.target.value)}
        />
      </div>

      <div className="flex justify-end pt-6 border-t">
        <Button type="submit">Continue to Address</Button>
      </div>
    </form>
  );
};
