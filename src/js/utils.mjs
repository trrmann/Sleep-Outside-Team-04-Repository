// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}

export function renderListWithTemplate(templateFn, parentElement, list, position="afterbegin", clear = false){
  const htmlStrings = list.map(templateFn);
  if (clear=true) {
    parentElement.textContent = "";
  }

   parentElement.insertAdjacentHTML('afterbegin', htmlStrings.join(''));

}

//calling header and footer
export function renderWithTemplate(template, parentElement, data, callback ){
 parentElement.innerHTML = template;
 if(callback){
  callback(data);
 }

}

//loading template for header and footer
export async function loadTemplate(path){
  const response = await fetch(path);

  return await response.text(); 

 

}

export function loadHeaderFooter(){
    const headerTemplate = loadTemplate("../public/partials/header.html");
    const footerTemplate = loadTemplate("../public/partials/footer.html");

    const headerElement = document.getElementById("siteHeader");
    const footerElement = document.getElementById("siteFooter");

    renderWithTemplate(headerTemplate,headerElement);

    renderListWithTemplate(footerTemplate,footerElement);

    

}