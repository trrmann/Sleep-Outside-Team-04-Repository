import {
  getLocalStorage,
  setLocalStorage,
  updateCartCount,
  loadHeaderFooter,
  initSearchForm,
  renderBreadcrumbs,
} from "./utils.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
renderBreadcrumbs();

function getItemQty(item) {
  const raw = item?.quantity ?? item?.Quantity ?? 1;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function setItemQty(item, qty) {
  return { ...item, quantity: qty, Quantity: qty };
}

function cartItemTemplate(item) {
  const qty = getItemQty(item);
  const price = Number(item?.FinalPrice ?? 0);
  const lineTotal = price * qty;

  return `
    <li class="cart-card divider">
      <button class="cart-remove" data-id="${item.Id}" aria-label="Remove item">×</button>
      <button class="move-to-wishlist" data-id="${item.Id}" aria-label="Move to wishlist">♡</button>

      <a href="/product_pages/?product=${item.Id}" class="cart-card__image">
        <img src="${getCartItemImage(item)}" alt="${item.Name ?? "Product"}" />
      </a>

      <a href="/product_pages/?product=${item.Id}">
        <h2 class="card__name">${item.Name ?? ""}</h2>
      </a>

      <p class="cart-card__color">${item?.Colors?.[0]?.ColorName ?? "N/A"}</p>

      <label class="cart-card__quantity" aria-label="Quantity">
        qty:
        <input
          class="qty-input"
          type="number"
          min="1"
          step="1"
          value="${qty}"
          data-id="${item.Id}"
          inputmode="numeric"
        />
      </label>

      <p class="cart-card__price">$${lineTotal.toFixed(2)}</p>
    </li>
  `;
}

function getCartItemImage(item) {
  return (
    item?.Images?.PrimaryMedium ||
    item?.Images?.PrimaryLarge ||
    item?.PrimaryMedium ||
    item?.PrimaryLarge ||
    item?.Image ||
    ""
  );
}

function renderCartContents() {
  const cart = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  const cartFooter = document.querySelector(".cart-footer");
  const cartTotalEl = document.querySelector(".cart-total");

  if (!productList) return;

  if (!cart.length) {
    productList.innerHTML = "<p class='cart-empty'>Your cart is empty.</p>";
    if (cartFooter) cartFooter.classList.add("hide");
    return;
  }

  productList.innerHTML = cart.map(cartItemTemplate).join("");

  attachRemoveListeners();
  attachQuantityHandlers(cart);

  const total = calculateCartTotal(cart);
  if (cartTotalEl) cartTotalEl.textContent = `Total: $${total.toFixed(2)}`;
  if (cartFooter) cartFooter.classList.remove("hide");
}

function attachRemoveListeners() {
  document.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      removeFromCart(id);
    });
  });
}

function attachQuantityHandlers(cartItems) {
  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const id = e.currentTarget.dataset.id;
      const nextQty = Math.max(1, parseInt(e.currentTarget.value, 10) || 1);

      const updated = cartItems.map((item) => {
        if (String(item.Id) === String(id)) {
          return setItemQty(item, nextQty);
        }
        return item;
      });

      setLocalStorage("so-cart", updated);
      updateCartCount();
      renderCartContents();
      attachWishlistMoveListeners();

    });

    // Optional: make Enter commit the value
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.currentTarget.blur();
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
    const qty = getItemQty(item);
    const price = Number(item?.FinalPrice ?? 0);
    return sum + price * qty;
  }, 0);
}

function attachWishlistMoveListeners() {
  document.querySelectorAll(".move-to-wishlist").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.dataset.id;
      moveToWishlist(id);
    });
  });
}

function moveToWishlist(productId) {
  const cart = getLocalStorage("so-cart") || [];
  const wishlist = getLocalStorage("so-wishlist") || [];

  const item = cart.find((i) => String(i.Id) === String(productId));
  if (!item) return;

  // Add if not already in wishlist
  if (!wishlist.some((w) => String(w.Id) === String(item.Id))) {
    wishlist.push(item);
    setLocalStorage("so-wishlist", wishlist);
  }

  // Remove from cart
  const updatedCart = cart.filter((i) => String(i.Id) !== String(productId));
  setLocalStorage("so-cart", updatedCart);
  updateCartCount();
  renderCartContents();
}


// Initial render
renderCartContents();
