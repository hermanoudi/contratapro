# backend/app/config.py
from pydantic_settings import BaseSettings
from pydantic import field_validator, Field, AliasChoices

# Valores que NUNCA podem ser usados como segredo real - literais publicos
# que já existiram como default no código (auth_utils.py e config.py antigos)
# ou placeholders dos templates de .env. Se o segredo resolvido for um destes,
# a aplicação falha ao subir em vez de assinar tokens com uma chave conhecida.
_INSECURE_SECRET_DEFAULTS = {
    "",
    "supersecretkey",
    "your-secret-key-here-change-in-production",
    "your-secret-key-here-change-in-production-min-32-chars",
    "fallback-secret",
    "substitua-por-um-secret-forte-minimo-32-caracteres",
}


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:password@db/faz_de_tudo"

    @field_validator('DATABASE_URL')
    @classmethod
    def convert_database_url(cls, v: str) -> str:
        """
        Converte DATABASE_URL do Railway (postgresql://) para asyncpg (postgresql+asyncpg://)
        """
        if v and v.startswith('postgresql://'):
            return v.replace('postgresql://', 'postgresql+asyncpg://', 1)
        return v

    # JWT — fonte única de verdade para assinatura e validação de tokens.
    # Nome canônico: SECRET_KEY. Aceita também JWT_SECRET_KEY (nome usado
    # historicamente nos templates de .env/Railway) para não quebrar ambientes
    # já configurados; novas configurações devem usar SECRET_KEY.
    SECRET_KEY: str = Field(
        default="",
        validation_alias=AliasChoices("SECRET_KEY", "JWT_SECRET_KEY"),
    )
    ALGORITHM: str = Field(
        default="HS256",
        validation_alias=AliasChoices("ALGORITHM", "JWT_ALGORITHM"),
    )
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 dias

    @field_validator('SECRET_KEY')
    @classmethod
    def require_strong_secret_key(cls, v: str) -> str:
        """
        Recusa subir a aplicação se o segredo de JWT estiver ausente ou for
        um dos literais públicos que já circularam no código/templates.
        Sem isso, tokens podem ser forjados por qualquer pessoa que leia o
        repositório (ver auditoria de segurança / plano de melhorias).
        """
        if v.strip().lower() in _INSECURE_SECRET_DEFAULTS:
            raise ValueError(
                "SECRET_KEY ausente ou usando um valor padrão inseguro. "
                "Defina a variável de ambiente SECRET_KEY (ou JWT_SECRET_KEY) "
                "com um segredo forte antes de iniciar a aplicação. "
                "Gere um com: python -c \"import secrets; print(secrets.token_urlsafe(32))\""
            )
        return v

    MERCADOPAGO_ACCESS_TOKEN: str = ""
    MERCADOPAGO_PUBLIC_KEY: str = ""
    MERCADOPAGO_WEBHOOK_SECRET: str = ""

    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    SUBSCRIPTION_AMOUNT: float = 50.00
    SUBSCRIPTION_FREQUENCY: int = 1  # monthly
    SUBSCRIPTION_FREQUENCY_TYPE: str = "months"

    UPLOAD_STORAGE: str = "local"  # "local" ou "cloudinary"
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_FROM_NAME: str = "ContrataPro"
    SMTP_USE_TLS: bool = True

    RESEND_API_KEY: str = ""
    RESEND_FROM_EMAIL: str = ""  # Se vazio, usa SMTP_FROM
    RESEND_FROM_NAME: str = ""   # Se vazio, usa SMTP_FROM_NAME

    EMAIL_PROVIDER: str = "smtp"  # Mude para "resend" no Railway

    # Nunca deve ser True em produção: com DEBUG=True, o SQLAlchemy loga todo
    # SQL executado (incluindo dados sensíveis) em stdout (ver database.py).
    DEBUG: bool = False

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignora variáveis extras do .env


settings = Settings()
