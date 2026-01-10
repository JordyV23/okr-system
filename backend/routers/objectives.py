from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime, date
from database.database import get_db
from models.models import Objective, KeyResult, User, Cycle
from schemas.schemas import ObjectiveCreate, ObjectiveRead, ObjectiveUpdate, KeyResultCreate

router = APIRouter(prefix="/api/objectives", tags=["objectives"])


def calculate_objective_status(objective: Objective) -> str:
    """
    Calculate automatic objective status based on progress and time
    
    Args:
        objective: Objective instance with its key results
        
    Returns:
        str: Status ("on-track", "at-risk", "delayed", "completed")
    """
    current_date = date.today()
    
    # If objective is completed, return completed
    if objective.progress >= 100:
        return "completed"
    
    # Check if objective hasn't started yet
    if current_date < objective.start_date:
        return "on-track"
    
    # Calculate total duration and elapsed time
    total_duration = (objective.end_date - objective.start_date).days
    if total_duration <= 0:
        total_duration = 1  # Avoid division by zero
    
    elapsed_days = (current_date - objective.start_date).days
    time_percentage = min(elapsed_days / total_duration, 1.0)
    
    # Expected progress based on time
    expected_progress = time_percentage * 100
    
    # Calculate key results progress
    kr_progress = 0
    if objective.key_results:
        kr_progress = sum(kr.progress or 0 for kr in objective.key_results) / len(objective.key_results)
    
    # Use the minimum between objective progress and key results progress
    actual_progress = min(objective.progress or 0, kr_progress)
    
    # Determine status based on progress vs expected time
    days_remaining = (objective.end_date - current_date).days
    
    if days_remaining < 0:
        # Objective is past due date
        return "delayed"
    elif days_remaining <= 7:
        # Within 7 days of deadline
        if actual_progress < 90:
            return "at-risk"
    elif actual_progress < (expected_progress * 0.7):
        # Progress is significantly behind expected time
        return "at-risk"
    elif actual_progress < (expected_progress * 0.5):
        # Progress is critically behind
        return "delayed"
    
    return "on-track"


async def update_objective_status(db: AsyncSession, objective_id: str) -> str:
    """
    Update objective status based on automatic calculation
    
    Args:
        db: Database session
        objective_id: Objective ID to update
        
    Returns:
        str: New status
    """
    query = select(Objective).options(
        selectinload(Objective.key_results)
    ).where(Objective.id == objective_id)
    result = await db.execute(query)
    objective = result.scalar_one_or_none()
    
    if not objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    new_status = calculate_objective_status(objective)
    objective.status = new_status
    objective.updated_at = datetime.utcnow()
    
    await db.commit()
    return new_status


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
    # Build query with relationships
    query = select(Objective).options(
        selectinload(Objective.key_results),
        selectinload(Objective.owner)
    )
    
    # Filter out logically deleted objectives
    query = query.where(Objective.is_deleted == False)
    
    # Apply filters
    if cycle_id:
        query = query.where(Objective.cycle_id == cycle_id)
    if owner_id:
        query = query.where(Objective.owner_id == owner_id)
    if status:
        query = query.where(Objective.status == status)
    
    # Order by updated_at desc
    query = query.order_by(Objective.updated_at.desc())
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
    ).where(Objective.id == objective_id, Objective.is_deleted == False)
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
    
    # Update status automatically
    db_objective.status = calculate_objective_status(db_objective)
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
    query = select(Objective).where(Objective.id == objective_id, Objective.is_deleted == False)
    result = await db.execute(query)
    db_objective = result.scalar_one_or_none()
    if not db_objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    update_data = objective_update.model_dump(exclude_unset=True, exclude={"key_results"})
    for field, value in update_data.items():
        setattr(db_objective, field, value)
    
    # Handle key results update if provided
    if objective_update.key_results is not None:
        # Get existing key results
        existing_krs_query = select(KeyResult).where(KeyResult.objective_id == objective_id)
        existing_krs_result = await db.execute(existing_krs_query)
        existing_krs = {kr.id: kr for kr in existing_krs_result.scalars().all()}
        
        # Track which key results to keep, update, or create
        incoming_kr_ids = set()
        
        for kr_data in objective_update.key_results:
            kr_dump = kr_data.model_dump()
            kr_id = kr_dump.get('id')
            
            if kr_id and kr_id in existing_krs:
                # Update existing key result
                existing_kr = existing_krs[kr_id]
                for field, value in kr_dump.items():
                    if field != 'id':  # Don't update the ID
                        setattr(existing_kr, field, value)
                incoming_kr_ids.add(kr_id)
            else:
                # Create new key result
                db_kr = KeyResult(**kr_dump, objective_id=objective_id)
                db.add(db_kr)
        
        # Delete key results that are no longer present
        from sqlalchemy import delete as sqlalchemy_delete
        krs_to_delete = set(existing_krs.keys()) - incoming_kr_ids
        if krs_to_delete:
            delete_query = sqlalchemy_delete(KeyResult).where(
                KeyResult.objective_id == objective_id,
                KeyResult.id.in_(krs_to_delete)
            )
            # Execute delete and ignore result
            await db.execute(delete_query)
    
    # Single commit with all changes
    await db.commit()
    await db.refresh(db_objective)
    
    # Update status automatically in the same transaction
    db_objective.status = calculate_objective_status(db_objective)
    await db.commit()
    
    # Reload with relationships
    query = select(Objective).options(
        selectinload(Objective.key_results),
        selectinload(Objective.owner)
    ).where(Objective.id == objective_id)
    result = await db.execute(query)
    return result.scalar_one()


@router.delete("/{objective_id}", status_code=204)
async def delete_objective(objective_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an objective (logical delete)"""
    result = await db.execute(select(Objective).where(Objective.id == objective_id, Objective.is_deleted == False))
    db_objective = result.scalar_one_or_none()
    if not db_objective:
        raise HTTPException(status_code=404, detail="Objective not found")
    
    # Logical delete - mark as deleted instead of physical deletion
    db_objective.is_deleted = True
    db_objective.deleted_at = datetime.utcnow()
    
    await db.commit()
    return None


@router.post("/{objective_id}/update-status", response_model=dict)
async def update_objective_status_endpoint(
    objective_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Manually trigger status recalculation for an objective"""
    new_status = await update_objective_status(db, objective_id)
    return {"status": new_status, "message": f"Objective status updated to {new_status}"}


@router.post("/batch-update-status", response_model=dict)
async def batch_update_status(
    db: AsyncSession = Depends(get_db)
):
    """Update status for all objectives"""
    query = select(Objective).options(selectinload(Objective.key_results))
    result = await db.execute(query)
    objectives = result.scalars().all()
    
    updated_count = 0
    for objective in objectives:
        new_status = calculate_objective_status(objective)
        if objective.status != new_status:
            objective.status = new_status
            objective.updated_at = datetime.utcnow()
            updated_count += 1
    
    await db.commit()
    return {"updated_count": updated_count, "total_count": len(objectives)}