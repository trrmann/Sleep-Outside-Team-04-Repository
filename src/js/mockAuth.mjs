// Mock authentication tokens for development testing
// WARNING: This file is for DEVELOPMENT ONLY - never use in production!

import { setToken } from "./Auth.mjs";

// Mock JWT tokens (base64 encoded JSON payloads)
// These are NOT real tokens - just for UI testing

// Employee token - has employee role
const MOCK_EMPLOYEE_TOKEN = createMockToken({
  id: "emp001",
  email: "admin@example.com",
  name: "Admin User",
  employee: true,
  isEmployee: true,
  role: "employee",
  exp: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year from now
});

// Customer token - regular user
const MOCK_CUSTOMER_TOKEN = createMockToken({
  id: "cust001",
  email: "customer@example.com",
  name: "Test Customer",
  employee: false,
  exp: Math.floor(Date.now() / 1000) + 86400 * 365, // 1 year from now
});

/**
 * Creates a mock JWT token with the given payload
 * Format: header.payload.signature (we only care about payload for testing)
 */
function createMockToken(payload) {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadEncoded = btoa(JSON.stringify(payload));
  const signature = "mock_signature_for_dev_testing";
  return `${header}.${payloadEncoded}.${signature}`;
}

/**
 * Set mock employee token for testing
 */
export function setMockEmployeeAuth() {
  setToken(MOCK_EMPLOYEE_TOKEN);
  console.log("[MOCK AUTH] Set employee token");
  console.log("Employee: admin@example.com");
  console.log("Reload page to see employee features");
  return MOCK_EMPLOYEE_TOKEN;
}

/**
 * Set mock customer token for testing
 */
export function setMockCustomerAuth() {
  setToken(MOCK_CUSTOMER_TOKEN);
  console.log("[MOCK AUTH] Set customer token");
  console.log("Customer: customer@example.com");
  console.log("Reload page to see customer features");
  return MOCK_CUSTOMER_TOKEN;
}

/**
 * Get the mock tokens for manual testing
 */
export function getMockTokens() {
  return {
    employee: MOCK_EMPLOYEE_TOKEN,
    customer: MOCK_CUSTOMER_TOKEN,
  };
}

// Expose to window for console access in development
if (import.meta.env?.DEV) {
  window.mockAuth = {
    setEmployee: setMockEmployeeAuth,
    setCustomer: setMockCustomerAuth,
    getTokens: getMockTokens,
  };
  console.log(
    "[MOCK AUTH] Available in console: mockAuth.setEmployee() or mockAuth.setCustomer()",
  );
}
