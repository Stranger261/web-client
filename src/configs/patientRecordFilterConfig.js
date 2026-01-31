export const patientRecordConfig = [
  { type: 'search', name: 'search' },
  { type: 'date', name: 'startDate', label: 'Start Date' },
  { type: 'date', name: 'endDate', label: 'End Date' },
  {
    type: 'select',
    name: 'visitType',
    label: 'Visit Type',
    options: [
      { value: '', label: 'All Types' },
      { value: 'appointment', label: 'Appointments' },
      { value: 'admission', label: 'Admissions' },
      { value: 'er_visit', label: 'ER Visit' },
    ],
  },
  {
    type: 'select',
    name: 'status',
    label: 'Status',
    options: [
      { value: '', label: 'All Status' },
      { value: 'completed', label: 'Completed' },
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'active', label: 'Active' },
      { value: 'discharged', label: 'Discharged' },
    ],
  },
];
