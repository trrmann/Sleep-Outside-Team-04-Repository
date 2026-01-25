import { loadHeaderFooter, updateCartCount, initSearchForm } from "./utils.mjs";
import modal from "./modal.js";
import Alert from "./Alert.js";



await loadHeaderFooter(updateCartCount);
updateCartCount();
initSearchForm();
//modal();
document.addEventListener('DOMContentLoaded', () => {
    modal();
});
const alert = new Alert();
await alert.init();


