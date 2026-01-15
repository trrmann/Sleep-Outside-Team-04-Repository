import { getLocalStorage } from "./utils.mjs";

function renderCartContents() {
  const cartAllItems = getLocalStorage("so-cart");
  const cartTotal = document.querySelector(".cart-footer");
  const cartTotalAmount = document.querySelector(".cart-total-amount");
  const cartKeys = Object.keys(cartAllItems);
  if (cartKeys.length > 0) {
    cartTotal.classList.remove("hide");
  }
  const cartItems = cartKeys.map((key) => cartAllItems[key].itemData);
  const totalCost = cartItems.reduce(function (acc, item) {
    return acc + cartAllItems[item.Id].count * item.FinalPrice;
  }, 0);
  cartTotalAmount.textContent = `${totalCost.toFixed(2)}`;
  const htmlItems = cartItems.map((item) =>
    cartItemTemplate(item, cartAllItems[item.Id].count),
  );
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
}

function cartItemTemplate(item, count) {
  const newItem = `<li class="cart-card divider">
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: ${count}</p>
  <p class="cart-card__price">$${item.FinalPrice * count}</p>
</li>`;

  return newItem;
}

renderCartContents();
