import {
  loadHeaderFooter,
  updateCartCount,
  getParam,
  initSearchForm,
  renderBreadcrumbs,
  updateWishlistIcon,
} from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductDetails from "./ProductDetails.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
renderBreadcrumbs();
updateWishlistIcon();

const dataSource = new ExternalServices();
const productId = getParam("product");

const productDetails = new ProductDetails(productId, dataSource);
productDetails.init();
