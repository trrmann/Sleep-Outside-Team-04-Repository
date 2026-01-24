import { loadHeaderFooter, updateCartCount, initSearchForm } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import CheckoutProcess from "./CheckoutProcess.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();

const services = new ProductData();
const checkoutProcess = new CheckoutProcess("so-cart", "#orderSummary", services);
checkoutProcess.init();

// Calculate tax/shipping after zip entered
const zipInput = document.querySelector("#zip");
if (zipInput) {
  zipInput.addEventListener("change", () => {
    if (zipInput.value.trim()) checkoutProcess.calculateOrderTotal();
  });
}

// Submit order
const form = document.querySelector("#checkout-form");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // ensure totals are calculated even if zip change event didn't fire
    checkoutProcess.calculateOrderTotal();

    try {
      const response = await checkoutProcess.checkout(form);

      console.log("ORDER RESPONSE:", response);

      // Clear cart
      localStorage.removeItem("so-cart");
      updateCartCount();

      // Show success modal
      showSuccessModal();
    } catch (err) {
      console.error("CHECKOUT ERROR:", err);
      alert(err.message);
    }
  });
}

function showSuccessModal() {
  const modal = document.querySelector("#checkout-modal");
  const closeBtn = document.querySelector("#modal-close-btn");

  if (!modal) return;

  modal.classList.remove("hidden");

  const redirect = () => {
    window.location.href = "/index.html";
  };

  // Button click
  if (closeBtn) {
    closeBtn.addEventListener("click", redirect, { once: true });
  }

  // Auto redirect after 4 seconds
  setTimeout(redirect, 4000);
}
