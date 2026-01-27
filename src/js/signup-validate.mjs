// Simple validation utilities for signup form
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const s = String(email).trim().toLowerCase();
  // simple email regex
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(s);
}

export function isStrongPassword(pw) {
  if (!pw || typeof pw !== 'string') return false;
  return pw.length >= 8;
}

export function validateSignupData({ name, address, email, password }) {
  const errors = {};
  if (!name || String(name).trim().length === 0) errors.name = 'Name is required';
  if (!address || String(address).trim().length === 0) errors.address = 'Address is required';
  if (!isValidEmail(email)) errors.email = 'Valid email is required';
  if (!isStrongPassword(password)) errors.password = 'Password must be at least 8 characters';
  return errors;
}

export default { isValidEmail, isStrongPassword, validateSignupData };
