// Filter configuration
export const admissionFilterConfig = [
  {
    type: 'search',
    name: 'search',
    placeholder: 'Search by patient name, MRN, admission #, or bed...',
  },
  {
    type: 'select',
    name: 'status',
    label: 'Admission Status',
    options: [
      { value: '', label: 'All Status' },
      { value: 'active', label: 'Active' },
      { value: 'pending_discharge', label: 'Pending Discharge' },
      { value: 'discharged', label: 'Discharged' },
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
    type: 'select',
    name: 'admission_source',
    label: 'Admission Source',
    options: [
      { value: '', label: 'All Sources' },
      { value: 'emergency', label: 'Emergency' },
      { value: 'outpatient', label: 'Outpatient' },
      { value: 'transfer', label: 'Transfer' },
      { value: 'referral', label: 'Referral' },
    ],
  },
  {
    type: 'date',
    name: 'from_date',
    label: 'Admitted From',
  },
  {
    type: 'date',
    name: 'to_date',
    label: 'Admitted To',
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
    ],
  },
];
