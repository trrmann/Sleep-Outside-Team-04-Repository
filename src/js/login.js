// src/js/login.js
import {
  loadHeaderFooter,
  updateCartCount,
  initSearchForm,
  alertMessage,
  updateWishlistIcon,
} from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import { setToken } from "./Auth.mjs";
import {
  debugLog,
  debugToken,
  debugAPIResponse,
  debugFormSubmit,
  showDevBanner,
} from "./debug.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
updateWishlistIcon();
showDevBanner();

const services = new ExternalServices();

const form = document.querySelector("#login-form");
const statusEl = document.querySelector("#login-status");

function normalizeError(err) {
  if (!err) return "Login failed. Please try again.";

  if (typeof err.message === "string") return err.message;

  if (err.message && typeof err.message === "object") {
    return Object.values(err.message)
      .filter((v) => typeof v === "string" && v.trim().length > 0)
      .join(" | ");
  }

  return "Login failed. Check console for details.";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const email = String(form.email.value || "")
      .trim()
      .toLowerCase();
    const password = String(form.password.value || "").trim();

    // Send email and password
    const credentials = {
      email,
      password,
    };

    debugFormSubmit("Login", { email, password: "***" });

    try {
      if (statusEl) statusEl.textContent = "Logging in...";

      debugLog("LOGIN", "Sending login request", { endpoint: "/api/login" });
      const res = await services.login(credentials);

      debugAPIResponse("/api/login", { status: 200, ok: true }, res);

      const token =
        res?.token ||
        res?.Token ||
        res?.accessToken ||
        res?.access_token ||
        res?.data?.token;

      if (!token) {
        debugLog("LOGIN", "⚠️ No token in response", res);
        throw new Error(
          "Login succeeded but no token was returned by the server.",
        );
      }

      debugLog("LOGIN", "✅ Token received from server");
      debugToken(token, "Login Token");

      setToken(token);
      debugLog("LOGIN", "Token stored in localStorage");

      if (statusEl) statusEl.textContent = "";
      alertMessage("Login successful. Redirecting to orders...", false);

      debugLog("LOGIN", "Redirecting to /orders/");
      window.location.href = "/orders/";
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      debugLog("LOGIN", "❌ Login failed", {
        error: err.message,
        stack: err.stack,
        fullError: err,
      });
      alertMessage(`Login failed: ${normalizeError(err)}`, true);
      if (statusEl) statusEl.textContent = "";
    }
  });
}

// Support a login button placed outside the form (mobile/layout scenarios)
const loginBtn = document.querySelector("#login-button");
if (loginBtn && form) {
  loginBtn.addEventListener("click", () => {
    // Use requestSubmit to run form validation and trigger the submit handler
    if (typeof form.requestSubmit === "function") form.requestSubmit();
    else form.submit();
  });
}

// Show/hide password support for the login page
const toggleLoginPw = document.querySelector("#toggle-login-password");
if (toggleLoginPw) {
  toggleLoginPw.addEventListener("click", () => {
    const pw = document.querySelector("#password");
    if (!pw) return;
    if (pw.type === "password") {
      pw.type = "text";
      toggleLoginPw.textContent = "Hide";
    } else {
      pw.type = "password";
      toggleLoginPw.textContent = "Show";
    }
  });
}
