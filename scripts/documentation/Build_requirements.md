# Build.ps1 Functional Requirements

**Reminder:** If any new permanent functionality is added to Build.ps1, update this requirements file to reflect the changes.

- Runs **'npm run build'** from the project root. **npm is required. Do not use pnpm or yarn.**
- Uses Vite to build optimized production files to /dist directory.
- Exits with the same code as the build process (0 for success, nonzero for failure).
- Must be called from the scripts folder but run from the project root.
