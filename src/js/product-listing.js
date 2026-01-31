import { loadHeaderFooter, getParam } from "./utils.mjs";
import ExternalServices from "./ExternalServices.mjs";
import ProductList from "./ProductList.mjs";

loadHeaderFooter();

const category = getParam("category");
const dataSource = new ExternalServices();
const element = document.querySelector(".product-list");
const listing = new ProductList(category, dataSource, element);

// input de búsqueda
const searchInput = document.querySelector("#quickLookup");

let allProducts = [];

// Inicializar listado con todos los productos
async function initListing() {
  allProducts = await dataSource.getData(category);
  listing.renderList(allProducts);
  document.querySelector(".title").textContent = category;
}

initListing();

// Quick lookup: filtrar mientras se escribe
searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();

  const filtered = allProducts.filter((product) =>
    product.Name.toLowerCase().includes(query)
  );

  listing.renderList(filtered);
});
