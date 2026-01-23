import logging
from typing import Optional, Tuple
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import aiosmtplib

from .base import NotificationAdapter
from ...config import settings

logger = logging.getLogger(__name__)


class EmailAdapter(NotificationAdapter):
    """Adaptador de notificação via e-mail usando SMTP (Titan/GoDaddy)"""

    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.user = settings.SMTP_USER
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM
        self.from_name = settings.SMTP_FROM_NAME
        self.use_tls = settings.SMTP_USE_TLS

    def is_configured(self) -> bool:
        """Verifica se todas as configurações SMTP estão presentes"""
        return all([self.host, self.user, self.password, self.from_email])

    async def send(
        self,
        to: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Envia e-mail via SMTP.

        Args:
            to: E-mail do destinatário
            subject: Assunto do e-mail
            body: Corpo em texto plano
            html_body: Corpo em HTML (opcional)

        Returns:
            tuple: (success, error_message)
        """
        if not self.is_configured():
            logger.warning("SMTP não configurado. E-mail não enviado.")
            return False, "SMTP não configurado"

        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to

            # Versão texto plano
            message.attach(MIMEText(body, "plain", "utf-8"))

            # Versão HTML se fornecida
            if html_body:
                message.attach(MIMEText(html_body, "html", "utf-8"))

            # Para porta 465: usar SSL direto (use_tls=True, start_tls=False)
            # Para porta 587: usar STARTTLS (use_tls=False, start_tls=True)
            use_ssl = self.port == 465

            await aiosmtplib.send(
                message,
                hostname=self.host,
                port=self.port,
                username=self.user,
                password=self.password,
                use_tls=use_ssl,
                start_tls=not use_ssl and self.use_tls,
            )

            logger.info(f"E-mail enviado com sucesso para {to}")
            return True, None

        except aiosmtplib.SMTPException as e:
            error_msg = f"Erro SMTP: {str(e)}"
            logger.error(error_msg)
            return False, error_msg
        except Exception as e:
            error_msg = f"Erro inesperado: {str(e)}"
            logger.error(error_msg)
            return False, error_msg


# Instância singleton
email_adapter = EmailAdapter()
