# Environment Configuration

This project uses environment-specific configuration files for different deployment scenarios.

## Environment Files

- **`.env`** - Default fallback configuration
- **`.env.development`** - Used during local development (`npm run start`)
- **`.env.production`** - Used for production builds (`npm run build`)
- **`.env.example`** - Example template (not used, safe to commit)
- **`.env.production.local`** - Optional local production secrets (gitignored). Use for local testing only; do NOT commit.

## How It Works

### Development (Local)
- Uses `.env.development`
- API URL: `/api/`
- Requests are proxied through Vite to avoid CORS issues
- The proxy is configured in `vite.config.js`

### Production (Deployed)

- Uses `.env.production` for build-time values.
- Frontend build-time API base: `VITE_SERVER_URL=/api/` (the production build expects to use the server proxy at `/api/`).
- The production site is deployed as a Node Web Service that serves `dist/` and proxies `/api/*` to the backend via `server.js` so browsers do not encounter CORS.
- Set `BACKEND_URL` in your host (Render) environment to point to the backend API (for example `https://wdd330-backend.onrender.com`).
- If your backend requires a service token, set `BACKEND_API_TOKEN` as a secret in Render's environment settings; do NOT commit this token into the repo.
- Recommended Node runtime on Render: set `NODE_VERSION` to `20.x`.

**Important**: You should not need to configure CORS on the backend when the proxy is used. If you are not using the proxy, the backend must allow requests from your production domain.

## CORS Configuration Required

For production to work, the backend server needs to include these headers:

```
Access-Control-Allow-Origin: https://sleep-outside-team-04-repository-zc3y.onrender.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Contact the backend API administrator to configure CORS for your production domain.

## Testing

- **Local Development**: `npm run start` (uses proxy, no CORS issues)
- **Production Build**: `npm run build` (creates dist/ with production config)
- **Preview Production**: `npm run preview` (tests production build locally)

Local production testing without committing secrets:

- Create `src/.env.production.local` (gitignored) and add any production-only secrets you need for testing, e.g.:

	```dotenv
	BACKEND_API_TOKEN=your-secret-value
	```

- Build and serve locally:

	```bash
	npm run build
	npm run serve
	```

	The `server.js` proxy will pick up `process.env.BACKEND_API_TOKEN` if present when started.
