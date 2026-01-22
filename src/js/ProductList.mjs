import { renderListWithTemplate } from "./utils.mjs";

function productCardTemplate(product) {
  const final = Number(product.FinalPrice);
  const retail = Number(product.SuggestedRetailPrice);

  const isDiscounted =
    Number.isFinite(final) &&
    Number.isFinite(retail) &&
    retail > 0 &&
    final < retail;

  const percentOff = isDiscounted ? Math.round((1 - final / retail) * 100) : 0;

  return `
    <li class="product-card">
      <a href="/product_pages/?product=${product.Id}">
        ${isDiscounted ? `<span class="discount-badge">-${percentOff}%</span>` : ""}
        <img src="${getProductImage(product)}" alt="${product.Name ?? "Product image"}" />
        <h3 class="card__brand">${product.Brand?.Name ?? product.Brand ?? ""}</h3>
        <h2 class="card__name">${product.NameWithoutBrand ?? product.Name ?? ""}</h2>
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
    renderListWithTemplate(productCardTemplate, parent, safeList, "afterbegin", true);
  }
}
