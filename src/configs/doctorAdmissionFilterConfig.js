// configs/doctorAdmissionFilterConfig.js
export const doctorAdmissionFilterConfig = [
  {
    type: 'search',
    name: 'search',
    label: 'Search',
    placeholder: 'Search patient, MRN, diagnosis...',
  },
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    options: [
      { value: '', label: 'All Statuses' },
      { value: 'active', label: 'Active' },
      { value: 'pending_discharge', label: 'Pending Discharge' },
      { value: 'discharged', label: 'Discharged' },
      { value: 'transferred', label: 'Transferred' },
    ],
  },
  {
    type: 'select',
    name: 'admission_type',
    label: 'Admission Type',
    options: [
      { value: '', label: 'All Types' },
      { value: 'elective', label: 'Elective' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'transfer', label: 'Transfer' },
      { value: 'delivery', label: 'Delivery' },
    ],
  },
  {
    type: 'date',
    name: 'from_date',
    label: 'From Date',
  },
  {
    type: 'date',
    name: 'to_date',
    label: 'To Date',
  },
  {
    type: 'select',
    name: 'floor',
    label: 'Floor',
    options: [
      { value: '', label: 'All Floors' },
      { value: '1', label: 'Floor 1' },
      { value: '2', label: 'Floor 2' },
      { value: '3', label: 'Floor 3' },
      { value: '4', label: 'Floor 4' },
      { value: '5', label: 'Floor 5' },
    ],
  },
  {
    type: 'switch',
    name: 'discharge_pending',
    label: 'Pending Discharge Only',
    description: 'Show patients ready for discharge',
  },
];
