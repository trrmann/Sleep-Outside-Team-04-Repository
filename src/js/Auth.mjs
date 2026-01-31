// src/js/Auth.mjs
import { isEmployeeEmail } from "./employeeConfig.mjs";

const TOKEN_KEY = "so-auth-token-v1";

export function setToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}

// Decode JWT token payload (without verification - for client-side only)
function decodeToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
}

// Check if current user is an employee
export function isEmployee() {
  const token = getToken();
  if (!token) return false;

  const payload = decodeToken(token);
  if (!payload) return false;

  // First check: Does the backend include employee status in the token?
  const backendEmployee = Boolean(
    payload.employee || payload.isEmployee || payload.role === "employee"
  );

  if (backendEmployee) {
    return true;
  }

  // Fallback: Check against configured employee email list
  // This allows employee access even if backend doesn't set the flag
  const email =
    payload.email || payload.username || payload.sub || payload.user;

  if (email && isEmployeeEmail(email)) {
    console.log(
      `Employee access granted via email list: ${email.substring(0, 3)}***`
    );
    return true;
  }

  return false;
}
