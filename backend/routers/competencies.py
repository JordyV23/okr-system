from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database.database import get_db
from models.models import Competency
from schemas.schemas import CompetencyCreate, CompetencyRead
import json

router = APIRouter(prefix="/api/competencies", tags=["competencies"])

@router.get("/", response_model=List[CompetencyRead])
async def get_competencies(
    skip: int = 0,
    limit: int = 100,
    category: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all competencies with optional filtering"""
    try:
        # Simple query - no filters for now
        query = select(Competency)
        
        result = await db.execute(query)
        competencies_db = result.scalars().all()
        
        # Convertir datos de DB a formato correcto para el schema
        competencies = []
        for comp in competencies_db:
            # Convertir level_descriptions de string '{}' a dict
            level_descriptions = comp.level_descriptions
            if isinstance(level_descriptions, str) and level_descriptions.strip() == '{}':
                level_descriptions = {}
            
            competency_dict = {
                "id": comp.id,
                "name": comp.name,
                "description": comp.description,
                "category": comp.category,
                "levels": comp.levels,
                "level_descriptions": level_descriptions,
                "is_active": comp.is_active,
                "created_at": comp.created_at,
                "updated_at": comp.updated_at
            }
            competencies.append(competency_dict)
        
        return competencies
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to get competencies: {str(e)}")

@router.post("/", response_model=CompetencyRead, status_code=201)
async def create_competency(competency: CompetencyCreate, db: AsyncSession = Depends(get_db)):
    """Create a new competency"""
    try:
        # Simple creation - no complex logic
        db_competency = Competency(
            name=competency.name,
            description=competency.description,
            category=competency.category,
            levels=competency.levels,
            level_descriptions=competency.level_descriptions,
            is_active=True
        )
        
        db.add(db_competency)
        await db.commit()
        await db.refresh(db_competency)
        
        # Convertir a formato correcto para la respuesta
        level_descriptions = db_competency.level_descriptions
        if isinstance(level_descriptions, str) and level_descriptions.strip() == '{}':
            level_descriptions = {}
            
        competency_response = {
            "id": db_competency.id,
            "name": db_competency.name,
            "description": db_competency.description,
            "category": db_competency.category,
            "levels": db_competency.levels,
            "level_descriptions": level_descriptions,
            "is_active": db_competency.is_active,
            "created_at": db_competency.created_at,
            "updated_at": db_competency.updated_at
        }
        
        return competency_response
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create competency: {str(e)}")