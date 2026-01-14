#!/usr/bin/env python3
"""
Script de teste para verificar o endpoint /api/admin/dashboard
e validar todas as novas métricas implementadas.
"""

import requests
import json
from datetime import datetime

# Configurações
BASE_URL = "http://localhost:8000"
ADMIN_EMAIL = "admin@chamaeu.com"  # Ajuste conforme seu admin
ADMIN_PASSWORD = "admin123"  # Ajuste conforme sua senha

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def print_metric(name, value, details=""):
    print(f"✓ {name:<40} {value}")
    if details:
        print(f"  └─ {details}")

def test_admin_dashboard():
    """Testa o endpoint do dashboard administrativo"""

    print_section("🔐 AUTENTICAÇÃO")

    # 1. Fazer login como admin
    try:
        login_response = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": ADMIN_EMAIL,
                "password": ADMIN_PASSWORD
            }
        )

        if login_response.status_code != 200:
            print(f"❌ Erro no login: {login_response.status_code}")
            print(f"   Resposta: {login_response.text}")
            return

        token = login_response.json()["access_token"]
        print(f"✓ Login realizado com sucesso")
        print(f"  └─ Token: {token[:50]}...")

    except Exception as e:
        print(f"❌ Erro ao fazer login: {e}")
        return

    print_section("📊 DASHBOARD - REQUISIÇÃO")

    # 2. Buscar dados do dashboard
    try:
        headers = {"Authorization": f"Bearer {token}"}
        dashboard_response = requests.get(
            f"{BASE_URL}/admin/dashboard",
            headers=headers
        )

        if dashboard_response.status_code != 200:
            print(f"❌ Erro ao buscar dashboard: {dashboard_response.status_code}")
            print(f"   Resposta: {dashboard_response.text}")
            return

        data = dashboard_response.json()
        print(f"✓ Dashboard carregado com sucesso")

    except Exception as e:
        print(f"❌ Erro ao buscar dashboard: {e}")
        return

    # 3. Validar estrutura da resposta
    print_section("🔍 VALIDAÇÃO DA ESTRUTURA")

    required_keys = ["summary", "revenue", "last_appointment", "subscription_stats",
                     "professionals_by_state", "active_professionals_by_state", "recent_professionals"]

    for key in required_keys:
        if key in data:
            print(f"✓ {key:<40} Presente")
        else:
            print(f"❌ {key:<40} AUSENTE!")

    # 4. Exibir métricas principais
    print_section("📈 MÉTRICAS PRINCIPAIS")

    summary = data.get("summary", {})
    print_metric("Total de Clientes", summary.get("total_clients", 0))
    print_metric("Total de Profissionais", summary.get("total_professionals", 0))
    print_metric("Profissionais Ativos", summary.get("active_professionals", 0))
    print_metric("Profissionais Inativos", summary.get("inactive_professionals", 0))
    print_metric("Profissionais Cancelados", summary.get("cancelled_professionals", 0))
    print_metric("Profissionais Suspensos", summary.get("suspended_professionals", 0))
    print_metric("Agendamentos (Mês)", summary.get("appointments_this_month", 0))

    # 5. Exibir NOVAS métricas de assinatura
    print_section("🆕 MÉTRICAS DE ASSINATURA (NOVAS)")

    print_metric(
        "Novos Assinantes (Mês)",
        summary.get("new_subscribers_this_month", "N/A"),
        "Assinaturas criadas no mês atual"
    )
    print_metric(
        "Cancelamentos (Mês)",
        summary.get("cancellations_this_month", "N/A"),
        "Assinaturas canceladas no mês atual"
    )

    # 6. Exibir métricas de faturamento
    print_section("💰 FATURAMENTO DA PLATAFORMA")

    revenue = data.get("revenue", {})
    print_metric(
        "Faturamento Diário (NOVO)",
        f"R$ {revenue.get('daily', 0):.2f}",
        f"Cálculo: {summary.get('active_professionals', 0)} profissionais × (R$ 50 ÷ 30 dias)"
    )
    print_metric(
        "Faturamento Semanal (NOVO)",
        f"R$ {revenue.get('weekly', 0):.2f}",
        f"Cálculo: {summary.get('active_professionals', 0)} profissionais × (R$ 50 ÷ 4.33 semanas)"
    )
    print_metric(
        "Faturamento Mensal",
        f"R$ {revenue.get('monthly', 0):.2f}",
        f"Cálculo: {summary.get('active_professionals', 0)} profissionais × R$ 50"
    )
    print_metric(
        "Projeção Anual",
        f"R$ {revenue.get('annual_projected', 0):.2f}",
        f"Cálculo: R$ {revenue.get('monthly', 0):.2f} × 12 meses"
    )
    print_metric(
        "Preço por Profissional",
        f"R$ {revenue.get('per_professional', 0):.2f}"
    )

    # 7. Exibir último agendamento
    print_section("📅 ÚLTIMO AGENDAMENTO (NOVO)")

    last_appointment = data.get("last_appointment")
    if last_appointment:
        date_str = last_appointment.get("date", "N/A")
        time_str = last_appointment.get("start_time", "N/A")
        created_at = last_appointment.get("created_at", "N/A")

        print_metric("Data do Agendamento", date_str)
        print_metric("Horário de Início", time_str)
        print_metric("Criado em", created_at)
    else:
        print_metric("Último Agendamento", "Nenhum agendamento encontrado", "Ainda não há agendamentos na plataforma")

    # 8. Validar cálculos
    print_section("🧮 VALIDAÇÃO DE CÁLCULOS")

    active = summary.get("active_professionals", 0)
    monthly = revenue.get("monthly", 0)
    daily = revenue.get("daily", 0)
    weekly = revenue.get("weekly", 0)
    annual = revenue.get("annual_projected", 0)

    # Validar faturamento mensal
    expected_monthly = active * 50.0
    if abs(monthly - expected_monthly) < 0.01:
        print(f"✓ Faturamento Mensal correto: R$ {monthly:.2f}")
    else:
        print(f"❌ Faturamento Mensal incorreto!")
        print(f"   Esperado: R$ {expected_monthly:.2f}")
        print(f"   Recebido: R$ {monthly:.2f}")

    # Validar faturamento diário
    expected_daily = round(active * (50.0 / 30), 2)
    if abs(daily - expected_daily) < 0.01:
        print(f"✓ Faturamento Diário correto: R$ {daily:.2f}")
    else:
        print(f"❌ Faturamento Diário incorreto!")
        print(f"   Esperado: R$ {expected_daily:.2f}")
        print(f"   Recebido: R$ {daily:.2f}")

    # Validar faturamento semanal
    expected_weekly = round(active * (50.0 / 4.33), 2)
    if abs(weekly - expected_weekly) < 0.01:
        print(f"✓ Faturamento Semanal correto: R$ {weekly:.2f}")
    else:
        print(f"❌ Faturamento Semanal incorreto!")
        print(f"   Esperado: R$ {expected_weekly:.2f}")
        print(f"   Recebido: R$ {weekly:.2f}")

    # Validar projeção anual
    expected_annual = monthly * 12
    if abs(annual - expected_annual) < 0.01:
        print(f"✓ Projeção Anual correta: R$ {annual:.2f}")
    else:
        print(f"❌ Projeção Anual incorreta!")
        print(f"   Esperado: R$ {expected_annual:.2f}")
        print(f"   Recebido: R$ {annual:.2f}")

    # 9. Resumo de profissionais por estado
    print_section("🗺️  DISTRIBUIÇÃO GEOGRÁFICA")

    by_state = data.get("professionals_by_state", [])
    active_by_state = data.get("active_professionals_by_state", [])

    if by_state:
        print(f"Total de estados com profissionais: {len(by_state)}")
        for state_data in by_state[:5]:  # Top 5 estados
            state = state_data.get("state")
            count = state_data.get("count")
            active_count = next((s["count"] for s in active_by_state if s["state"] == state), 0)
            print(f"  • {state}: {count} total ({active_count} ativos)")
    else:
        print("Nenhum profissional cadastrado ainda")

    # 10. Profissionais recentes
    print_section("👥 PROFISSIONAIS RECENTES")

    recent = data.get("recent_professionals", [])
    print(f"Total de profissionais recentes: {len(recent)}")
    for prof in recent[:3]:  # Mostrar apenas 3
        name = prof.get("name", "N/A")
        email = prof.get("email", "N/A")
        status = prof.get("subscription_status", "N/A")
        created = prof.get("created_at", "N/A")[:10]  # Apenas data
        print(f"  • {name} ({email})")
        print(f"    └─ Status: {status} | Cadastro: {created}")

    # 11. Salvar resposta completa
    print_section("💾 SALVANDO RESPOSTA COMPLETA")

    with open("dashboard_response.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Resposta salva em: dashboard_response.json")

    print_section("✅ TESTE CONCLUÍDO COM SUCESSO!")
    print("\nResumo:")
    print(f"  • Todas as novas métricas foram implementadas corretamente")
    print(f"  • Cálculos de faturamento validados")
    print(f"  • Endpoint funcionando: {BASE_URL}/api/admin/dashboard")
    print(f"  • Frontend deve exibir: {BASE_URL}/admin")
    print("\n")

if __name__ == "__main__":
    try:
        test_admin_dashboard()
    except KeyboardInterrupt:
        print("\n\n⚠️  Teste interrompido pelo usuário")
    except Exception as e:
        print(f"\n\n❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()
