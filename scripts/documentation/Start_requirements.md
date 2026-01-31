# Start.ps1 Functional Requirements

**Reminder:** If any new permanent functionality is added to Start.ps1, update this requirements file to reflect the changes.

- Runs **'npm run start'** from the project root in a new PowerShell window. **npm is required. Do not use pnpm or yarn.**
- Starts Vite development server on http://localhost:5173.
- Window stays open with -NoExit flag.
- Informs the user to close the PowerShell window to stop the server.
- Outputs status messages for server start.
