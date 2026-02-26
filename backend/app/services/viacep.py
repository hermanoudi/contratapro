"""
Serviço de integração com BrasilAPI para busca de endereços por CEP
"""
import httpx
from typing import Optional, Dict


class ViaCEPService:
    """Serviço para consultar CEPs usando a BrasilAPI v2"""

    BASE_URL = "https://brasilapi.com.br/api/cep/v2"
    TIMEOUT = 10.0  # segundos

    @staticmethod
    async def buscar_cep(cep: str) -> Optional[Dict[str, str]]:
        """
        Busca informações de endereço por CEP usando a BrasilAPI v2.

        Args:
            cep: CEP a ser consultado (com ou sem formatação)

        Returns:
            Dict com dados do endereço ou None se não encontrado/erro
            {
                "cep": "38412-298",
                "street": "Rua Example",
                "complement": "",
                "neighborhood": "Tibery",
                "city": "Uberlândia",
                "state": "MG",
            }
        """
        # Limpar CEP (remover tudo que não for número)
        cep_limpo = ''.join(filter(str.isdigit, cep))

        # Validar formato (8 dígitos)
        if len(cep_limpo) != 8:
            return None

        url = f"{ViaCEPService.BASE_URL}/{cep_limpo}"

        try:
            async with httpx.AsyncClient(timeout=ViaCEPService.TIMEOUT) as client:
                response = await client.get(url)

                # BrasilAPI retorna 404 quando CEP não existe
                if response.status_code != 200:
                    return None

                data = response.json()

                return {
                    "cep": data.get("cep", ""),
                    "street": data.get("street", ""),
                    "complement": "",  # BrasilAPI v2 não retorna complement
                    "neighborhood": data.get("neighborhood", ""),
                    "city": data.get("city", ""),
                    "state": data.get("state", ""),
                }

        except httpx.TimeoutException:
            # Timeout na requisição
            return None
        except httpx.RequestError:
            # Erro de conexão
            return None
        except Exception:
            # Qualquer outro erro
            return None

    @staticmethod
    def formatar_cep(cep: str) -> str:
        """
        Formata CEP no padrão XXXXX-XXX

        Args:
            cep: CEP sem formatação (apenas números)

        Returns:
            CEP formatado ou string vazia se inválido
        """
        cep_limpo = ''.join(filter(str.isdigit, cep))

        if len(cep_limpo) != 8:
            return ""

        return f"{cep_limpo[:5]}-{cep_limpo[5:]}"


# Instância singleton do serviço
viacep_service = ViaCEPService()
