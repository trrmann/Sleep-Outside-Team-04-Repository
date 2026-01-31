// Employee configuration
// This serves as a fallback if the backend doesn't include employee status in the JWT token.
// Add employee email addresses here to grant them access to all orders.

export const EMPLOYEE_EMAILS = [
  "admin@example.com",
  "manager@example.com",
  "tmann@byupathway.edu",
  // Add more employee emails here as needed
];

// Check if an email is in the employee list
export function isEmployeeEmail(email) {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  return EMPLOYEE_EMAILS.some(
    (emp) => String(emp).trim().toLowerCase() === normalized
  );
}
