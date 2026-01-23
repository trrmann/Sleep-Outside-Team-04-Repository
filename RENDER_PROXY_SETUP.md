# Production Proxy Setup for Render

This setup uses a Node.js Express server to proxy API requests in production, eliminating CORS issues.

## How It Works

1. **Build**: Vite builds your static files to `/dist`
2. **Server**: Express serves the static files and proxies `/api/*` requests to the backend
3. **No CORS Issues**: Requests are server-side, so CORS doesn't apply

## Files

- **[server.js](server.js)** - Express server that serves static files and proxies API requests
- **[render.yaml](render.yaml)** - Render deployment configuration
- **[package.json](package.json)** - Updated with proxy dependencies and serve script

## Environment Variables in Render

Set these in your Render dashboard (Environment tab):

| Key | Value | Description |
|-----|-------|-------------|
| `BACKEND_URL` | `https://wdd330-backend.onrender.com` | Backend API URL to proxy to |
| `NODE_VERSION` | `18` | Node.js version |

**Note**: `PORT` is automatically set by Render

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

## Benefits

✅ **No CORS configuration needed** on backend  
✅ **Works in development and production** with same URL pattern  
✅ **Secure** - API keys can be added server-side if needed  
✅ **Simple** - No complex infrastructure required
