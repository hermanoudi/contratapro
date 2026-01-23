from abc import ABC, abstractmethod
from typing import Optional, Tuple


class NotificationAdapter(ABC):
    """Classe base abstrata para adaptadores de notificação"""

    @abstractmethod
    async def send(
        self,
        to: str,
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> Tuple[bool, Optional[str]]:
        """
        Envia notificação através deste canal.

        Args:
            to: Destinatário
            subject: Assunto/título
            body: Corpo em texto plano
            html_body: Corpo em HTML (opcional)

        Returns:
            tuple: (success: bool, error_message: Optional[str])
        """
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Verifica se o adaptador está configurado corretamente"""
        pass
