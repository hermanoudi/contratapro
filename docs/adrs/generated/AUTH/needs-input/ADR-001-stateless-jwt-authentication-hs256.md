# ADR-001: Stateless JWT Authentication with HS256

**Status:** Accepted
**Date:** 2026-01-14
**Related to:**
- [ADR-001: FastAPI as Primary Backend Framework](../../CORE/ADR-001-fastapi-as-primary-backend-framework.md)
- [ADR-001: bcrypt for Password Hashing](../ADR-001-bcrypt-password-hashing.md)

**Used by:** [ADR-001: JWT Storage in Browser localStorage](./ADR-001-jwt-storage-in-browser-localstorage.md)

---

## Context and Problem Statement

ContrataPro is deployed across two separate domains: the API on Railway and the frontend on Vercel.
This split-origin architecture ruled out the most common web session approach — server-side sessions
with cookies — because cross-domain cookies require additional CORS configuration, CSRF protection,
and a shared session store accessible to both runtime environments.

The platform required an authentication mechanism that could work statelessly across this
distributed deployment while embedding enough identity information for authorization decisions to
be made at the router level without a second lookup. The mechanism also needed to differentiate
regular access tokens from password-reset tokens to prevent misuse of one token type as the other.

[NEEDS INPUT: Was a shared session store (e.g., Redis) explicitly evaluated and rejected, or was
stateless JWT selected without considering it? The "split deployment" rationale appears in code
comments, but the actual decision record is missing.]

## Decision Drivers

- Cross-origin deployment between Railway (API) and Vercel (frontend) makes cookie-based sessions
  architecturally inconvenient without additional shared infrastructure
- Every authenticated endpoint must resolve user identity and role (professional, admin) without
  a separate authorization service
- Password-reset flows require token isolation to prevent reset tokens from elevating to session
  access
- The single shared secret (`SECRET_KEY`) simplifies key management for a small team with a single
  deployment environment
- [NEEDS INPUT: Were there security policy constraints — such as a requirement for revocable
  sessions or specific token lifetime limits — that drove the 7-day expiry target in configuration?]

## Considered Options

1. Stateless JWT with HS256 (symmetric shared secret) — chosen
2. Server-side sessions backed by a shared store (Redis or database)
3. JWT with RS256 (asymmetric key pair)

## Decision Outcome

Chosen option: Stateless JWT with HS256, because it eliminates the need for a shared session store
in the Railway + Vercel split-origin deployment, embeds role claims for inline authorization, and
keeps cryptographic key management to a single environment variable available to all replicas.

A custom `"purpose"` claim distinguishes password-reset tokens from access tokens at the
application layer, preventing token type confusion without a separate signing key.

One configuration inconsistency affects the actual token lifetime: the target of 7 days
(`ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7` in `config.py`) is not read by the login router,
which hardcodes a 30-minute expiry. The effective access token lifetime is 30 minutes.

## Pros and Cons of the Options

### Stateless JWT with HS256

- Good: No additional infrastructure required; works across Railway and Vercel without shared state
- Good: Role claims (`is_professional`, `is_admin`) embedded at issuance avoid per-request
  authorization queries
- Bad: Tokens cannot be revoked before expiry; a compromised token is valid until it expires
- Bad: Symmetric key means any service with `SECRET_KEY` can both issue and verify tokens — no
  verification-only path for future read-only consumers

### Server-side sessions backed by shared store

- Good: Sessions are instantly revocable; password change or account suspension takes effect
  immediately
- Good: No sensitive claims stored client-side
- Bad: Requires a shared session store (Redis or DB) accessible from all deployment origins,
  adding infrastructure cost and operational complexity for a two-person team
- Bad: Cross-domain cookie configuration with CSRF protection needed for split-origin setup

### JWT with RS256 (asymmetric key pair)

- Good: Verification-only consumers (future mobile clients, third-party services) can hold the
  public key without being able to issue tokens
- Good: Enables JWKS endpoint for standard OAuth2/OIDC interoperability
- Bad: Key rotation requires distributing new public keys to all verifiers
- Bad: Adds operational complexity (key pair generation, secure private key storage) with no
  immediate benefit at current single-consumer scale

## Consequences

The absence of token revocation means that account suspension, password change, or credential
compromise does not invalidate existing tokens until their expiry window closes. Any future
security incident response that requires immediate session termination cannot be handled without
introducing a token denylist (typically Redis-backed), which reintroduces shared state. This
constraint should be explicitly accepted or a denylist added before the platform reaches a user
volume where incident response time becomes a liability.

The DB lookup on every authenticated request (in `get_current_user`) partially offsets the
stateless benefit: the token is stateless in transit, but validation still incurs a database round
trip. This is the correct trade-off for data freshness (suspended accounts, plan changes), but it
means the architecture is not purely stateless in practice.

[NEEDS INPUT: Has the team accepted the non-revocability constraint as a known risk, or is there a
plan to introduce a token denylist or shorten the expiry window? This should be documented as an
explicit policy decision.]

If future requirements include a mobile application or third-party OAuth consumer, the HS256
symmetric scheme would need to be replaced with RS256 and a JWKS endpoint, as external consumers
cannot safely hold the shared signing secret.

## References

- `backend/app/auth_utils.py:1-68`
- `backend/app/dependencies.py:1-37`
- `backend/app/config.py:20-26`
- `backend/app/routers/auth.py:132-158`
