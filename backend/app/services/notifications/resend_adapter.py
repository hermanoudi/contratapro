import logging
from typing import Optional, Tuple

import resend

from .base import NotificationAdapter
from ...config import settings

logger = logging.getLogger(__name__)


class ResendAdapter(NotificationAdapter):
    """Adaptador de notificação via Resend API"""

    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        self.from_email = settings.RESEND_FROM_EMAIL or settings.SMTP_FROM
        self.from_name = settings.RESEND_FROM_NAME or settings.SMTP_FROM_NAME

        if self.api_key:
            resend.api_key = self.api_key

        if self.is_configured():
            logger.info(f"ResendAdapter inicializado - From: {self.from_email}")
        else:
            logger.warning("ResendAdapter não configurado - RESEND_API_KEY não definida")

    def is_configured(self) -> bool:
        """Verifica se a API key do Resend está configurada"""
        return bool(self.api_key and self.from_email)

    async def send(
        self,
        to: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Envia e-mail via Resend API.

        Args:
            to: E-mail do destinatário
            subject: Assunto do e-mail
            body: Corpo em texto plano
            html_body: Corpo em HTML (opcional)

        Returns:
            tuple: (success, error_message)
        """
        if not self.is_configured():
            logger.warning("Resend não configurado. E-mail não enviado.")
            return False, "Resend não configurado"

        try:
            logger.info(f"Preparando envio de e-mail para {to} via Resend")

            from_address = f"{self.from_name} <{self.from_email}>"

            params = {
                "from": from_address,
                "to": [to],
                "subject": subject,
            }

            # Resend prefere HTML, mas aceita text também
            if html_body:
                params["html"] = html_body
            else:
                params["text"] = body

            response = resend.Emails.send(params)

            if response and response.get("id"):
                logger.info(f"E-mail enviado com sucesso para {to} via Resend (ID: {response['id']})")
                return True, None
            else:
                error_msg = f"Resend retornou resposta inesperada: {response}"
                logger.error(error_msg)
                return False, error_msg

        except resend.exceptions.ResendError as e:
            error_msg = f"Erro Resend: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Erro ao enviar via Resend: {type(e).__name__} - {str(e)}"
            logger.error(error_msg)
            return False, error_msg


# Instância singleton
resend_adapter = ResendAdapter()
