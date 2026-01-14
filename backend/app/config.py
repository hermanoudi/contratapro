# backend/app/config.py
from pydantic_settings import BaseSettings
from pydantic import field_validator


class Settings(BaseSettings):
    # Database
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

    # JWT
    JWT_SECRET_KEY: str = "your-secret-key-here-change-in-production"
    SECRET_KEY: str = ""  # Alias para compatibilidade
    JWT_ALGORITHM: str = "HS256"
    ALGORITHM: str = ""  # Alias para compatibilidade
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    @field_validator('SECRET_KEY')
    @classmethod
    def set_secret_key_alias(cls, v: str, info) -> str:
        """Usa JWT_SECRET_KEY se SECRET_KEY não estiver definido"""
        return v or info.data.get('JWT_SECRET_KEY', 'fallback-secret')

    @field_validator('ALGORITHM')
    @classmethod
    def set_algorithm_alias(cls, v: str, info) -> str:
        """Usa JWT_ALGORITHM se ALGORITHM não estiver definido"""
        return v or info.data.get('JWT_ALGORITHM', 'HS256')

    # Mercado Pago
    MERCADOPAGO_ACCESS_TOKEN: str = ""
    MERCADOPAGO_PUBLIC_KEY: str = ""

    # URLs
    FRONTEND_URL: str = "http://localhost:5173"
    BACKEND_URL: str = "http://localhost:8000"

    # Subscription Plan
    SUBSCRIPTION_AMOUNT: float = 50.00
    SUBSCRIPTION_FREQUENCY: int = 1  # monthly
    SUBSCRIPTION_FREQUENCY_TYPE: str = "months"

    # Upload de Imagens
    UPLOAD_STORAGE: str = "local"  # "local" ou "cloudinary"
    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignora variáveis extras do .env


settings = Settings()
