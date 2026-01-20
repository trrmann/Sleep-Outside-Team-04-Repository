import { getQueryParm } from "./utils.mjs";
import ProductData from "./ProductData.mjs";
import ProductDetails from "./productDetails.mjs";

// Get the value of the 'id' parameter
const productID = getQueryParm("id");
const dataSource = new ProductData(productID);
const productDetails = new ProductDetails(productID, dataSource);
await productDetails.init();
productDetails.renderProductDetails();
