# Production Proxy Setup for Render

This setup uses a Node.js Express server to proxy API requests in production, eliminating CORS issues.

## How It Works

1. **Build**: Vite builds your static files to `/dist`
2. **Server**: Express serves the static files and proxies `/api/*` requests to the backend
3. **No CORS Issues**: Requests are server-side, so CORS doesn't apply

> Important: Configure the Render service as a **Web Service** (not a Static Site) so the Node `server.js` process runs and the proxy is active. Use `npm run serve` as the start command (or `node server.js`).

## Files

- **[server.js](server.js)** - Express server that serves static files and proxies API requests
- **[render.yaml](render.yaml)** - Render deployment configuration
- **[package.json](package.json)** - Updated with proxy dependencies and serve script

## Environment Variables in Render

Set these in your Render dashboard (Environment tab). Do NOT store secrets in the repo — add them in Render's dashboard or secret manager.

| Key | Example Value | Purpose |
|-----|---------------|---------|
| `BACKEND_URL` | `https://wdd330-backend.onrender.com` | Backend API URL the proxy forwards to (required)
| `VITE_SERVER_URL` | `/api/` | Frontend build-time API base. Use `/api/` when using the server proxy.
| `BACKEND_API_TOKEN` | *secret* (set in Render only) | Optional service token forwarded by the proxy to backend when client Authorization is absent
| `ALLOW_CORS` | `false` | Optional flag to enable CORS middleware for debugging (set `true` only temporarily)
| `NODE_VERSION` | `20.x` | Node runtime to use for build/start (recommended)

**Note**: `PORT` is provided by Render at runtime; `server.js` falls back to `3000` locally.

## Deployment Steps

### Option 1: Using render.yaml (Recommended)

1. **Commit and push** all changes to GitHub
2. In Render dashboard, go to your web service
3. Render will detect `render.yaml` and use it automatically
4. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Option 2: Manual Configuration

If render.yaml doesn't auto-configure:

1. Go to Render dashboard → Your web service → Settings
2. **Build Command**: `npm install && npm run build`
3. **Start Command**: `npm run serve`
4. Go to **Environment** tab and add:
   - `BACKEND_URL` = `https://wdd330-backend.onrender.com`
   - `VITE_SERVER_URL` = `/api/`
   - (Optional) `BACKEND_API_TOKEN` = <your secret token> — add this via Render dashboard, do NOT commit it to git
   - (Optional) `ALLOW_CORS` = `false` (set `true` temporarily only for debugging)
5. **Save Changes** → Render will redeploy

## Local Testing

Test the production setup locally:

```bash
# Build the production files
npm run build

# Start the proxy server
npm run serve
```

Visit http://localhost:3000 - it should work exactly like production

Local production testing without committing secrets:

- Use the Vite dev server for development (no secrets required):

   ```bash
   npm run start
   ```

- To test a production build locally without adding secrets to the repo, create a gitignored file `src/.env.production.local` with the `BACKEND_API_TOKEN` value and/or other secrets. Example `src/.env.production.local`:

   ```dotenv
   BACKEND_API_TOKEN=your-secret-value-here
   ```

   Then run:

   ```bash
   npm run build
   npm run serve
   ```

   The `server.js` proxy will read `process.env.BACKEND_API_TOKEN` at runtime if present and forward it to the backend when the client request lacks an Authorization header.

## How Requests Flow

**Development** (`npm start`):
```
Browser → /api/products → Vite Dev Proxy → wdd330-backend.onrender.com/products
```

**Production** (Render):
```
Browser → /api/products → Express Proxy → wdd330-backend.onrender.com/products
```

## Troubleshooting

- **Check Render Logs**: Dashboard → Logs tab to see server startup and proxy requests
- **Verify Environment Variables**: Make sure `BACKEND_URL` is set correctly
- **Test Locally First**: Run `npm run build && npm run serve` before deploying

## Security Notes

- Never commit secrets (`BACKEND_API_TOKEN`) into the repository. Use Render's dashboard or secret manager to set production secrets.
- Keep `ALLOW_CORS=false` in production. Only enable `ALLOW_CORS=true` temporarily for debugging local/remote issues and turn it off immediately after.

## Benefits

✅ **No CORS configuration needed** on backend  
✅ **Works in development and production** with same URL pattern  
✅ **Secure** - API keys can be added server-side if needed  
✅ **Simple** - No complex infrastructure required
