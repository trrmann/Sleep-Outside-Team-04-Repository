# TestDbConnection.ps1 Functional Requirements

**Reminder:** If any new permanent functionality is added to TestDbConnection.ps1, update this requirements file to reflect the changes.

- Tests connectivity to a PostgreSQL database using Test-NetConnection.
- Accepts optional parameters for database host and port (defaults: localhost, 5432).
- Outputs success or error messages based on the result.
- Exits with code 0 if the connection succeeds, 1 if it fails.

## SSL Handling

- The script must test connectivity using the same SSL settings as the application: SSL enabled for remote databases, disabled for localhost.
