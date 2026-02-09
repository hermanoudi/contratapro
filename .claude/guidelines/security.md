# Security Guidelines

## Secrets That Must NEVER Be Committed

- `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_PUBLIC_KEY`
- `JWT_SECRET_KEY`, `SECRET_KEY`
- `DATABASE_URL` (contains credentials)
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY`
- `SMTP_PASSWORD`, `SMTP_USER`
- Any `*_TOKEN`, `*_SECRET`, `*_PASSWORD` value

## How to Handle Secrets

All secrets go in `backend/.env` (gitignored). Access via `settings`:

```python
from .config import settings
token = settings.MERCADOPAGO_ACCESS_TOKEN
```

In documentation, use placeholders: `seu-token-aqui`, `sua-senha-aqui`.

## Pre-Commit Checklist

Before every commit, scan for:
- Hardcoded strings that look like passwords or tokens
- URLs with embedded credentials (`postgresql://user:realpass@...`)
- API keys (long alphanumeric strings)
- Any value that came from a `.env` file

If credentials leak: change the secret immediately, remove from code, consider `git filter-branch` or BFG to clean history.

## Password Hashing

Uses raw `bcrypt` (NOT passlib):

```python
# backend/app/auth_utils.py
import bcrypt

def get_password_hash(password):
    if isinstance(password, str):
        password = password.encode('utf-8')
    hashed = bcrypt.hashpw(password, bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_password(plain_password, hashed_password):
    if isinstance(plain_password, str):
        plain_password = plain_password.encode('utf-8')
    if isinstance(hashed_password, str):
        hashed_password = hashed_password.encode('utf-8')
    return bcrypt.checkpw(plain_password, hashed_password)
```

## JWT Authentication

Token payload structure:

```python
{
    "sub": user.email,         # Subject (email)
    "id": user.id,             # User ID
    "is_professional": bool,   # Role flag
    "is_admin": bool,          # Admin flag
    "exp": datetime            # Expiration
}
```

Password reset tokens include `"purpose": "password_reset"` claim to differentiate from access tokens.

## Auth Dependencies

Defined in `backend/app/dependencies.py`:

| Dependency | Purpose |
|-----------|---------|
| `get_current_user` | Decodes JWT, loads User with `selectinload(User.subscription_plan)` |
| `check_can_manage_schedule` | Verifies plan allows schedule management + trial not expired |
| `check_can_create_service` | Verifies plan service limit not reached + trial not expired |

## Ownership Validation

Always filter by `current_user.id` to prevent accessing other users' data:

```python
result = await db.execute(
    select(WorkingHour).filter(
        WorkingHour.id == wh_id,
        WorkingHour.professional_id == current_user.id
    )
)
```

## Role-Based Access

Check `is_professional` or `is_admin` flags directly:

```python
if not current_user.is_professional:
    raise HTTPException(status_code=403, detail="Only professionals can create services")
```

## Blind Response Pattern

For email-based operations (login, password reset), return same response whether email exists or not:

```python
# Password reset - always return success message
return {"message": "Se o email existir, enviaremos instrucoes"}
```

## CORS Configuration

Defined in `backend/app/main.py`:
- Explicit origins: `localhost:5173`, `localhost:3000`, `contratapro.com.br`, `www.contratapro.com.br`
- Regex: `https://.*\.vercel\.app` (preview deploys)
- All methods and headers allowed, credentials enabled
