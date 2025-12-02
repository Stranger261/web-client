import { useState } from 'react';

import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select } from '../../../components/ui/select';

import { PhoneInput } from '../../../components/ui/PhoneInput';

const RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'child', label: 'Child' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'friend', label: 'Friend' },
  { value: 'relative', label: 'Relative' },
  { value: 'other', label: 'Other' },
];

export const EmergencyContactForm = ({ data, onChange, onNext, onBack }) => {
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    onChange({ [field]: value });

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const required = [
      'emergency_contact_name',
      'emergency_contact_number',
      'emergency_contact_relationship',
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

    if (
      data.emergency_contact_relationship === 'other' &&
      !data.emergency_contact_relationship_specification
    ) {
      newErrors.emergency_contact_relationship_specification =
        'Please specify relationship';
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
        Emergency Contact Information
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Full Name"
          name="emergency_contact_name"
          value={data.emergency_contact_name}
          onChange={e => handleChange('emergency_contact_name', e.target.value)}
          error={errors.emergency_contact_name}
          required
        />

        <PhoneInput
          label="Phone Number"
          name="emergency_contact_number"
          value={data.emergency_contact_number}
          onChange={e =>
            handleChange(
              'emergency_contact_number',
              e.target.fullValue || '+63'
            )
          }
          placeholder="9XXXXXXXXX"
          required
          error={errors.emergency_contact_number}
          countryCode="+63"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Relationship"
          name="emergency_contact_relationship"
          value={data.emergency_contact_relationship}
          onChange={e =>
            handleChange('emergency_contact_relationship', e.target.value)
          }
          options={RELATIONSHIPS}
          error={errors.emergency_contact_relationship}
          required
        />

        {data.emergency_contact_relationship === 'other' && (
          <Input
            label="Specify Relationship"
            name="emergency_contact_relationship_specification"
            value={data.emergency_contact_relationship_specification}
            onChange={e =>
              handleChange(
                'emergency_contact_relationship_specification',
                e.target.value
              )
            }
            error={errors.emergency_contact_relationship_specification}
            required={data.emergency_contact_relationship === 'other'}
          />
        )}
      </div>

      <Input
        label="Emergency Contact Address"
        name="emergency_contact_address"
        value={data.emergency_contact_address}
        onChange={e =>
          handleChange('emergency_contact_address', e.target.value)
        }
        placeholder="Full address of emergency contact"
        rows={3}
      />

      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button type="submit">Continue to Verification</Button>
      </div>
    </form>
  );
};
