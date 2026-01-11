/**
 * Transform nested userData into flat patient data structure
 */
export const transformUserDataToPatientData = (
  userData,
  resolvedAddress = null
) => {
  if (!userData) return null;
  console.log(userData);

  const person = userData.person || {};
  const patient = person.patient || userData.patient || {};
  const addresses = person.addresses || [];
  const contacts = person.contacts || [];

  // Get primary address
  const primaryAddress =
    addresses.find(addr => addr.is_primary) || addresses[0] || {};

  // Use resolved address if provided, otherwise use raw codes
  const addressData = resolvedAddress || primaryAddress;

  // Get mobile contact
  const mobileContact = contacts.find(
    c => c.contact_type === 'mobile' && !c.deleted_at
  );

  // Get home/phone contact
  const phoneContact = contacts.find(
    c => c.contact_type === 'home' && !c.deleted_at
  );

  // Get emergency contact
  const emergencyContact = contacts.find(
    c => c.contact_type === 'emergency' && !c.deleted_at
  );

  return {
    // Basic Info (Locked)
    firstName: person.first_name || '',
    middleName: person.middle_name || '',
    lastName: person.last_name || '',
    suffix: person.suffix || '',
    birthDate: person.date_of_birth || '',
    gender: person.gender || '',
    nationality: person.nationality || '',
    bloodType: person.blood_type || '',

    // Basic Info (Editable)
    civilStatus: person.civil_status || '',

    // Contact Info
    email: userData.email || '',
    contact_number: mobileContact?.contact_number || '',
    phone: phoneContact?.contact_number || userData.phone || '',

    // Address with codes AND names
    address: {
      // Building/Street details
      house_number: addressData.house_number || '',
      street_name: addressData.street_name || '',
      building_name: addressData.building_name || '',
      subdivision: addressData.subdivision || '',
      unit_floor: addressData.unit_floor || '',

      // Location codes
      region_code: addressData.region_code || '',
      province_code: addressData.province_code || '',
      city_code: addressData.city_code || '',
      barangay_code: addressData.barangay_code || '',

      // Location names (resolved from codes)
      region_name: addressData.region_name || '',
      province_name: addressData.province_name || '',
      city_name: addressData.city_name || '',
      barangay_name: addressData.barangay_name || '',

      // Other
      zip_code: addressData.zip_code || '',
      landmark: addressData.landmark || '',
      delivery_instructions: addressData.delivery_instructions || '',
      is_verified: addressData.is_verified || false,
    },

    // Emergency Contact
    emergency_contact_name: emergencyContact?.contact_name || '',
    emergency_contact_relation: emergencyContact?.relationship || '',
    emergency_contact_number: emergencyContact?.contact_number || '',

    // Medical Info (if exists in userData)
    medicalInfo: {
      allergies: '',
    },

    // Insurance (from patient record)
    insurance: {
      provider: patient.insurance_provider || '',
      number: patient.insurance_number || '',
      expiry: patient.insurance_expiry || '',
    },

    // Patient Status
    patientStatus: patient.patient_status || '',
    mrn: patient.mrn || '',
    patientUuid: patient.patient_uuid || '',
    height: patient.height || '',
    weight: patient.weight || '',
    chronicConditions: patient.chronic_conditions || '',
    currentMedications: patient.current_medications || '',

    // User Status
    accountStatus: userData.account_status || '',
    registrationStatus: userData.registration_status || '',
    role: userData.role || '',

    // IDs
    userId: userData.user_id,
    personId: person.person_id,
    patientId: patient.patient_id,
  };
};

/**
 * Format address for display
 */
export const formatAddressDisplay = address => {
  if (!address) return 'Not specified';

  const parts = [];

  // Building/Street
  if (address.unit_floor) parts.push(address.unit_floor);
  if (address.building_name) parts.push(address.building_name);
  if (address.house_number) parts.push(`#${address.house_number}`);
  if (address.street_name) parts.push(address.street_name);
  if (address.subdivision) parts.push(address.subdivision);

  const streetAddress = parts.join(', ');

  // Location
  const location = [
    address.barangay_name,
    address.city_name,
    address.province_name,
    address.region_name,
    address.zip_code,
  ]
    .filter(Boolean)
    .join(', ');

  return [streetAddress, location].filter(Boolean).join(' | ');
};
