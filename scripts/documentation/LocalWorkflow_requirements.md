# LocalWorkflow.ps1 Functional Requirements

**Note:** This workflow will not perform a commit or push. All commit/push operations must be performed manually or by other scripts.

- Loads environment variables from .env at the repo root.
- Validates required env vars: DATABASE_URL, SESSION_SECRET, PORT.
- **Environment validation (`ValidateEnvironment.ps1`) is always required and cannot be skipped.**
- **Test database connection (`TestDbConnection.ps1`) is always required and cannot be skipped.**
- **Test step (`Test.ps1`) is always required and cannot be skipped.**
- Runs a sequence of steps: install, lint, format, test DB connection, test, start server.
- Fails fast on any error.
- Each step can be skipped by setting a SKIP\_\* env var, except for environment validation, test DB connection, and test steps, which are mandatory.
- Starts the server in a new PowerShell window.
- Checks port availability for the dev server before starting.
- Cleans and reinstalls dependencies if install fails, then checks for outdated packages.
