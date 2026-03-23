import bcrypt
from datetime import datetime, timedelta
from jose import jwt
import os

# Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecretkey") # Change in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

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
    return hashed.decode('utf-8') # Return as string for DB storage

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    now = datetime.utcnow()
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=15)
    to_encode.update({"exp": expire, "iat": int(now.timestamp())})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_password_reset_token(email: str) -> str:
    """
    Cria um token JWT especial para reset de senha com expiracao de 24h.
    Inclui claim 'purpose' para diferenciar de tokens de acesso normais.
    """
    now = datetime.utcnow()
    expire = now + timedelta(hours=24)
    to_encode = {
        "sub": email,
        "purpose": "password_reset",
        "exp": expire,
        "iat": int(now.timestamp()),
    }
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_password_reset_token(token: str) -> dict | None:
    """
    Verifica um token de reset de senha.
    Retorna dict com 'email' e 'iat' se valido, ou None se invalido/expirado.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("purpose") != "password_reset":
            return None
        email = payload.get("sub")
        iat = payload.get("iat")
        if not email:
            return None
        return {"email": email, "iat": iat}
    except jwt.ExpiredSignatureError:
        return None
    except jwt.JWTError:
        return None
