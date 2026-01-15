import { resolve } from "path";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        cart: resolve(__dirname, "src/cart/index.html"),
        checkout: resolve(__dirname, "src/checkout/index.html"),
        product: resolve(__dirname, "src/product_pages/index.html"),
      },
    },
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
<<<<<<< HEAD
          src: "json/*",
          dest: "json",
        },
=======
          src: "public/json/*",
          dest: "json",
        },
        {
          src: "public/images/**/*",
          dest: "images",
        },
>>>>>>> trm-Total$inCart
      ],
    }),
  ],
});
