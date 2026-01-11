export const ALLERGY_TYPES = ['medication', 'food', 'environmental', 'other'];

export const SEVERITY_LEVELS = [
  'mild',
  'moderate',
  'severe',
  'life_threatening',
];

export const SEVERITY_COLORS = {
  mild: '#10b981', // green
  moderate: '#f59e0b', // yellow
  severe: '#ef4444', // red
  life_threatening: '#7f1d1d', // dark red
};

export const SEVERITY_LABELS = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe',
  life_threatening: 'Life Threatening',
};

export const ALLERGY_TYPE_LABELS = {
  medication: 'Medication',
  food: 'Food',
  environmental: 'Environmental',
  other: 'Other',
};

export const INITIAL_ALLERGY_DATA = {
  allergen: '',
  allergy_type: 'food',
  severity: 'mild',
  reaction: '',
  reported_date: new Date().toISOString().split('T')[0],
};
