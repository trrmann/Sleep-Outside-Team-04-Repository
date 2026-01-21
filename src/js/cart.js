import { getLocalStorage, setLocalStorage, updateCartCount, loadHeaderFooter } from "./utils.mjs";

await loadHeaderFooter(updateCartCount);

function cartItemTemplate(item) {
  const qty = Number(item.Quantity || 1);
  const price = Number(item.FinalPrice || 0);
  const lineTotal = price * qty;

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
      <p class="cart-card__quantity">qty: ${qty}</p>
      <p class="cart-card__price">$${lineTotal.toFixed(2)}</p>
    </li>
  `;
}


function renderCartContents() {
  const cart = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  const cartFooter = document.querySelector(".cart-footer");
  const cartTotalEl = document.querySelector(".cart-total");

  if (!cart.length) {
    productList.innerHTML = "<p class='cart-empty'>Your cart is empty.</p>";
    cartFooter.classList.add("hide");
    return;
  }

  productList.innerHTML = cart.map(cartItemTemplate).join("");
  attachRemoveListeners();

  // Calculate and display total
  const total = calculateCartTotal(cart);
  cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
  cartFooter.classList.remove("hide");
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

function calculateCartTotal(cartItems) {
  return cartItems.reduce((sum, item) => {
    const qty = Number(item.Quantity || 1);
    const price = Number(item.FinalPrice || 0);
    return sum + price * qty;
  }, 0);
}


// Initial render
renderCartContents();
