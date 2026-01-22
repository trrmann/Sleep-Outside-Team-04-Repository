import { loadHeaderFooter, updateCartCount, getParam, initSearchForm, renderBreadcrumbs } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./ProductDetails.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
renderBreadcrumbs();


const dataSource = new ProductData();
const productId = getParam("product");

const productDetails = new ProductDetails(productId, dataSource);
productDetails.init();