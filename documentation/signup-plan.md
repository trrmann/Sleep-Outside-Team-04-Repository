# Customer Signup Plan

## Goal
Provide a secure, accessible sign-up flow for customers to create an account. Capture name, address, email, and password. Stretch: allow uploading an avatar.

## API Contract (confirm before implementation)
- Endpoint: `POST /users`
- Content: Prefer `application/json` with fields:
  - `name` (string)
  - `address` (string)
  - `email` (string, unique)
  - `password` (string, hashed server-side)
  - `avatar` (optional): either URL (string) or handled via multipart upload — confirm with backend.
- Responses:
  - `201 Created` with user object (and optional `token` for immediate auth)
  - `400` validation errors
  - `409` email already exists

If backend expects multipart/form-data for avatar, submit form as multipart with fields above and a `file` part named `avatar`.

## UI Changes
- Add page: `src/signup/index.html` with form fields:
  - Full Name (required)
  - Address (required)
  - Email (required, email input)
  - Password (required, show/hide toggle, strength hint)
  - Avatar (optional file input with client preview)
  - Submit button

## Client-side Logic
- New script: `src/js/signup.js`
  - Validate inputs (client-side): required fields, email format, password strength.
  - On submit, disable form and show loading state.
  - Build request:
    - If avatar is used and backend requires multipart: create `FormData`, append fields and file.
    - Else send JSON body `{ name, address, email, password }` with `Content-Type: application/json`.
  - POST to `/users` (use relative path so local proxy forwards to backend).
  - On success:
    - If response contains `token`, save to `localStorage` or `sessionStorage` and redirect to welcome or account page.
    - Otherwise redirect to login with success message.
  - On error: display server validation messages inline.

## Avatar (Stretch)
- Show client-side preview of selected image (FileReader).
- Option A (preferred): send avatar as part of `multipart/form-data` so server can store file.
- Option B: convert to base64 and include in JSON only if backend supports it (not recommended for large images).

## Proxy / Server
- Ensure `server.js` or `vite.config.js` proxies `/users` to the backend URL used by the project:
  - Confirm proxy rewrites and headers (if `BACKEND_API_TOKEN` injection is used, the proxy can add Authorization for dev testing).

## Tests
- Unit tests for validation functions (email, password) in `test/`.
- Integration test that mocks `fetch` to assert the correct request shape and UI behavior on success/error. Add `test/signup.test.js`.

## Accessibility & UX
- Use semantic form controls and labels.
- Ensure keyboard focus order, ARIA live regions for errors, and visible focus styles.

## Files to Create / Edit
- `src/signup/index.html` — markup for the form.
- `src/js/signup.js` — client logic and fetch.
- `src/css/signup.css` — small styles (or add to existing `src/css/style.css`).
- `server.js` or `vite.config.js` — ensure routing/proxy for `/users`.
- `test/signup.test.js` — tests.
- Update header partial at `src/public/partials/header.html` to link to the signup page.

## Implementation Steps (suggested order)
1. Confirm API contract with backend (fields, avatar handling, responses).
2. Scaffold `src/signup/index.html` and add route link in header.
3. Implement `src/js/signup.js` with validation and POST logic (JSON path first).
4. Wire proxy if needed and test POST to backend with dev proxy and a valid token.
5. Add avatar support if backend supports multipart.
6. Add tests and documentation.

## Example JSON payload
```json
{
  "name": "Jane Doe",
  "address": "123 Main St, City, ST 12345",
  "email": "jane@example.com",
  "password": "S3cureP@ssw0rd"
}
```

## Notes / Risks
- Password handling must always be done server-side (hashing). Never store plaintext tokens or passwords in client code or logs.
- Confirm backend CORS or proxy behavior to avoid CORS issues during development.

---
Created: plan for customer signup flow.
