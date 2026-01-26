from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, EmailStr
import re
import secrets
import string
import logging
from ..database import get_db
from ..models import User
from ..schemas import UserLogin, Token, UserResponse
from ..auth_utils import (
    verify_password,
    create_access_token,
    get_password_hash,
    create_password_reset_token,
    verify_password_reset_token
)
from ..dependencies import get_current_user
from ..config import settings
from ..services.notifications.templates import email_templates
from ..services.notifications.resend_adapter import resend_adapter
from datetime import timedelta

logger = logging.getLogger(__name__)

router = APIRouter()


# ============================================
# Validação de Senha Forte
# ============================================

class PasswordValidationRequest(BaseModel):
    password: str


class PasswordValidationResponse(BaseModel):
    is_valid: bool
    criteria: dict
    message: str


class GeneratePasswordResponse(BaseModel):
    password: str


def validate_password_strength(password: str) -> dict:
    """
    Valida a força da senha e retorna os critérios atendidos.
    Critérios:
    - Mínimo 8 caracteres
    - Pelo menos uma letra maiúscula
    - Pelo menos uma letra minúscula
    - Pelo menos um número
    - Pelo menos um caractere especial
    """
    criteria = {
        "min_length": len(password) >= 8,
        "has_uppercase": bool(re.search(r'[A-Z]', password)),
        "has_lowercase": bool(re.search(r'[a-z]', password)),
        "has_number": bool(re.search(r'[0-9]', password)),
        "has_special": bool(re.search(r'[!@#$%^&*()_+\-=\[\]{};\':"\\|,.<>\/?]', password))
    }

    return criteria


def generate_strong_password(length: int = 16) -> str:
    """
    Gera uma senha forte aleatória que atende a todos os critérios.
    """
    # Garantir que tenha pelo menos um de cada tipo
    password_chars = [
        secrets.choice(string.ascii_uppercase),  # Maiúscula
        secrets.choice(string.ascii_lowercase),  # Minúscula
        secrets.choice(string.digits),            # Número
        secrets.choice('!@#$%^&*()_+-=[]{}|;:,.<>?')  # Especial
    ]

    # Preencher o resto com caracteres aleatórios
    all_chars = string.ascii_letters + string.digits + '!@#$%^&*()_+-=[]{}|;:,.<>?'
    password_chars.extend(secrets.choice(all_chars) for _ in range(length - 4))

    # Embaralhar para não ter padrão previsível
    password_list = list(password_chars)
    secrets.SystemRandom().shuffle(password_list)

    return ''.join(password_list)


@router.post("/validate-password", response_model=PasswordValidationResponse)
async def validate_password(request: PasswordValidationRequest):
    """
    Valida se a senha atende aos critérios de segurança.
    Retorna quais critérios foram atendidos para feedback visual.
    """
    criteria = validate_password_strength(request.password)
    is_valid = all(criteria.values())

    if is_valid:
        message = "Senha forte! Todos os critérios foram atendidos."
    else:
        missing = []
        if not criteria["min_length"]:
            missing.append("mínimo 8 caracteres")
        if not criteria["has_uppercase"]:
            missing.append("letra maiúscula")
        if not criteria["has_lowercase"]:
            missing.append("letra minúscula")
        if not criteria["has_number"]:
            missing.append("número")
        if not criteria["has_special"]:
            missing.append("caractere especial")
        message = f"Senha fraca. Faltam: {', '.join(missing)}."

    return PasswordValidationResponse(
        is_valid=is_valid,
        criteria=criteria,
        message=message
    )


@router.get("/generate-password", response_model=GeneratePasswordResponse)
async def generate_password():
    """
    Gera uma senha forte aleatória que atende a todos os critérios.
    """
    password = generate_strong_password(16)
    return GeneratePasswordResponse(password=password)

@router.post("/login", response_model=Token)
async def login(login_data: UserLogin, db: AsyncSession = Depends(get_db)):
    # Find user by email
    result = await db.execute(select(User).filter(User.email == login_data.email))
    user = result.scalars().first()
    
    # Verify user and password
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
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

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user


# ============================================
# Recuperacao de Senha
# ============================================

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/forgot-password", status_code=200)
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Solicita recuperacao de senha.
    Sempre retorna 200 OK (blind response) para prevenir enumeracao de emails.
    """
    result = await db.execute(
        select(User).filter(User.email == request.email)
    )
    user = result.scalars().first()

    if user:
        # Gerar token de reset
        reset_token = create_password_reset_token(user.email)

        # Construir link de reset
        frontend_url = settings.FRONTEND_URL or "https://contratapro.com.br"
        reset_link = f"{frontend_url}/nova-senha?token={reset_token}"

        # Gerar conteudo do email
        subject, plain_text, html = email_templates.password_reset(
            recipient_name=user.name,
            reset_link=reset_link,
            expiration_hours=24
        )

        # Enviar email em background
        background_tasks.add_task(
            resend_adapter.send,
            to=user.email,
            subject=subject,
            body=plain_text,
            html_body=html
        )

        logger.info(f"Password reset email queued for: {user.email}")
    else:
        logger.info(f"Password reset requested for unknown email")

    # Sempre retorna sucesso (blind response)
    return {
        "message": "Se o e-mail estiver cadastrado, "
                   "voce recebera instrucoes de recuperacao."
    }


@router.get("/validate-reset-token")
async def validate_reset_token(token: str):
    """
    Valida um token de reset de senha.
    """
    email = verify_password_reset_token(token)

    if email:
        return {"valid": True, "email": email}

    return {"valid": False, "email": None}


@router.post("/reset-password")
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Redefine a senha usando um token de reset valido.
    """
    # Validar token
    email = verify_password_reset_token(request.token)

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalido ou expirado"
        )

    # Validar forca da senha
    criteria = validate_password_strength(request.new_password)
    if not all(criteria.values()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha nao atende aos criterios de seguranca"
        )

    # Buscar usuario
    result = await db.execute(select(User).filter(User.email == email))
    user = result.scalars().first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Usuario nao encontrado"
        )

    # Atualizar senha
    user.hashed_password = get_password_hash(request.new_password)
    await db.commit()

    logger.info(f"Password reset successful for: {email}")

    return {"message": "Senha alterada com sucesso"}
