import { updateCartCount } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";
import Alert from "./Alert.js";

updateCartCount();

const alert = new Alert();
await alert.init();

const productData = new ProductData("tents");
const productList = new ProductList(
  productData.category,
  productData,
  ".product-list",
);
await productList.init();
productList.renderList();
