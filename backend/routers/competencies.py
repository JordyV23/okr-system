from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database.database import get_db
from models.models import Competency
from schemas.schemas import CompetencyCreate, CompetencyRead, CompetencyUpdate

router = APIRouter(prefix="/api/competencies", tags=["competencies"])


@router.get("/", response_model=List[CompetencyRead])
@router.get("", response_model=List[CompetencyRead])
async def get_competencies(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all competencies with optional filtering"""
    query = select(Competency)
    
    if category:
        query = query.where(Competency.category == category)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    competencies = result.scalars().all()
    return competencies


@router.get("/{competency_id}", response_model=CompetencyRead)
async def get_competency(competency_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific competency by ID"""
    result = await db.execute(select(Competency).where(Competency.id == competency_id))
    competency = result.scalar_one_or_none()
    if not competency:
        raise HTTPException(status_code=404, detail="Competency not found")
    return competency


@router.post("/", response_model=CompetencyRead, status_code=201)
async def create_competency(competency: CompetencyCreate, db: AsyncSession = Depends(get_db)):
    """Create a new competency"""
    db_competency = Competency(**competency.model_dump())
    db.add(db_competency)
    await db.commit()
    await db.refresh(db_competency)
    return db_competency


@router.put("/{competency_id}", response_model=CompetencyRead)
async def update_competency(
    competency_id: str,
    competency_update: CompetencyUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a competency"""
    result = await db.execute(select(Competency).where(Competency.id == competency_id))
    db_competency = result.scalar_one_or_none()
    if not db_competency:
        raise HTTPException(status_code=404, detail="Competency not found")
    
    update_data = competency_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_competency, field, value)
    
    await db.commit()
    await db.refresh(db_competency)
    return db_competency


@router.delete("/{competency_id}", status_code=204)
async def delete_competency(competency_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a competency"""
    result = await db.execute(select(Competency).where(Competency.id == competency_id))
    db_competency = result.scalar_one_or_none()
    if not db_competency:
        raise HTTPException(status_code=404, detail="Competency not found")
    
    db.delete(db_competency)
    await db.commit()
    return None

