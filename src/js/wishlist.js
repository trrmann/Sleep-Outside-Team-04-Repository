import {
  loadHeaderFooter,
  updateCartCount,
  initSearchForm,
  renderBreadcrumbs,
  getLocalStorage,
  setLocalStorage,
  getWishlist,
  setWishlist,
  alertMessage,
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

function addToCart(product) {
  const cart = getLocalStorage("so-cart") || [];

  // If your cart uses variants, keep it simple: just add product as a line
  cart.push({ ...product, quantity: 1, Quantity: 1 });

  setLocalStorage("so-cart", cart);
  updateCartCount();
}

function wishlistItemTemplate(item) {
  const img =
    item?.Images?.PrimaryMedium ||
    item?.Images?.PrimaryLarge ||
    item?.PrimaryMedium ||
    item?.PrimaryLarge ||
    item?.Image ||
    "";

  const price = Number(item?.FinalPrice ?? 0);

  return `
    <li class="cart-card divider">
      <button class="wish-remove" data-id="${item.Id}" aria-label="Remove item">×</button>

      <a href="/product_pages/?product=${item.Id}" class="cart-card__image">
        <img src="${img}" alt="${item.Name ?? "Product"}" />
      </a>

      <a href="/product_pages/?product=${item.Id}">
        <h2 class="card__name">${item.Name ?? ""}</h2>
      </a>

      <p class="cart-card__price">$${price.toFixed(2)}</p>

      <button class="wish-move" data-id="${item.Id}" type="button">
        Move to Cart
      </button>
    </li>
  `;
}

function renderWishlist() {
  const list = getWishlist();
  const ul = document.querySelector(".product-list");
  const note = document.querySelector("#wishlist-note");

  if (!ul) return;

  if (!list.length) {
    ul.innerHTML = `<p class="cart-empty">Your wishlist is empty.</p>`;
    if (note)
      note.textContent = "Browse products and add items to your wishlist.";
    return;
  }

  ul.innerHTML = list.map(wishlistItemTemplate).join("");
  if (note) note.textContent = "";

  document.querySelectorAll(".wish-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const updated = list.filter((i) => String(i.Id) !== String(id));
      setWishlist(updated);
      renderWishlist();
      alertMessage("Removed from wishlist.", false);
    });
  });

  document.querySelectorAll(".wish-move").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const item = list.find((i) => String(i.Id) === String(id));
      if (!item) return;

      addToCart(item);

      const updated = list.filter((i) => String(i.Id) !== String(id));
      setWishlist(updated);

      renderWishlist();
      alertMessage("Moved to cart!", false);
    });
  });
}

renderWishlist();
