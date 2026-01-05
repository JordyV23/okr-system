from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from typing import List, Optional
from database.database import get_db
from models.models import CheckIn, Objective, User
from schemas.schemas import CheckInCreate, CheckInRead, CheckInUpdate

router = APIRouter(prefix="/api/check-ins", tags=["check-ins"])


@router.get("/", response_model=List[CheckInRead])
async def get_check_ins(
    skip: int = 0,
    limit: int = 100,
    objective_id: Optional[str] = None,
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all check-ins with optional filtering"""
    query = select(CheckIn).options(
        selectinload(CheckIn.objective),
        selectinload(CheckIn.user)
    ).order_by(desc(CheckIn.created_at))
    
    if objective_id:
        query = query.where(CheckIn.objective_id == objective_id)
    if user_id:
        query = query.where(CheckIn.user_id == user_id)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    check_ins = result.scalars().all()
    return check_ins


@router.get("/{check_in_id}", response_model=CheckInRead)
async def get_check_in(check_in_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific check-in by ID"""
    query = select(CheckIn).options(
        selectinload(CheckIn.objective),
        selectinload(CheckIn.user)
    ).where(CheckIn.id == check_in_id)
    result = await db.execute(query)
    check_in = result.scalar_one_or_none()
    if not check_in:
        raise HTTPException(status_code=404, detail="Check-in not found")
    return check_in


@router.post("/", response_model=CheckInRead, status_code=201)
async def create_check_in(check_in: CheckInCreate, db: AsyncSession = Depends(get_db)):
    """Create a new check-in"""
    # Check if objective exists
    obj_result = await db.execute(select(Objective).where(Objective.id == check_in.objective_id))
    if not obj_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Objective not found")
    
    # Check if user exists
    user_result = await db.execute(select(User).where(User.id == check_in.user_id))
    if not user_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")
    
    db_check_in = CheckIn(**check_in.model_dump())
    db.add(db_check_in)
    await db.commit()
    await db.refresh(db_check_in)
    
    # Reload with relationships
    query = select(CheckIn).options(
        selectinload(CheckIn.objective),
        selectinload(CheckIn.user)
    ).where(CheckIn.id == db_check_in.id)
    result = await db.execute(query)
    return result.scalar_one()


@router.put("/{check_in_id}", response_model=CheckInRead)
async def update_check_in(
    check_in_id: str,
    check_in_update: CheckInUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a check-in"""
    result = await db.execute(select(CheckIn).where(CheckIn.id == check_in_id))
    db_check_in = result.scalar_one_or_none()
    if not db_check_in:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    update_data = check_in_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_check_in, field, value)
    
    await db.commit()
    await db.refresh(db_check_in)
    
    # Reload with relationships
    query = select(CheckIn).options(
        selectinload(CheckIn.objective),
        selectinload(CheckIn.user)
    ).where(CheckIn.id == check_in_id)
    result = await db.execute(query)
    return result.scalar_one()


@router.delete("/{check_in_id}", status_code=204)
async def delete_check_in(check_in_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a check-in"""
    result = await db.execute(select(CheckIn).where(CheckIn.id == check_in_id))
    db_check_in = result.scalar_one_or_none()
    if not db_check_in:
        raise HTTPException(status_code=404, detail="Check-in not found")
    
    db.delete(db_check_in)
    await db.commit()
    return None

