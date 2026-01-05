from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from database.database import get_db
from models.models import PDI, PDIAction, User, Cycle
from schemas.schemas import PDICreate, PDIRead, PDIUpdate, PDIActionCreate

router = APIRouter(prefix="/api/pdis", tags=["pdis"])


@router.get("/", response_model=List[PDIRead])
async def get_pdis(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    cycle_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all PDIs with optional filtering"""
    query = select(PDI).options(
        selectinload(PDI.user),
        selectinload(PDI.actions).selectinload(PDIAction.responsible)
    )
    
    if user_id:
        query = query.where(PDI.user_id == user_id)
    if cycle_id:
        query = query.where(PDI.cycle_id == cycle_id)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    pdis = result.scalars().all()
    return pdis


@router.get("/{pdi_id}", response_model=PDIRead)
async def get_pdi(pdi_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific PDI by ID"""
    query = select(PDI).options(
        selectinload(PDI.user),
        selectinload(PDI.actions).selectinload(PDIAction.responsible)
    ).where(PDI.id == pdi_id)
    result = await db.execute(query)
    pdi = result.scalar_one_or_none()
    if not pdi:
        raise HTTPException(status_code=404, detail="PDI not found")
    return pdi


@router.post("/", response_model=PDIRead, status_code=201)
async def create_pdi(pdi: PDICreate, db: AsyncSession = Depends(get_db)):
    """Create a new PDI"""
    # Check if user exists
    user_result = await db.execute(select(User).where(User.id == pdi.user_id))
    if not user_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if cycle exists
    cycle_result = await db.execute(select(Cycle).where(Cycle.id == pdi.cycle_id))
    if not cycle_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Cycle not found")
    
    pdi_data = pdi.model_dump(exclude={"actions"})
    actions_data = pdi.actions or []
    
    db_pdi = PDI(**pdi_data)
    db.add(db_pdi)
    await db.flush()
    
    # Create actions
    for action_data in actions_data:
        db_action = PDIAction(**action_data.model_dump(), pdi_id=db_pdi.id)
        db.add(db_action)
    
    await db.commit()
    await db.refresh(db_pdi)
    
    # Reload with relationships
    query = select(PDI).options(
        selectinload(PDI.user),
        selectinload(PDI.actions).selectinload(PDIAction.responsible)
    ).where(PDI.id == db_pdi.id)
    result = await db.execute(query)
    return result.scalar_one()


@router.put("/{pdi_id}", response_model=PDIRead)
async def update_pdi(
    pdi_id: str,
    pdi_update: PDIUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a PDI"""
    result = await db.execute(select(PDI).where(PDI.id == pdi_id))
    db_pdi = result.scalar_one_or_none()
    if not db_pdi:
        raise HTTPException(status_code=404, detail="PDI not found")
    
    update_data = pdi_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_pdi, field, value)
    
    await db.commit()
    await db.refresh(db_pdi)
    
    # Reload with relationships
    query = select(PDI).options(
        selectinload(PDI.user),
        selectinload(PDI.actions).selectinload(PDIAction.responsible)
    ).where(PDI.id == pdi_id)
    result = await db.execute(query)
    return result.scalar_one()


@router.delete("/{pdi_id}", status_code=204)
async def delete_pdi(pdi_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a PDI"""
    result = await db.execute(select(PDI).where(PDI.id == pdi_id))
    db_pdi = result.scalar_one_or_none()
    if not db_pdi:
        raise HTTPException(status_code=404, detail="PDI not found")
    
    db.delete(db_pdi)
    await db.commit()
    return None

