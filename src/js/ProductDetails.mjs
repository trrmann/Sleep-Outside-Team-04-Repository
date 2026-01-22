// src/js/ProductDetails.mjs
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

    const retail = Number(this.product?.SuggestedRetailPrice);
    const final = Number(this.product?.FinalPrice);

    const flag = document.querySelector("#discount-flag");
    if (flag) {
      if (Number.isFinite(retail) && Number.isFinite(final) && retail > final) {
        const percentOff = Math.round((1 - final / retail) * 100);
        const amountOff = (retail - final).toFixed(2);
        flag.textContent = `Discount: -${percentOff}% (Save $${amountOff})`;
      } else {
        flag.textContent = "";
      }
    }

    
    const btn = document.getElementById("addToCart");
    if (btn) {
      btn.addEventListener("click", this.addProductToCart.bind(this));
      btn.dataset.id = this.product?.Id ?? "";
    }
  }

  addProductToCart() {
    const cart = getLocalStorage("so-cart") || [];

    const existingIndex = cart.findIndex(
      (item) => String(item.Id) === String(this.product.Id)
    );

    if (existingIndex >= 0) {
      const existing = cart[existingIndex];

      // support both fields: Quantity (legacy) and quantity (new)
      const currentQty = Number(existing.quantity ?? existing.Quantity ?? 1);
      const nextQty = (Number.isFinite(currentQty) && currentQty > 0 ? currentQty : 1) + 1;

      cart[existingIndex] = { ...existing, quantity: nextQty, Quantity: nextQty };
    } else {
      cart.push({ ...this.product, quantity: 1, Quantity: 1 });
    }

    setLocalStorage("so-cart", cart);
    updateCartCount();
  }

  renderProductDetails() {
    // matches src/product_pages/index.html structure
    const brandEl = document.querySelector(".product-brand");
    if (brandEl) brandEl.textContent = this.product?.Brand?.Name ?? "";

    const nameEl = document.querySelector(".product-name");
    if (nameEl) {
      nameEl.textContent = this.product?.NameWithoutBrand ?? this.product?.Name ?? "";
    }

    // Responsive image: PrimaryMedium for small, PrimaryLarge for larger screens
    const img = document.querySelector(".product-image");
    if (img) {
      const medium =
        this.product?.Images?.PrimaryMedium || this.product?.PrimaryMedium || "";
      const large =
        this.product?.Images?.PrimaryLarge || this.product?.PrimaryLarge || "";
      const fallback =
        this.product?.Image || medium || large || "";

      img.src = medium || large || fallback;

      // Only set srcset if we have at least one valid URL
      const srcsetParts = [];
      if (medium) srcsetParts.push(`${medium} 600w`);
      if (large) srcsetParts.push(`${large} 1200w`);
      if (srcsetParts.length) {
        img.srcset = srcsetParts.join(", ");
        img.sizes = "(max-width: 600px) 600px, 1200px";
      }

      img.alt = this.product?.Name ?? "Product image";
    }

    const priceEl = document.querySelector(".product-card__price");
    if (priceEl) {
      const final = Number(this.product?.FinalPrice ?? 0);
      priceEl.textContent = `$${final.toFixed(2)}`;
    }

    const colorEl = document.querySelector(".product__color");
    if (colorEl) colorEl.textContent = this.product?.Colors?.[0]?.ColorName ?? "";

    const descEl = document.querySelector(".product__description");
    if (descEl) descEl.innerHTML = this.product?.DescriptionHtmlSimple ?? "";

    // Discount flag (requires an element with id="discount-flag" in the HTML)
    const flag = document.querySelector("#discount-flag");
    if (flag) {
      const retail = Number(this.product?.SuggestedRetailPrice);
      const final = Number(this.product?.FinalPrice);

      if (Number.isFinite(retail) && Number.isFinite(final) && retail > final) {
        const percentOff = Math.round((1 - final / retail) * 100);
        const amountOff = (retail - final).toFixed(2);
        flag.textContent = `Discount: -${percentOff}% (Save $${amountOff})`;
      } else {
        flag.textContent = "";
      }
    }

    // optional: set page title
    document.title = this.product?.Name ?? "Product Details";
  }
}
