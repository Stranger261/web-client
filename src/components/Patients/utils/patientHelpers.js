export const calculateAge = dob => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const getStatusVariant = status => {
  switch (status) {
    case 'active':
      return 'success';
    case 'inactive':
      return 'danger';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

export const getRecordTypeColor = type => {
  switch (type) {
    case 'consultation':
      return 'primary';
    case 'lab_result':
      return 'info';
    case 'imaging':
      return 'warning';
    case 'diagnosis':
      return 'danger';
    case 'procedure':
      return 'success';
    default:
      return 'default';
  }
};

export const formatAddress = address => {
  return [
    address.unit_floor,
    address.building_name,
    address.house_number,
    address.street_name,
    address.subdivision,
  ]
    .filter(Boolean)
    .join(', ');
};

export const formatLocation = address => {
  return [address.barangay, address.city, address.province]
    .filter(Boolean)
    .join(', ');
};
