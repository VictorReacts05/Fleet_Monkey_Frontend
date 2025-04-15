// Basic validations
export const validateRequired = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return '';
};

// Email validation
export const validateEmail = (email) => {
  if (!email) return '';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) ? '' : 'Invalid email format';
};

// URL validation
export const validateUrl = (url) => {
  if (!url) return '';
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
  return urlRegex.test(url) ? '' : 'Invalid URL format';
};

// Phone number validation
export const validatePhone = (phone) => {
  if (!phone) return '';
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone) ? '' : 'Invalid phone number format';
};

// Number plate validation
export const validateNumberPlate = (plate) => {
  if (!plate) return '';
  const plateRegex = /^[A-Z0-9\s-]{5,}$/;
  return plateRegex.test(plate) ? '' : 'Invalid number plate format';
};

// Currency validation
export const validateCurrency = (amount) => {
  if (!amount) return '';
  return isNaN(amount) ? 'Invalid currency amount' : '';
};

// Code validation (IFSC, IBAN, etc.)
export const validateCode = (code, type) => {
  if (!code) return '';
  
  const patterns = {
    IFSC: /^[A-Z]{4}0[A-Z0-9]{6}$/,
    IBAN: /^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/,
    VIN: /^[A-HJ-NPR-Z0-9]{17}$/,
    MICR: /^\d{9}$/
  };

  return patterns[type]?.test(code) ? '' : `Invalid ${type} format`;
};

// Name validation
export const validateName = (name) => {
  if (!name) return '';
  const nameRegex = /^[a-zA-Z\s'-]{2,}$/;
  return nameRegex.test(name) ? '' : 'Invalid name format';
};

// Date validation
export const validateDate = (date) => {
  if (!date) return '';
  return date instanceof Date && !isNaN(date) ? '' : 'Invalid date format';
};