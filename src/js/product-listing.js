import { getParam, loadHeaderFooter, updateCartCount } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();

const category = getParam("category") || "tents";

const dataSource = new ProductData();
const myList = new ProductList(category, dataSource, ".product-list");

await myList.init();
myList.renderList();

// Fix the title requirement: "Top Products: Backpacks" etc. :contentReference[oaicite:4]{index=4}
const titleEl = document.querySelector(".product-list-title");
if (titleEl) {
  titleEl.textContent = `Top Products: ${formatCategoryLabel(category)}`;
}
document.title = `Sleep Outside | ${formatCategoryLabel(category)}`;

function formatCategoryLabel(cat) {
  return String(cat)
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
