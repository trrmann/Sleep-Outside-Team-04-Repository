import { setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  // This code will get existing cart or initialize as empty array
  let cart = JSON.parse(localStorage.getItem("so-cart")) || [];

  // Here we can add new product
  cart.push(product);

  // This was the existing code that was saving the products, I change "product" to "cart" instead.
  setLocalStorage("so-cart", cart);
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
