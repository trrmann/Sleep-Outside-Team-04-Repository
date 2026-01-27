**Proxy Wiring & Local Token Injection**

Summary
- `server.js` now reads `src/.env.production.local` (if present) and merges its KEY=VALUE pairs into `process.env` when the server starts. This makes `BACKEND_API_TOKEN` available to the proxy without requiring manual environment configuration.
- The dev proxy forwards:
  - `/api/*` → BACKEND_URL (rewrites `^/api` to ``)
  - `/users` → BACKEND_URL/users
- When a client request does not include an `Authorization` header and `BACKEND_API_TOKEN` is set, the proxy injects `Authorization: Bearer <BACKEND_API_TOKEN>` before forwarding. This enables testing protected endpoints during local development.

Files changed / added
- `server.js` — loads `src/.env.production.local` and applies token injection in proxy `onProxyReq` handlers.
- `scripts/test-post.mjs` — utility script that reads `src/.env.production.local` and performs a direct POST to the backend `/users` endpoint (used for quick verification).

How it works (behavior details)
- Env parsing: `KEY=VALUE` lines are parsed; optional single or double quotes around values are stripped. Blank lines and malformed lines are ignored.
- Precedence: existing `process.env` values are preserved; the loader sets values only when the env key is not already defined.
- Non-fatal: failures to read or parse the file are logged silently and do not block server startup.

Quick start / verification
1. Restart the dev server so `server.js` loads the local env file.

   - Node (from repo root):
     ```powershell
     node server.js
     ```

   - Or use your existing npm script (if present):
     ```powershell
     npm run start
     ```

2. Verify a proxied POST with `curl` (example):

   ```powershell
   curl -v -X POST http://localhost:3000/users \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","address":"1 Test St","email":"test+local@example.com","password":"password123"}'
   ```

3. Or use the provided test script which posts directly to the live backend using the token in `src/.env.production.local`:

   ```powershell
   node scripts/test-post.mjs
   ```

Security notes
- Do NOT commit real tokens to source control. `src/.env.production.local` is convenient for local development but should not be included in public repositories.
- The proxy's automatic token injection only happens when the client request is missing an `Authorization` header; this avoids unintentionally overriding explicit client-sent credentials.

Next steps (optional)
- Add client-side file-size/type validation for avatar uploads before sending multipart requests.
- Add an integration test that hits the proxied endpoint (`http://localhost:3000/users`) to validate the end-to-end flow.
