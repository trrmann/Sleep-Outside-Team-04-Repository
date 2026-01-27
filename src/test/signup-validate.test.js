/* global describe, test, expect, beforeAll */

let validate;

beforeAll(() => {
  validate = require("../js/signup-validate.cjs");
});

describe("Signup validation utilities", () => {
  test("isValidEmail accepts valid emails and rejects invalid", () => {
    expect(validate.isValidEmail("jane@example.com")).toBe(true);
    expect(validate.isValidEmail("invalid-email")).toBe(false);
    expect(validate.isValidEmail("")).toBe(false);
    expect(validate.isValidEmail(null)).toBe(false);
  });

  test("isStrongPassword enforces minimum length", () => {
    expect(validate.isStrongPassword("12345678")).toBe(true);
    expect(validate.isStrongPassword("short")).toBe(false);
  });

  test("validateSignupData returns an errors object for missing/invalid fields", () => {
    const ok = validate.validateSignupData({
      name: "Jane",
      address: "1 Test St",
      email: "jane@example.com",
      password: "password123",
      passwordConfirm: "password123",
    });
    expect(Object.keys(ok).length).toBe(0);

    const bad = validate.validateSignupData({
      name: "",
      address: "",
      email: "no",
      password: "short",
      passwordConfirm: "different",
    });
    expect(bad.name).toBeTruthy();
    expect(bad.address).toBeTruthy();
    expect(bad.email).toBeTruthy();
    expect(bad.password).toBeTruthy();
    expect(bad.passwordConfirm).toBeTruthy();
  });
});
