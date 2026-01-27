Signup flow consolidation

Summary
- Removed duplicate registration handler in `src/js/signup.js` that used `ProductData.registerUser`.
- Kept the canonical in-file handler which:
  - Validates fields (name, address, email, password)
  - Supports avatar preview and multipart upload when a file is selected
  - Submits JSON when no avatar is present
  - Parses JSON responses and stores `body.token` to `localStorage` when provided
- Removed `console.*` calls to satisfy linting rules.

Why
- Two handlers caused ambiguous behavior and introduced lint/parsing issues.
- Consolidation simplifies maintenance and ensures a single source of truth for form submission.

Notes
- If you prefer a service-layer approach (e.g., `ProductData.registerUser`), consider moving the fetch/form-data logic into that service and having the UI call it. For now, UI-level fetch is retained because it handles multipart uploads directly.
- For E2E testing, ensure the dev proxy forwards `/api/users` to the backend and injects `BACKEND_API_TOKEN` if required.

Files changed
- `src/js/signup.js` — removed duplicate handler and console calls, added documentation comments.
- `documentation/signup-consolidation.md` — this file.

Next steps (suggested)
- Confirm backend accepts multipart avatars and implement client-side file size/type validation if needed.
- Add integration tests that exercise both JSON and multipart submission paths.
