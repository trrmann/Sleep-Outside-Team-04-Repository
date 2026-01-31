import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "src/index.html"),
        cart: resolve(__dirname, "src/cart/index.html"),
        checkout: resolve(__dirname, "src/checkout/index.html"),
        login: resolve(__dirname, "src/login/index.html"),
        signup: resolve(__dirname, "src/signup/index.html"),
        product: resolve(__dirname, "src/product_pages/index.html"),
        product_listing: resolve(__dirname, "src/product_listing/index.html"),
        orders: resolve(__dirname, "src/orders/index.html"),
        mockAuth: resolve(__dirname, "src/mock-auth/index.html"),
      },
    },
  },

  server: {
    proxy: {
      "/api": {
        target: "https://wdd330-backend.onrender.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        configure: (proxy, options) => {
          console.log("[Vite Proxy] Configure callback registered");
          proxy.on("proxyReq", (proxyReq, req, res) => {
            console.log(
              `[Vite Proxy] ProxyReq event fired for ${req.method} ${req.url}`,
            );

            // Inject BACKEND_API_TOKEN for dev environment
            // This matches the behavior in server.js for production
            const token =
              process.env.BACKEND_API_TOKEN ||
              "b14f8c6e9a2d4f3a9c1e7b2d5f8a9c0e4b6d3c2a1f0e9d8c7b6a5f4e3d2c1b0";

            // Only inject if client hasn't already sent Authorization
            const hasAuth =
              req.headers.authorization || req.headers.Authorization;

            console.log(
              `[Vite Proxy] hasAuth=${hasAuth}, token=${token ? "present" : "missing"}`,
            );

            if (!hasAuth && token) {
              proxyReq.setHeader("Authorization", `Bearer ${token}`);
              console.log(
                `[Vite Proxy] ✓ Injected API token for ${req.method} ${req.url}`,
              );
            } else if (hasAuth) {
              console.log(
                `[Vite Proxy] Client already has Authorization header`,
              );
            }
          });
        },
      },
    },
  },
});
