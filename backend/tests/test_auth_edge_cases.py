"""
Testes de edge cases para autenticação e segurança.

Cobre os seguintes riscos de alta prioridade:
- Token de reset de senha reutilizável (JWT nunca invalidado)
- Sessão anterior válida após troca de senha
- Tentativa de usar token de acesso como token de reset
- Chave secreta inválida nos endpoints de setup
"""
import uuid
import pytest
from jose import jwt
from datetime import datetime, timedelta

from app.auth_utils import create_password_reset_token, SECRET_KEY, ALGORITHM
from tests.helpers import make_user, get_auth_headers


# ============================================================
# Reuso de token de reset de senha
# ============================================================

@pytest.mark.asyncio
async def test_password_reset_token_is_reusable_after_first_use(async_client):
    """
    Documenta que tokens de reset de senha (JWT) nunca são invalidados após o uso.
    Um atacante com acesso ao link pode redefinir a senha múltiplas vezes.
    COMPORTAMENTO ESPERADO: segundo uso deve retornar 400.
    """
    email, original_password, _ = await make_user(async_client)

    # Gera token de reset diretamente (simula o link enviado por email)
    reset_token = create_password_reset_token(email)

    # Primeiro uso: troca de senha com sucesso
    first_resp = await async_client.post(
        "/auth/reset-password",
        json={"token": reset_token, "new_password": "NewPass@456"},
    )
    assert first_resp.status_code == 200

    # Segundo uso do MESMO token: deveria falhar, mas não falha
    second_resp = await async_client.post(
        "/auth/reset-password",
        json={"token": reset_token, "new_password": "AnotherPass@789"},
    )
    # BUG: retorna 200 em vez de 400 — o token deveria ser invalidado após o primeiro uso
    assert second_resp.status_code == 400, (
        "Falha de segurança: token de reset reutilizado com sucesso. "
        "Tokens deveriam ser invalidados após o primeiro uso."
    )


@pytest.mark.asyncio
async def test_old_access_token_remains_valid_after_password_reset(async_client):
    """
    Documenta que tokens JWT de acesso anteriores continuam válidos após
    uma troca de senha. Um atacante que obteve um token pode continuar
    acessando a conta mesmo após o usuário trocar a senha.
    COMPORTAMENTO ESPERADO: acesso com token antigo deve retornar 401.
    """
    email, password, _ = await make_user(async_client)
    old_headers = await get_auth_headers(async_client, email, password)

    # Confirma que o token antigo funciona antes da troca de senha
    me_resp = await async_client.get("/auth/me", headers=old_headers)
    assert me_resp.status_code == 200

    # Troca de senha via reset
    reset_token = create_password_reset_token(email)
    reset_resp = await async_client.post(
        "/auth/reset-password",
        json={"token": reset_token, "new_password": "BrandNew@999"},
    )
    assert reset_resp.status_code == 200

    # BUG: token antigo ainda funciona após a troca de senha
    me_after_reset = await async_client.get("/auth/me", headers=old_headers)
    assert me_after_reset.status_code == 401, (
        "Falha de segurança: token de acesso anterior ainda válido após reset de senha. "
        "Todas as sessões ativas deveriam ser invalidadas ao trocar a senha."
    )


# ============================================================
# Proteção do token de reset contra uso indevido
# ============================================================

@pytest.mark.asyncio
async def test_access_token_cannot_be_used_as_reset_token(async_client):
    """
    Garante que um token JWT de acesso (sem claim 'purpose') não pode ser
    usado como token de reset de senha.
    """
    email, password, _ = await make_user(async_client)
    headers = await get_auth_headers(async_client, email, password)

    # Extrai o token de acesso do header
    access_token = headers["Authorization"].replace("Bearer ", "")

    # Tenta usar token de acesso como token de reset
    resp = await async_client.post(
        "/auth/reset-password",
        json={"token": access_token, "new_password": "ShouldFail@123"},
    )
    assert resp.status_code == 400
    assert "invalido" in resp.json()["detail"].lower() or "invalid" in resp.json()["detail"].lower()


