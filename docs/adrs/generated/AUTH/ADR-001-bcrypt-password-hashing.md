# ADR-001: bcrypt for Password Hashing

**Status:** Accepted
**Date:** 2026-02-17
**Related to:** [ADR-001: Stateless JWT Authentication with HS256](./needs-input/ADR-001-stateless-jwt-authentication-hs256.md)

---

## 1. Context and Problem Statement

ContrataPro requires a password hashing strategy that protects user credentials at rest for all account types (clients and professionals). The platform performs credential hashing at registration, login verification, and password reset flows.

The codebase currently has two coexisting bcrypt interfaces: a direct `bcrypt` library integration in the primary auth utilities module, and a `passlib.CryptContext` wrapper in the admin router. Both produce compatible bcrypt hashes but represent different integration surfaces that must be maintained separately. The `passlib` library is already present as a project dependency, which makes this duality notable.

The password strength policy (minimum length, uppercase, lowercase, digit, special character) is enforced server-side at the password reset endpoint. Its consistent enforcement across all user creation paths is an operational concern tied to this decision.

## 2. Decision Drivers

- All user credentials — professional and client — depend on the hash algorithm's resistance to brute-force and GPU-accelerated attacks.
- bcrypt's 72-character password limit silently truncates longer inputs, which constrains the password policy ceiling.
- The OWASP Password Storage Cheat Sheet currently recommends argon2id as the preferred algorithm over bcrypt.
- The dual-implementation increases maintenance surface: a cost factor change must be applied in two places.
- Future OAuth2 social login integration must define behavior for users without local passwords, intersecting with the current data model assumption that every user has a hashed password value.

## 3. Considered Options

- **Option A: Direct bcrypt library (current primary approach)** — Raw bcrypt hashing using the `bcrypt` Python library with explicit UTF-8 byte encoding/decoding.
- **Option B: passlib unified interface** — Replace both bcrypt integrations with a single `passlib.CryptContext` instance, which already exists as a dependency and provides algorithm migration support via rehash-on-verify.
- **Option C: argon2id via passlib** — Adopt argon2id (OWASP-recommended) through `passlib`'s argon2 backend, enabling migration of existing bcrypt hashes transparently on next login.

## 4. Decision Outcome

Chosen option: **Option A (direct bcrypt library)**, because the primary authentication utilities were implemented with it and it remains the default hashing path for all user-facing flows.

[NEEDS INPUT: Document the specific rationale for choosing the raw bcrypt library over the passlib wrapper, given that passlib was already present as a dependency at the time of implementation. Was this an intentional choice or an incremental adoption artifact?]

[NEEDS INPUT: Confirm the bcrypt cost factor in use. The implementation calls `bcrypt.gensalt()` with no explicit argument, which defaults to 12 rounds. Verify this is intentional and document whether the cost factor is expected to increase as hardware benchmarks evolve.]

## 5. Pros and Cons of the Options

### Option A: Direct bcrypt library

- Good: Minimal dependencies — no abstraction layer between the application and the hashing primitive.
- Good: Compatible hash output with passlib's bcrypt scheme (same underlying algorithm).
- Bad: Requires manual UTF-8 byte encoding/decoding at every call site.
- Bad: Dual-implementation with the admin router's passlib wrapper creates split maintenance responsibility.

### Option B: passlib unified interface

- Good: Single, consistent hashing interface across all user creation paths.
- Good: Built-in rehash-on-verify enables cost factor migration without forced password resets.
- Bad: Adds an abstraction layer that obscures the underlying bcrypt parameters.
- Bad: Requires consolidation effort to remove the direct bcrypt library usage.

### Option C: argon2id via passlib

- Good: OWASP-recommended algorithm with stronger resistance to GPU and ASIC attacks than bcrypt.
- Good: passlib supports transparent migration — existing bcrypt hashes are verified as-is and rehashed to argon2id on next login.
- Bad: Requires the `argon2-cffi` native dependency and additional configuration of memory, iteration, and parallelism parameters.

[NEEDS INPUT: Was argon2id formally evaluated or ruled out before adopting bcrypt? If a deliberate decision was made to prefer bcrypt at this stage, document the reasoning (e.g., operational familiarity, argon2 native dependency concerns, team preference).]

## 6. Consequences

The direct bcrypt library remains the canonical hashing path for all user-facing registration and authentication flows. Any developer adding new user creation paths (OAuth2 social login, admin bulk import, service account creation) must use the shared auth utilities module rather than introducing a third hashing context.

The dual-implementation with the admin router is a known technical debt item. Consolidating to a single interface — whether the direct library or the passlib wrapper — would reduce the cost of a future cost factor increase or algorithm migration.

The current data model assumes every user row has a non-null hashed password. Introducing social OAuth login will require either a nullable password column or a sentinel value strategy, and this decision will need revisiting at that point.

## 7. References

- `backend/app/auth_utils.py:1-27`
- `backend/app/routers/admin.py:8-15`
- `backend/app/models.py:43`
