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

export function getItemQuantity(item) {
  const raw = item?.quantity ?? item?.Quantity ?? 1;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
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

  const totalQty = cart.reduce((sum, item) => sum + getItemQuantity(item), 0);
  badge.textContent = totalQty;
}

export function getWishlist(key = "so-wishlist") {
  return getLocalStorage(key) || [];
}

export function setWishlist(list, key = "so-wishlist") {
  setLocalStorage(key, list);
}

export function isInWishlist(productId, key = "so-wishlist") {
  const list = getWishlist(key);
  return list.some((i) => String(i.Id) === String(productId));
}

export function updateWishlistIcon() {
  const link = document.querySelector(".wishlist-link");
  if (!link) return;

  const list = JSON.parse(localStorage.getItem("so-wishlist") || "[]");

  link.textContent = list.length ? "❤️" : "🤍";
}


export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.innerHTML = template;
  if (callback) callback(data);
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  return await res.text();
}

export async function loadHeaderFooter(callback) {
  const headerTemplate = await loadTemplate("/partials/header.html");
  const footerTemplate = await loadTemplate("/partials/footer.html");

  const headerElement = document.querySelector("#main-header");
  const footerElement = document.querySelector("#main-footer");

  if (headerElement) {
    renderWithTemplate(headerTemplate, headerElement, null, callback);
    updateHeaderAuth();
  }

  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
}

// Update header links based on authentication state
function updateHeaderAuth() {
  // Dynamically import Auth to avoid circular dependencies
  import("./Auth.mjs").then(({ isLoggedIn, isEmployee, clearToken }) => {
    const loginLink = document.querySelector(".login");
    if (!loginLink) return;

    if (isLoggedIn()) {
      // User is logged in - show Orders (if employee) and Logout
      let html = "";
      
      if (isEmployee()) {
        html += '<li class="orders"><a href="/orders/">Orders</a></li>';
      }
      
      html += '<li class="logout"><a href="#" id="logout-link">Logout</a></li>';
      
      loginLink.outerHTML = html;

      // Setup logout handler
      const logoutLink = document.getElementById("logout-link");
      if (logoutLink) {
        logoutLink.addEventListener("click", (e) => {
          e.preventDefault();
          clearToken();
          window.location.href = "/login/";
        });
      }
    }
    // If not logged in, keep the Login link as-is
  });
}

// For search form submission
export function initSearchForm() {
  const form = document.querySelector("#product-search");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const q = String(formData.get("q") || "").trim();
    if (!q) return;

    // redirect to product listing with search param
    window.location.href = `/product_listing/index.html?search=${encodeURIComponent(
      q
    )}`;
  });
}

// breadcrumb builder
export function renderBreadcrumbs() {
  const el = document.querySelector("#breadcrumbs");
  if (!el) return;

  const path = window.location.pathname;

  // Product listing
  if (path.includes("/product_listing/")) {
    const category = getParam("category");
    const search = getParam("search");

    if (search) {
      el.innerHTML = `Search → <strong>"${escapeHtml(
        search
      )}"</strong> <span data-bc-count></span>`;
      return;
    }

    if (category) {
      const label = formatCategoryLabel(category);
      el.innerHTML = `${label} → <span data-bc-count></span>`;
      return;
    }

    el.innerHTML = `Products`;
    return;
  }

  // Product detail
  if (path.includes("/product_pages/")) {
    const category = getParam("category");
    if (category) {
      el.innerHTML = `${formatCategoryLabel(category)}`;
    } else {
      el.innerHTML = `Product`;
    }
    return;
  }

  // Cart
  if (path.includes("/cart/")) {
    el.innerHTML = `Cart`;
  }
}

function formatCategoryLabel(cat) {
  return String(cat)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}

// NEW: convert checkout form to JSON payload
export function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const json = {};
  for (const [key, value] of formData.entries()) {
    json[key] = typeof value === "string" ? value.trim() : value;
  }
  return json;
}

export function alertMessage(message, scroll = true) {
  const alert = document.createElement("div");
  alert.classList.add("alert");

  alert.innerHTML = `
    <span>${message}</span>
    <button class="alert-close">✕</button>
  `;

  alert.addEventListener("click", (e) => {
    if (e.target.classList.contains("alert-close")) {
      alert.remove();
    }
  });

  const main = document.querySelector("main");
  if (main) main.prepend(alert);

  if (scroll) window.scrollTo(0, 0);
}

export function animateCartIcon() {
  // Header cart link should exist after loadHeaderFooter()
  const cartLink = document.querySelector(".cart a");
  if (!cartLink) return;

  // remove if already there so it can replay
  cartLink.classList.remove("cart-animate");

  // force reflow to restart animation reliably
  void cartLink.offsetWidth;

  cartLink.classList.add("cart-animate");

  // cleanup after animation ends
  setTimeout(() => {
    cartLink.classList.remove("cart-animate");
  }, 700);
}

export function getProductComments(productId) {
  const all = JSON.parse(localStorage.getItem("so-comments") || "{}");
  return Array.isArray(all?.[productId]) ? all[productId] : [];
}

export function saveProductComment(productId, comment) {
  const all = JSON.parse(localStorage.getItem("so-comments") || "{}");
  const list = Array.isArray(all?.[productId]) ? all[productId] : [];
  all[productId] = [comment, ...list];
  localStorage.setItem("so-comments", JSON.stringify(all));
}

export function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
