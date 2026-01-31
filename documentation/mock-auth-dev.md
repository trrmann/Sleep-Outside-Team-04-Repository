# Mock Authentication for Development

## Overview

Mock authentication provides test tokens to bypass login during development. This is useful for testing the orders page and employee features when the backend login is unavailable or having issues.

## ⚠️ WARNING

**This is for DEVELOPMENT ONLY**. Never use mock authentication in production!

## Mock Identities

### Employee Account
- **Email**: `admin@example.com`
- **Name**: `Admin User`
- **ID**: `emp001`
- **Role**: Employee (has employee privileges)
- **Permissions**: Can view all orders, access employee features
- **Token Payload**:
  ```json
  {
    "id": "emp001",
    "email": "admin@example.com",
    "name": "Admin User",
    "employee": true,
    "isEmployee": true,
    "role": "employee",
    "exp": <1 year from now>
  }
  ```

### Customer Account
- **Email**: `customer@example.com`
- **Name**: `Test Customer`
- **ID**: `cust001`
- **Role**: Customer (no employee privileges)
- **Permissions**: Limited to own orders only
- **Token Payload**:
  ```json
  {
    "id": "cust001",
    "email": "customer@example.com",
    "name": "Test Customer",
    "employee": false,
    "exp": <1 year from now>
  }
  ```

## How to Use

### Method 1: Mock Auth Page (Recommended)

1. Navigate to `http://localhost:5173/mock-auth/` in your browser
2. Click one of the buttons:
   - **"Login as Employee"** - Sets employee token
   - **"Login as Customer"** - Sets customer token
3. You'll be redirected to `/orders/` with authentication set
4. Page will behave as if you're logged in with that identity

### Method 2: Browser Console

Open browser console (F12) and use these commands:

```javascript
// Login as employee
mockAuth.setEmployee()

// Login as customer
mockAuth.setCustomer()

// View available mock tokens
mockAuth.getTokens()
```

After running a command, reload the page to see the changes.

### Method 3: Direct Import

In any JavaScript module during development:

```javascript
import { setMockEmployeeAuth, setMockCustomerAuth } from './js/mockAuth.mjs';

// Set employee auth
setMockEmployeeAuth();

// Set customer auth
setMockCustomerAuth();
```

## What Gets Tested

### Employee Token Testing
- ✅ Employee detection (via JWT payload)
- ✅ Dynamic header shows "Orders" and "Logout" links
- ✅ Orders page loads without redirect
- ✅ Employee-specific UI elements visible
- ✅ API requests include Authorization header with token
- ⚠️ Actual order fetching depends on backend accepting the mock token

### Customer Token Testing
- ✅ Non-employee user detection
- ✅ Dynamic header shows "Logout" link (no Orders link)
- ✅ Orders page shows "non-employee" message
- ✅ User can see logged-in state
- ✅ Logout functionality works

## File Locations

- **Mock Auth Module**: `src/js/mockAuth.mjs`
- **Mock Auth Page**: `src/mock-auth/index.html`
- **Employee Email List**: `src/js/employeeConfig.mjs`
- **Auth Module**: `src/js/Auth.mjs`

## Token Format

Mock tokens are JWT-formatted (Base64 encoded):
```
<header>.<payload>.<signature>
```

- **Header**: `{"alg":"HS256","typ":"JWT"}`
- **Payload**: Contains user data (see above)
- **Signature**: `"mock_signature_for_dev_testing"` (not validated)

The application decodes the payload to extract user information and employee status.

## Clearing Mock Auth

To logout and clear mock tokens:

1. Click the "Logout" link in the header
2. Or run in console: `localStorage.removeItem('so-auth-token-v1')`
3. Or use browser DevTools → Application → Local Storage → Clear

## Backend Integration Notes

Mock tokens work for **frontend testing only**:
- ✅ Frontend employee detection works
- ✅ UI conditionals work
- ✅ Token storage/retrieval works
- ⚠️ Backend API calls may reject mock tokens
- ⚠️ Order fetching requires valid backend authentication

To test full order fetching, the backend must:
1. Accept the BACKEND_API_TOKEN in Authorization header (working via Vite proxy)
2. Have a working login endpoint (currently returns 401 errors)
3. Return valid JWT tokens that match expected format

## Troubleshooting

### Mock auth not working?
1. Ensure you're in development mode (localhost)
2. Check console for `[MOCK AUTH]` messages
3. Verify token is set: `localStorage.getItem('so-auth-token-v1')`
4. Reload page after setting token

### Orders page redirects to login?
1. Verify token is set in localStorage
2. Check orders.js auth check logic
3. Ensure isLoggedIn() returns true

### Employee features not showing?
1. Verify you used `setEmployee()` not `setCustomer()`
2. Check token payload has `employee: true`
3. Verify employeeConfig.mjs includes the email
4. Check Auth.mjs isEmployee() logic

## Related Documentation

- [Employee Access](./employee-access.md) - Employee detection and access control
- [Authentication Flow](../src/js/login.js) - Real login implementation
- [Orders Page](../src/orders/index.html) - Employee order management
