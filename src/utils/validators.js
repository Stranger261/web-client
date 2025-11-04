// src/utils/validators.js
import { useMemo } from 'react';

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
    message: 'Valid email format',
    validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  },
];

const PHONE_VALIDATORS = [
  {
    message: 'Valid phone number format',
    validate: value => /^[+]?[1-9][\d]{0,15}$/.test(value.replace(/\D/g, '')),
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
