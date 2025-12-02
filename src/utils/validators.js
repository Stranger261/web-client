// Create stable validator instances (singleton pattern)
const PASSWORD_VALIDATORS = [
  {
    message: 'At least 8 characters',
    validate: value => value.length >= 8,
  },
  {
    message: 'Contains at least one number',
    validate: value => /\d/.test(value),
  },
  {
    message: 'Contains at least one special character',
    validate: value => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value),
  },
  {
    message: 'Contains at least one uppercase letter',
    validate: value => /[A-Z]/.test(value),
  },
  {
    message: 'Contains at least one lowercase letter',
    validate: value => /[a-z]/.test(value),
  },
];

const EMAIL_VALIDATORS = [
  {
    message: 'Must contain @ symbol',
    validate: value => value.includes('@'),
  },
  {
    message: 'Must have text before @',
    validate: value => {
      const parts = value.split('@');
      return parts[0] && parts[0].length > 0;
    },
  },
  {
    message: 'Must have domain after @ (e.g., gmail.com)',
    validate: value => {
      const parts = value.split('@');
      return parts[1] && parts[1].length > 0;
    },
  },
  {
    message: 'Domain must contain a dot (e.g., .com, .org)',
    validate: value => {
      const parts = value.split('@');
      return parts[1] && parts[1].includes('.');
    },
  },
  {
    message: 'Valid email format (e.g., user@example.com)',
    validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
];

const PHONE_VALIDATORS = [
  {
    message: 'Must start with 9',
    validate: value => {
      const phone = value.replace('+63', '');
      return phone.startsWith('9');
    },
  },
  {
    message: 'Must be exactly 10 digits',
    validate: value => {
      const phone = value.replace('+63', '');
      return phone.length === 10;
    },
  },
  {
    message: 'Valid Philippine mobile number',
    validate: value => {
      const phone = value.replace('+63', '');
      return /^9\d{9}$/.test(phone);
    },
  },
];

// Simple getter functions that return the same array reference
export const getPasswordValidators = () => PASSWORD_VALIDATORS;
export const getEmailValidators = () => EMAIL_VALIDATORS;
export const getPhoneValidators = () => PHONE_VALIDATORS;

// Hooks that return stable references (these won't cause re-renders)
export const usePasswordValidators = () => PASSWORD_VALIDATORS;
export const useEmailValidators = () => EMAIL_VALIDATORS;
export const usePhoneValidators = () => PHONE_VALIDATORS;

// Simplified validation function (no state management)
export const validateValue = (value, validators) => {
  if (!validators || !value) {
    return { results: [], isValid: true, allValid: false };
  }

  const results = validators.map(validator => ({
    ...validator,
    isValid: validator.validate(value),
  }));

  const allValid = results.every(r => r.isValid);

  return {
    results,
    isValid: allValid,
    allValid,
  };
};
