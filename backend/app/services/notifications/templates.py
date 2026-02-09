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
            color: #FFFFFF !important;
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

            <a href="https://contratapro.com.br" class="button" style="color: #FFFFFF;">Ver Detalhes</a>
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

            <a href="https://contratapro.com.br" class="button" style="color: #FFFFFF;">Ver Detalhes</a>
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

    @staticmethod
    def password_reset(
        recipient_name: str,
        reset_link: str,
        expiration_hours: int = 24
    ) -> Tuple[str, str, str]:
        """
        Template para e-mail de recuperacao de senha.

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = "Redefinir sua senha - ContrataPro"

        plain_text = f"""
Ola {recipient_name},

Recebemos uma solicitacao para redefinir sua senha no ContrataPro.

Clique no link abaixo para criar uma nova senha:
{reset_link}

Este link expira em {expiration_hours} horas.

Se voce nao solicitou a redefinicao de senha, ignore este e-mail.

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p>Recebemos uma solicitacao para redefinir sua senha no ContrataPro.</p>

            <p>Clique no botao abaixo para criar uma nova senha:</p>

            <a href="{reset_link}" class="button">Redefinir Senha</a>

            <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #64748b;">
                Este link expira em {expiration_hours} horas.
            </p>

            <p style="margin-top: 1rem; font-size: 0.875rem; color: #64748b;">
                Se voce nao solicitou a redefinicao de senha, ignore este e-mail.
            </p>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)


    # ==================== TEMPLATES DE ASSINATURA ====================

    @staticmethod
    def subscription_activated(
        recipient_name: str,
        plan_name: str,
        plan_price: float,
        is_trial: bool = False,
        trial_days: int = None,
        trial_end_date: str = None
    ) -> Tuple[str, str, str]:
        """
        Template para assinatura ativada (trial ou paga).

        Returns:
            tuple: (subject, plain_text, html)
        """
        if is_trial:
            subject = f"Bem-vindo ao ContrataPro! Seu Trial foi ativado"
            price_text = "Gratis"
            extra_info = f"Voce tem {trial_days} dias para experimentar todos os recursos. Seu trial expira em {trial_end_date}."
            status_class = "status-completed"
        else:
            subject = f"Assinatura Ativada - Plano {plan_name}"
            price_text = f"R$ {plan_price:.2f}/mes".replace('.', ',')
            extra_info = "Sua assinatura esta ativa e voce ja pode comecar a receber solicitacoes de clientes!"
            status_class = "status-completed"

        plain_text = f"""
Ola {recipient_name},

Parabens! Sua assinatura foi ativada com sucesso!

Plano: {plan_name}
Valor: {price_text}

{extra_info}

Acesse o ContrataPro para configurar seu perfil e comecar a receber clientes.

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="{status_class}">Parabens! Sua assinatura foi ativada com sucesso!</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano:</span>
                    <span class="info-value">{plan_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Valor:</span>
                    <span class="info-value">{price_text}</span>
                </div>
            </div>

            <p>{extra_info}</p>

            <a href="https://contratapro.com.br/dashboard" class="button">Acessar Dashboard</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def subscription_cancelled(
        recipient_name: str,
        plan_name: str,
        cancellation_reason: str = None
    ) -> Tuple[str, str, str]:
        """
        Template para assinatura cancelada.

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = "Assinatura Cancelada - ContrataPro"

        reason_text = f"\nMotivo informado: {cancellation_reason}" if cancellation_reason else ""

        plain_text = f"""
Ola {recipient_name},

Sua assinatura do plano {plan_name} foi cancelada.{reason_text}

Sentiremos sua falta! Seu perfil nao aparecera mais nas buscas e voce nao recebera novas solicitacoes de clientes.

Se mudar de ideia, voce pode reativar sua assinatura a qualquer momento acessando o ContrataPro.

Atenciosamente,
Equipe ContrataPro
"""

        reason_html = f"""
                <div class="info-item">
                    <span class="info-label">Motivo:</span>
                    <span class="info-value">{cancellation_reason}</span>
                </div>
""" if cancellation_reason else ""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="status-cancelled">Sua assinatura foi cancelada.</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano:</span>
                    <span class="info-value">{plan_name}</span>
                </div>{reason_html}
            </div>

            <p>Sentiremos sua falta! Seu perfil nao aparecera mais nas buscas e voce nao recebera novas solicitacoes de clientes.</p>

            <p>Se mudar de ideia, voce pode reativar sua assinatura a qualquer momento.</p>

            <a href="https://contratapro.com.br/subscription/setup" class="button">Reativar Assinatura</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def subscription_plan_changed(
        recipient_name: str,
        old_plan_name: str,
        new_plan_name: str,
        new_plan_price: float,
        is_upgrade: bool,
        requires_payment: bool = False
    ) -> Tuple[str, str, str]:
        """
        Template para mudanca de plano (upgrade/downgrade).

        Returns:
            tuple: (subject, plain_text, html)
        """
        change_type = "Upgrade" if is_upgrade else "Downgrade"
        subject = f"{change_type} de Plano - {new_plan_name}"

        price_text = f"R$ {new_plan_price:.2f}/mes".replace('.', ',') if new_plan_price > 0 else "Gratis"

        if requires_payment:
            action_text = "Complete o pagamento para ativar seu novo plano."
            button_text = "Completar Pagamento"
            button_url = "https://contratapro.com.br/minha-assinatura"
        else:
            action_text = "Seu novo plano ja esta ativo!"
            button_text = "Acessar Dashboard"
            button_url = "https://contratapro.com.br/dashboard"

        plain_text = f"""
Ola {recipient_name},

Seu plano foi alterado com sucesso!

Plano anterior: {old_plan_name}
Novo plano: {new_plan_name}
Valor: {price_text}

{action_text}

Atenciosamente,
Equipe ContrataPro
"""

        status_class = "status-completed" if is_upgrade else "status-updated"

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="{status_class}">Seu plano foi alterado com sucesso!</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano anterior:</span>
                    <span class="info-value">{old_plan_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Novo plano:</span>
                    <span class="info-value" style="font-weight: bold; color: #6366f1;">{new_plan_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Valor:</span>
                    <span class="info-value">{price_text}</span>
                </div>
            </div>

            <p>{action_text}</p>

            <a href="{button_url}" class="button">{button_text}</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def trial_expiring_soon(
        recipient_name: str,
        days_remaining: int,
        expiration_date: str
    ) -> Tuple[str, str, str]:
        """
        Template para aviso de trial expirando.

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = f"Seu trial expira em {days_remaining} dias - ContrataPro"

        plain_text = f"""
Ola {recipient_name},

Seu periodo de trial no ContrataPro expira em {days_remaining} dias ({expiration_date}).

Para continuar recebendo solicitacoes de clientes e manter seu perfil visivel, faca upgrade para um plano pago.

Nao perca suas conexoes com clientes! Faca upgrade agora.

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="status-updated">Seu periodo de trial esta acabando!</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Dias restantes:</span>
                    <span class="info-value" style="font-weight: bold; color: #f59e0b;">{days_remaining} dias</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Expira em:</span>
                    <span class="info-value">{expiration_date}</span>
                </div>
            </div>

            <p>Para continuar recebendo solicitacoes de clientes e manter seu perfil visivel, faca upgrade para um plano pago.</p>

            <p><strong>Nao perca suas conexoes com clientes!</strong></p>

            <a href="https://contratapro.com.br/alterar-plano" class="button">Fazer Upgrade Agora</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    # ==================== TEMPLATES DE RENOVACAO E FALHAS ====================

    @staticmethod
    def renewal_reminder_paid(
        recipient_name: str,
        plan_name: str,
        plan_price: float,
        renewal_date: str
    ) -> Tuple[str, str, str]:
        """
        Template para lembrete de renovacao de plano pago (7 dias antes).

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = f"Lembrete: Sua assinatura sera renovada em 7 dias"
        price_text = f"R$ {plan_price:.2f}".replace('.', ',')

        plain_text = f"""
Ola {recipient_name},

Este e um lembrete de que sua assinatura do plano {plan_name} sera renovada automaticamente em {renewal_date}.

Plano: {plan_name}
Valor: {price_text}/mes
Data de renovacao: {renewal_date}

O valor sera cobrado automaticamente no cartao cadastrado.

Se voce nao deseja renovar, cancele sua assinatura antes da data de vencimento pelo ContrataPro.

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p>Este e um lembrete de que sua assinatura sera renovada em breve.</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano:</span>
                    <span class="info-value">{plan_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Valor:</span>
                    <span class="info-value">{price_text}/mes</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data de renovacao:</span>
                    <span class="info-value" style="font-weight: bold; color: #6366f1;">{renewal_date}</span>
                </div>
            </div>

            <p>O valor sera cobrado automaticamente no cartao cadastrado.</p>

            <p>Se voce nao deseja renovar, cancele sua assinatura antes da data de vencimento.</p>

            <a href="https://contratapro.com.br/minha-assinatura" class="button">Gerenciar Assinatura</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def trial_expired(
        recipient_name: str,
        plan_name: str
    ) -> Tuple[str, str, str]:
        """
        Template para notificacao de trial expirado.

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = "Seu periodo de trial expirou - ContrataPro"

        plain_text = f"""
Ola {recipient_name},

Seu periodo de trial no ContrataPro expirou.

Seu perfil nao aparecera mais nas buscas e voce nao recebera novas solicitacoes de clientes.

Para continuar usando todos os recursos da plataforma, contrate um plano pago agora mesmo!

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="status-cancelled">Seu periodo de trial expirou.</p>

            <p>Seu perfil nao aparecera mais nas buscas e voce nao recebera novas solicitacoes de clientes.</p>

            <p>Para continuar usando todos os recursos da plataforma, contrate um plano pago agora mesmo!</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano Basic:</span>
                    <span class="info-value">R$ 29,90/mes - Ate 5 servicos</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Plano Premium:</span>
                    <span class="info-value">R$ 49,90/mes - Servicos ilimitados</span>
                </div>
            </div>

            <a href="https://contratapro.com.br/alterar-plano" class="button">Contratar Plano Agora</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def payment_failed(
        recipient_name: str,
        plan_name: str,
        days_remaining: int
    ) -> Tuple[str, str, str]:
        """
        Template para notificacao de falha no pagamento.

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = "Problema com seu pagamento - ContrataPro"

        plain_text = f"""
Ola {recipient_name},

Houve um problema ao processar o pagamento da sua assinatura do plano {plan_name}.

Voce tem {days_remaining} dias para regularizar o pagamento e evitar a suspensao da sua conta.

Por favor, verifique:
- Se o cartao cadastrado esta valido
- Se ha limite disponivel
- Se os dados estao corretos

Atualize seus dados de pagamento para continuar usando o ContrataPro.

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="status-cancelled">Houve um problema com seu pagamento.</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano:</span>
                    <span class="info-value">{plan_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Prazo para regularizar:</span>
                    <span class="info-value" style="font-weight: bold; color: #ef4444;">{days_remaining} dias</span>
                </div>
            </div>

            <p>Por favor, verifique:</p>
            <ul style="text-align: left; margin: 1rem 0;">
                <li>Se o cartao cadastrado esta valido</li>
                <li>Se ha limite disponivel</li>
                <li>Se os dados estao corretos</li>
            </ul>

            <a href="https://contratapro.com.br/minha-assinatura" class="button">Atualizar Pagamento</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def subscription_suspended_non_payment(
        recipient_name: str,
        plan_name: str
    ) -> Tuple[str, str, str]:
        """
        Template para notificacao de suspensao por nao pagamento.

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = "Assinatura suspensa por falta de pagamento - ContrataPro"

        plain_text = f"""
Ola {recipient_name},

Sua assinatura do plano {plan_name} foi suspensa devido a falta de pagamento.

Seu perfil nao aparecera mais nas buscas e voce nao recebera novas solicitacoes de clientes.

Para reativar sua conta, regularize o pagamento o mais rapido possivel.

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="status-cancelled">Sua assinatura foi suspensa.</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano:</span>
                    <span class="info-value">{plan_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Status:</span>
                    <span class="info-value" style="font-weight: bold; color: #ef4444;">Suspensa por falta de pagamento</span>
                </div>
            </div>

            <p>Seu perfil nao aparecera mais nas buscas e voce nao recebera novas solicitacoes de clientes.</p>

            <p>Para reativar sua conta, regularize o pagamento.</p>

            <a href="https://contratapro.com.br/minha-assinatura" class="button">Reativar Assinatura</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def cancellation_scheduled(
        recipient_name: str,
        plan_name: str,
        cancellation_date: str,
        cancellation_reason: str = None
    ) -> Tuple[str, str, str]:
        """
        Template para notificacao de cancelamento agendado.
        O usuario pode continuar usando ate a data do cancelamento.

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = f"Cancelamento agendado - ContrataPro"

        reason_text = f"\nMotivo informado: {cancellation_reason}" if cancellation_reason else ""

        plain_text = f"""
Ola {recipient_name},

Seu pedido de cancelamento foi registrado.

Plano: {plan_name}
Data do cancelamento: {cancellation_date}{reason_text}

IMPORTANTE: Voce pode continuar usando todos os recursos do ContrataPro ate a data do cancelamento.

Se mudar de ideia, voce pode cancelar este pedido a qualquer momento antes de {cancellation_date} pelo ContrataPro.

Atenciosamente,
Equipe ContrataPro
"""

        reason_html = f"""
                <div class="info-item">
                    <span class="info-label">Motivo:</span>
                    <span class="info-value">{cancellation_reason}</span>
                </div>
""" if cancellation_reason else ""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="status-updated">Seu pedido de cancelamento foi registrado.</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano:</span>
                    <span class="info-value">{plan_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data do cancelamento:</span>
                    <span class="info-value" style="font-weight: bold; color: #f59e0b;">{cancellation_date}</span>
                </div>{reason_html}
            </div>

            <p style="background: #dbeafe; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <strong>IMPORTANTE:</strong> Voce pode continuar usando todos os recursos do ContrataPro ate a data do cancelamento.
            </p>

            <p>Se mudar de ideia, voce pode cancelar este pedido a qualquer momento.</p>

            <a href="https://contratapro.com.br/minha-assinatura" class="button">Gerenciar Assinatura</a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)

    @staticmethod
    def downgrade_scheduled(
        recipient_name: str,
        old_plan_name: str,
        new_plan_name: str,
        new_plan_price: float,
        change_date: str
    ) -> Tuple[str, str, str]:
        """
        Template para downgrade agendado.

        Returns:
            tuple: (subject, plain_text, html)
        """
        subject = f"Downgrade agendado para {change_date} - ContrataPro"
        price_text = f"R$ {new_plan_price:.2f}".replace('.', ',')

        plain_text = f"""
Ola {recipient_name},

Seu pedido de downgrade foi registrado.

Plano atual: {old_plan_name}
Novo plano: {new_plan_name} ({price_text}/mes)
Data da mudanca: {change_date}

IMPORTANTE: Voce continuara com todos os recursos do plano {old_plan_name} ate {change_date}.
A partir dessa data, seu plano sera alterado para {new_plan_name}.

Se mudar de ideia, voce pode cancelar este pedido a qualquer momento.

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p class="status-updated">Seu pedido de downgrade foi registrado.</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Plano atual:</span>
                    <span class="info-value">{old_plan_name}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Novo plano:</span>
                    <span class="info-value">{new_plan_name} ({price_text}/mes)</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data da mudanca:</span>
                    <span class="info-value" style="font-weight: bold;">{change_date}</span>
                </div>
            </div>

            <p style="background: #dbeafe; padding: 1rem; border-radius: 8px;">
                <strong>IMPORTANTE:</strong> Voce continuara com todos os recursos
                do plano {old_plan_name} ate {change_date}.
            </p>

            <p>Se mudar de ideia, voce pode cancelar este pedido a qualquer momento.</p>

            <a href="https://contratapro.com.br/minha-assinatura" class="button">
                Gerenciar Assinatura
            </a>
        </div>
"""

        return subject, plain_text, EmailTemplates._base_template(html_content)


    # ==================== TEMPLATES DE AVALIACAO ====================

    @staticmethod
    def review_request(
        recipient_name: str,
        professional_name: str,
        service_title: str,
        appointment_date: date,
        review_link: str
    ) -> Tuple[str, str, str]:
        """
        Template para solicitacao de avaliacao apos conclusao do servico.

        Returns:
            tuple: (subject, plain_text, html)
        """
        date_str = appointment_date.strftime("%d/%m/%Y")

        subject = (
            f"Como foi seu atendimento? "
            f"Avalie {professional_name}"
        )

        plain_text = f"""
Ola {recipient_name},

Seu atendimento com {professional_name} foi concluido!

Servico: {service_title}
Data: {date_str}

Sua opiniao e muito importante. Avalie o servico clicando no link abaixo:

{review_link}

Leva menos de 1 minuto e ajuda outros clientes a encontrar bons profissionais.

Atenciosamente,
Equipe ContrataPro
"""

        html_content = f"""
        <div class="content">
            <h2>Ola {recipient_name},</h2>
            <p>Seu atendimento com <strong>{professional_name}</strong> foi concluido!</p>

            <div class="info-box">
                <div class="info-item">
                    <span class="info-label">Servico:</span>
                    <span class="info-value">{service_title}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Data:</span>
                    <span class="info-value">{date_str}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Profissional:</span>
                    <span class="info-value">{professional_name}</span>
                </div>
            </div>

            <p>Sua opiniao e muito importante! Avalie o servico e ajude outros clientes a encontrar bons profissionais.</p>

            <p><strong>Leva menos de 1 minuto!</strong></p>

            <a href="{review_link}" class="button">Avaliar Agora</a>
        </div>
"""

        return (
            subject, plain_text,
            EmailTemplates._base_template(html_content)
        )


email_templates = EmailTemplates()
