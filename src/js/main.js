import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

const productData = new ProductData("tents");
const productList = new ProductList(
  productData.category,
  productData,
  ".product-list",
);
await productList.init();
productList.renderList();
