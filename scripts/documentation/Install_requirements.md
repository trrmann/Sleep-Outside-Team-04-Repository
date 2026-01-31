# Install.ps1 Functional Requirements

**Reminder:** If any new permanent functionality is added to Install.ps1, update this requirements file to reflect the changes.

- Runs **'npm install'** from the project root, passing any additional arguments. **npm is required. Do not use pnpm or yarn.**
- Exits with the same code as the install process (0 for success, nonzero for failure).
- Must be called from the scripts folder but run from the project root.
