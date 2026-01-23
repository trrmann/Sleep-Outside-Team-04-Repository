import { loadHeaderFooter, updateCartCount, initSearchForm } from "./utils.mjs";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();

//The Checkout functionality will be implemented in later activities.