@pytest.mark.asyncio
async def test_expired_reset_token_is_rejected(async_client):
    """
    Garante que um token de reset já expirado é rejeitado.
    """
    email, _, _ = await make_user(async_client)

    # Cria token já expirado (exp no passado)
    expired_token = jwt.encode(
        {"sub": email, "purpose": "password_reset", "exp": datetime.utcnow() - timedelta(hours=1)},
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    resp = await async_client.post(
        "/auth/reset-password",
        json={"token": expired_token, "new_password": "ShouldFail@123"},
    )
    assert resp.status_code == 400


# ============================================================
# Segurança dos endpoints de setup
# ============================================================

@pytest.mark.asyncio
async def test_setup_create_admin_endpoint_no_longer_exists(async_client):
    """
    POST /admin/setup/create-admin foi removido (Fase 1.2 do plano de
    melhorias): permitia criar um administrador com base apenas em uma
    comparação de string não constant-time contra settings.SECRET_KEY,
    sem exigir autenticação. O bootstrap do primeiro admin agora é feito
    localmente via backend/scripts/create_admin.py, nunca por HTTP público.
    """
    resp = await async_client.post(
        "/admin/setup/create-admin",
        json={
            "email": f"admin_{uuid.uuid4()}@example.com",
            "password": "AdminPass@123",
            "name": "Admin Hacker",
        },
    )
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_setup_update_trial_days_requires_authentication(async_client):
    """
    Garante que /admin/setup/update-trial-days exige um token de acesso válido.
    """
    resp = await async_client.post("/admin/setup/update-trial-days")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_setup_update_trial_days_requires_admin(async_client):
    """
    Garante que um usuário autenticado, mas não-admin, não consegue acessar
    /admin/setup/update-trial-days.
    """
    email, password, _ = await make_user(async_client)
    headers = await get_auth_headers(async_client, email, password)

    resp = await async_client.post("/admin/setup/update-trial-days", headers=headers)
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_setup_change_admin_password_requires_authentication(async_client):
    """
    Garante que /admin/setup/change-admin-password exige um token de acesso válido.
    """
    resp = await async_client.post(
        "/admin/setup/change-admin-password",
        json={"email": "someone@example.com", "new_password": "NewPass@123"},
    )
    assert resp.status_code == 401


# ============================================================
# Proteção de rotas autenticadas
# ============================================================

@pytest.mark.asyncio
async def test_protected_endpoint_rejects_missing_token(async_client):
    """
    Garante que endpoints protegidos rejeitam requisições sem token.
    """
    resp = await async_client.get("/auth/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoint_rejects_malformed_token(async_client):
    """
    Garante que tokens malformados são rejeitados.
    """
    resp = await async_client.get(
        "/auth/me",
        headers={"Authorization": "Bearer token-invalido-aqui"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_protected_endpoint_rejects_tampered_token(async_client):
    """
    Garante que tokens com assinatura inválida (payload adulterado) são rejeitados.
    """
    email, password, _ = await make_user(async_client)
    headers = await get_auth_headers(async_client, email, password)
    valid_token = headers["Authorization"].replace("Bearer ", "")

    # Adultera o payload mas mantém a estrutura do JWT
    parts = valid_token.split(".")
    import base64, json as json_mod
    # Adiciona padding e decodifica o payload
    payload_b64 = parts[1] + "=" * (4 - len(parts[1]) % 4)
    payload_data = json_mod.loads(base64.b64decode(payload_b64).decode())
    payload_data["is_admin"] = True  # Tenta se tornar admin

    # Recodifica com o payload adulterado mas sem a chave secreta correta
    forged_payload = base64.b64encode(json_mod.dumps(payload_data).encode()).decode().rstrip("=")
    tampered_token = f"{parts[0]}.{forged_payload}.{parts[2]}"

    resp = await async_client.get(
        "/auth/me",
        headers={"Authorization": f"Bearer {tampered_token}"},
    )
    assert resp.status_code == 401


# ============================================================
# Rate limiting (Fase 1.4 do plano de melhorias)
# ============================================================

@pytest.mark.asyncio
async def test_login_is_rate_limited_after_repeated_attempts(async_client):
    """
    Garante que POST /auth/login passa a responder 429 após repetidas
    tentativas na mesma origem, contendo brute-force/credential stuffing.
    """
    email, password, _ = await make_user(async_client)

    responses = []
    for _ in range(15):
        resp = await async_client.post(
            "/auth/login",
            json={"email": email, "password": "senha-errada-de-proposito"},
        )
        responses.append(resp.status_code)

    assert 429 in responses, (
        "Login não é limitado por taxa: 15 tentativas seguidas da mesma "
        "origem não dispararam nenhum 429."
    )


@pytest.mark.asyncio
async def test_forgot_password_is_rate_limited_after_repeated_attempts(async_client):
    """
    Garante que POST /auth/forgot-password também é limitado por taxa —
    sem isso, o endpoint pode ser usado para enumerar e-mails cadastrados
    em massa, além de disparar envio de e-mails em volume.
    """
    responses = []
    for _ in range(10):
        resp = await async_client.post(
            "/auth/forgot-password",
            json={"email": "qualquer@example.com"},
        )
        responses.append(resp.status_code)

    assert 429 in responses, (
        "Forgot-password não é limitado por taxa: 10 tentativas seguidas da "
        "mesma origem não dispararam nenhum 429."
    )
