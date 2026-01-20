// generic template list renderer
export function renderListWithTemplate(femplateFn, parentElement, list, position = "afterbegin", clear = false) {
      if(clear) {
        parentElement.innerHTML = "";  
      }
      parentElement.insertAdjacentHTML(position, list.map(femplateFn).join(""));
}

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

export function getQueryParm(parmName) {
  // Get the full URL's query string (e.g., "?id=123&name=tent")
  const queryString = window.location.search;

  // Create a URLSearchParams object
  const urlParams = new URLSearchParams(queryString);

  // Get the value of the parameter
  return urlParams.get(parmName);
}
