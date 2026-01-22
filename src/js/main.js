import ProductData from "./ProductData.mjs";
import ProductList from "./productList.mjs";
//import {Alert} from "./Alert.js";
import { loadHeaderFooter } from "./utils.mjs";

const myProductData = new ProductData("tents");

const myProductList = new ProductList(
  "tents",
  myProductData,
  document.querySelector(".product-list"),
);

//const myAlert = new Alert("Alert");
//const htmlAlert = await myAlert.getData();
//htmlAlert = document.querySelector(".alert").innerHTML;

myProductList.init();

loadHeaderFooter();
