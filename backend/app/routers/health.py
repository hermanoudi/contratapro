"""
Health Check Router
Endpoint para monitoramento da saúde da aplicação
"""
from datetime import datetime
from typing import Dict, Any
from fastapi import APIRouter, Depends, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from ..database import get_db
import httpx

router = APIRouter(prefix="/health", tags=["health"])


async def check_database(db: AsyncSession) -> Dict[str, Any]:
    """
    Verifica conexão com o banco de dados PostgreSQL.

    Returns:
        Dict com status e tempo de resposta
    """
    try:
        start_time = datetime.now()

        # Executar query simples para testar conexão
        result = await db.execute(text("SELECT 1"))
        result.scalar()

        response_time = (datetime.now() - start_time).total_seconds()

        return {
            "status": "healthy",
            "response_time_ms": round(response_time * 1000, 2),
            "message": "Database connection successful"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "Database connection failed"
        }


async def check_viacep() -> Dict[str, Any]:
    """
    Verifica disponibilidade da API ViaCEP.

    Returns:
        Dict com status do serviço
    """
    try:
        start_time = datetime.now()

        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get("https://viacep.com.br/ws/01310100/json/")

        response_time = (datetime.now() - start_time).total_seconds()

        if response.status_code == 200:
            return {
                "status": "healthy",
                "response_time_ms": round(response_time * 1000, 2),
                "message": "ViaCEP API is reachable"
            }
        else:
            return {
                "status": "degraded",
                "http_status": response.status_code,
                "message": "ViaCEP API returned non-200 status"
            }
    except httpx.TimeoutException:
        return {
            "status": "unhealthy",
            "error": "timeout",
            "message": "ViaCEP API timeout"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "message": "ViaCEP API unreachable"
        }


async def check_cloudinary() -> Dict[str, Any]:
    """
    Verifica disponibilidade do Cloudinary.

    Returns:
        Dict com status do serviço
    """
    try:
        import cloudinary

        # Verificar se está configurado
        if not cloudinary.config().cloud_name:
            return {
                "status": "not_configured",
                "message": "Cloudinary not configured"
            }

        return {
            "status": "healthy",
            "message": "Cloudinary configured",
            "cloud_name": cloudinary.config().cloud_name
        }
    except ImportError:
        return {
            "status": "not_available",
            "message": "Cloudinary library not installed"
        }
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "message": "Cloudinary check failed"
        }


@router.get("/", status_code=status.HTTP_200_OK)
async def health_check(db: AsyncSession = Depends(get_db)):
    """
    Health check principal - verifica todos os componentes críticos.

    Retorna:
        - 200 OK: Todos os serviços essenciais estão funcionando
        - 503 Service Unavailable: Um ou mais serviços críticos falharam

    Response:
        {
            "status": "healthy" | "degraded" | "unhealthy",
            "timestamp": "2026-01-05T10:30:00Z",
            "version": "1.0.0",
            "services": {
                "database": {...},
                "viacep": {...},
                "cloudinary": {...}
            }
        }
    """
    # Executar todas as verificações em paralelo seria ideal,
    # mas para simplificar vamos fazer sequencial
    database_health = await check_database(db)
    viacep_health = await check_viacep()
    cloudinary_health = await check_cloudinary()

    # Determinar status geral
    overall_status = "healthy"

    # Se banco falhar, aplicação está unhealthy
    if database_health["status"] == "unhealthy":
        overall_status = "unhealthy"
    # Se serviços externos falharem, aplicação está degraded
    elif (viacep_health["status"] == "unhealthy" or
          cloudinary_health["status"] == "unhealthy"):
        overall_status = "degraded"

    response = {
        "status": overall_status,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "version": "1.0.0",
        "services": {
            "database": database_health,
            "viacep": viacep_health,
            "cloudinary": cloudinary_health
        }
    }

    # Retornar 503 se unhealthy
    if overall_status == "unhealthy":
        return response, status.HTTP_503_SERVICE_UNAVAILABLE

    return response


@router.get("/liveness", status_code=status.HTTP_200_OK)
async def liveness_check():
    """
    Liveness probe - verifica se a aplicação está rodando.

    Este endpoint é usado por Kubernetes/Docker para verificar
    se o container precisa ser reiniciado.

    Retorna sempre 200 OK se a aplicação está respondendo.
    """
    return {
        "status": "alive",
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }


@router.get("/readiness", status_code=status.HTTP_200_OK)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """
    Readiness probe - verifica se a aplicação está pronta para
    receber tráfego.

    Este endpoint é usado por Kubernetes/Docker para verificar
    se o container pode receber requisições.

    Retorna:
        - 200 OK: Aplicação pronta para receber tráfego
        - 503 Service Unavailable: Aplicação não está pronta
    """
    # Verificar apenas serviços críticos (banco de dados)
    database_health = await check_database(db)

    if database_health["status"] == "unhealthy":
        return {
            "status": "not_ready",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "reason": "Database connection failed"
        }, status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "database": database_health
    }
