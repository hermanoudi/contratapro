# Potential ADR: bcrypt for Password Hashing

**Module**: AUTH
**Category**: Security
**Priority**: Must Document (Score: 135)
**Date Identified**: 2026-02-17

---

## What Was Identified

All user passwords in ContrataPro are hashed using bcrypt before storage, via the `bcrypt` Python library (not via `passlib` or any framework default). The implementation uses `bcrypt.gensalt()` with the default cost factor (12 rounds), stores the resulting hash as a UTF-8 string in the `users.hashed_password` column, and verifies passwords at login with `bcrypt.checkpw()`.

There is an important implementation detail: the `bcrypt` library API requires bytes input, so `auth_utils.py` explicitly encodes string passwords to UTF-8 bytes before hashing and decodes the resulting hash bytes back to a string for database storage. This encoding ceremony is repeated in both `get_password_hash` and `verify_password`.

A secondary hashing context also exists in `admin.py` using `passlib.context.CryptContext` with the `bcrypt` scheme — imported for use in admin user creation. This means two different bcrypt interfaces coexist: the direct `bcrypt` library in `auth_utils.py` and `passlib`'s wrapper in `admin.py`. Both ultimately produce compatible bcrypt hashes, but the dual-implementation increases maintenance surface.

The password hashing strategy extends into two additional places: the `/auth/reset-password` endpoint re-hashes the new password using `get_password_hash` after validating strength criteria, and the `RegisterProfessional.jsx` and `RegisterClient.jsx` pages post raw passwords over HTTPS to the registration endpoint (no client-side hashing — server-side only, which is correct).

## Why This Might Deserve an ADR

- **Impact**: Every user's credentials security depends on this choice. A change from bcrypt to argon2 or scrypt would require a migration path for all existing password hashes (typically: re-hash on next login, bulk migration or forced password reset).
- **Trade-offs**: bcrypt has a 72-character password limit (silently truncates longer inputs). argon2id is now the OWASP-recommended algorithm, offering better resistance to GPU/ASIC attacks. The current default cost factor (12) may need increasing as hardware becomes cheaper.
- **Complexity**: The dual-implementation (direct `bcrypt` vs `passlib.CryptContext`) is a maintenance risk — if the cost factor needs updating, it must be changed in two places.
- **Team Knowledge**: Any developer adding user creation flows (e.g., OAuth2 social login, admin bulk import) must know to use `get_password_hash` from `auth_utils.py` and not roll their own hashing.
- **Future Implications**: If the platform adds social OAuth login (Google, Facebook), the hashing strategy must be defined for users who have no local password. The current model assumes every user has a `hashed_password` column value.

## Evidence Found in Codebase

### Key Files

- [`backend/app/auth_utils.py`](../../../../../backend/app/auth_utils.py) - Lines 1-27
  - Primary bcrypt implementation: `verify_password`, `get_password_hash`
- [`backend/app/routers/admin.py`](../../../../../backend/app/routers/admin.py) - Lines 8, 15
  - Secondary passlib CryptContext with bcrypt scheme
- [`backend/app/models.py`](../../../../../backend/app/models.py) - Line 43
  - `hashed_password = Column(String, nullable=False)` — storage column

### Code Evidence

```python
# backend/app/auth_utils.py:1-27
import bcrypt

def verify_password(plain_password, hashed_password):
    # bcrypt.checkpw expects bytes
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password, hashed_password)

def get_password_hash(password):
    # bcrypt.hashpw expects bytes and returns bytes
    if isinstance(password, str):
        password = password.encode('utf-8')
    # Generate salt and hash
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    return hashed.decode('utf-8')  # Return as string for DB storage
```

```python
# backend/app/routers/admin.py:8, 15 — second bcrypt interface
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

```python
# backend/app/models.py:43
hashed_password = Column(String, nullable=False)
```

### Impact Analysis

- Git history: Not available for this analysis
- Affects: All user accounts — professional and client registration flows, login verification, password reset
- Dual-implementation footprint: `auth_utils.py` (primary) + `admin.py` (secondary, passlib wrapper)
- Strong password validation: enforced at `/auth/validate-password`, `/auth/reset-password`, and registration

### Alternatives (if observable)

`passlib` is already present as a dependency (visible in `admin.py` import). The passlib library offers a unified interface for bcrypt, argon2, and scrypt, and supports algorithm migration with rehashing-on-verify. The coexistence of direct `bcrypt` and `passlib.CryptContext` suggests the passlib path may have been considered or partially adopted. No argon2 or scrypt evidence found.

## Questions to Address in ADR (if created)

- Why use the raw `bcrypt` library directly instead of `passlib` (which already exists as a dependency)?
- What is the bcrypt cost factor in use? Is it explicitly set or using the library default?
- What is the migration plan if the cost factor needs increasing in the future?
- Was argon2id considered? If not, why not (OWASP now recommends it over bcrypt)?
- How should the dual-implementation (direct bcrypt vs passlib) be resolved?

## Related Potential ADRs

- [stateless-jwt-authentication-hs256.md](./stateless-jwt-authentication-hs256.md) — bcrypt is the password security layer that complements JWT-based session management

## Additional Notes

The `hashed_password` column is `String` without an explicit length constraint in the SQLAlchemy model. bcrypt hashes are always 60 characters, so this is not a practical issue, but an explicit `String(60)` or `String(72)` would be self-documenting.

The strong password validation in `auth.py` (5 criteria: min length 8, uppercase, lowercase, digit, special char) applies at reset time but its application at registration depends on each registration endpoint calling `validate_password_strength` — consistency should be verified across all user creation paths.
