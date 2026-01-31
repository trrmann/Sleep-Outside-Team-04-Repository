// Debug utilities - only active in development/local environment
// This module provides debug logging that is automatically disabled in production

// Check if running in development mode
function isDevelopment() {
  // Check for localhost or local development indicators
  const hostname = window.location.hostname;
  const isLocal =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.endsWith(".local");

  // Also check Vite dev mode
  const isViteDev = import.meta.env?.DEV === true;

  return isLocal || isViteDev;
}

// Decode JWT token payload (for debugging only)
function decodeJWT(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

// Debug logger - only logs in development
export function debugLog(category, message, data = null) {
  if (!isDevelopment()) return;

  const timestamp = new Date().toISOString();
  const prefix = `[DEBUG:${category}] ${timestamp}`;

  console.group(prefix);
  console.log(message);

  if (data !== null) {
    if (typeof data === "object") {
      console.table(data);
      console.log("Raw data:", data);
    } else {
      console.log("Data:", data);
    }
  }

  console.groupEnd();
}

// Debug token information
export function debugToken(token, context = "Token") {
  if (!isDevelopment()) return;

  debugLog("AUTH", `${context} received`);

  if (!token) {
    console.warn("Token is null/undefined");
    return;
  }

  console.group(`[DEBUG:TOKEN] ${context} Details`);
  console.log("Token (first 20 chars):", token.substring(0, 20) + "...");
  console.log("Token length:", token.length);

  const payload = decodeJWT(token);
  if (payload) {
    console.log("📦 Decoded Payload:");
    console.table(payload);

    // Check for employee status
    const isEmployee =
      payload.employee || payload.isEmployee || payload.role === "employee";
    console.log(
      `👤 Employee Status: ${isEmployee ? "✅ YES" : "❌ NO"}`,
      isEmployee
        ? {
            employee: payload.employee,
            isEmployee: payload.isEmployee,
            role: payload.role,
          }
        : ""
    );

    // Check expiration
    if (payload.exp) {
      const expDate = new Date(payload.exp * 1000);
      const now = new Date();
      const isExpired = expDate < now;
      console.log(
        `⏰ Expiration: ${expDate.toLocaleString()}`,
        isExpired ? "⚠️ EXPIRED" : "✅ Valid"
      );
    }

    // User identification
    const userId =
      payload.userId ||
      payload.id ||
      payload.sub ||
      payload.email ||
      payload.username;
    console.log(`🔑 User ID:`, userId);
  } else {
    console.warn("⚠️ Failed to decode token payload");
  }

  console.groupEnd();
}

// Debug API response
export function debugAPIResponse(endpoint, response, data = null) {
  if (!isDevelopment()) return;

  console.group(`[DEBUG:API] ${endpoint}`);
  console.log("Status:", response.status, response.statusText);
  console.log("OK:", response.ok);

  if (data) {
    console.log("Response data:");
    console.table(data);
    console.log("Raw response:", data);
  }

  console.groupEnd();
}

// Debug form submission
export function debugFormSubmit(formName, formData) {
  if (!isDevelopment()) return;

  console.group(`[DEBUG:FORM] ${formName} Submission`);
  console.log("Timestamp:", new Date().toISOString());

  // Don't log passwords in plain text - mask them
  const safeData = { ...formData };
  if (safeData.password) safeData.password = "***MASKED***";
  if (safeData.passwordConfirm) safeData.passwordConfirm = "***MASKED***";

  console.table(safeData);
  console.log("Form data:", safeData);
  console.groupEnd();
}

// Visual debug banner for development mode
export function showDevBanner() {
  if (!isDevelopment()) return;

  const banner = document.createElement("div");
  banner.id = "dev-debug-banner";
  banner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #ff6b00;
    color: white;
    padding: 4px 8px;
    text-align: center;
    font-size: 12px;
    font-weight: bold;
    z-index: 999999;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  `;
  banner.textContent = "🔧 DEVELOPMENT MODE - Debug logging enabled";

  document.body.prepend(banner);

  // Auto-hide after 3 seconds
  setTimeout(() => {
    banner.style.transition = "opacity 0.5s";
    banner.style.opacity = "0";
    setTimeout(() => banner.remove(), 500);
  }, 3000);
}
