// generic template list renderer
export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false
) {
  if (clear) parentElement.innerHTML = "";
  parentElement.insertAdjacentHTML(position, list.map(templateFn).join(""));
}

// wrapper for querySelector
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

// retrieve data from localStorage
export function getLocalStorage(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
}

// store data in localStorage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function getQueryParm(parmName) {
  // Get the full URL's query string (e.g., "?id=123&name=tent")
  const queryString = window.location.search;

  // Create a URLSearchParams object
  const urlParams = new URLSearchParams(queryString);

  // Get the value of the parameter
  return urlParams.get(parmName);
}

// URL param helper
export function getParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

export function updateCartCount() {
  const cart = getLocalStorage("so-cart") || [];
  const cartLink = document.querySelector(".cart a");

  if (!cartLink) return;

  let badge = cartLink.querySelector(".cart-count");

  if (!badge) {
    badge = document.createElement("span");
    badge.classList.add("cart-count");
    cartLink.appendChild(badge);
  }

  badge.textContent = cart.length;
}
