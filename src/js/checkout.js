import CheckoutProcess from "./CheckoutProcess.mjs";

const checkout = new CheckoutProcess("so-cart", "main.checkout");

checkout.init();
checkout.calculateOrderTotal();

const form = document.forms["checkout"];

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!form.checkValidity()) {
    form.reportValidity();
    checkout.showMessage("Please fill out all required fields.", "error");
    return;
  }

  checkout.checkout(e);
});
