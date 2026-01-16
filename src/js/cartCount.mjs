export function updateCartCount() {
  const badge = document.querySelector("#cart-count");
  if (!badge) return;

  const cart = JSON.parse(localStorage.getItem("so-cart")) || [];
  let total = 0;

  cart.forEach(item => {
    total += item.quantity ? item.quantity : 1;
  });

  if (total > 0) {
    badge.textContent = total;
  } else {
    badge.textContent = "";
  }
}
