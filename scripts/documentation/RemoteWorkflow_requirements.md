## Database Connectivity Note

- The application must support connecting to both local and remote PostgreSQL databases.
- When connecting to a remote database (i.e., DATABASE_URL does not contain "localhost"), SSL must be enabled with `rejectUnauthorized: false` to ensure compatibility with managed database providers (e.g., Render, Heroku).
- When connecting to a local database, SSL should be disabled.

# RemoteWorkflow.ps1 Functional Requirements

**Reminder:** If any new permanent functionality is added to RemoteWorkflow.ps1, update this requirements file to reflect the changes.

- Validates production environment configuration (ValidateEnvironment.ps1). **This step is always required and cannot be skipped.**
- **Test database connection (`TestDbConnection.ps1`) is always required and cannot be skipped.**
- **Test step (`Test.ps1`) is always required and cannot be skipped.**
- Runs install, lint, format, and build steps in order.
- Lint step attempts auto-fix if errors are found, commits fixes if needed.
- Checks port availability for both the proxy server (3000) and the app server (default 5500) by calling `ValidatePort.ps1` for each. Both ports must be free before starting the proxy server. Offers to kill blocking processes for either port.
- Starts the production proxy server for testing and opens the browser when running.
- Prompts for manual testing confirmation before commit and push.
- Commits and pushes changes to GitHub, triggering Render deployment.
- Fails fast on any error or user cancellation.
- Exits with code 0 on success, 1 on failure.
