"""
API Router para consulta de CEP
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.viacep import viacep_service


class CEPResponse(BaseModel):
    """Resposta da consulta de CEP"""
    cep: str
    street: str
    complement: str
    neighborhood: str
    city: str
    state: str


router = APIRouter(prefix="/cep", tags=["cep"])


@router.get("/{cep}", response_model=CEPResponse)
async def buscar_cep(cep: str):
    """
    Busca informações de endereço por CEP.

    Args:
        cep: CEP a ser consultado (com ou sem formatação)

    Returns:
        Dados do endereço encontrado

    Raises:
        404: CEP não encontrado ou inválido
        500: Erro ao consultar serviço ViaCEP
    """
    resultado = await viacep_service.buscar_cep(cep)

    if resultado is None:
        raise HTTPException(
            status_code=404,
            detail="CEP não encontrado ou inválido"
        )

    return resultado
