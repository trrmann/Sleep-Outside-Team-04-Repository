import { getLocalStorage, setLocalStorage, updateCartCount } from "./utils.mjs";

function cartItemTemplate(item) {
  return `
    <li class="cart-card divider">
      <button class="cart-remove" data-id="${item.Id}" aria-label="Remove item">×</button>

      <a href="../product_pages/?product=${item.Id}" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}" />
      </a>

      <a href="../product_pages/?product=${item.Id}">
        <h2 class="card__name">${item.Name}</h2>
      </a>

      <p class="cart-card__color">${item.Colors?.[0]?.ColorName ?? "N/A"}</p>
      <p class="cart-card__quantity">qty: 1</p>
      <p class="cart-card__price">$${Number(item.FinalPrice).toFixed(2)}</p>
    </li>
  `;
}

function renderCartContents() {
  const cart = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");

  if (!cart.length) {
    productList.innerHTML = "<p class='cart-empty'>Your cart is empty.</p>";
    return;
  }

  productList.innerHTML = cart.map(cartItemTemplate).join("");
  attachRemoveListeners();
}

function attachRemoveListeners() {
  document.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      removeFromCart(id);
    });
  });
}

function removeFromCart(productId) {
  const cart = getLocalStorage("so-cart") || [];
  const updated = cart.filter((item) => String(item.Id) !== String(productId));
  setLocalStorage("so-cart", updated);
  updateCartCount();
  renderCartContents();
}

// Initial render
renderCartContents();
