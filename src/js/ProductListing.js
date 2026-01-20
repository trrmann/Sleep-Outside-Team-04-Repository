import { getQueryParm } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

//const productID = getQueryParm("type");
const productID = "tents";
const productData = new ProductData(productID);
const productList = new ProductList(
  productData.category,
  productData,
  ".product-list",
);
await productList.init();
productList.renderList();
