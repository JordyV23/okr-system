from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from database.database import get_db
from models.models import Objective, KeyResult, User, Cycle
from schemas.schemas import ObjectiveCreate, ObjectiveRead, ObjectiveUpdate, KeyResultCreate

# Temporary: disable database dependency for testing
async def mock_get_db():
    # Mock database session for testing
    class MockSession:
        pass
    return MockSession()

router = APIRouter(prefix="/api/objectives", tags=["objectives"])


@router.get("/", response_model=List[ObjectiveRead])
async def get_objectives(
    skip: int = 0,
    limit: int = 100,
    cycle_id: Optional[str] = None,
    owner_id: Optional[str] = None,
    status: Optional[str] = None,
    db = Depends(mock_get_db)
):
    """Get all objectives with optional filtering"""
    # Temporary mock data for testing
    from datetime import datetime, date
    import uuid
    from decimal import Decimal
    
    mock_objectives = [
        ObjectiveRead(
            id=str(uuid.uuid4()),
            cycle_id=str(uuid.uuid4()),
            owner_id=str(uuid.uuid4()),
            title="Implementar sistema de autenticación",
            description="Desarrollar un sistema seguro de autenticación de usuarios",
            type="technical",
            status="on-track",
            approval_status="approved",
            weight=Decimal("0.8"),
            progress=Decimal("65.0"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            key_results=[
                {
                    "id": str(uuid.uuid4()),
                    "title": "Configurar OAuth2",
                    "current": Decimal("1.0"),
                    "target": Decimal("1.0"),
                    "unit": "implementaciones",
                    "progress": Decimal("100.0")
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Implementar JWT tokens",
                    "current": Decimal("1.0"),
                    "target": Decimal("1.0"),
                    "unit": "implementaciones",
                    "progress": Decimal("100.0")
                },
                {
                    "id": str(uuid.uuid4()),
                    "title": "Crear middleware de autorización",
                    "current": Decimal("0.0"),
                    "target": Decimal("1.0"),
                    "unit": "implementaciones",
                    "progress": Decimal("0.0")
                }
            ],
            owner={
                "id": str(uuid.uuid4()),
                "full_name": "Juan Pérez",
                "department": {
                    "id": str(uuid.uuid4()),
                    "name": "Desarrollo"
                }
            }
        ),
        ObjectiveRead(
            id=str(uuid.uuid4()),
            cycle_id=str(uuid.uuid4()),
            owner_id=str(uuid.uuid4()),
            title="Mejorar rendimiento de la aplicación",
            description="Optimizar consultas y reducir tiempos de carga",
            type="technical",
            status="at-risk",
            approval_status="approved",
            weight=Decimal("0.6"),
            progress=Decimal("30.0"),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            key_results=[
                {
                    "id": str(uuid.uuid4()),
                    "title": "Optimizar consultas SQL",
                    "current": Decimal("5.0"),
                    "target": Decimal("10.0"),
                    "unit": "consultas",
                    "progress": Decimal("50.0")
                }
            ],
            owner={
                "id": str(uuid.uuid4()),
                "full_name": "María García",
                "department": {
                    "id": str(uuid.uuid4()),
                    "name": "Desarrollo"
                }
            }
        )
    ]
    
    # Apply filters
    if owner_id:
        mock_objectives = [obj for obj in mock_objectives if obj.owner_id == owner_id]
    if status:
        mock_objectives = [obj for obj in mock_objectives if obj.status == status]
    
    return mock_objectives[skip:skip + limit]
    
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
    
    update_data = objective_update.model_dump(exclude_unset=True, exclude={"key_results"})
    for field, value in update_data.items():
        setattr(db_objective, field, value)
    
    # Handle key results update if provided
    if objective_update.key_results is not None:
        # Delete existing key results
        await db.execute(
            select(KeyResult).where(KeyResult.objective_id == objective_id).delete()
        )
        
        # Create new key results
        for kr_data in objective_update.key_results:
            db_kr = KeyResult(**kr_data.model_dump(), objective_id=objective_id)
            db.add(db_kr)
    
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

