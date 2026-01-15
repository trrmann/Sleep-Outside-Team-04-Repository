import ProductData from "./ProductData.mjs";
import ProductDetails from "./productDetails.mjs";

const dataSource = new ProductData("tents");

// Get the full URL's query string (e.g., "?id=123&name=tent")
const queryString = window.location.search;

// Create a URLSearchParams object
const urlParams = new URLSearchParams(queryString);

// Get the value of the 'id' parameter
const productID = urlParams.get("id");
const productDetails = new ProductDetails(productID, dataSource);
await productDetails.init();
productDetails.renderProductDetails();
