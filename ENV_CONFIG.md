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
- Uses `.env.production`
- API URL: `https://wdd330-backend.onrender.com/`
- Makes direct requests to the backend
- **IMPORTANT**: Backend must have CORS configured to allow requests from your production domain
 - Production deployed via Render uses a server-side proxy (`server.js`) to forward `/api/*` to `BACKEND_URL` and avoid browser CORS. Set `BACKEND_URL` and `BACKEND_API_TOKEN` (secret) in Render's environment settings. Do NOT commit `BACKEND_API_TOKEN` to the repo.

## CORS Configuration Required

For production to work, the backend server needs to include these headers:

```
Access-Control-Allow-Origin: https://sleep-outside-team-04-repository.onrender.com
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
