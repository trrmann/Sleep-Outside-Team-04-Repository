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
      <a href="product_pages/?product=${product.Id}">
        ${isDiscounted ? `<span class="discount-badge">-${percentOff}%</span>` : ""}
        <img src="${product.Image}" alt="${product.Name}" />
        <h3 class="card__brand">${product.Brand?.Name ?? ""}</h3>
        <h2 class="card__name">${product.NameWithoutBrand ?? product.Name ?? ""}</h2>
        <p class="product-card__price">$${final.toFixed(2)}</p>
      </a>
    </li>
  `;
}

export default class ProductList {
  constructor(category, dataSource, listElement) {
    this.category = category;
    this.dataSource = dataSource;
    this.listElement = listElement; // selector string, e.g. ".product-list"
    this.list = [];
  }

  async init() {
    this._list = await this.dataSource.getData();
  }
  productCardTemplate(product) {
    return `
          <li class="product-card">
            <a href="product_pages/index.html?id=${product.Id}">
              <img
                src="${product.Image}"
                alt="${product.Name}"
              />
              <h3 class="card__brand">${product.Brand.Name}</h3>
              <h2 class="card__name">${product.NameWithoutBrand}</h2>
              <p class="product-card__price">$${product.FinalPrice}</p>
            </a>
          </li>`
        };
    renderList() {
      renderListWithTemplate(this.productCardTemplate, this.listElement, this.list.filter(function (product) {return product.Top === true;}), "afterbegin");
    }
}
