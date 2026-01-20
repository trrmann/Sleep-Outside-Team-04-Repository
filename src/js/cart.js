import { getLocalStorage, setLocalStorage } from "./utils.mjs";

function renderCartContents() {
  let cart = getLocalStorage("so-cart") || {};
  const cartKeys = Object.keys(cart);

  const productList = document.querySelector(".product-list");
  const cartFooter = document.querySelector(".cart-footer");
  const cartTotalAmount = document.querySelector(".cart-total-amount");

  // Handle empty cart
  if (cartKeys.length === 0) {
    productList.innerHTML = "<p class='cart-empty'>Your cart is empty.</p>";
    if (cartFooter) cartFooter.classList.add("hide");
    if (cartTotalAmount) cartTotalAmount.textContent = "0.00";
    return;
  }

  // Show footer if items exist
  if (cartFooter) cartFooter.classList.remove("hide");

  const cartItems = cartKeys.map((key) => cart[key].itemData);

  // Calculate total
  const totalCost = cartItems.reduce((acc, item) => {
    const quantity = cart[item.Id]?.count || 0;
    return acc + quantity * item.FinalPrice;
  }, 0);

  if (cartTotalAmount) {
    cartTotalAmount.textContent = totalCost.toFixed(2);
  }

  // Render items
  const htmlItems = cartItems.map((item) =>
    cartItemTemplate(item, cart[item.Id]?.count || 1),
  );

  productList.innerHTML = htmlItems.join("");

  // Attach listeners AFTER rendering
  attachRemoveListeners();
}

function cartItemTemplate(item, count) {
  return `
    <li class="cart-card divider" data-id="${item.Id}">
      <button class="cart-remove" data-id="${item.Id}" aria-label="Remove ${item.Name} from cart">×</button>
      
      <a href="#" class="cart-card__image">
        <img src="${item.Image}" alt="${item.Name}" />
      </a>
      <a href="#">
        <h2 class="card__name">${item.Name}</h2>
      </a>
      <p class="cart-card__color">${item.Colors?.[0]?.ColorName || "N/A"}</p>
      <p class="cart-card__quantity">qty: ${count}</p>
      <p class="cart-card__price">$${(item.FinalPrice * count).toFixed(2)}</p>
    </li>`;
}

function attachRemoveListeners() {
  document.querySelectorAll(".cart-remove").forEach((btn) => {
    // Remove any old listeners first (prevents duplicates on re-render)
    btn.removeEventListener("click", handleRemoveClick);
    btn.addEventListener("click", handleRemoveClick);
  });
}

// Named function so we can remove/add cleanly
function handleRemoveClick(e) {
  const productId = e.target.dataset.id;
  if (productId) {
    removeFromCart(productId);
    renderCartContents(); // re-render after change
  }
}

function removeFromCart(productId) {
  let cart = getLocalStorage("so-cart") || {};
  if (cart[productId]) {
    delete cart[productId];
    setLocalStorage("so-cart", cart);
  }
}

// Initial render
renderCartContents();
