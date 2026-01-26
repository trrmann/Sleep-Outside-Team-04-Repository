import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL =
  process.env.BACKEND_URL || "https://wdd330-backend.onrender.com";
const BACKEND_API_TOKEN = process.env.BACKEND_API_TOKEN || null;
const ALLOW_CORS =
  String(process.env.ALLOW_CORS || "false").toLowerCase() === "true";

// Optional CORS middleware for debugging only. Do NOT enable in production unless
// you understand the security implications.
if (ALLOW_CORS) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With",
    );
    if (req.method === "OPTIONS") return res.sendStatus(204);
    next();
  });
}

// Proxy API requests to the backend
app.use(
  "/api",
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/api": "", // Remove /api prefix when forwarding to backend
    },
    onProxyReq: (proxyReq, req, res) => {
      // Forward a server-side token only when the client did not provide Authorization
      // and a BACKEND_API_TOKEN is configured. This avoids forcing auth onto public
      // product endpoints while allowing access to protected backend routes when
      // necessary.
      const hasAuth = req.headers.authorization || req.headers.Authorization;
      if (!hasAuth && BACKEND_API_TOKEN) {
        proxyReq.setHeader("Authorization", `Bearer ${BACKEND_API_TOKEN}`);
      }

      console.log(
        `Proxying: ${req.method} ${req.url} -> ${BACKEND_URL}${req.url.replace("/api", "")}`,
      );
    },
  }),
);

// Serve static files from dist directory
app.use(express.static(join(__dirname, "dist")));

// Handle client-side routing - return index.html for all non-API routes
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Proxying /api/* to ${BACKEND_URL}`);
});
