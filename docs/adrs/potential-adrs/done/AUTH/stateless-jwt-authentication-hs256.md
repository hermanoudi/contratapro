# Potential ADR: Stateless JWT Authentication with HS256

**Module**: AUTH
**Category**: Security / Architecture
**Priority**: Must Document (Score: 150)
**Date Identified**: 2026-02-17

---

## What Was Identified

The entire authentication system is built on stateless JSON Web Tokens (JWT) signed with HMAC-SHA256 (HS256), using a single shared `SECRET_KEY`. No server-side session storage exists — every request carries a self-contained token that the server validates by re-signing and comparing.

Access tokens are issued at login with a 30-minute default expiry window overridden to 7 days in `config.py` (`ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7`). Password-reset tokens use a separate 24-hour expiry and are distinguished from access tokens via a dedicated `"purpose": "password_reset"` claim, preventing reset tokens from being used as access tokens. The JWT payload embeds identity and role data: `{"sub": email, "id": user_id, "is_professional": bool, "is_admin": bool}`.

The FastAPI `OAuth2PasswordBearer` scheme is used as the token extraction mechanism, pointing at `/auth/login` as the token URL. The `get_current_user` dependency in `dependencies.py` is the single validation gate: it decodes the JWT, extracts the `sub` (email) claim, and performs a DB lookup on every authenticated request to hydrate the full `User` object.

The choice of stateless JWT over server-side sessions was deliberate given the Railway + Vercel split deployment — with the API and frontend on different domains and origins, shared server-side session storage (e.g., Redis-backed sessions with cookies) would require additional cross-domain cookie configuration, CSRF protection, and a shared session store. Stateless JWT avoids all of that infrastructure at the cost of non-revocability.

## Why This Might Deserve an ADR

- **Impact**: Every authenticated endpoint in the system — 13 routers, all professional/client/admin flows — depends on this mechanism. It is the single authentication layer of the entire platform.
- **Trade-offs**: Tokens cannot be revoked server-side. A stolen token is valid until expiry (7 days). There is no token refresh mechanism — expiry forces re-login. The `purpose` claim for password-reset tokens is a custom convention that every developer must know to avoid security bugs.
- **Complexity**: The `SECRET_KEY` is the single cryptographic root of trust. Rotation requires all active sessions to be invalidated simultaneously. HS256 (symmetric) means the same key signs and verifies — no asymmetric option was chosen despite the distributed deployment.
- **Team Knowledge**: Every backend developer adding a new endpoint must understand which dependency (`get_current_user`, `check_can_manage_schedule`, `check_can_create_service`) to apply. Any developer forgetting `Depends(get_current_user)` leaves an endpoint unprotected.
- **Future Implications**: If the system ever adds a mobile app or a third-party OAuth provider, this HS256 + single-secret design would need significant rework (RS256 for asymmetric verification, JWKS endpoints, etc.).

## Evidence Found in Codebase

### Key Files

- [`backend/app/auth_utils.py`](../../../../../backend/app/auth_utils.py) - Lines 1-68
  - Core crypto: `ALGORITHM = "HS256"`, `create_access_token`, `create_password_reset_token`, `verify_password_reset_token`
- [`backend/app/dependencies.py`](../../../../../backend/app/dependencies.py) - Lines 1-37
  - `get_current_user` — decodes JWT, DB lookup on every request
- [`backend/app/config.py`](../../../../../backend/app/config.py) - Lines 20-26
  - `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7` (7-day override)
- [`backend/app/routers/auth.py`](../../../../../backend/app/routers/auth.py) - Lines 132-158
  - `/auth/login` endpoint — token issuance with role claims embedded

### Code Evidence

```python
# backend/app/auth_utils.py:8-36
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
```

```python
# backend/app/auth_utils.py:40-51
def create_password_reset_token(email: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=24)
    to_encode = {
        "sub": email,
        "purpose": "password_reset",  # Claim especial para diferenciar tokens
        "exp": expire
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
```

```python
# backend/app/routers/auth.py:148-158
access_token = create_access_token(
    data={
        "sub": user.email,
        "id": user.id,
        "is_professional": user.is_professional,
        "is_admin": user.is_admin
    },
    expires_delta=access_token_expires
)
return {"access_token": access_token, "token_type": "bearer"}
```

```python
# backend/app/dependencies.py:14-37
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    # DB lookup on every authenticated request
    result = await db.execute(
        select(User).filter(User.email == email)
        .options(selectinload(User.subscription_plan))
    )
    user = result.scalars().first()
    if user is None:
        raise credentials_exception
    return user
```

### Impact Analysis

- Git history: Not available for this analysis
- Affects: All 13 backend routers (authenticated endpoints), all 26 frontend files that include `Authorization: Bearer` headers
- Single point of trust: `SECRET_KEY` environment variable
- Dependency chain: `get_current_user` → used by `check_can_manage_schedule`, `check_can_create_service`, all admin guards

### Alternatives (if observable)

The `config.py` has both `SECRET_KEY` and `JWT_SECRET_KEY` fields with validator aliases — indicating the config was refactored at some point, possibly from a simpler implementation. The dual alias suggests awareness of naming conventions from other frameworks (e.g., Django REST Framework's `JWT_SECRET_KEY`). No evidence of session-based auth, OAuth2 provider, or asymmetric JWT (RS256) was found anywhere in the codebase.

## Questions to Address in ADR (if created)

- Why HS256 over RS256, given the split Vercel/Railway deployment?
- Why 7 days for access token expiry with no refresh token mechanism?
- What is the token revocation strategy when a user changes their password or is suspended?
- Was a Redis-backed session store considered? Why rejected?
- Is there a plan to introduce token refresh or shorter expiry with silent refresh?

## Related Potential ADRs

- [bcrypt-password-hashing.md](./bcrypt-password-hashing.md) — password security complements auth strategy
- [jwt-stored-in-localstorage.md](../../consider/AUTH/jwt-stored-in-localstorage.md) — how the frontend stores and uses these tokens

## Additional Notes

There is a subtle inconsistency: `auth_utils.py` reads `SECRET_KEY` directly from `os.getenv()` (line 7), while `config.py` defines a `JWT_SECRET_KEY` setting with a validator alias that populates `SECRET_KEY`. This means the key used for signing (`os.getenv("SECRET_KEY")`) may diverge from the pydantic-settings value if not set identically in the environment. This is a latent configuration risk worth documenting.

The `ACCESS_TOKEN_EXPIRE_MINUTES = 30` constant in `auth_utils.py` is overridden at call site in `auth.py` with `timedelta(minutes=30)`, while `config.py` declares `ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7`. The router hardcodes 30 minutes rather than reading from settings — meaning the intended 7-day expiry in `config.py` is not actually applied. The effective token lifetime is 30 minutes.
