// src/js/login.js
import {
  loadHeaderFooter,
  updateCartCount,
  initSearchForm,
  alertMessage,
  updateWishlistIcon,
} from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import { setToken } from "./Auth.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
updateWishlistIcon();

const services = new ProductData();

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

    const email = String(form.email.value || "").trim().toLowerCase();
    const password = String(form.password.value || "").trim();

    // ✅ Send both keys to satisfy either backend expectation
    const credentials = {
      email,
      username: email,
      password,
    };

    try {
      if (statusEl) statusEl.textContent = "Logging in...";

      const res = await services.login(credentials);

      const token =
        res?.token ||
        res?.Token ||
        res?.accessToken ||
        res?.access_token ||
        res?.data?.token;

      if (!token) {
        throw new Error(
          "Login succeeded but no token was returned by the server."
        );
      }

      setToken(token);

      if (statusEl) statusEl.textContent = "";
      alertMessage(
        "Login successful. You can now access protected pages.",
        false
      );

      window.location.href = "/index.html";
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      alertMessage(`Login failed: ${normalizeError(err)}`, true);
      if (statusEl) statusEl.textContent = "";
    }
  });
}
