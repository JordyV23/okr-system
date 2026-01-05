from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from database.database import get_db
from models.models import Objective, KeyResult, User, Cycle
from schemas.schemas import ObjectiveCreate, ObjectiveRead, ObjectiveUpdate, KeyResultCreate

router = APIRouter(prefix="/api/objectives", tags=["objectives"])


@router.get("/", response_model=List[ObjectiveRead])
async def get_objectives(
    skip: int = 0,
    limit: int = 100,
    cycle_id: Optional[str] = None,
    owner_id: Optional[str] = None,
    status: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all objectives with optional filtering"""
    query = select(Objective).options(selectinload(Objective.key_results), selectinload(Objective.owner))
    
    if cycle_id:
        query = query.where(Objective.cycle_id == cycle_id)
    if owner_id:
        query = query.where(Objective.owner_id == owner_id)
    if status:
        query = query.where(Objective.status == status)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    objectives = result.scalars().all()
    return objectives


@router.get("/{objective_id}", response_model=ObjectiveRead)
async def get_objective(objective_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific objective by ID"""
    query = select(Objective).options(
        selectinload(Objective.key_results),
        selectinload(Objective.owner)
    ).where(Objective.id == objective_id)
    result = await db.execute(query)
    objective = result.scalar_one_or_none()
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    return objective


@router.post("/", response_model=ObjectiveRead, status_code=201)
async def create_objective(objective: ObjectiveCreate, db: AsyncSession = Depends(get_db)):
    """Create a new objective"""
    # Check if cycle exists
    cycle_result = await db.execute(select(Cycle).where(Cycle.id == objective.cycle_id))
    if not cycle_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Cycle not found")
    
    # Check if owner exists
    user_result = await db.execute(select(User).where(User.id == objective.owner_id))
    if not user_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")
    
    objective_data = objective.model_dump(exclude={"key_results"})
    key_results_data = objective.key_results or []
    
    db_objective = Objective(**objective_data)
    db.add(db_objective)
    await db.flush()
    
    # Create key results
    for kr_data in key_results_data:
        db_kr = KeyResult(**kr_data.model_dump(), objective_id=db_objective.id)
        db.add(db_kr)
    
    await db.commit()
    await db.refresh(db_objective)
    
    # Reload with relationships
    query = select(Objective).options(
        selectinload(Objective.key_results),
        selectinload(Objective.owner)
    ).where(Objective.id == db_objective.id)
    result = await db.execute(query)
    return result.scalar_one()


@router.put("/{objective_id}", response_model=ObjectiveRead)
async def update_objective(
    objective_id: str,
    objective_update: ObjectiveUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an objective"""
    query = select(Objective).where(Objective.id == objective_id)
    result = await db.execute(query)
    db_objective = result.scalar_one_or_none()
    if not db_objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    update_data = objective_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_objective, field, value)
    
    await db.commit()
    await db.refresh(db_objective)
    
    # Reload with relationships
    query = select(Objective).options(
        selectinload(Objective.key_results),
        selectinload(Objective.owner)
    ).where(Objective.id == objective_id)
    result = await db.execute(query)
    return result.scalar_one()


@router.delete("/{objective_id}", status_code=204)
async def delete_objective(objective_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an objective"""
    result = await db.execute(select(Objective).where(Objective.id == objective_id))
    db_objective = result.scalar_one_or_none()
    if not db_objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    db.delete(db_objective)
    await db.commit()
    return None

