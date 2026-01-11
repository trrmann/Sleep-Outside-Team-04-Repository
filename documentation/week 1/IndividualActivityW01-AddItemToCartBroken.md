error found in the console was:  product-BopOnU2u.js:1  GET https://sleep-outside-team-04-repository.onrender.com/json/tents.json 404 (Not Found)

After review of the dist after the build the json files are not present in the distribution to go to render.

After review of the vite.config.js it has no reference to migrate the json files to the dist folder.

using AI for suggestions I posed this question:  where do i update the vite config to add the json data files

answer:
To include your JSON data files in the Vite build output, update your vite.config.js. You should use the public directory for static assets, but if you want to copy files from another location, use the Vite plugin vite-plugin-static-copy.

Here’s how to update vite.config.js:

Install vite-plugin-static-copy:
  npm install vite-plugin-static-copy --save-dev

In vite.config.js, add the plugin and configure it to copy your json folder to dist:
  import { defineConfig } from 'vite';
  import { viteStaticCopy } from 'vite-plugin-static-copy';

  export default defineConfig({
    plugins: [
      viteStaticCopy({
        targets: [
          {
            src: 'src/json/*',
            dest: 'json'
          }
        ]
      })
    ]
  });

This will copy all files from src/json to dist/json during the build. Alternatively, move your json files to a public folder at the project root for automatic copying.


so the steps are:
  npm install vite-plugin-static-copy --save-dev
  npm run build

No need to install pnpm or use pnpm commands. All dependencies and build steps use npm now.

  this did add the item to local storage, but only 1 item is in the cart at a time, if you add another item to the cart it overwrites this one.


function addProductToCart(product) {
  setLocalStorage("so-cart", product);
}

only has 1 item possible in the cart

updated to the following to allow multiple items and counts of the items.

function addProductToCart(product) {
  let products = getLocalStorage("so-cart");
  if(products == undefined) {
    products = {}
  }
  if (Object.prototype.hasOwnProperty.call(products, product.Id)) {
    products[product.Id]["count"] = products[product.Id]["count"] + 1;
  } else {
    products[product.Id] = {
      "count": 1,
      "itemData": product
    };
  }
  setLocalStorage("so-cart", products);
}

after lint and build, review on the render site shows that it now adds multiple types of items and counts each click to add another of the same to the cart.
