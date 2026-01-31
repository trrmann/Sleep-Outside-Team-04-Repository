# Employee Access Control

This application implements employee access control for the order management system.

## How It Works

### Backend Token-Based (Preferred)
If the backend includes employee status in the JWT token, the system will automatically detect it by checking for:
- `employee: true`
- `isEmployee: true`
- `role: "employee"`

### Email List Fallback
If the backend doesn't provide employee status, the system falls back to checking against a configured email list in `src/js/employeeConfig.mjs`.

## Adding Employees

### Option 1: Backend Configuration (Recommended)
Configure your backend to include employee status in the JWT token payload when users with admin/employee roles log in.

### Option 2: Client-Side Email List
Edit `src/js/employeeConfig.mjs` and add employee email addresses to the `EMPLOYEE_EMAILS` array:

```javascript
export const EMPLOYEE_EMAILS = [
  "admin@example.com",
  "manager@example.com",
  "youremployee@company.com",
  // Add more as needed
];
```

## Testing

1. **Test as non-employee:**
   - Login with a regular user account
   - Should redirect to `/orders/`
   - Should see message: "You can view your order history here. Currently showing your orders only."
   - "Orders" link should NOT appear in header

2. **Test as employee:**
   - Login with an email listed in `employeeConfig.mjs` OR with a backend token that includes employee status
   - Should redirect to `/orders/`
   - Should see all orders from the system
   - "Orders" link SHOULD appear in header (between search and logout)

## Security Note

The email list is client-side only and should be considered a convenience feature. For production security, always rely on backend JWT tokens with proper authentication and authorization.
