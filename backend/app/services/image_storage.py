# backend/app/services/image_storage.py
"""
Service de armazenamento de imagens.
Suporta armazenamento local (desenvolvimento) e Cloudinary (produção).
"""
import os
import uuid
from pathlib import Path
from typing import Optional
from fastapi import UploadFile, HTTPException
from ..config import settings


class ImageStorageService:
    """Serviço abstrato para armazenamento de imagens"""

    def __init__(self):
        self.storage_type = settings.UPLOAD_STORAGE

    async def upload(self, file: UploadFile, folder: str = "services") -> str:
        """
        Faz upload de uma imagem e retorna a URL.

        Args:
            file: Arquivo enviado
            folder: Pasta de destino (services, profiles, etc)

        Returns:
            URL pública da imagem
        """
        # Validar extensão
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in settings.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"Formato não permitido. Use: {', '.join(settings.ALLOWED_EXTENSIONS)}"
            )

        # Validar tamanho
        contents = await file.read()
        if len(contents) > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Arquivo muito grande. Máximo: {settings.MAX_UPLOAD_SIZE / (1024*1024)}MB"
            )

        # Resetar ponteiro do arquivo
        await file.seek(0)

        # Delegar para o storage apropriado
        if self.storage_type == "cloudinary":
            return await self._upload_cloudinary(file, folder, contents)
        else:
            return await self._upload_local(file, folder, file_ext)

    async def _upload_local(self, file: UploadFile, folder: str, file_ext: str) -> str:
        """Upload para armazenamento local"""
        # Criar diretório se não existir
        upload_dir = Path("uploads") / folder
        upload_dir.mkdir(parents=True, exist_ok=True)

        # Gerar nome único
        filename = f"{uuid.uuid4()}{file_ext}"
        file_path = upload_dir / filename

        # Salvar arquivo
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)

        # Retornar URL relativa
        return f"/uploads/{folder}/{filename}"

    async def _upload_cloudinary(self, file: UploadFile, folder: str, contents: bytes) -> str:
        """Upload para Cloudinary"""
        try:
            import cloudinary
            import cloudinary.uploader

            # Configurar Cloudinary
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )

            # Gerar nome único
            public_id = f"{folder}/{uuid.uuid4()}"

            # Upload
            result = cloudinary.uploader.upload(
                contents,
                public_id=public_id,
                folder=folder,
                resource_type="image",
                format="webp",  # Converter para WebP (otimizado)
                quality="auto",  # Qualidade automática
                fetch_format="auto"
            )

            return result.get("secure_url")

        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="Cloudinary não está instalado. Execute: pip install cloudinary"
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Erro ao fazer upload: {str(e)}"
            )

    async def delete(self, url: str) -> bool:
        """
        Deleta uma imagem.

        Args:
            url: URL da imagem

        Returns:
            True se deletado com sucesso
        """
        if self.storage_type == "cloudinary":
            return await self._delete_cloudinary(url)
        else:
            return await self._delete_local(url)

    async def _delete_local(self, url: str) -> bool:
        """Deleta arquivo local"""
        try:
            # Extrair caminho do arquivo da URL
            file_path = Path(url.lstrip("/"))
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception:
            return False

    async def _delete_cloudinary(self, url: str) -> bool:
        """Deleta arquivo do Cloudinary"""
        try:
            import cloudinary
            import cloudinary.uploader

            # Configurar Cloudinary
            cloudinary.config(
                cloud_name=settings.CLOUDINARY_CLOUD_NAME,
                api_key=settings.CLOUDINARY_API_KEY,
                api_secret=settings.CLOUDINARY_API_SECRET
            )

            # Extrair public_id da URL
            # URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/filename.ext
            parts = url.split("/")
            if "cloudinary.com" in url and len(parts) >= 2:
                public_id = "/".join(parts[-2:]).split(".")[0]
                result = cloudinary.uploader.destroy(public_id)
                return result.get("result") == "ok"

            return False

        except Exception:
            return False


# Singleton
image_storage = ImageStorageService()
