import { loadHeaderFooter, updateCartCount, initSearchForm } from "./utils.mjs";
import Alert from "./Alert.js";

await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();

const alert = new Alert();
await alert.init();
