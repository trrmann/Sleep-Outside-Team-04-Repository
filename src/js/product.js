import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  let products = getLocalStorage("so-cart");
  if (products == undefined) {
    products = {};
  }
  if (Object.prototype.hasOwnProperty.call(products, product.Id)) {
    products[product.Id]["count"] = products[product.Id]["count"] + 1;
  } else {
    products[product.Id] = {
      count: 1,
      itemData: product,
    };
  }
  setLocalStorage("so-cart", products);
}
// add to cart button event handler
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);
