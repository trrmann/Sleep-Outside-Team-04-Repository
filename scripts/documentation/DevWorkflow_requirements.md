## Error Logging

- Controllers must log the actual error to the console before passing to the error handler, to aid in diagnosing issues in all environments (including production).

## Database Connectivity Note

- The application must support connecting to both local and remote PostgreSQL databases.
- When connecting to a remote database (i.e., DATABASE_URL does not contain "localhost"), SSL must be enabled with `rejectUnauthorized: false` to ensure compatibility with managed database providers (e.g., Render, Heroku).
- When connecting to a local database, SSL should be disabled.

# DevWorkflow.ps1 Functional Requirements

**Note:** This workflow will not perform a commit or push. All commit/push operations must be performed manually or by other scripts.

- Loads environment variables from `.env` at the repo root.
- Validates required env vars: `DATABASE_URL`, `SESSION_SECRET`, `PORT`.
- **Environment validation (`ValidateEnvironment.ps1`) is always required and cannot be skipped.**
- **Test database connection (`TestDbConnection.ps1`) is always required and cannot be skipped.**
- **Test step (`Test.ps1`) is always required and cannot be skipped.**
- Checks port availability for both the dev server (default 5500) and the proxy server (3000) by calling `ValidatePort.ps1` for each. Both ports must be free before starting the dev server.
- Runs a sequence of steps: install, lint, format, test DB connection, test, start dev server.
- Fails fast on any error.
- Each step can be skipped by setting a `SKIP_*` env var, except for environment validation, test DB connection, and test steps, which are mandatory.
- Must run a single, central port check for both required ports (dev server and proxy) before starting the dev server.
- Port check must auto-kill any process using either port, with no prompt.
- No duplicate port check logic elsewhere in the workflow.

**Note:** The proxy server is not required for local development, but port 3000 is reserved for production proxy use and must be kept free to avoid conflicts during deployment or testing. The dev workflow ensures both ports are available to prevent issues when switching between dev and production workflows.
