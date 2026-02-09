# Endpoints publicos para avaliacoes de prestadores
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func

from ..database import get_db
from ..models import Review, ReviewToken, User, Appointment
from ..schemas import (
    ReviewCreate,
    ReviewResponse,
    ReviewsSummaryResponse,
    ReviewCommentResponse,
)

router = APIRouter()


@router.post(
    "/{token}",
    response_model=ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def submit_review(
    token: str,
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
):
    """
    Endpoint publico para submissao de avaliacao via token UUID.
    Nao requer autenticacao.
    """
    # Buscar token valido (nao utilizado)
    result = await db.execute(
        select(ReviewToken).filter(
            ReviewToken.token == token,
            ReviewToken.used_at.is_(None),
        )
    )
    review_token = result.scalars().first()

    if not review_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Token invalido ou ja utilizado",
        )

    # Verificar se ja existe avaliacao para este agendamento
    existing = await db.execute(
        select(Review).filter(
            Review.appointment_id == review_token.appointment_id
        )
    )
    if existing.scalars().first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Este agendamento ja foi avaliado",
        )

    # Buscar appointment para obter professional_id
    appt_result = await db.execute(
        select(Appointment).filter(
            Appointment.id == review_token.appointment_id
        )
    )
    appointment = appt_result.scalars().first()

    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agendamento nao encontrado",
        )

    # Criar a avaliacao
    new_review = Review(
        appointment_id=review_token.appointment_id,
        professional_id=appointment.professional_id,
        rating=review_data.rating,
        comment=review_data.comment,
        customer_name=review_data.customer_name,
    )
    db.add(new_review)

    # Invalidar token
    review_token.used_at = datetime.now()

    # Recalcular media do profissional
    await _update_professional_rating(
        db, appointment.professional_id
    )

    await db.commit()
    await db.refresh(new_review)

    return new_review


@router.get(
    "/providers/{provider_id}/summary",
    response_model=ReviewsSummaryResponse,
)
async def get_provider_reviews_summary(
    provider_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Endpoint publico para resumo de avaliacoes de um profissional.
    Nao requer autenticacao.
    """
    # Verificar se profissional existe
    pro_result = await db.execute(
        select(User).filter(
            User.id == provider_id,
            User.is_professional.is_(True),
        )
    )
    professional = pro_result.scalars().first()

    if not professional:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profissional nao encontrado",
        )

    # Buscar ultimos comentarios (mais recentes, limitado a 10)
    reviews_result = await db.execute(
        select(Review)
        .filter(Review.professional_id == provider_id)
        .order_by(Review.created_at.desc())
        .limit(10)
    )
    latest_reviews = reviews_result.scalars().all()

    latest_comments = [
        ReviewCommentResponse(
            rating=r.rating,
            comment=r.comment,
            customer_name=r.customer_name,
            created_at=r.created_at,
        )
        for r in latest_reviews
        if r.comment
    ]

    return ReviewsSummaryResponse(
        average_rating=professional.average_rating,
        total_reviews=professional.total_reviews or 0,
        latest_comments=latest_comments,
    )


async def _update_professional_rating(
    db: AsyncSession,
    professional_id: int,
):
    """Recalcula e atualiza a media de avaliacoes do profissional"""
    result = await db.execute(
        select(
            func.avg(Review.rating),
            func.count(Review.id),
        ).filter(Review.professional_id == professional_id)
    )
    row = result.first()
    avg_rating = (
        round(float(row[0]), 2) if row[0] else None
    )
    total = row[1] or 0

    pro_result = await db.execute(
        select(User).filter(User.id == professional_id)
    )
    professional = pro_result.scalars().first()
    if professional:
        professional.average_rating = avg_rating
        professional.total_reviews = total
