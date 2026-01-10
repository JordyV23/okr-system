from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from database.database import get_db
from models.models import Competency
from schemas.schemas import CompetencyCreate, CompetencyRead, CompetencyUpdate
import json

# Alerta simple para depuración
def _log(message: str):
    print(f"🔔 COMPETENCIES ALERT: {message}")

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
            # Convertir level_descriptions de string a dict
            level_descriptions = comp.level_descriptions
            if isinstance(level_descriptions, str):
                try:
                    level_descriptions = json.loads(level_descriptions) if level_descriptions.strip() else {}
                except json.JSONDecodeError:
                    level_descriptions = {}
            elif not isinstance(level_descriptions, dict):
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
        
        _log(f"GET: Devueltos {len(competencies)} competencies")
        return competencies
        
    except Exception as e:
        await db.rollback()
        _log(f"ERROR en GET competencies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get competencies: {str(e)}")

@router.post("/", response_model=CompetencyRead, status_code=201)
async def create_competency(competency: CompetencyCreate, db: AsyncSession = Depends(get_db)):
    """Create a new competency"""
    try:
        # Convert level_descriptions dict to JSON string for Oracle compatibility
        level_descriptions_json = json.dumps(competency.level_descriptions) if competency.level_descriptions else "{}"
        
        # Simple creation - no complex logic
        db_competency = Competency(
            name=competency.name,
            description=competency.description,
            category=competency.category,
            levels=competency.levels,
            level_descriptions=level_descriptions_json,
            is_active=True
        )
        
        db.add(db_competency)
        await db.commit()
        await db.refresh(db_competency)
        
        # Convertir level_descriptions de string a dict para la respuesta
        level_descriptions = db_competency.level_descriptions
        if isinstance(level_descriptions, str):
            try:
                level_descriptions = json.loads(level_descriptions) if level_descriptions.strip() else {}
            except json.JSONDecodeError:
                level_descriptions = {}
        elif not isinstance(level_descriptions, dict):
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
        
        _log(f"POST: Creada competencia '{db_competency.name}' (ID: {db_competency.id})")
        return competency_response
        
    except Exception as e:
        await db.rollback()
        _log(f"ERROR en POST competencies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create competency: {str(e)}")

@router.put("/{competency_id}", response_model=CompetencyRead)
async def update_competency(competency_id: str, competency: CompetencyUpdate, db: AsyncSession = Depends(get_db)):
    """Update a competency"""
    try:
        # Get existing competency
        query = select(Competency).where(Competency.id == competency_id)
        result = await db.execute(query)
        db_competency = result.scalar_one_or_none()
        
        if not db_competency:
            _log(f"PUT: Competencia con ID {competency_id} no encontrada")
            raise HTTPException(status_code=404, detail="Competency not found")
        
        # Update fields with provided values
        if competency.name is not None:
            db_competency.name = competency.name
        if competency.description is not None:
            db_competency.description = competency.description
        if competency.category is not None:
            db_competency.category = competency.category
        if competency.levels is not None:
            db_competency.levels = competency.levels
        if competency.level_descriptions is not None:
            # Convert level_descriptions dict to JSON string for Oracle compatibility
            db_competency.level_descriptions = json.dumps(competency.level_descriptions) if competency.level_descriptions else "{}"
        if competency.is_active is not None:
            db_competency.is_active = competency.is_active
        
        await db.commit()
        await db.refresh(db_competency)
        
        # Convertir level_descriptions de string a dict para la respuesta
        level_descriptions = db_competency.level_descriptions
        if isinstance(level_descriptions, str):
            try:
                level_descriptions = json.loads(level_descriptions) if level_descriptions.strip() else {}
            except json.JSONDecodeError:
                level_descriptions = {}
        elif not isinstance(level_descriptions, dict):
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
        
        _log(f"PUT: Actualizada competencia '{db_competency.name}' (ID: {db_competency.id})")
        return competency_response
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        _log(f"ERROR en PUT competencies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update competency: {str(e)}")

@router.delete("/{competency_id}", status_code=204)
async def delete_competency(competency_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a competency (soft delete by setting is_active=False)"""
    try:
        # Get existing competency
        query = select(Competency).where(Competency.id == competency_id)
        result = await db.execute(query)
        db_competency = result.scalar_one_or_none()
        
        if not db_competency:
            _log(f"DELETE: Competencia con ID {competency_id} no encontrada")
            raise HTTPException(status_code=404, detail="Competency not found")
        
        # Soft delete: set is_active=False
        db_competency.is_active = False
        
        await db.commit()
        
        _log(f"DELETE: Desactivada competencia '{db_competency.name}' (ID: {db_competency.id})")
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        _log(f"ERROR en DELETE competencies: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete competency: {str(e)}")