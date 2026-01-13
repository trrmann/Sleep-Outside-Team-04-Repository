import { getLocalStorage, setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");
// Get the full URL's query string (e.g., "?id=123&name=tent")
const queryString = window.location.search;

// Create a URLSearchParams object
const urlParams = new URLSearchParams(queryString);

// Get the value of the 'id' parameter
const productID = urlParams.get("id");
const productData = await dataSource.findProductById(productID);
const pageTitleContainer = document.querySelector("title");
pageTitleContainer.innerText = `Sleep Outside | ${productData.NameWithoutBrand}`;
const productBrandContainer = document.querySelector(".product-brand");
productBrandContainer.innerText = productData.Brand.Name;
const productNameContainer = document.querySelector(".product-name");
productNameContainer.innerText = productData.NameWithoutBrand;
const productImageContainer = document.querySelector(".product-image");
productImageContainer.src = productData.Image;
productImageContainer.alt = productData.Name;
const productPriceContainer = document.querySelector(".product-card__price");
productPriceContainer.innerText = `$${productData.FinalPrice}`;
const productColorContainer = document.querySelector(".product__color");
productColorContainer.innerText = productData.Colors[0].ColorName;
const productDescriptionContainer = document.querySelector(".product__description");
productDescriptionContainer.innerHTML = productData.DescriptionHtmlSimple;
const productAddToCartButton = document.querySelector("#addToCart");
productAddToCartButton.setAttribute("data-id", productData.Id);

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
