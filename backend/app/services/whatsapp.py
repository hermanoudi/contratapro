"""
Serviço de integração com WhatsApp
Geração de links e mensagens pré-formatadas
"""
from typing import Optional
from datetime import datetime
from urllib.parse import quote


class WhatsAppService:
    """Serviço para gerar links e mensagens do WhatsApp"""

    @staticmethod
    def formatar_telefone(whatsapp: str) -> str:
        """
        Formata número de WhatsApp para padrão internacional.
        Remove caracteres especiais e adiciona código do país (55 - Brasil)

        Args:
            whatsapp: Número no formato (XX) XXXXX-XXXX ou similar

        Returns:
            Número formatado: 5511999999999
        """
        # Remover tudo que não for número
        numeros = ''.join(filter(str.isdigit, whatsapp))

        # Se não começar com 55 (código do Brasil), adicionar
        if not numeros.startswith('55'):
            numeros = f'55{numeros}'

        return numeros

    @staticmethod
    def gerar_link_contato(
        whatsapp: str,
        profissional_nome: str,
        cliente_nome: str,
        servico: Optional[str] = None
    ) -> str:
        """
        Gera link do WhatsApp para contato inicial com profissional.

        Args:
            whatsapp: Número do profissional
            profissional_nome: Nome do profissional
            cliente_nome: Nome do cliente
            servico: Serviço de interesse (opcional)

        Returns:
            URL completa do WhatsApp Web
        """
        telefone = WhatsAppService.formatar_telefone(whatsapp)

        # Mensagem pré-formatada
        mensagem = f"Olá {profissional_nome}!\n\n"
        mensagem += (f"Meu nome é {cliente_nome} e encontrei seu perfil "
                     f"na plataforma *Chama Eu*.\n\n")

        if servico:
            mensagem += f"Tenho interesse no serviço: *{servico}*\n\n"

        mensagem += ("Gostaria de saber mais informações sobre "
                     "disponibilidade e valores.\n\n")
        mensagem += "Obrigado!"

        # Codificar mensagem para URL
        mensagem_encoded = quote(mensagem)

        return f"https://wa.me/{telefone}?text={mensagem_encoded}"

    @staticmethod
    def gerar_link_agendamento(
        whatsapp: str,
        profissional_nome: str,
        cliente_nome: str,
        servico: str,
        data_hora: datetime,
        observacoes: Optional[str] = None
    ) -> str:
        """
        Gera link do WhatsApp para confirmação de agendamento.

        Args:
            whatsapp: Número do profissional
            profissional_nome: Nome do profissional
            cliente_nome: Nome do cliente
            servico: Nome do serviço agendado
            data_hora: Data e hora do agendamento
            observacoes: Observações do cliente (opcional)

        Returns:
            URL completa do WhatsApp Web
        """
        telefone = WhatsAppService.formatar_telefone(whatsapp)

        # Formatar data e hora
        data_formatada = data_hora.strftime("%d/%m/%Y")
        hora_formatada = data_hora.strftime("%H:%M")

        # Mensagem pré-formatada
        mensagem = f"Olá {profissional_nome}!\n\n"
        mensagem += f"Meu nome é {cliente_nome} e acabei de fazer um agendamento através da plataforma *Chama Eu*.\n\n"
        mensagem += "*Detalhes do Agendamento:*\n"
        mensagem += f"Serviço: {servico}\n"
        mensagem += f"Data: {data_formatada}\n"
        mensagem += f"Horário: {hora_formatada}\n"

        if observacoes:
            mensagem += f"\n*Observações:*\n{observacoes}\n"

        mensagem += "\nAguardo sua confirmação!\n\n"
        mensagem += "Obrigado!"

        # Codificar mensagem para URL
        mensagem_encoded = quote(mensagem)

        return f"https://wa.me/{telefone}?text={mensagem_encoded}"

    @staticmethod
    def gerar_link_cancelamento(
        whatsapp: str,
        profissional_nome: str,
        cliente_nome: str,
        servico: str,
        data_hora: datetime,
        motivo: Optional[str] = None
    ) -> str:
        """
        Gera link do WhatsApp para notificar cancelamento.

        Args:
            whatsapp: Número do profissional
            profissional_nome: Nome do profissional
            cliente_nome: Nome do cliente
            servico: Nome do serviço
            data_hora: Data e hora original do agendamento
            motivo: Motivo do cancelamento (opcional)

        Returns:
            URL completa do WhatsApp Web
        """
        telefone = WhatsAppService.formatar_telefone(whatsapp)

        # Formatar data e hora
        data_formatada = data_hora.strftime("%d/%m/%Y")
        hora_formatada = data_hora.strftime("%H:%M")

        # Mensagem pré-formatada
        mensagem = f"Olá {profissional_nome}!\n\n"
        mensagem += f"Meu nome é {cliente_nome}.\n\n"
        mensagem += ("Preciso cancelar o agendamento que fiz através da "
                     "plataforma *Chama Eu*.\n\n")
        mensagem += "*Detalhes:*\n"
        mensagem += f"Serviço: {servico}\n"
        mensagem += f"Data: {data_formatada}\n"
        mensagem += f"Horário: {hora_formatada}\n"

        if motivo:
            mensagem += f"\n*Motivo:*\n{motivo}\n"

        mensagem += "\nDesculpe pelo transtorno.\n\n"
        mensagem += "Obrigado!"

        # Codificar mensagem para URL
        mensagem_encoded = quote(mensagem)

        return f"https://wa.me/{telefone}?text={mensagem_encoded}"


# Instância singleton
whatsapp_service = WhatsAppService()
