# Potential ADR: JWT Token Stored in Browser localStorage

**Module**: AUTH
**Category**: Security / Frontend Architecture
**Priority**: Consider (Score: 70)
**Date Identified**: 2026-02-17

---

## What Was Identified

The React frontend stores the JWT access token in `window.localStorage` under the key `'token'`. This is the sole mechanism for persisting authentication state across page loads and browser sessions. The pattern is consistent across the entire frontend: at login (`Login.jsx` line 363) and after registration (`RegisterProfessional.jsx` line 582), the token is written with `localStorage.setItem('token', access_token)`. On every subsequent authenticated request, it is read with `localStorage.getItem('token')` and injected as an `Authorization: Bearer <token>` header.

This pattern is applied uniformly across 26 frontend files covering all authenticated surfaces: layouts (`ProfessionalLayout`, `ClientLayout`, `SharedLayout`), all professional pages (`Dashboard`, `MySubscription`, `ChangePlan`, `SubscriptionCheckout`), all client pages (`ClientDashboard`, `AppointmentDetail`, `History`), and admin pages (`AdminDashboard`, `AdminTrials`).

The frontend also decodes the JWT payload client-side without a library (`JSON.parse(atob(token.split('.')[1]))`) to extract `is_professional` and `is_admin` claims for routing decisions immediately after login — meaning the role claims in the token directly influence navigation without a round-trip to the server.

This is a strategic choice given the split deployment architecture: the API runs on `api.contratapro.com.br` (Railway) while the frontend runs on `contratapro.com.br` (Vercel). Cross-origin `Set-Cookie` with `SameSite=None; Secure; HttpOnly` would be necessary for cookie-based auth in this configuration, adding complexity around CSRF protection and browser compatibility. localStorage avoids all of that at the cost of XSS vulnerability surface.

## Why This Might Deserve an ADR

- **Impact**: Affects all 26 authenticated frontend files. Every developer building any authenticated page, component, or layout must follow this pattern to integrate with the auth system.
- **Trade-offs**: The primary security concern with localStorage is XSS (Cross-Site Scripting) — any injected JavaScript can read `localStorage` and exfiltrate the token. httpOnly cookies are immune to XSS but introduce CSRF risk and cross-domain cookie complexity. Given the Railway+Vercel split domain, httpOnly cookies would require `SameSite=None; Secure` and explicit CORS cookie settings on both sides.
- **Complexity**: There is no React Context or custom hook centralizing auth state — each component independently calls `localStorage.getItem('token')`. If the storage key or mechanism changes, 26 files need updating. There is no centralized logout function that clears all auth state.
- **Team Knowledge**: Every frontend developer must know the exact localStorage key (`'token'`), the Authorization header format, and that token expiry is not proactively detected (expired tokens result in 401 responses that must be handled per-component).
- **Future Implications**: If a mobile app or browser extension is added, localStorage is browser-tab-scoped and not accessible from native apps. The absence of a token refresh mechanism means a 30-minute expiry (the effective expiry, as documented in the JWT ADR) results in frequent re-logins for users.

## Evidence Found in Codebase

### Key Files

- [`frontend/src/pages/Login.jsx`](../../../../../frontend/src/pages/Login.jsx) - Line 363
  - Token write on successful login: `localStorage.setItem('token', data.access_token)`
- [`frontend/src/pages/Login.jsx`](../../../../../frontend/src/pages/Login.jsx) - Lines 369-377
  - Client-side JWT decode for role-based routing
- [`frontend/src/pages/RegisterProfessional.jsx`](../../../../../frontend/src/pages/RegisterProfessional.jsx) - Line 582
  - Token write after auto-login post-registration
- [`frontend/src/components/ProfessionalLayout.jsx`](../../../../../frontend/src/components/ProfessionalLayout.jsx) - Lines 192, 201, 240, 243
  - Repeated `localStorage.getItem('token')` pattern in layout component

### Code Evidence

```javascript
// frontend/src/pages/Login.jsx:363-377
localStorage.setItem('token', data.access_token);
toast.success('Login realizado com sucesso!');

// Verificar se há uma rota de origem (de onde o usuário veio)
const from = location.state?.from;

// Client-side JWT decode — no library, raw base64
const payload = JSON.parse(atob(data.access_token.split('.')[1]));
if (payload.is_admin) {
  navigate('/admin');
} else if (payload.is_professional) {
  navigate('/dashboard');
} else {
  navigate(from || '/');
}
```

```javascript
// Repeated pattern in 26 files — example from ProfessionalLayout.jsx:192-201
const token = localStorage.getItem('token');
// ...
headers: { 'Authorization': `Bearer ${token}` }
```

### Impact Analysis

- Git history: Not available for this analysis
- Affected files: 26 frontend `.jsx` files containing `localStorage` or `Authorization: Bearer` patterns
- Architecture dependency: Vercel (frontend) + Railway (backend) cross-origin split makes cookie-based auth non-trivial
- No centralized auth state: no React Context, no custom `useAuth()` hook, no interceptor layer

### Alternatives (if observable)

No evidence of httpOnly cookie auth attempts, React Context for auth state, Axios interceptors, or a centralized auth module was found. The `frontend/src/contexts/` directory exists with only `TourContext.jsx` — no auth context. The architecture explicitly documents "No `src/services/` dir" and "inline fetch()" which is consistent with the decentralized token retrieval pattern.

## Questions to Address in ADR (if created)

- Was the localStorage vs httpOnly cookie trade-off explicitly evaluated, given the cross-domain deployment?
- Is XSS risk acceptable given the current Content Security Policy (if any)?
- Should a `useAuth()` hook or React Context centralize token access to reduce the 26-file pattern duplication?
- What is the expected behavior when a token expires mid-session? Is 401 handling per-component intentional?
- Would a token refresh mechanism (short access token + refresh token in httpOnly cookie) be a better hybrid?

## Related Potential ADRs

- [stateless-jwt-authentication-hs256.md](../../must-document/AUTH/stateless-jwt-authentication-hs256.md) — the JWT strategy this storage decision is built upon

## Additional Notes

The client-side JWT decode (`atob(token.split('.')[1])`) without signature verification is intentional — the frontend cannot verify the HS256 signature without the secret key, and does not need to since it only uses the claims for UI routing. Actual access control enforcement happens server-side. This is correct behavior but worth documenting as a deliberate decision.

The absence of a centralized auth module means there is no single place to add token refresh logic, logout cleanup, or session expiry detection in the future. Any refactor toward a `useAuth()` hook or auth context would touch all 26 files.
