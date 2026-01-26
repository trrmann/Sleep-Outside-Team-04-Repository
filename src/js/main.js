import {
  loadHeaderFooter,
  updateCartCount,
  initSearchForm,
  alertMessage,
  updateWishlistIcon,
} from "./utils.mjs";
import Alert from "./Alert.js";
import initRegisterCta from "./ctaRegister.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
updateWishlistIcon();
initRegisterCta({
  registerUrl: "/signup/index.html",
  delayMs: 700,
});

/* =========================
   Newsletter signup handler
========================= */
const form = document.querySelector("#newsletter-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const emailEl = document.querySelector("#newsletter-email");
    const email = String(emailEl?.value || "")
      .trim()
      .toLowerCase();

    // browser validation first
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // store locally until backend exists
    const key = "so-newsletter-signups";
    const existing = JSON.parse(localStorage.getItem(key) || "[]");

    const already = existing.some((x) => x.email === email);
    if (already) {
      alertMessage("You’re already subscribed. Thanks!", false);
      return;
    }

    existing.push({ email, date: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(existing));

    alertMessage(
      "Thanks for subscribing! Watch for our next deals email.",
      false,
    );
    form.reset();
  });
}

const alert = new Alert();
await alert.init();
