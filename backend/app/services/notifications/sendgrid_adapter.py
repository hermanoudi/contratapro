import logging
from typing import Optional, Tuple

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent

from .base import NotificationAdapter
from ...config import settings

logger = logging.getLogger(__name__)


class SendGridAdapter(NotificationAdapter):
    """Adaptador de notificação via SendGrid API"""

    def __init__(self):
        self.api_key = settings.SENDGRID_API_KEY
        self.from_email = settings.SENDGRID_FROM_EMAIL or settings.SMTP_FROM
        self.from_name = settings.SENDGRID_FROM_NAME or settings.SMTP_FROM_NAME

        if self.is_configured():
            logger.info(f"SendGridAdapter inicializado - From: {self.from_email}")
        else:
            logger.warning("SendGridAdapter não configurado - SENDGRID_API_KEY não definida")

    def is_configured(self) -> bool:
        """Verifica se a API key do SendGrid está configurada"""
        configured = bool(self.api_key and self.from_email)
        return configured

    async def send(
        self,
        to: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Envia e-mail via SendGrid API.

        Args:
            to: E-mail do destinatário
            subject: Assunto do e-mail
            body: Corpo em texto plano
            html_body: Corpo em HTML (opcional)

        Returns:
            tuple: (success, error_message)
        """
        if not self.is_configured():
            logger.warning("SendGrid não configurado. E-mail não enviado.")
            return False, "SendGrid não configurado"

        try:
            logger.info(f"Preparando envio de e-mail para {to} via SendGrid")

            message = Mail(
                from_email=Email(self.from_email, self.from_name),
                to_emails=To(to),
                subject=subject,
            )

            # Adicionar conteúdo
            if html_body:
                message.content = [
                    Content("text/plain", body),
                    Content("text/html", html_body)
                ]
            else:
                message.content = Content("text/plain", body)

            sg = SendGridAPIClient(self.api_key)
            response = sg.send(message)

            if response.status_code in [200, 201, 202]:
                logger.info(f"E-mail enviado com sucesso para {to} via SendGrid")
                return True, None
            else:
                error_msg = f"SendGrid retornou status {response.status_code}"
                logger.error(error_msg)
                return False, error_msg

        except Exception as e:
            error_msg = f"Erro ao enviar via SendGrid: {type(e).__name__} - {str(e)}"
            logger.error(error_msg)
            return False, error_msg


# Instância singleton
sendgrid_adapter = SendGridAdapter()
