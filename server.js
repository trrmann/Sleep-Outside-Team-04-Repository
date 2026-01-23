import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "https://wdd330-backend.onrender.com";

// Proxy API requests to the backend
app.use("/api", createProxyMiddleware({
  target: BACKEND_URL,
  changeOrigin: true,
  pathRewrite: {
    "^/api": "", // Remove /api prefix when forwarding to backend
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`Proxying: ${req.method} ${req.url} -> ${BACKEND_URL}${req.url.replace("/api", "")}`);
  },
}));

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
