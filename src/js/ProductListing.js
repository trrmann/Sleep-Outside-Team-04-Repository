import { getQueryParm } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

const productID = getQueryParm("category");

//const productID = "tents";
const productData = new ProductData();
const categoryLabel = document.getElementById("category-label");
switch (productID) {
  case "tents":
    categoryLabel.innerText = "Tents";
    break;
  case "backpacks":
    categoryLabel.innerText = "Backpacks";
    break;

  case "sleeping-bags":
    categoryLabel.innerText = "Sleeping Bags";
    break;
  case "hammocks":
    categoryLabel.innerText = "Hammocks";
    break;
}
const productList = new ProductList(productID, productData, ".product-list");
await productList.init();
productList.renderList();
