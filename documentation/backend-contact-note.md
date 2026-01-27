Note: Backend developer contact

Status: No direct contact available

Details:
- We do not have a contact or direct communication channel with the backend development team for https://wdd330-backend.onrender.com.
- This constrains our ability to clarify API contracts or request server-side changes.

Implications:
- Treat the backend as a fixed black box; prefer approaches that work with observed behavior.
- The backend accepts JSON user-creation payloads but rejects multipart/form-data for user creation (we verified direct and proxied multipart requests return 400 with "Email and password required").
- Avoid implementing client-side features that require backend changes (for example, expecting multipart user creation) unless we can negotiate API changes later.

Recommended actions:
- Use JSON POST for initial account creation, then upload avatar via a separate endpoint if available.
- Add integration tests that exercise the JSON create flow and then (optionally) the avatar upload if/when the backend documents or accepts it.
- If multipart support becomes essential, log the exact multipart payload we send and attempt to contact backend owners via project stakeholders or platform support channels.

Location: This note is stored at `documentation/backend-contact-note.md` in the repository.
