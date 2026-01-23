import {
  getParam,
  loadHeaderFooter,
  updateCartCount,
  initSearchForm,
  renderBreadcrumbs,
} from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
renderBreadcrumbs();

const category = getParam("category");
const search = getParam("search");

const dataSource = new ProductData();
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

  // optional: show count somewhere if you later add breadcrumbs
  const countEl = document.querySelector("[data-bc-count]");
  if (countEl) countEl.textContent = `(${count} items)`;

  document.title = `Sleep Outside | ${title}`;
}
