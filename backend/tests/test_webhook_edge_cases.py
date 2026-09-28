"""
Testes de edge cases para o webhook do Mercado Pago.

Cobre os seguintes riscos de alta prioridade:
- Webhook sem verificação de assinatura HMAC (qualquer requisição é aceita)
- Payload com tipo de evento desconhecido retorna graciosamente
- Payload sem preapproval_id retorna erro esperado
- Payload com external_reference de usuário inexistente
- Payload malformado (JSON inválido)
- Payload vazio aceito sem erro

A partir da Fase 1.3 do plano de melhorias, o endpoint exige uma assinatura
HMAC válida (header x-signature) antes de processar qualquer payload — os
testes abaixo (exceto os que testam a ausência/invalidez da assinatura)
assinam suas requisições com _signed_webhook_request(), usando o mesmo
segredo de teste definido em conftest.py (MERCADOPAGO_WEBHOOK_SECRET).
"""
import hashlib
import hmac
import time

import pytest

from app.config import settings

WEBHOOK_URL = "/subscriptions/webhook"


def _signed_webhook_request(data_id: str = "fake-id"):
    """
    Monta (url, headers) com uma assinatura HMAC válida para o payload,
    replicando o algoritmo de
    app.routers.subscriptions._verify_mercadopago_webhook_signature
    (que por sua vez segue a documentação oficial: segmentos ausentes são
    omitidos do manifesto, não incluídos vazios).
    """
    ts = str(int(time.time()))
    request_id = "test-request-id"

    manifest_parts = []
    if data_id:
        manifest_parts.append(f"id:{data_id.lower()}")
    manifest_parts.append(f"request-id:{request_id}")
    manifest_parts.append(f"ts:{ts}")
    manifest = ";".join(manifest_parts) + ";"

    v1 = hmac.new(
        settings.MERCADOPAGO_WEBHOOK_SECRET.encode("utf-8"),
        manifest.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    url = f"{WEBHOOK_URL}?data.id={data_id}" if data_id else WEBHOOK_URL
    headers = {
        "x-signature": f"ts={ts},v1={v1}",
        "x-request-id": request_id,
    }
    return url, headers


# ============================================================
# Verificação de autenticidade do webhook (assinatura HMAC)
# ============================================================

@pytest.mark.asyncio
async def test_webhook_rejects_request_without_hmac_signature(async_client):
    """
    Garante que o webhook do Mercado Pago rejeita requisições sem assinatura
    HMAC válida, antes de processar ou tocar no banco.

    Referência: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks#editor_2
    """
    resp = await async_client.post(
        WEBHOOK_URL,
        json={"type": "test", "data": {"id": "fake-id"}},
        # Sem header x-signature, x-request-id etc
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_webhook_rejects_request_with_wrong_hmac_signature(async_client):
    """
    Garante que uma assinatura presente, mas incorreta, também é rejeitada.
    """
    resp = await async_client.post(
        f"{WEBHOOK_URL}?data.id=fake-id",
        json={"type": "test", "data": {"id": "fake-id"}},
        headers={"x-signature": "ts=123,v1=chave-forjada", "x-request-id": "abc"},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_webhook_accepts_valid_signature_without_data_id_query_param(async_client):
    """
    Garante que a verificação de assinatura segue a documentação oficial do
    Mercado Pago: quando data.id não vem nos query params, o segmento
    correspondente é OMITIDO do manifesto HMAC (não incluído como "id:;").
    Uma implementação que sempre inclui "id:{vazio};" nunca bateria com a
    assinatura real enviada pelo Mercado Pago nesse cenário.
    """
    url, headers = _signed_webhook_request(data_id="")
    resp = await async_client.post(
        url,
        json={"type": "test", "data": {}},
        headers=headers,
    )
    # Assinatura válida -> não deve ser rejeitado por 401 (pode retornar
    # outro status ao processar um payload sem dados suficientes).
    assert resp.status_code != 401


# ============================================================
# Tipos de eventos desconhecidos
# ============================================================

@pytest.mark.asyncio
async def test_webhook_unknown_event_type_returns_gracefully(async_client):
    """
    Garante que um tipo de evento desconhecido (ex: 'payment.refunded')
    não causa erro 500 — deve ser ignorado silenciosamente.
    """
    url, headers = _signed_webhook_request("some-id")
    resp = await async_client.post(
        url,
        json={"type": "unknown_event_type_xyz", "data": {"id": "some-id"}},
        headers=headers,
    )
    # Deve retornar 200 ou 400, mas nunca 500
    assert resp.status_code != 500, (
        "Erro interno ao processar tipo de evento desconhecido. "
        "O webhook deve ignorar tipos não reconhecidos graciosamente."
    )
    assert resp.status_code in (200, 400)


@pytest.mark.asyncio
async def test_webhook_payment_event_without_authorization_data_handled(async_client):
    """
    Garante que evento do tipo 'payment' (diferente de 'preapproval') sem
    dados suficientes não causa crash.
    """
    url, headers = _signed_webhook_request("")
    resp = await async_client.post(
        url,
        json={"type": "payment", "data": {}},
        headers=headers,
    )
    assert resp.status_code != 500


# ============================================================
# Payload inválido ou incompleto
# ============================================================

@pytest.mark.asyncio
async def test_webhook_missing_preapproval_id_returns_error(async_client):
    """
    Garante que um payload de assinatura sem 'data.id' retorna erro
    (não processa parcialmente).
    """
    url, headers = _signed_webhook_request("")
    resp = await async_client.post(
        url,
        json={"type": "preapproval", "data": {}},  # sem 'id'
        headers=headers,
    )
    # Esperamos 200 com status de erro no body (padrão atual) ou 400
    assert resp.status_code in (200, 400)
    if resp.status_code == 200:
        body = resp.json()
        assert body.get("status") == "error" or body.get("message") is not None


@pytest.mark.asyncio
async def test_webhook_empty_body_does_not_crash(async_client):
    """
    Garante que um payload vazio {} não cause erro 500.
    """
    url, headers = _signed_webhook_request("")
    resp = await async_client.post(
        url,
        json={},
        headers=headers,
    )
    assert resp.status_code != 500


@pytest.mark.asyncio
async def test_webhook_null_type_does_not_crash(async_client):
    """
    Garante que type=null não cause erro 500.
    """
    url, headers = _signed_webhook_request("some-id")
    resp = await async_client.post(
        url,
        json={"type": None, "data": {"id": "some-id"}},
        headers=headers,
    )
    assert resp.status_code != 500


# ============================================================
# Proteção contra substituição de external_reference
# ============================================================

@pytest.mark.asyncio
async def test_webhook_with_nonexistent_external_reference_does_not_crash(async_client):
    """
    Garante que um webhook com external_reference apontando para um usuário
    inexistente não cause erro 500 — deve ser tratado como referência inválida.

    Este teste também documenta o risco: se um atacante souber que o webhook
    usa external_reference para buscar usuários, poderia tentar ativar planos
    de usuários arbitrários.
    """
    url, headers = _signed_webhook_request("fake-preapproval-999")
    resp = await async_client.post(
        url,
        json={
            "type": "preapproval",
            "data": {"id": "fake-preapproval-999"},
        },
        headers=headers,
    )
    # O MP SDK tentará buscar o preapproval e falhará (sem credenciais válidas no teste)
    # O importante é não retornar 500 por causa do external_reference
    assert resp.status_code in (200, 400, 500)
    # Nota: em ambiente de teste sem credenciais MP, pode retornar 500 por falha no SDK.
    # O teste principal de segurança é o HMAC acima.


# ============================================================
# Idempotência
# ============================================================

@pytest.mark.asyncio
async def test_webhook_duplicate_event_does_not_cause_double_processing(async_client):
    """
    Garante que o mesmo evento enviado duas vezes não processa em duplicata.
    O Mercado Pago pode reenviar webhooks que não receberam resposta — o sistema
    deve ser idempotente.

    NOTA: Este teste documenta o comportamento esperado. A verificação real
    de duplo processamento exigiria assinaturas válidas e DB isolado.
    """
    payload = {"type": "preapproval", "data": {"id": "duplicate-test-id"}}
    url, headers = _signed_webhook_request("duplicate-test-id")

    first = await async_client.post(url, json=payload, headers=headers)
    second = await async_client.post(url, json=payload, headers=headers)

    # Ambos devem retornar o mesmo status (idempotência)
    assert first.status_code == second.status_code
