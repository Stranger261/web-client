export const LEAFLET = {
  HOSPITALADDRESS: '82 J. P. Rizal St., Manggahan 1860 Rodriguez, Philippines',
  HOSPITAL_COORDS: [14.72414951530476, 121.14176532431448],
  ZOOM_LEVEL: 15,
};
export const GOOGLEMAPSURL = `https://google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  LEAFLET.HOSPITALADDRESS
)}`;

export const AUTH_SERVICE_BASE_URL = 'http://localhost:56741/api/v1';
export const PATIENT_SERVICE_BASE_URL = 'http://localhost:56742/api/v1';

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
];

export const CIVIL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'separated', label: 'Separated' },
  { value: 'divorced', label: 'Divorced' },
];

export const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
