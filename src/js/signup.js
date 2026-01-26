import {
  loadHeaderFooter,
  updateCartCount,
  initSearchForm,
  alertMessage,
  updateWishlistIcon,
} from "./utils.mjs";
import ProductData from "./ProductData.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
updateWishlistIcon();

const services = new ProductData();

const form = document.querySelector("#signup-form");
const statusEl = document.querySelector("#signup-status");

function normalizeError(err) {
  if (!err) return "Registration failed. Please try again.";

  if (typeof err.message === "string") return err.message;

  if (err.message && typeof err.message === "object") {
    // Backend often returns { message: {field: "error"} } or similar
    return Object.values(err.message).join(" | ");
  }

  return "Registration failed. Check console for details.";
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const name = String(form.name.value || "").trim();
    const address = String(form.address.value || "").trim();
    const email = String(form.email.value || "").trim().toLowerCase();
    const password = String(form.password.value || "");
    const passwordConfirm = String(form.passwordConfirm.value || "");
    const avatar = String(form.avatar.value || "").trim();

    if (password !== passwordConfirm) {
      alertMessage("Passwords do not match.", true);
      return;
    }

    // Required by server: email + password
    // Assignment required fields: name + address + email
    const payload = { name, address, email, password };
    if (avatar) payload.avatar = avatar;

    try {
      if (statusEl) statusEl.textContent = "Creating account...";

      const res = await services.registerUser(payload);
      console.log("REGISTER RESPONSE:", res);

      if (statusEl) statusEl.textContent = "";
      alertMessage("Account created successfully.", false);

      form.reset();
      window.location.href = "/index.html";
    } catch (err) {
      console.error("REGISTER ERROR:", err);
      if (statusEl) statusEl.textContent = "";
      alertMessage(`Create failed: ${normalizeError(err)}`, true);
    }
  });
}
