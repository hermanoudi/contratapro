from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from ..database import get_db
from ..models import WorkingHour, User
from ..schemas import WorkingHourCreate, WorkingHourResponse
from ..dependencies import get_current_user, check_can_manage_schedule

router = APIRouter()

@router.post("/", response_model=WorkingHourResponse, status_code=status.HTTP_201_CREATED)
async def create_working_hour(wh: WorkingHourCreate, current_user: User = Depends(check_can_manage_schedule), db: AsyncSession = Depends(get_db)):
    if not current_user.is_professional:
        raise HTTPException(status_code=403, detail="Only professionals can set working hours")
    
    # Check overlap logic could go here, but keeping it simple for MVP
    new_wh = WorkingHour(
        day_of_week=wh.day_of_week,
        start_time=wh.start_time,
        end_time=wh.end_time,
        professional_id=current_user.id
    )
    db.add(new_wh)
    await db.commit()
    await db.refresh(new_wh)
    return new_wh

@router.get("/me", response_model=List[WorkingHourResponse])
async def read_my_working_hours(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkingHour).filter(WorkingHour.professional_id == current_user.id))
    return result.scalars().all()

@router.delete("/{wh_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_working_hour(wh_id: int, current_user: User = Depends(check_can_manage_schedule), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorkingHour).filter(WorkingHour.id == wh_id, WorkingHour.professional_id == current_user.id))
    wh = result.scalars().first()
    if not wh:
        raise HTTPException(status_code=404, detail="Working hour not found")
    
    await db.delete(wh)
    await db.commit()
