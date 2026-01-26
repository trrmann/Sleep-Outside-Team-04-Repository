// src/js/ProductDetails.mjs
import {
  getLocalStorage,
  setLocalStorage,
  updateCartCount,
  alertMessage,
  animateCartIcon,
  getWishlist,
  setWishlist,
  isInWishlist,
  getProductComments,
  saveProductComment,
  formatDateTime
} from "./utils.mjs";

export default class ProductDetails {
  constructor(productId, dataSource) {
    this.productId = productId;
    this.dataSource = dataSource;
    this.product = {};
    this.selectedColor = null; // NEW
  }

  async init() {
    this.product = await this.dataSource.findProductById(this.productId);
    this.renderProductDetails();
    this.initComments();

    // Hook up Add to Cart
    const btn = document.getElementById("addToCart");
    if (btn) {
      btn.addEventListener("click", this.addProductToCart.bind(this));
      btn.dataset.id = this.product?.Id ?? "";
    }

    const wishBtn = document.getElementById("addToWishlist");
    if (wishBtn) {
      wishBtn.addEventListener("click", this.toggleWishlist.bind(this));
      this.updateWishlistButton();
    }

  }

  addProductToCart() {
    const cart = getLocalStorage("so-cart") || [];

    const swatchContainer = document.querySelector("#color-swatches");

    const selectedColorName =
      swatchContainer?.dataset?.selectedColorName ||
      this.product?.Colors?.[0]?.ColorName ||
      "";

    const selectedColorSwatch =
      swatchContainer?.dataset?.selectedColorSwatch ||
      "";

    // Unique key for same product + different color
    const lineKey = `${this.product.Id}::${selectedColorName}`;

    const existingIndex = cart.findIndex(
      (item) => String(item.lineKey) === String(lineKey)
    );

    if (existingIndex >= 0) {
      const existing = cart[existingIndex];
      const currentQty = Number(existing.quantity ?? existing.Quantity ?? 1);
      const nextQty =
        (Number.isFinite(currentQty) && currentQty > 0 ? currentQty : 1) + 1;

      cart[existingIndex] = {
        ...existing,
        quantity: nextQty,
        Quantity: nextQty,
        selectedColorName,
        selectedColorSwatch,
        lineKey,
        // keep compatibility with any UI that reads Colors[0]
        Colors: [{ ColorName: selectedColorName }],
      };
    } else {
      cart.push({
        ...this.product,
        quantity: 1,
        Quantity: 1,
        selectedColorName,
        selectedColorSwatch,
        lineKey,
        Colors: [{ ColorName: selectedColorName }],
      });
    }

    setLocalStorage("so-cart", cart);
    updateCartCount();
    animateCartIcon();
    alertMessage("Item added to cart!", false);
  }

  updateWishlistButton() {
    const btn = document.getElementById("addToWishlist");
    if (!btn) return;

    const inWish = isInWishlist(this.product?.Id);
    btn.textContent = inWish ? "Remove from Wishlist" : "Add to Wishlist";
    btn.dataset.inWishlist = inWish ? "true" : "false";
  }

  toggleWishlist() {
    const list = getWishlist();
    const id = String(this.product?.Id ?? "");
    if (!id) return;

    const exists = list.some((i) => String(i.Id) === id);

    let updated;
    if (exists) {
      updated = list.filter((i) => String(i.Id) !== id);
      alertMessage("Removed from wishlist.", false);
    } else {
      // Keep it simple: store the product object as-is
      updated = [{ ...this.product }, ...list];
      alertMessage("Added to wishlist!", false);
    }

    setWishlist(updated);
    this.updateWishlistButton();
  }

  renderProductDetails() {
    // Brand
    const brandEl = document.querySelector(".product-brand");
    if (brandEl) brandEl.textContent = this.product?.Brand?.Name ?? "";

    // Name
    const nameEl = document.querySelector(".product-name");
    if (nameEl) {
      nameEl.textContent =
        this.product?.NameWithoutBrand ?? this.product?.Name ?? "";
    }



    // Image / Carousel
    this.renderImageCarousel();

    // Price
    const priceEl = document.querySelector(".product-card__price");
    if (priceEl) {
      const final = Number(this.product?.FinalPrice ?? 0);
      priceEl.textContent = `$${final.toFixed(2)}`;
    }

    // Description
    const descEl = document.querySelector(".product__description");
    if (descEl) descEl.innerHTML = this.product?.DescriptionHtmlSimple ?? "";

    // Discount flag
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

    // Color (text) - will be overwritten by renderColorOptions when multi-color
    const colorEl = document.querySelector(".product__color");
    if (colorEl) colorEl.textContent = this.product?.Colors?.[0]?.ColorName ?? "";

    // NEW: Color options / swatches
    this.renderColorOptions();

    // Page title
    document.title = this.product?.Name ?? "Product Details";
  }

