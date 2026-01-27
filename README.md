# BYU-Pathway Worldwide Online
## WDD 330 - Web Frontend Development II

### ⛺ SleepOutside Starter Code

 - This repository is the start of the SleepOutside web application project for WDD 330. The repository contains branches which are checkpoints for the team and individual assignments throughout the course.

 - https://byui-cse.github.io/wdd330-ww-course/week01/team.html

### Prerequisites

- You must have Node installed to run the following commands.
[WDD 330 Setup Environment](https://byui-cse.github.io/wdd330-ww-course/intro/) 


### Common Workflow Commands (using npm)

- `npm install` to install all dependencies.
- `npm run lint` to run ESLint against your code to find errors.
- `npm run format` to run Prettier to automatically format your code.
- `npm run start` starts up a local server and updates on any JS or CSS/SCSS.
- `npm run build` to build final files when you are ready to turn in.

### Node.js / Vite compatibility

- This project requires Node.js >= 20.19.0 to build with the current Vite version.
- We added an `engines.node` field to `package.json` to encourage CI and deploy services
	(such as Render) to use a compatible Node runtime.

If your local machine is on an older Node version, use `nvm` / `nvm-windows` or the
official Node installer to upgrade. On Render, set the service's Node version to `20.x`
or newer in the environment settings so remote builds succeed.

## Deployment (Render)

This project is deployed as a Node Web Service on Render that serves the Vite `dist/` build and proxies `/api/*` to the backend to avoid browser CORS issues.

- Build command: `npm install && npm run build`
- Start command: `npm run serve` (runs `node server.js`)
- Required Render environment variables: `BACKEND_URL`, `VITE_SERVER_URL=/api/` and (optional secret) `BACKEND_API_TOKEN` set in Render's dashboard
- Recommended Node runtime on Render: set `NODE_VERSION` to `20.x`
 - Recommended Node runtime on Render: set `NODE_VERSION` to `20.x` (or use the
	 `engines.node` from `package.json` to select a compatible runtime)

Do NOT commit any secrets (`BACKEND_API_TOKEN`) to the repo — use Render's environment/secret settings.

> **Note:** This project now uses npm for all dependency management and scripts. Do not use pnpm.


---
_BYU-Pathway Worldwide improves lives through access to spiritually based, online affordable higher education. Its mission is to develop disciples of Jesus Christ who are leaders in their homes, the Church, and their communities._



