import { getLocalStorage, setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.product = {};
    this.dataSource = dataSource;
  }
  async init(){
    //this.product = await this.dataSource.findProductById(this.productId);
    const response = await fetch(`${this.dataSource.baseURL}product/${this.productId}`);
    this.product = (await response.json()).Result;
    // add listener to Add to Cart button
    const addToCartBtn = document.getElementById("addToCart");
    if (addToCartBtn) {
      addToCartBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.addProductToCart(this.product);
      });
    }
  }

  addProductToCart(product){
    console.log(product);
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
  renderProductDetails(){
    console.log(this.product);
    const pageTitleContainer = document.querySelector("title");
    pageTitleContainer.innerText = `Sleep Outside | ${this.product.NameWithoutBrand}`;
    const productBrandContainer = document.querySelector(".product-brand");
    productBrandContainer.innerText = this.product.Brand.Name;
    const productNameContainer = document.querySelector(".product-name");
    productNameContainer.innerText = this.product.NameWithoutBrand;
    const productImageContainer = document.querySelector(".product-image");
    productImageContainer.src = this.product.Images.PrimaryLarge;
    productImageContainer.alt = this.product.Name;
    const productPriceContainer = document.querySelector(".product-card__price");
    productPriceContainer.innerText = `$${this.product.FinalPrice}`;
    const productColorContainer = document.querySelector(".product__color");
    productColorContainer.innerText = this.product.Colors[0].ColorName;
    const productDescriptionContainer = document.querySelector(".product__description");
    productDescriptionContainer.innerHTML = this.product.DescriptionHtmlSimple;
    const productAddToCartButton = document.querySelector("#addToCart");
    productAddToCartButton.setAttribute("data-id", this.product.Id);
  }

}
