// src/js/ProductList.mjs
import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  const final = Number(product?.FinalPrice ?? 0);
  const retail = Number(product?.SuggestedRetailPrice ?? 0);

  const isDiscounted =
    Number.isFinite(final) &&
    Number.isFinite(retail) &&
    retail > 0 &&
    final < retail;

  const percentOff = isDiscounted ? Math.round((1 - final / retail) * 100) : 0;

  const medium = product?.Images?.PrimaryMedium || product?.PrimaryMedium || "";
  const large = product?.Images?.PrimaryLarge || product?.PrimaryLarge || "";
  const fallback = getProductImage(product);

  return `
    <li class="product-card">
      <a href="/product_pages/?product=${product.Id}">
        ${isDiscounted ? `<span class="discount-badge">-${percentOff}%</span>` : ""}

        <img
          src="${medium || fallback}"
          srcset="${medium ? `${medium} 600w,` : ""} ${large ? `${large} 1200w` : ""}".trim()
          sizes="(max-width: 600px) 600px, 1200px"
          alt="${product.Name ?? "Product image"}"
          loading="lazy"
        />

        <h3 class="card__brand">${product?.Brand?.Name ?? product?.Brand ?? ""}</h3>
        <h2 class="card__name">${product?.NameWithoutBrand ?? product?.Name ?? ""}</h2>
        <p class="product-card__price">$${final.toFixed(2)}</p>
      </a>
    </li>
  `;
}

function getProductImage(product) {
  // API response includes Images with PrimaryMedium/PrimaryLarge
  return (
    product?.Images?.PrimaryMedium ||
    product?.Images?.PrimaryLarge ||
    product?.PrimaryMedium ||
    product?.PrimaryLarge ||
    product?.Image ||
    ""
  );
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement; // selector string, e.g. ".product-list"
    this.list = [];
  }

  async init() {
    this.list = await this.dataSource.getData(this.category);
  }

  renderList(list = this.list) {
    const parent = document.querySelector(this.listElement);
    if (!parent) return;

    const safeList = Array.isArray(list) ? list : [];
    renderListWithTemplate(
      productCardTemplate,
      parent,
      safeList,
      "afterbegin",
      true
    );
  }
}
