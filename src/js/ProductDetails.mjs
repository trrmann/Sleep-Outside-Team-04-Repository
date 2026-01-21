import { getLocalStorage, setLocalStorage, updateCartCount } from "./utils.mjs";


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
    const cart = getLocalStorage("so-cart") || [];

    const existingIndex = cart.findIndex(
      (item) => String(item.Id) === String(this.product.Id)
    );

    if (existingIndex >= 0) {
      const existing = cart[existingIndex];
      existing.Quantity = (existing.Quantity || 1) + 1;
      cart[existingIndex] = existing;
    } else {
      cart.push({ ...this.product, Quantity: 1 });
    }

    setLocalStorage("so-cart", cart);
    updateCartCount();
  }


  renderProductDetails() {
    // matches src/product_pages/index.html structure
    document.querySelector(".product-brand").textContent =
      this.product.Brand?.Name ?? "";

    document.querySelector(".product-name").textContent =
      this.product.NameWithoutBrand ?? this.product.Name ?? "";

    const img = document.querySelector(".product-image");
    img.src = this.product.Image;
    img.alt = this.product.Name ?? "Product image";

    document.querySelector(".product-card__price").textContent =
      `$${Number(this.product.FinalPrice).toFixed(2)}`;

    document.querySelector(".product__color").textContent =
      this.product.Colors?.[0]?.ColorName ?? "";

    document.querySelector(".product__description").innerHTML =
      this.product.DescriptionHtmlSimple ?? "";

    // optional: set page title + button data-id
    document.title = this.product.Name ?? "Product Details";
    document.getElementById("addToCart").dataset.id = this.product.Id ?? "";
  }
}
