# Signup API Discovery Notes

Date: 2026-01-26

Summary
- I inspected the local proxy and Vite dev proxy and attempted to fetch the OpenAPI spec for the backend.

Server and proxy configuration
- `server.js` (dev/preview server):
  - Default `PORT`: `3000`.
  - `BACKEND_URL` default: `https://wdd330-backend.onrender.com`.
  - Proxy: forwards `/api/*` to `BACKEND_URL` with `/api` stripped.
  - Behavior: if a client request lacks an `Authorization` header and `BACKEND_API_TOKEN` is set in the server environment, the server will set an `Authorization: Bearer <BACKEND_API_TOKEN>` header when proxying.
  - Optional `ALLOW_CORS` env var enables permissive CORS for debugging.

- `vite.config.js` (dev server):
  - Proxies `/api` to `https://wdd330-backend.onrender.com` and rewrites the path (removes `/api`).

What I probed
- Attempted to GET the OpenAPI spec at:
  - `http://localhost:3000/api/openapi.json` (via local `server.js` proxy)
  - `https://wdd330-backend.onrender.com/openapi.json` (direct backend)

Results
- `http://localhost:3000/api/openapi.json` — request failed in this environment (fetch failed). Possible causes:
  - Local proxy not running on port `3000` when probe ran.
  - Networking restrictions in this agent environment.

- `https://wdd330-backend.onrender.com/openapi.json` — backend responded with HTTP `401` and JSON body:
  {
    "status": 401,
    "message": "JsonWebTokenError: jwt malformed"
  }

  This indicates the backend is protected and requires a valid JWT for this endpoint, and that the token used (if any) is malformed or invalid.

Token note
- I attempted to use a token read from `src/.env.production.local` (if present). The backend returned `401` (jwt malformed), so the token in that file is not valid for the live backend.

Next steps / Recommendations
1. Start the local proxy with a valid `BACKEND_API_TOKEN` in the environment and re-run the probe. Example (PowerShell):
   ```powershell
   $env:BACKEND_API_TOKEN = '<<VALID_TOKEN>>'
   node server.js
   ```
   Then fetch `http://localhost:3000/api/openapi.json` again.

2. If you can't obtain a valid token, request the backend owner to provide the `POST /users` contract (OpenAPI snippet or example request/response). Key things to request:
   - Exact request field names and types for `POST /users` (JSON vs multipart/form-data), including required vs optional fields.
   - Example success `201` response and whether a `token` is returned on creation.
   - Avatar handling (file upload or URL) and size/type limits.

3. For development, the local `server.js` proxy can inject a valid `BACKEND_API_TOKEN` so the frontend can call `/api/users` without needing the user to supply a token.

Recorded commands used
- Probe command (node fetch):
  ```bash
  node --input-type=module -e "import fs from 'fs'; const env=fs.existsSync('src/.env.production.local')?fs.readFileSync('src/.env.production.local','utf8'):''; const m=env.match(/BACKEND_API_TOKEN=(.*)/); const token=m?m[1].trim():''; const urls=['http://localhost:3000/api/openapi.json','https://wdd330-backend.onrender.com/openapi.json']; (async()=>{ for(const u of urls){ try{ const headers={}; if(token) headers.Authorization='Bearer '+token; const r=await fetch(u,{headers}); console.log('\\n===',u,'status',r.status); const t=r.headers.get('content-type'); if(t) console.log(' type:',t); const txt=await r.text(); console.log(txt.slice(0,4000)); }catch(e){console.error('\\nERR',u,e.message);} } })();"
  ```

Acceptance criteria for step 1
- Either the OpenAPI spec is accessible and `POST /users` is documented, or the backend owner provides a definitive contract for `POST /users` (fields, types, avatar handling, responses).

Document created by automated discovery run.

POST /users probe (attempted)
- Payload used (JSON):

```json
{
  "name": "Test User",
  "address": "1 Test St",
  "email": "test+signup1769481544088@example.com",
  "password": "Test1234!"
}
```

- Results:
  - `http://localhost:3000/api/users` — fetch failed (proxy likely not running on port 3000 during this run).
  - `https://wdd330-backend.onrender.com/users` — returned HTTP `200` with JSON body:

```json
{ "message": "User created: test+signup1769481544088@example.com" }
```

  - Observations: the backend accepted a JSON POST and created the user. The response code was `200` (not `201`) and no auth token was returned in the response body.

Recorded command used (node inline script):

```bash
node --input-type=module -e "import fs from 'fs'; const env=fs.existsSync('src/.env.production.local')?fs.readFileSync('src/.env.production.local','utf8'):''; const m=env.match(/BACKEND_API_TOKEN=(.*)/); const token=m?m[1].trim():''; const urls=['http://localhost:3000/api/users','https://wdd330-backend.onrender.com/users']; const payload={name:'Test User',address:'1 Test St',email:'test+signup'+Date.now()+'@example.com',password:'Test1234!'}; (async()=>{ for(const u of urls){ try{ const headers={'Content-Type':'application/json'}; if(token) headers.Authorization='Bearer '+token; const r=await fetch(u,{method:'POST',headers,body:JSON.stringify(payload)}); console.log('\\n===',u,'status',r.status); const t=r.headers.get('content-type'); if(t) console.log(' type:',t); const txt=await r.text(); console.log(txt.slice(0,4000)); }catch(e){console.error('\\nERR',u,e.message);} } })();"
```

Next notes
- The backend accepts unauthenticated `POST /users` with JSON body in this run. For development, you can POST to `/api/users` via the local proxy if `server.js` is running (it will forward and can inject `BACKEND_API_TOKEN` when needed). Update the signup UI to send JSON by default; add multipart/avatar support later if backend requires it.
