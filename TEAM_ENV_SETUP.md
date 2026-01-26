# Environment Variables - Team Documentation

## 📋 Overview

This project uses environment variables for configuration. Here's what your team needs to know about which files exist, which are tracked in git, and how to set them up.

---

## 🗂️ Environment Files in the Project

### ✅ **Tracked in Git** (Safe to Commit)

These files ARE committed to the repository and shared with the team:

| File | Location | Purpose |
|------|----------|---------|
| `.env.example` | `/` (root) | Example template showing what variables are available |
| `src/.env.development` | `/src/` | Development environment config (uses `/api/` with Vite proxy) |
| `src/.env.production` | `/src/` | Production environment config (uses `/api/` with Express proxy) |
| `src/.env` | `/src/` | Default fallback config |

### ❌ **NOT Tracked in Git** (Gitignored)

These files are EXCLUDED from git (listed in `.gitignore`) and should NEVER be committed:

| File | Location | Purpose |
|------|----------|---------|
| `.env.local` | Any location | Local overrides for any environment |
| `.env.development.local` | Any location | Local development secrets (if needed) |
| `.env.production.local` | `/src/` | **IMPORTANT** - Contains production secrets for local testing |

---

## 🔐 Secret File: `src/.env.production.local`

**⚠️ CRITICAL: This file contains secrets and is gitignored!**

### Current Contents (DO NOT COMMIT):
```dotenv
BACKEND_API_TOKEN=b14f8c6e9a2d4f3a9c1e7b2d5f8a9c0e4b6d3c2a1f0e9d8c7b6a5f4e3d2c1b0
```

### What Your Team Needs to Know:

1. **This file exists locally** but is NOT in git
2. **Each team member needs to create this file manually** on their machine
3. **Location**: `src/.env.production.local`
4. **Use**: Only for local production testing (`npm run build && npm run serve`)

### How Team Members Should Set It Up:

```bash
# Navigate to the src folder
cd src

# Create the file (copy from documentation)
# On Windows PowerShell:
echo "BACKEND_API_TOKEN=b14f8c6e9a2d4f3a9c1e7b2d5f8a9c0e4b6d3c2a1f0e9d8c7b6a5f4e3d2c1b0" > .env.production.local

# On Mac/Linux:
echo "BACKEND_API_TOKEN=b14f8c6e9a2d4f3a9c1e7b2d5f8a9c0e4b6d3c2a1f0e9d8c7b6a5f4e3d2c1b0" > .env.production.local
```

---

## 🔑 Environment Variables Used

### Frontend (Vite - `VITE_*` prefix required)

| Variable | Dev Value | Production Value | Where Used |
|----------|-----------|------------------|------------|
| `VITE_SERVER_URL` | `/api/` | `/api/` | `src/js/ProductData.mjs` |

### Backend (Node.js server - `server.js`)

| Variable | Default Value | Set In | Purpose |
|----------|---------------|--------|---------|
| `PORT` | `3000` | Render (auto) | Server port |
| `BACKEND_URL` | `https://wdd330-backend.onrender.com` | Render | Backend API to proxy to |
| `BACKEND_API_TOKEN` | `null` | Render (secret) | Optional authentication token |
| `ALLOW_CORS` | `false` | Render | Debug flag - keep `false` in production |
| `NODE_VERSION` | N/A | Render | Recommended: `20.x` |

---

## 🚀 Render Production Deployment

### Required Environment Variables in Render Dashboard:

Your team needs to set these in Render (Environment tab):

| Key | Value | Notes |
|-----|-------|-------|
| `BACKEND_URL` | `https://wdd330-backend.onrender.com` | Backend API URL |
| `VITE_SERVER_URL` | `/api/` | Frontend build-time config |
| `BACKEND_API_TOKEN` | `b14f8c6e9a2d4f3a9c1e7b2d5f8a9c0e4b6d3c2a1f0e9d8c7b6a5f4e3d2c1b0` | **SECRET** - Add via Render dashboard |
| `NODE_VERSION` | `20.x` | Recommended Node runtime |
| `ALLOW_CORS` | `false` | Only set `true` for debugging, then turn back off |

### Render Service Configuration:

- **Service Type**: Web Service (NOT Static Site)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm run serve`

---

## 📝 Team Setup Checklist

### For Development (Local):
- [ ] Clone the repository
- [ ] Run `npm install`
- [ ] Files `src/.env.development` and `src/.env` are already in the repo
- [ ] Run `npm start` - should work immediately (uses Vite proxy)

### For Production Testing (Local):
- [ ] Create `src/.env.production.local` with the token above
- [ ] Run `npm run build`
- [ ] Run `npm run serve`
- [ ] Test at http://localhost:3000

### For Render Deployment:
- [ ] Set all environment variables in Render dashboard (see table above)
- [ ] Verify Build Command: `npm install && npm run build`
- [ ] Verify Start Command: `npm run serve`
- [ ] Deploy

---

## ⚠️ Security Reminders

1. **NEVER commit** `src/.env.production.local` to git
2. **NEVER commit** the `BACKEND_API_TOKEN` value to any tracked file
3. **Always use** Render dashboard to set production secrets
4. **Keep** `ALLOW_CORS=false` in production (security risk if enabled)
5. **Verify** `.gitignore` includes:
   ```
   .env.local
   .env.development.local
   .env.production.local
   ```

---

## 🔍 Quick Reference

### Which .env file is used when?

- **`npm start`** (development) → `src/.env.development` → Uses Vite proxy
- **`npm run build`** (production build) → `src/.env.production` → Frontend uses `/api/`
- **`npm run serve`** (local production test) → `src/.env.production.local` → Server reads `BACKEND_API_TOKEN`

### How to check what's loaded:

In browser console (development or production):
```javascript
console.log(import.meta.env.VITE_SERVER_URL)
```

Should show: `/api/`

---

## 📞 Questions?

See detailed documentation:
- [ENV_CONFIG.md](ENV_CONFIG.md) - Environment configuration details
- [RENDER_PROXY_SETUP.md](RENDER_PROXY_SETUP.md) - Production deployment setup
- [README.md](README.md) - General project information
