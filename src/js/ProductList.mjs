import { renderListWithTemplate } from "./utils.mjs";
export default class ProductList {
  _productCategoryInfo = undefined;
  _dataSourceInfo = undefined;
  _targetElementInfo = undefined;
  _listData = undefined;

  get productCategory() { return this._productCategoryInfo; }
  set _productCategory(category) { this._productCategoryInfo = category; }
  get dataSource() { return this._dataSourceInfo; }
  set _dataSource(source) { this._dataSourceInfo = source; }
  get targetElement() { return this._targetElementInfo; }
  set _targetElement(element) { this._targetElementInfo = element; }
  get list() { return this._listData; }
  set _list(data) { this._listData = data; }
  get listElement() {return document.querySelector(this.targetElement);}
  constructor(category, dataSource, targetElement) {
    this._productCategory = category;
    this._dataSource = dataSource;
    this._targetElement = targetElement;
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
