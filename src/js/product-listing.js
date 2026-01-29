import {
  getParam,
  loadHeaderFooter,
  updateCartCount,
  initSearchForm,
  renderBreadcrumbs,
} from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
renderBreadcrumbs();

const category = getParam("category");
const search = getParam("search");

const dataSource = new ExternalServices();
const listUI = new ProductList(
  category || "tents",
  dataSource,
  ".product-list",
);

// Load data (category OR search)
let products = [];
if (search) {
  products = await dataSource.searchProducts(search);
  setPageTitle(`Search results: "${search}"`, products.length);
} else {
  const safeCategory = category || "tents";
  products = await dataSource.getData(safeCategory);
  setPageTitle(
    `Top Products: ${formatCategoryLabel(safeCategory)}`,
    products.length,
  );
}

listUI.list = Array.isArray(products) ? products : [];
listUI.renderList(listUI.list);

// Setup Quick View once (event delegation survives re-render)
setupQuickViewModal(dataSource);

// Sorting
const sortSelect = document.querySelector("#sortBy");
if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    const sorted = sortProducts(listUI.list, sortSelect.value);
    listUI.renderList(sorted);
  });
}

function sortProducts(items, sortBy) {
  const arr = [...(items || [])];

  if (sortBy === "name") {
    arr.sort((a, b) =>
      String(a?.NameWithoutBrand ?? a?.Name ?? "").localeCompare(
        String(b?.NameWithoutBrand ?? b?.Name ?? ""),
      ),
    );
  } else if (sortBy === "price") {
    arr.sort((a, b) => Number(a?.FinalPrice ?? 0) - Number(b?.FinalPrice ?? 0));
  }

  return arr;
}

function formatCategoryLabel(cat) {
  return String(cat)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function setPageTitle(title, count) {
  const titleEl = document.querySelector(".product-list-title");
  if (titleEl) titleEl.textContent = title;

  const countEl = document.querySelector("[data-bc-count]");
  if (countEl) countEl.textContent = `(${count} items)`;

  document.title = `Sleep Outside | ${title}`;
}

/* =========================
   Quick View Modal
========================= */

function setupQuickViewModal(services) {
  // Inject modal once
  if (!document.querySelector("#quickViewModal")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      `
      <div id="quickViewModal" class="qv-modal hidden" role="dialog" aria-modal="true" aria-labelledby="qvTitle">
        <div class="qv-backdrop" data-qv-close="true"></div>
        <div class="qv-panel" role="document">
          <button class="qv-close" type="button" aria-label="Close quick view" data-qv-close="true">✕</button>
          <div class="qv-content" id="qvContent">
            <p class="qv-loading">Loading...</p>
          </div>
        </div>
      </div>
      `,
    );
  }

  const modal = document.querySelector("#quickViewModal");
  const content = document.querySelector("#qvContent");
  const listEl = document.querySelector(".product-list");

  if (!modal || !content || !listEl) return;

  // Delegated click for quick view buttons
  listEl.addEventListener("click", async (e) => {
    const btn = e.target.closest(".quick-view-btn");
    if (!btn) return;

    const productId = btn.dataset.productId;
    if (!productId) return;

    openModal(modal);
    content.innerHTML = `<p class="qv-loading">Loading...</p>`;

    try {
      const product = await services.findProductById(productId);
      content.innerHTML = quickViewTemplate(product);
    } catch (err) {
      console.error("Quick View Error:", err);
      content.innerHTML = `
        <p class="qv-error">Sorry, we could not load this product right now.</p>
        <p><a href="/product_pages/?product=${productId}">Open product page</a></p>
      `;
    }
  });

  // Close on backdrop or X
  modal.addEventListener("click", (e) => {
    const shouldClose = e.target?.dataset?.qvClose === "true";
    if (shouldClose) closeModal(modal);
  });

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      closeModal(modal);
    }
  });
}

function openModal(modal) {
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal(modal) {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
}

function quickViewTemplate(product) {
  const name = product?.NameWithoutBrand ?? product?.Name ?? "Product";
  const brand = product?.Brand?.Name ?? product?.Brand ?? "";
  const price = Number(product?.FinalPrice ?? 0).toFixed(2);
  const img =
    product?.Images?.PrimaryLarge ||
    product?.Images?.PrimaryMedium ||
    product?.PrimaryLarge ||
    product?.PrimaryMedium ||
    "";

  const desc =
    product?.DescriptionHtmlSimple ||
    product?.Description ||
    "No description available.";

  return `
    <div class="qv-grid">
      <div class="qv-media">
        ${img ? `<img src="${img}" alt="${name}" />` : `<div class="qv-img-fallback">No image</div>`}
      </div>

      <div class="qv-details">
        <h2 id="qvTitle" class="qv-title">${name}</h2>
        ${brand ? `<p class="qv-brand">${brand}</p>` : ""}
        <p class="qv-price">$${price}</p>

        <div class="qv-desc">
          ${desc}
        </div>

        <div class="qv-actions">
          <a class="qv-link" href="/product_pages/?product=${product?.Id}">
            View full details
          </a>
        </div>
      </div>
    </div>
  `;
}
