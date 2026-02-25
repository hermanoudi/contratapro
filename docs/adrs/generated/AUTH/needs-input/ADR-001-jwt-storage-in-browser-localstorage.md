# ADR-001: JWT Storage in Browser localStorage

**Status:** Accepted
**Date:** 2026-02-17
**Depends on:** [ADR-001: Stateless JWT Authentication with HS256](./ADR-001-stateless-jwt-authentication-hs256.md)
**Related to:** [ADR-001: React 19 + Vite 7 as Frontend SPA Framework](../../FE-APP/needs-input/ADR-001-react-vite-spa-framework.md)

---

## 1. Context and Problem Statement

The ContrataPro frontend, deployed on Vercel (`contratapro.com.br`), communicates with a FastAPI backend deployed on Railway (`api.contratapro.com.br`). These are distinct origins. After successful authentication, the frontend receives a JWT access token that must be persisted across page loads and injected as a Bearer header into every subsequent API request.

The cross-origin nature of this deployment eliminates the simplest cookie approach: a standard `SameSite=Lax` httpOnly cookie set by the backend would be blocked by the browser on cross-origin requests. Making cookies work across these two origins requires `SameSite=None; Secure; HttpOnly`, explicit CORS cookie configuration on the backend (`allow_credentials=True`, whitelisted origin), and CSRF protection on every mutating endpoint. The team opted to store the JWT in `localStorage` and transmit it via the `Authorization: Bearer` header, avoiding all of that cross-domain cookie infrastructure entirely.

This token storage strategy is applied uniformly: 26 frontend files retrieve the token via `localStorage.getItem('token')` and inject it into `fetch()` calls individually. There is no centralized authentication context, no custom hook, and no token refresh mechanism. The token is decoded client-side without signature verification solely to extract role claims for immediate UI routing — actual access control enforcement occurs server-side.

## 2. Decision Drivers

- The Railway + Vercel split-origin deployment makes standard httpOnly cookie auth non-trivial, requiring `SameSite=None; Secure` and explicit CSRF protection.
- The project documentation (`CLAUDE.md`) prohibits a `src/services/` directory and mandates inline `fetch()` calls, making a centralized HTTP interceptor incompatible with current architecture conventions.
- Role claims embedded in the JWT (`is_professional`, `is_admin`) must be available immediately after login for client-side routing decisions without an additional server round-trip.
- [NEEDS INPUT: Was a formal security risk assessment performed to determine XSS acceptability? What Content Security Policy (CSP) is in place to mitigate XSS risk on the Vercel deployment?]
- Token expiry and re-login frequency must align with user experience expectations for a marketplace requiring frequent, multi-session use.

## 3. Considered Options

1. **localStorage with Authorization Bearer header** (chosen)
2. **Cross-origin httpOnly Cookie with `SameSite=None; Secure`**
3. **Hybrid: in-memory access token + httpOnly refresh token cookie**

## 4. Decision Outcome

Chosen option: **localStorage with Authorization Bearer header**, because it is directly compatible with the cross-origin split-domain deployment without requiring backend CSRF protection, cookie CORS configuration, or deviation from the established inline `fetch()` pattern. The XSS vulnerability surface — the primary downside — is accepted as a trade-off against the infrastructure complexity of cross-domain cookie-based auth.

[NEEDS INPUT: Was this trade-off explicitly approved by a security stakeholder or documented in a security review? Confirming this would validate the "Accepted" status and distinguish a deliberate decision from an accidental default.]

## 5. Pros and Cons of the Options

### Option 1: localStorage with Authorization Bearer header

- Pro: No CORS cookie configuration needed; works natively with cross-origin `fetch()` calls.
- Pro: Zero CSRF attack surface since cookies are not involved in the request authentication flow.
- Pro: Simple, uniform pattern already consistent across all 26 authenticated frontend files.
- Con: Vulnerable to XSS — any injected JavaScript can read `localStorage` and exfiltrate the token.

### Option 2: Cross-origin httpOnly Cookie with `SameSite=None; Secure`

- Pro: Immune to XSS token theft; the cookie is not readable by JavaScript.
- Con: Requires CSRF protection on all mutating endpoints, increasing backend complexity.
- Con: Requires `allow_credentials=True` and explicit origin whitelisting in FastAPI CORS configuration.
- Con: Browser compatibility and third-party cookie blocking (Safari ITP, Firefox ETP) introduces reliability risk.

### Option 3: Hybrid — in-memory access token + httpOnly refresh token cookie

- Pro: Short-lived in-memory access tokens limit XSS exposure window; refresh token in httpOnly cookie is protected from script access.
- Con: Requires a token refresh endpoint, silent refresh logic, and a centralized auth context — none of which exist currently.
- Con: [NEEDS INPUT: Was this hybrid approach formally evaluated? The current codebase shows no evidence of refresh token infrastructure.]

## 6. Consequences

The decentralized token retrieval pattern — 26 files each calling `localStorage.getItem('token')` independently — creates a significant refactoring burden if the storage mechanism changes in the future. Migrating to a centralized `useAuth()` hook or React Context for auth state would require touching every authenticated page, layout, and component. This coupling between the storage choice and the absence of an auth abstraction layer is the primary long-term cost of this decision.

Token non-revocability inherited from the stateless JWT strategy is compounded by the 30-minute effective token lifetime (the `config.py` 7-day setting is not applied at the call site; see AUTH/ADR-002). Users whose tokens are compromised have a 30-minute exposure window with no server-side revocation mechanism. Logout clears `localStorage` client-side but does not invalidate the token server-side.

Any future expansion to native mobile applications or browser extensions will require a storage strategy change, since `localStorage` is browser-tab-scoped and inaccessible from native app contexts. This decision effectively scopes the authentication mechanism to web-only clients until the architecture is revisited.

## 7. References

- `frontend/src/pages/Login.jsx:363` — token write on successful login
- `frontend/src/pages/Login.jsx:369-377` — client-side JWT decode for role-based routing
- `frontend/src/pages/RegisterProfessional.jsx:582` — token write after auto-login post-registration
- `frontend/src/components/ProfessionalLayout.jsx:192-243` — repeated decentralized token retrieval pattern
- `backend/app/routers/auth.py:132-158` — token issuance endpoint (cross-reference for token payload structure)
