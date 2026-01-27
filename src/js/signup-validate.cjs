/**
 * signup-validate.cjs
 *
 * CommonJS-compatible validation helpers for the signup form.
 * This file mirrors the ESM implementation used by the app, but
 * is provided in CommonJS format so test runners (Jest) can
 * require it without additional ESM configuration.
 *
 * Exports:
 *  - isValidEmail(email): boolean
 *  - isStrongPassword(pw): boolean
 *  - validateSignupData({name,address,email,password}): object (field->message)
 */

/**
 * Check whether a value looks like a valid email address.
 * This is a lightweight check suitable for client-side validation.
 *
 * @param {unknown} email
 * @returns {boolean} true when the value is a non-empty string matching a basic email pattern
 */
function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const s = String(email).trim().toLowerCase();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(s);
}

/**
 * Simple password strength checker.
 * Current policy: password must be a string with length >= 8.
 * Upgrade this function to add complexity or entropy checks if needed.
 *
 * @param {unknown} pw
 * @returns {boolean}
 */
function isStrongPassword(pw) {
  if (!pw || typeof pw !== "string") return false;
  return pw.length >= 8;
}

/**
 * Validate a signup payload and return an object of errors.
 * Each key maps to a form field name and the value is a user-facing
 * error message suitable for inline display.
 *
 * @param {{name?:any,address?:any,email?:any,password?:any}} param0
 * @returns {{[field:string]:string}}
 */
function validateSignupData({ name, address, email, password }) {
  const errors = {};
  if (!name || String(name).trim().length === 0) errors.name = "Name is required";
  if (!address || String(address).trim().length === 0) errors.address = "Address is required";
  if (!isValidEmail(email)) errors.email = "Valid email is required";
  if (!isStrongPassword(password)) errors.password = "Password must be at least 8 characters";
  return errors;
}

// Expose a simple CommonJS API for tests.
module.exports = { isValidEmail, isStrongPassword, validateSignupData };
