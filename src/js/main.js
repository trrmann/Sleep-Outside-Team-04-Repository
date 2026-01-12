import ProductData from "./ProductData.mjs";
import ProductList from "./ProductList.mjs";

const productData = new ProductData("tents");
const category = productData.category;
const dataSource = productData;
const targetElement = undefined;
const productList = new ProductList(category, dataSource, targetElement);
await productList.init();

console.log(productList.list);