  getAllProductImages() {
    const imgs = [];

    const add = (url) => {
      const u = String(url || "").trim();
      if (u) imgs.push(u);
    };

    // Primary image (prefer bigger first)
    add(
      this.product?.Images?.PrimaryExtraLarge ||
      this.product?.Images?.PrimaryLarge ||
      this.product?.Images?.PrimaryMedium ||
      this.product?.PrimaryLarge ||
      this.product?.PrimaryMedium ||
      this.product?.Image ||
      ""
    );

    // ✅ Correct path based on your screenshot:
    // this.product.Images.ExtraImages = Array of { Src, Title }
    const extras = Array.isArray(this.product?.Images?.ExtraImages)
      ? this.product.Images.ExtraImages
      : [];

    extras.forEach((img) => {
      add(img?.Src || img?.src || img?.URL || img?.Url || "");
    });

    // de-dupe
    return [...new Set(imgs)];
  }

  renderImageCarousel() {
    const mainImg = document.querySelector(".product-image");
    if (!mainImg) return;

    const thumbsEl = document.querySelector("#carousel-thumbs");
    const prevBtn = document.querySelector(".carousel-btn.prev");
    const nextBtn = document.querySelector(".carousel-btn.next");

    const images = this.getAllProductImages();
    if (!images.length) return;

    let index = 0;

    const setMain = (i) => {
      index = (i + images.length) % images.length;
      mainImg.src = images[index];
      mainImg.alt = this.product?.Name ?? "Product image";

      // prevent old responsive candidates overriding
      mainImg.srcset = "";
      mainImg.sizes = "";

      if (thumbsEl) {
        thumbsEl.querySelectorAll(".carousel-thumb").forEach((btn, idx) => {
          btn.classList.toggle("is-active", idx === index);
        });
      }
    };

    // If only one image, hide controls + thumbs
    if (images.length === 1) {
      setMain(0);
      if (prevBtn) prevBtn.style.display = "none";
      if (nextBtn) nextBtn.style.display = "none";
      if (thumbsEl) thumbsEl.innerHTML = "";
      return;
    }

    // Show controls if multiple images
    if (prevBtn) prevBtn.style.display = "";
    if (nextBtn) nextBtn.style.display = "";

    // Build thumbnails
    if (thumbsEl) {
      thumbsEl.innerHTML = images
        .map(
          (src, i) => `
          <button class="carousel-thumb ${i === 0 ? "is-active" : ""}" type="button" data-index="${i}" aria-label="View image ${i + 1}">
            <img src="${src}" alt="" loading="lazy" />
          </button>
        `
        )
        .join("");

      thumbsEl.querySelectorAll(".carousel-thumb").forEach((btn) => {
        btn.addEventListener("click", () => {
          const i = Number(btn.dataset.index);
          if (Number.isFinite(i)) setMain(i);
        });
      });
    }

    // Prev/Next
    if (prevBtn) prevBtn.onclick = () => setMain(index - 1);
    if (nextBtn) nextBtn.onclick = () => setMain(index + 1);

    // Keyboard navigation
    mainImg.tabIndex = 0;
    mainImg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") setMain(index - 1);
      if (e.key === "ArrowRight") setMain(index + 1);
    });

    setMain(0);
  }


  /* =========================
     NEW: Color swatches
  ========================= */
  renderColorOptions() {
    const swatchContainer = document.querySelector("#color-swatches");
    const selectedNameEl = document.querySelector("#selected-color-name");
    const colorTextEl = document.querySelector(".product__color");
    const mainImg = document.querySelector(".product-image");

    if (!swatchContainer) return;

    const colors = Array.isArray(this.product?.Colors) ? this.product.Colors : [];

    // If 0 or 1 color, nothing to "pick"
    if (colors.length <= 1) {
      swatchContainer.innerHTML = "";
      const only = colors[0]?.ColorName ?? "—";
      if (selectedNameEl) selectedNameEl.textContent = only;
      if (colorTextEl) colorTextEl.textContent = only;
      this.selectedColor = colors[0] ?? null;
      return;
    }

    // Build swatches
    swatchContainer.innerHTML = colors
      .map((c, idx) => {
        const name = c?.ColorName ?? `Color ${idx + 1}`;

        // Swatch image (small)
        const swatch =
          c?.ColorSwatchImageSrc ||
          c?.ColorChipImageSrc ||
          c?.ColorPreviewImageSrc ||
          c?.SwatchImage ||
          "";

        // Hero image for main image update (best effort)
        const hero =
          c?.ColorProductImageSrc ||
          c?.ColorMainImageSrc ||
          c?.ColorImageSrc ||
          c?.ColorPreviewImageSrc ||
          swatch ||
          "";

        return `
        <button
          class="color-swatch ${idx === 0 ? "is-selected" : ""}"
          type="button"
          data-color-name="${escapeHtml(name)}"
          data-color-hero="${escapeHtml(hero)}"
          data-color-swatch="${escapeHtml(swatch)}"
          aria-label="Select color ${escapeHtml(name)}"
          title="${escapeHtml(name)}"
        >
          ${swatch
            ? `<img src="${swatch}" alt="${escapeHtml(name)}" loading="lazy" />`
            : `<span>${escapeHtml(name)}</span>`
          }
        </button>
      `;
      })
      .join("");

    // Apply the default (first selected)
    const firstBtn = swatchContainer.querySelector(".color-swatch.is-selected");
    applySelectedColor.call(this, firstBtn);

    // Attach click listeners directly (reliable)
    swatchContainer.querySelectorAll(".color-swatch").forEach((btn) => {
      btn.addEventListener("click", () => {
        swatchContainer
          .querySelectorAll(".color-swatch")
          .forEach((b) => b.classList.remove("is-selected"));

        btn.classList.add("is-selected");
        applySelectedColor.call(this, btn);
      });
    });

    function applySelectedColor(btn) {
      if (!btn) return;

      const name = btn.dataset.colorName || "—";
      const hero = btn.dataset.colorHero || "";
      const swatch = btn.dataset.colorSwatch || "";

      swatchContainer.dataset.selectedColorName = name;
      swatchContainer.dataset.selectedColorSwatch = swatch;


      // ✅ set class state correctly (no window globals)
      this.selectedColor = { ColorName: name, heroImage: hero, swatch };

      // Update UI labels
      if (selectedNameEl) selectedNameEl.textContent = name;
      if (colorTextEl) colorTextEl.textContent = name;

      // Update main image if we have a hero url
      if (mainImg && hero) {
        mainImg.src = hero;
        mainImg.alt = `${name} - ${this.product?.Name ?? "Product image"}`;

        // prevent old responsive candidates overriding new src
        mainImg.srcset = "";
        mainImg.sizes = "";
      }
    }
  }

  initComments() {
    const form = document.querySelector("#comment-form");
    const nameInput = document.querySelector("#comment-name");
    const textInput = document.querySelector("#comment-text");

    if (!form || !nameInput || !textInput) return;

    // Render existing comments
    this.renderComments();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = String(nameInput.value || "").trim();
      const text = String(textInput.value || "").trim();

      if (!name || text.length < 3) {
        alertMessage("Please enter your name and a valid comment.", true);
        return;
      }

      const comment = {
        id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
        name,
        text,
        createdAt: new Date().toISOString(),
      };

      saveProductComment(String(this.product?.Id), comment);

      nameInput.value = "";
      textInput.value = "";

      this.renderComments();
      alertMessage("Comment posted!", false);
    });
  }

  renderComments() {
    const listEl = document.querySelector("#comment-list");
    if (!listEl) return;

    const productId = String(this.product?.Id || "");
    const comments = getProductComments(productId);

    if (!comments.length) {
      listEl.innerHTML = `<li class="comment-card"><p class="comment-card__text">No comments yet. Be the first to comment.</p></li>`;
      return;
    }

    listEl.innerHTML = comments
      .map((c) => {
        const safeName = escapeHtml(c?.name ?? "");
        const safeText = escapeHtml(c?.text ?? "");
        const when = formatDateTime(c?.createdAt ?? "");

        return `
        <li class="comment-card">
          <div class="comment-card__meta">
            <span class="comment-card__name">${safeName}</span>
            <span class="comment-card__date">${escapeHtml(when)}</span>
          </div>
          <p class="comment-card__text">${safeText}</p>
        </li>
      `;
      })
      .join("");
  }

}
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#039;");
}
