from datetime import date, time
from typing import Optional, Tuple


class EmailTemplates:
    """Templates de e-mail para notificações"""

    @staticmethod
    def _base_template(content: str) -> str:
        """Template base HTML com estilos"""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #6366f1, #8b5cf6);
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            color: white;
            margin: 0;
            font-size: 24px;
        }}
        .content {{
            padding: 30px;
        }}
        .content h2 {{
            color: #1e293b;
            margin-top: 0;
        }}
        .info-box {{
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }}
        .info-item {{
            margin-bottom: 12px;
        }}
        .info-label {{
            font-weight: 600;
            color: #64748b;
            display: inline-block;
            min-width: 100px;
        }}
        .info-value {{
            color: #1e293b;
        }}
        .footer {{
            background: #f8fafc;
            padding: 20px;
            text-align: center;
            color: #64748b;
            font-size: 14px;
        }}
        .button {{
            display: inline-block;
            background: #6366f1;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            text-decoration: none;
            margin-top: 20px;
        }}
        .status-cancelled {{
            color: #ef4444;
        }}
        .status-completed {{
            color: #10b981;
        }}
        .status-updated {{
            color: #f59e0b;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>ContrataPro</h1>
        </div>
        {content}
        <div class="footer">
            <p>Este e-mail foi enviado automaticamente pelo ContrataPro.</p>
            <p>contratapro.com.br</p>
        </div>
    </div>
</body>
</html>
"""

    @staticmethod
    def new_appointment(
        recipient_name: str,
        is_professional: bool,
        service_title: str,
        appointment_date: date,
        start_time: time,
        end_time: time,
        other_party_name: str,
        other_party_whatsapp: Optional[str] = None
    ) -> Tuple[str, str, str]:
        """
        Template para novo agendamento.

        Returns:
            tuple: (subject, plain_text, html)
        """
        date_str = appointment_date.strftime("%d/%m/%Y")
        time_str = f"{start_time.strftime('%H:%M')} - {end_time.strftime('%H:%M')}"

        if is_professional:
            subject = f"Novo Agendamento - {service_title}"
            role_other = "Cliente"
            intro = "Você recebeu um novo agendamento!"
        else:
            subject = f"Agendamento Confirmado - {service_title}"
            role_other = "Profissional"
            intro = "Seu agendamento foi confirmado!"

        plain_text = f"""
Olá {recipient_name},

{intro}

Serviço: {service_title}
Data: {date_str}
Horário: {time_str}
{role_other}: {other_party_name}

Acesse o ContrataPro para mais detalhes.
"""

        html_content = f"""
        <div class="content">
            <h2>Olá {recipient_name},</h2>
            <p>{intro}</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Serviço:</span>
                    <span class="info-value">{service_title}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data:</span>
                    <span class="info-value">{date_str}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Horário:</span>
                    <span class="info-value">{time_str}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">{role_other}:</span>
                    <span class="info-value">{other_party_name}</span>
                </div>
            </div>

            <a href="https://contratapro.com.br" class="button">Ver Detalhes</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def appointment_updated(
        recipient_name: str,
        is_professional: bool,
        service_title: str,
        appointment_date: date,
        start_time: time,
        end_time: time,
        other_party_name: str,
        new_status: str
    ) -> Tuple[str, str, str]:
        """
        Template para agendamento atualizado.

        Returns:
            tuple: (subject, plain_text, html)
        """
        date_str = appointment_date.strftime("%d/%m/%Y")
        time_str = f"{start_time.strftime('%H:%M')} - {end_time.strftime('%H:%M')}"

        status_map = {
            "scheduled": "Agendado",
            "completed": "Concluído",
            "cancelled": "Cancelado",
            "suspended": "Suspenso"
        }
        status_text = status_map.get(new_status, new_status)

        status_class = "status-completed" if new_status == "completed" else "status-updated"

        subject = f"Agendamento Atualizado - {service_title}"
        role_other = "Cliente" if is_professional else "Profissional"

        plain_text = f"""
Olá {recipient_name},

Um agendamento foi atualizado.

Serviço: {service_title}
Data: {date_str}
Horário: {time_str}
{role_other}: {other_party_name}
Novo Status: {status_text}

Acesse o ContrataPro para mais detalhes.
"""

        html_content = f"""
        <div class="content">
            <h2>Olá {recipient_name},</h2>
            <p>Um agendamento foi atualizado.</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Serviço:</span>
                    <span class="info-value">{service_title}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data:</span>
                    <span class="info-value">{date_str}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Horário:</span>
                    <span class="info-value">{time_str}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">{role_other}:</span>
                    <span class="info-value">{other_party_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="info-value {status_class}">{status_text}</span>
                </div>
            </div>

            <a href="https://contratapro.com.br" class="button">Ver Detalhes</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def appointment_cancelled(
        recipient_name: str,
        is_professional: bool,
        service_title: str,
        appointment_date: date,
        start_time: time,
        other_party_name: str,
        reason: Optional[str] = None
    ) -> Tuple[str, str, str]:
        """
        Template para agendamento cancelado.

        Returns:
            tuple: (subject, plain_text, html)
        """
        date_str = appointment_date.strftime("%d/%m/%Y")
        time_str = start_time.strftime('%H:%M')

        subject = f"Agendamento Cancelado - {service_title}"
        role_other = "Cliente" if is_professional else "Profissional"

        reason_text = f"\nMotivo: {reason}" if reason else ""

        plain_text = f"""
Olá {recipient_name},

Um agendamento foi cancelado.

Serviço: {service_title}
Data: {date_str}
Horário: {time_str}
{role_other}: {other_party_name}{reason_text}

Acesse o ContrataPro para mais detalhes.
"""

        reason_html = f"""
                <div class="info-item">
                    <span class="info-label">Motivo:</span>
                    <span class="info-value">{reason}</span>
                </div>
""" if reason else ""

        html_content = f"""
        <div class="content">
            <h2>Olá {recipient_name},</h2>
            <p class="status-cancelled">Um agendamento foi cancelado.</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Serviço:</span>
                    <span class="info-value">{service_title}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data:</span>
                    <span class="info-value">{date_str}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Horário:</span>
                    <span class="info-value">{time_str}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">{role_other}:</span>
                    <span class="info-value">{other_party_name}</span>
                </div>{reason_html}
            </div>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)


email_templates = EmailTemplates()
