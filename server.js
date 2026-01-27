import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load local env overrides from src/.env.production.local when present.
// This helps local dev inject a BACKEND_API_TOKEN without modifying system env.
try {
  const localEnvPath = join(__dirname, "src", ".env.production.local");
  if (fs.existsSync(localEnvPath)) {
    const raw = fs.readFileSync(localEnvPath, "utf8");
    raw.split(/\r?\n/).forEach((line) => {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (!m) return;
      const key = m[1];
      let val = m[2];
      // Remove optional surrounding quotes
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.length >= 2 &&
          val.charCodeAt(0) === 39 &&
          val.charCodeAt(val.length - 1) === 39)
      ) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = val;
    });
  }
} catch (e) {
  // Non-fatal: leave process.env as-is.
}

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
      const injected = !hasAuth && Boolean(BACKEND_API_TOKEN);
      if (injected) {
        proxyReq.setHeader("Authorization", `Bearer ${BACKEND_API_TOKEN}`);
      }

      // Basic debug logging: method, path, whether auth was present or injected,
      // and content length if available. Avoid printing sensitive tokens.
      const logLine = `Proxying: ${req.method} ${req.url} -> ${BACKEND_URL}${req.url.replace("/api", "")} | authPresent=${!!hasAuth} | injected=${injected} | content-length=${req.headers["content-length"] || 0}`;
      console.log(logLine);
      try {
        const logDir = join(__dirname, ".vscode");
        if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
        fs.appendFileSync(
          join(logDir, "proxy.log"),
          `${new Date().toISOString()} ${logLine}\n`,
        );
      } catch (e) {
        // ignore file write errors
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      try {
        const resLine = `Proxy response: ${req.method} ${req.url} -> ${proxyRes.statusCode}`;
        console.log(resLine);
        // Log a couple of response headers useful for debugging
        const hdrs = proxyRes.headers || {};
        console.log(
          `Proxy response headers: ${Object.keys(hdrs)
            .slice(0, 5)
            .map((k) => `${k}: ${hdrs[k]}`)
            .join(", ")}`,
        );
        try {
          const logDir = join(__dirname, ".vscode");
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          fs.appendFileSync(
            join(logDir, "proxy.log"),
            `${new Date().toISOString()} ${resLine} headers=${JSON.stringify(Object.fromEntries(Object.entries(hdrs).slice(0, 5)))}\n`,
          );
        } catch (e) {
          // ignore
        }
      } catch (e) {
        console.log("Error logging proxy response", e && e.message);
      }
    },
    onError: (err, req, res) => {
      console.error("Proxy error:", err && err.message ? err.message : err);
      if (res && !res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad gateway: proxy error");
      }
    },
  }),
);

// Also proxy top-level /users to backend to support clients that post to /users
// Temporary middleware: capture raw multipart bodies for debugging and save to .vscode
// This avoids losing the request body by reading it here and allows us to forward
// the captured buffer manually in the proxy's onProxyReq.
app.use((req, res, next) => {
  try {
    const ct = req.headers && req.headers["content-type"];
    if (
      req.method &&
      req.method.toUpperCase() === "POST" &&
      ct &&
      ct.indexOf("multipart/form-data") !== -1
    ) {
      const chunks = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        try {
          req.rawBody = Buffer.concat(chunks);
          const logDir = join(__dirname, ".vscode");
          if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
          const name = `proxy-capture-${Date.now()}.txt`;
          const out = [
            `URL: ${req.method} ${req.originalUrl}`,
            `Headers: ${JSON.stringify(req.headers, null, 2)}`,
            "",
            "Body (first 2000 bytes):",
            req.rawBody.slice(0, 2000).toString("utf8"),
          ].join("\n");
          fs.writeFileSync(join(logDir, name), out);
          fs.appendFileSync(
            join(logDir, "proxy-capture.log"),
            `${new Date().toISOString()} ${name} ${req.method} ${req.originalUrl}\n`,
          );
        } catch (e) {
          // ignore capture errors
        }
        next();
      });
      req.on("error", () => next());
      return;
    }
  } catch (e) {
    // ignore
  }
  next();
});

app.use(
  "/users",
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    pathRewrite: {
      "^/users": "/users",
    },
    onProxyReq: (proxyReq, req, res) => {
      const hasAuth = req.headers.authorization || req.headers.Authorization;
      const injected = !hasAuth && Boolean(BACKEND_API_TOKEN);
      if (injected) {
        proxyReq.setHeader("Authorization", `Bearer ${BACKEND_API_TOKEN}`);
      }
      console.log(
        `Proxying: ${req.method} ${req.url} -> ${BACKEND_URL}${req.url} | authPresent=${!!hasAuth} | injected=${injected} | content-length=${req.headers["content-length"] || 0}`,
      );

      // If we captured a raw body (multipart), forward it explicitly so the proxy
      // does not need to re-read the consumed stream.
      try {
        if (req.rawBody && req.rawBody.length) {
          proxyReq.setHeader("content-length", req.rawBody.length);
          proxyReq.write(req.rawBody);
          proxyReq.end();
        }
      } catch (e) {
        console.log("Error forwarding captured rawBody", e && e.message);
      }
    },
    onProxyRes: (proxyRes, req, res) => {
      try {
        console.log(
          `Proxy response: ${req.method} ${req.url} -> ${proxyRes.statusCode}`,
        );
        const hdrs = proxyRes.headers || {};
        console.log(
          `Proxy response headers: ${Object.keys(hdrs)
            .slice(0, 5)
            .map((k) => `${k}: ${hdrs[k]}`)
            .join(", ")}`,
        );
      } catch (e) {
        console.log("Error logging proxy response", e && e.message);
      }
    },
    onError: (err, req, res) => {
      console.error("Proxy error:", err && err.message ? err.message : err);
      if (res && !res.headersSent) {
        res.writeHead(502, { "Content-Type": "text/plain" });
        res.end("Bad gateway: proxy error");
      }
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
