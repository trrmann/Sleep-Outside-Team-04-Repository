# ValidateEnvironment.ps1 Functional Requirements

**Reminder:** If any new permanent functionality is added to ValidateEnvironment.ps1, update this requirements file to reflect the changes.

- Validates the presence of the .env file at the project root.
- Checks for required environment variables: PORT, DATABASE_URL, SESSION_SECRET.
- For production, may check for .env.production.local and BACKEND_API_TOKEN if needed.
- Outputs detailed status for each file and variable.
- Exits with code 0 if all checks pass, 1 if any required file or variable is missing.
- Never displays secret values, only confirms keys exist.
