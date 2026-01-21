import { setLocalStorage } from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
    this.product = {};
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails();

    document
      .getElementById("addToCart")
      .addEventListener("click", this.addProductToCart.bind(this));
  }

  addProductToCart() {
    setLocalStorage("so-cart", this.product);
  }

  renderProductDetails() {
    // This assumes your product_pages/index.html has these elements/classes
    document.querySelector(".product-name").textContent = this.product.Name;
    const img = document.querySelector(".product-image");
    img.src = this.product.Image;
    img.alt = this.product.Name;

    document.querySelector(".product-card__price").textContent =
      `$${this.product.FinalPrice}`;

    document.querySelector(".product__color").textContent =
      this.product.Colors?.[0]?.ColorName ?? "";

    document.querySelector(".product__description").innerHTML =
      this.product.DescriptionHtmlSimple;
  }
}
