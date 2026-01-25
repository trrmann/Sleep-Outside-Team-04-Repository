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

  const totalQty = cart.reduce(
    (sum, item) => sum + Number(item.Quantity || 1),
    0
  );

  badge.textContent = totalQty;
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
  }

  if (footerElement) {
    renderWithTemplate(footerTemplate, footerElement);
  }
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
    window.location.href = `/product_listing/index.html?search=${encodeURIComponent(q)}`;
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
      el.innerHTML = `Search → <strong>"${escapeHtml(search)}"</strong> <span data-bc-count></span>`;
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



