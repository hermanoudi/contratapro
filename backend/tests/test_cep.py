import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import httpx


BRASILAPI_RESPONSE = {
    "cep": "38412298",
    "state": "MG",
    "city": "Uberlândia",
    "neighborhood": "Tibery",
    "street": "Rua Exemplo",
    "location": {"type": "Point", "coordinates": {"longitude": "-48.2", "latitude": "-18.9"}},
}


def _mock_response(status_code: int, json_data: dict | None = None):
    """Cria um mock de resposta HTTP para o httpx."""
    mock_resp = MagicMock()
    mock_resp.status_code = status_code
    if json_data is not None:
        mock_resp.json.return_value = json_data
    return mock_resp


@pytest.mark.asyncio
async def test_buscar_cep_valido(async_client):
    """CEP válido retorna 200 com os campos do endereço."""
    with patch("httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_client
        mock_client.get.return_value = _mock_response(200, BRASILAPI_RESPONSE)

        response = await async_client.get("/cep/38412298")

    assert response.status_code == 200
    data = response.json()
    assert data["cep"] == "38412298"
    assert data["city"] == "Uberlândia"
    assert data["state"] == "MG"
    assert data["neighborhood"] == "Tibery"
    assert data["street"] == "Rua Exemplo"
    assert data["complement"] == ""


@pytest.mark.asyncio
async def test_buscar_cep_com_hifen(async_client):
    """CEP informado com hífen (XXXXX-XXX) deve ser aceito normalmente."""
    with patch("httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_client
        mock_client.get.return_value = _mock_response(200, BRASILAPI_RESPONSE)

        response = await async_client.get("/cep/38412-298")

    assert response.status_code == 200
    assert response.json()["city"] == "Uberlândia"


@pytest.mark.asyncio
async def test_buscar_cep_invalido_retorna_404(async_client):
    """CEP que não existe na BrasilAPI retorna 404."""
    with patch("httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_client
        mock_client.get.return_value = _mock_response(404)

        response = await async_client.get("/cep/00000000")

    assert response.status_code == 404


@pytest.mark.asyncio
async def test_buscar_cep_formato_invalido(async_client):
    """CEP com menos de 8 dígitos retorna 404 sem chamar a API externa."""
    response = await async_client.get("/cep/123")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_buscar_cep_timeout(async_client):
    """Timeout na BrasilAPI retorna 404 (serviço indisponível tratado graciosamente)."""
    with patch("httpx.AsyncClient") as mock_client_cls:
        mock_client = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_client
        mock_client.get.side_effect = httpx.TimeoutException("timeout")

        response = await async_client.get("/cep/38412298")

    assert response.status_code == 404
