"""
Serviço de integração com API ViaCEP
Validação e busca de endereços por CEP
"""
import httpx
from typing import Optional, Dict


class ViaCEPService:
    """Serviço para consultar CEPs usando a API ViaCEP"""

    BASE_URL = "https://viacep.com.br/ws"
    TIMEOUT = 10.0  # segundos

    @staticmethod
    async def buscar_cep(cep: str) -> Optional[Dict[str, str]]:
        """
        Busca informações de endereço por CEP usando a API ViaCEP.

        Args:
            cep: CEP a ser consultado (com ou sem formatação)

        Returns:
            Dict com dados do endereço ou None se não encontrado/erro
            {
                "cep": "38411-146",
                "logradouro": "Rua Example",
                "complemento": "",
                "bairro": "Centro",
                "localidade": "Uberlândia",
                "uf": "MG",
                "erro": true/false (presente apenas se CEP inválido)
            }
        """
        # Limpar CEP (remover tudo que não for número)
        cep_limpo = ''.join(filter(str.isdigit, cep))

        # Validar formato (8 dígitos)
        if len(cep_limpo) != 8:
            return None

        url = f"{ViaCEPService.BASE_URL}/{cep_limpo}/json/"

        try:
            async with httpx.AsyncClient(timeout=ViaCEPService.TIMEOUT) as client:
                response = await client.get(url)

                if response.status_code != 200:
                    return None

                data = response.json()

                # ViaCEP retorna {"erro": true} quando CEP não existe
                if data.get("erro"):
                    return None

                return {
                    "cep": data.get("cep", ""),
                    "street": data.get("logradouro", ""),
                    "complement": data.get("complemento", ""),
                    "neighborhood": data.get("bairro", ""),
                    "city": data.get("localidade", ""),
                    "state": data.get("uf", ""),
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
