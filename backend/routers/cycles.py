from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database.database import get_db
from models.models import Cycle
from schemas.schemas import CycleCreate, CycleRead

router = APIRouter(prefix="/api/cycles", tags=["cycles"])


@router.get("/", response_model=List[CycleRead])
async def get_cycles(
    skip: int = 0,
    limit: int = 100,
    is_active: bool = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all cycles with optional filtering"""
    query = select(Cycle)
    if is_active is not None:
        query = query.where(Cycle.is_active == is_active)
    query = query.order_by(Cycle.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    cycles = result.scalars().all()
    return cycles


@router.get("/{cycle_id}", response_model=CycleRead)
async def get_cycle(cycle_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific cycle by ID"""
    result = await db.execute(select(Cycle).where(Cycle.id == cycle_id))
    cycle = result.scalar_one_or_none()
    if not cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    return cycle


@router.post("/", response_model=CycleRead, status_code=201)
async def create_cycle(cycle: CycleCreate, db: AsyncSession = Depends(get_db)):
    """Create a new cycle"""
    # If this cycle is set as active, deactivate all others
    if cycle.is_active:
        result = await db.execute(select(Cycle).where(Cycle.is_active == True))
        active_cycles = result.scalars().all()
        for active_cycle in active_cycles:
            active_cycle.is_active = False
    
    db_cycle = Cycle(**cycle.model_dump())
    db.add(db_cycle)
    await db.commit()
    await db.refresh(db_cycle)
    return db_cycle


@router.put("/{cycle_id}", response_model=CycleRead)
async def update_cycle(
    cycle_id: str,
    cycle_update: CycleCreate,
    db: AsyncSession = Depends(get_db)
):
    """Update a cycle"""
    result = await db.execute(select(Cycle).where(Cycle.id == cycle_id))
    db_cycle = result.scalar_one_or_none()
    if not db_cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    
    # If this cycle is set as active, deactivate all others
    if cycle_update.is_active:
        result = await db.execute(select(Cycle).where(Cycle.is_active == True).where(Cycle.id != cycle_id))
        active_cycles = result.scalars().all()
        for active_cycle in active_cycles:
            active_cycle.is_active = False
    
    update_data = cycle_update.model_dump()
    for field, value in update_data.items():
        setattr(db_cycle, field, value)
    
    await db.commit()
    await db.refresh(db_cycle)
    return db_cycle


@router.delete("/{cycle_id}", status_code=204)
async def delete_cycle(cycle_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a cycle"""
    result = await db.execute(select(Cycle).where(Cycle.id == cycle_id))
    db_cycle = result.scalar_one_or_none()
    if not db_cycle:
        raise HTTPException(status_code=404, detail="Cycle not found")
    
    db.delete(db_cycle)
    await db.commit()
    return None

