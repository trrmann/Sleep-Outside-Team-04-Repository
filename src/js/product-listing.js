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

const category = getParam("category") || "tents";

const dataSource = new ProductData();
const productList = new ProductList(category, dataSource, ".product-list");

await productList.init();
productList.renderList();

const sortSelect = document.querySelector("#sortBy");

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    const sortBy = sortSelect.value;

    if (!sortBy) {
      productList.renderList(productList.list);
      return;
    }

    const sorted = [...productList.list];

    if (sortBy === "name") {
      sorted.sort((a, b) =>
        String(a?.NameWithoutBrand ?? a?.Name ?? "").localeCompare(
          String(b?.NameWithoutBrand ?? b?.Name ?? "")
        )
      );
    } else if (sortBy === "price") {
      sorted.sort(
        (a, b) => Number(a?.FinalPrice ?? 0) - Number(b?.FinalPrice ?? 0)
      );
    }

    productList.renderList(sorted);
  });
}
