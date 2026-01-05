from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from database.database import get_db
from models.models import Evaluation, EvaluationCompetency, EvaluationObjective, User, Cycle, Competency, Objective
from schemas.schemas import (
    EvaluationCreate, EvaluationRead, EvaluationUpdate,
    EvaluationCompetencyCreate, EvaluationObjectiveCreate
)

router = APIRouter(prefix="/api/evaluations", tags=["evaluations"])


@router.get("/", response_model=List[EvaluationRead])
async def get_evaluations(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    cycle_id: Optional[str] = None,
    phase: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all evaluations with optional filtering"""
    query = select(Evaluation).options(
        selectinload(Evaluation.user),
        selectinload(Evaluation.evaluation_competencies).selectinload(EvaluationCompetency.competency),
        selectinload(Evaluation.evaluation_objectives).selectinload(EvaluationObjective.objective)
    )
    
    if user_id:
        query = query.where(Evaluation.user_id == user_id)
    if cycle_id:
        query = query.where(Evaluation.cycle_id == cycle_id)
    if phase:
        query = query.where(Evaluation.phase == phase)
    
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    evaluations = result.scalars().all()
    return evaluations


@router.get("/{evaluation_id}", response_model=EvaluationRead)
async def get_evaluation(evaluation_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific evaluation by ID"""
    query = select(Evaluation).options(
        selectinload(Evaluation.user),
        selectinload(Evaluation.evaluation_competencies).selectinload(EvaluationCompetency.competency),
        selectinload(Evaluation.evaluation_objectives).selectinload(EvaluationObjective.objective)
    ).where(Evaluation.id == evaluation_id)
    result = await db.execute(query)
    evaluation = result.scalar_one_or_none()
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return evaluation


@router.post("/", response_model=EvaluationRead, status_code=201)
async def create_evaluation(evaluation: EvaluationCreate, db: AsyncSession = Depends(get_db)):
    """Create a new evaluation"""
    # Check if user exists
    user_result = await db.execute(select(User).where(User.id == evaluation.user_id))
    if not user_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if cycle exists
    cycle_result = await db.execute(select(Cycle).where(Cycle.id == evaluation.cycle_id))
    if not cycle_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Cycle not found")
    
    evaluation_data = evaluation.model_dump(exclude={"evaluation_competencies", "evaluation_objectives"})
    db_evaluation = Evaluation(**evaluation_data)
    db.add(db_evaluation)
    await db.flush()
    
    # Create evaluation competencies
    for ec_data in evaluation.evaluation_competencies or []:
        comp_result = await db.execute(select(Competency).where(Competency.id == ec_data.competency_id))
        if not comp_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail=f"Competency {ec_data.competency_id} not found")
        db_ec = EvaluationCompetency(**ec_data.model_dump(), evaluation_id=db_evaluation.id)
        db.add(db_ec)
    
    # Create evaluation objectives
    for eo_data in evaluation.evaluation_objectives or []:
        obj_result = await db.execute(select(Objective).where(Objective.id == eo_data.objective_id))
        if not obj_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail=f"Objective {eo_data.objective_id} not found")
        db_eo = EvaluationObjective(**eo_data.model_dump(), evaluation_id=db_evaluation.id)
        db.add(db_eo)
    
    await db.commit()
    await db.refresh(db_evaluation)
    
    # Reload with relationships
    query = select(Evaluation).options(
        selectinload(Evaluation.user),
        selectinload(Evaluation.evaluation_competencies).selectinload(EvaluationCompetency.competency),
        selectinload(Evaluation.evaluation_objectives).selectinload(EvaluationObjective.objective)
    ).where(Evaluation.id == db_evaluation.id)
    result = await db.execute(query)
    return result.scalar_one()


@router.put("/{evaluation_id}", response_model=EvaluationRead)
async def update_evaluation(
    evaluation_id: str,
    evaluation_update: EvaluationUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an evaluation"""
    result = await db.execute(select(Evaluation).where(Evaluation.id == evaluation_id))
    db_evaluation = result.scalar_one_or_none()
    if not db_evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    update_data = evaluation_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_evaluation, field, value)
    
    await db.commit()
    await db.refresh(db_evaluation)
    
    # Reload with relationships
    query = select(Evaluation).options(
        selectinload(Evaluation.user),
        selectinload(Evaluation.evaluation_competencies).selectinload(EvaluationCompetency.competency),
        selectinload(Evaluation.evaluation_objectives).selectinload(EvaluationObjective.objective)
    ).where(Evaluation.id == evaluation_id)
    result = await db.execute(query)
    return result.scalar_one()


@router.delete("/{evaluation_id}", status_code=204)
async def delete_evaluation(evaluation_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an evaluation"""
    result = await db.execute(select(Evaluation).where(Evaluation.id == evaluation_id))
    db_evaluation = result.scalar_one_or_none()
    if not db_evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    db.delete(db_evaluation)
    await db.commit()
    return None

