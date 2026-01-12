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
  constructor(category, dataSource, targetElement) {
    this._productCategory = category;
    this._dataSource = dataSource;
    this._targetElement = targetElement;
  }
  async init() {
    this._list = await this.dataSource.getData();
  }
}
