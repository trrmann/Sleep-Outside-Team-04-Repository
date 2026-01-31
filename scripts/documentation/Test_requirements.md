# Test.ps1 Functional Requirements

**⚠️ NOTE: This script does not currently exist in this environment.**

**If Test.ps1 is created, it should meet these requirements:**

- Runs **'npm test'** from the project root, passing any additional arguments. **npm is required. Do not use pnpm or yarn.**
- Exits with the same code as the test process (0 for success, nonzero for failure).
- Must be called from the scripts folder but run from the project root.

**Current workaround:** Run `npm test` directly from the project root.
