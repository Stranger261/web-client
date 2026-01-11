export const PATIENT_TABS = [
  {
    id: 'basic',
    label: 'Basic Information',
    badge: 'Mostly Locked',
  },
  {
    id: 'contact',
    label: 'Contact & Emergency',
    badge: 'Editable',
  },
  {
    id: 'medical',
    label: 'Medical & Insurance',
    badge: 'Partially Editable',
  },
];

export const LOCKED_FIELDS = [
  'firstName',
  'middleName',
  'lastName',
  'birthDate',
  'gender',
  'nationality',
  'bloodType',
];

export const GENDER_OPTIONS = ['Male', 'Female', 'Other'];
export const CIVIL_STATUS_OPTIONS = [
  'Single',
  'Married',
  'Widowed',
  'Divorced',
];
export const RELATIONSHIP_OPTIONS = [
  'Parent',
  'Spouse',
  'Sibling',
  'Child',
  'Other',
];

export const INITIAL_PATIENT_DATA = {
  // person
  first_name: '',
  middle_name: '',
  last_name: '',
  suffix: '',
  date_of_birth: '',
  gender: '',
  gender_specification: '',
  blood_type: '',
  nationality: '',
  civil_status: '',

  // user
  email: '',
  phone: '+63',

  // person contact
  // primary
  contact_number: '',
  contact_type: '',
  contact_name: '',

  // emergency
  emergency_contact_name: '',
  emergency_contact_relation: '',
  emergency_contact_number: '',

  // person address
  barangay_code: '',
  city_code: '',
  province_code: '',
  region_code: '',
  postal_code: '',
  zipCode: '',

  height: '',
  weight: '',
  allergies: '',
  chronicConditions: '',
  currentMedications: '',
  insuranceProvider: '',
  insuranceNumber: '',
  insuranceExpiry: '',
};
