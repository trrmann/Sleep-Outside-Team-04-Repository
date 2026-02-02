import {
  getLocalStorage,
  setLocalStorage,
  updateCartCount,
  loadHeaderFooter,
  initSearchForm,
  renderBreadcrumbs,
  updateWishlistIcon,
} from "./utils.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
renderBreadcrumbs();
updateWishlistIcon();

function getItemQty(item) {
  const raw = item?.quantity ?? item?.Quantity ?? 1;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function setItemQty(item, qty) {
  return { ...item, quantity: qty, Quantity: qty };
}

function getCartItemColor(item) {
  return item?.selectedColorName ?? item?.Colors?.[0]?.ColorName ?? "N/A";
}

function getLineKey(item) {
  const color = getCartItemColor(item);
  return item?.lineKey ?? `${item.Id}::${color}`;
}

function getColorSwatch(item) {
  return item?.selectedColorSwatch || "";
}

function cartItemTemplate(item) {
  const qty = getItemQty(item);
  const price = Number(item?.FinalPrice ?? 0);
  const lineTotal = price * qty;

  const color = getCartItemColor(item);
  const lineKey = getLineKey(item);
  const swatch = getColorSwatch(item);

  return `
    <li class="cart-card divider">
      <button class="cart-remove" data-linekey="${lineKey}" aria-label="Remove item">×</button>

      <a href="/product_pages/?product=${item.Id}" class="cart-card__image">
        <img src="${getCartItemImage(item)}" alt="${item.Name ?? "Product"}" />
      </a>

      <a href="/product_pages/?product=${item.Id}">
        <h2 class="card__name">${item.Name ?? ""}</h2>
      </a>

      <p class="cart-card__color">
        ${swatch ? `<img class="cart-color-swatch" src="${swatch}" alt="" aria-hidden="true" />` : ""}
        ${color}
      </p>

      <label class="cart-card__quantity" aria-label="Quantity">
        qty:
        <input
          class="qty-input"
          type="number"
          min="1"
          step="1"
          value="${qty}"
          data-linekey="${lineKey}"
          inputmode="numeric"
        />
      </label>

      <p class="cart-card__price">$${lineTotal.toFixed(2)}</p>
    </li>
  `;
}

function getCartItemImage(item) {
  // ✅ Prefer selected color swatch/preview image if available
  const colorImage =
    item?.selectedColorSwatch || item?.selectedColorImage || "";

  if (colorImage) return colorImage;

  // Fallback to base product images
  return (
    item?.Images?.PrimaryMedium ||
    item?.Images?.PrimaryLarge ||
    item?.PrimaryMedium ||
    item?.PrimaryLarge ||
    item?.Image ||
    ""
  );
}
   // ── Improve cart with message
function renderCartContents() {
  const cart = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");
  const cartFooter = document.querySelector(".cart-footer");
  const totalAmountEl = document.querySelector(".cart-total-amount");

  if (!productList) return;

  if (!cart.length) {
    productList.innerHTML = `
      <div class="cart-empty-message">
        <h2>Your cart is empty</h2>
        <p>Start exploring our outdoor gear and fill your cart with adventure essentials!</p>
        <a href="/product_listing/" class="button continue-shopping">
          Continue Shopping
        </a>
      </div>
    `;

    if (cartFooter) cartFooter.classList.add("hide");
    return;
  }

  productList.innerHTML = cart.map(cartItemTemplate).join("");

  attachRemoveListeners();
  attachQuantityHandlers(cart);

  const total = calculateCartTotal(cart);
  if (totalAmountEl) totalAmountEl.textContent = total.toFixed(2);

  if (cartFooter) cartFooter.classList.remove("hide");
}

function attachRemoveListeners() {
  document.querySelectorAll(".cart-remove").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const lineKey = e.currentTarget.dataset.linekey;
      removeFromCart(lineKey);
    });
  });
}

function attachQuantityHandlers(cartItems) {
  document.querySelectorAll(".qty-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const lineKey = e.currentTarget.dataset.linekey;
      const nextQty = Math.max(1, parseInt(e.currentTarget.value, 10) || 1);

      const updated = cartItems.map((item) => {
        if (String(getLineKey(item)) === String(lineKey)) {
          return setItemQty(item, nextQty);
        }
        return item;
      });

      setLocalStorage("so-cart", updated);
      updateCartCount();
      renderCartContents();
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") e.currentTarget.blur();
    });
  });
}

function removeFromCart(lineKey) {
  const cart = getLocalStorage("so-cart") || [];
  const updated = cart.filter(
    (item) => String(getLineKey(item)) !== String(lineKey),
  );
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

renderCartContents();
