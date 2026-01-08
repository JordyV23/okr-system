from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from datetime import datetime, date, timedelta
from decimal import Decimal
from typing import List
from database.database import get_db
from models.models import (
    Objective, Cycle, CheckIn, User, Department, Evaluation
)
from schemas.schemas import (
    DashboardMetrics, DepartmentProgress, MonthlyProgress, CycleRead
)

# Temporary: disable database dependency for testing
async def mock_get_db():
    # Mock database session for testing
    class MockSession:
        pass
    return MockSession()

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/current-cycle", response_model=CycleRead)
async def get_current_cycle(db = Depends(mock_get_db)):
    """Get the current active cycle"""
    # Temporary mock data for testing
    import uuid
    return CycleRead(
        id=str(uuid.uuid4()),
        name="Q1 2026",
        start_date=date(2026, 1, 1),
        end_date=date(2026, 3, 31),
        is_active=True,
        created_at=datetime.utcnow()
    )


@router.get("/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics(
    cycle_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Get dashboard metrics"""
    # Get current cycle if not provided
    if not cycle_id:
        result = await db.execute(
            select(Cycle).where(Cycle.is_active == True).order_by(Cycle.created_at.desc())
        )
        cycle = result.scalar_one_or_none()
        if cycle:
            cycle_id = cycle.id
    
    if not cycle_id:
        # Return empty metrics if no cycle
        return DashboardMetrics(
            total_objectives=0,
            completed_objectives=0,
            avg_progress=Decimal("0"),
            on_track_percentage=Decimal("0"),
            at_risk_count=0,
            pending_check_ins=0,
            upcoming_deadlines=0
        )
    
    # Get objectives for the cycle
    objectives_query = select(Objective).where(Objective.cycle_id == cycle_id)
    objectives_result = await db.execute(objectives_query)
    objectives = objectives_result.scalars().all()
    
    total_objectives = len(objectives)
    completed_objectives = sum(1 for obj in objectives if obj.status == "completed")
    at_risk_count = sum(1 for obj in objectives if obj.status == "at-risk")
    
    # Calculate average progress
    if objectives:
        avg_progress = sum(float(obj.progress) for obj in objectives) / len(objectives)
        on_track_count = sum(1 for obj in objectives if obj.status == "on-track")
        on_track_percentage = (on_track_count / len(objectives)) * 100
    else:
        avg_progress = Decimal("0")
        on_track_percentage = Decimal("0")
    
    # Get pending check-ins (check-ins from last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    check_ins_query = select(CheckIn).join(Objective).where(
        CheckIn.created_at >= week_ago,
        Objective.cycle_id == cycle_id
    )
    check_ins_result = await db.execute(check_ins_query)
    pending_check_ins = len(check_ins_result.scalars().all())
    
    # Get upcoming deadlines (objectives ending in next 7 days)
    next_week = date.today() + timedelta(days=7)
    upcoming_deadlines = sum(
        1 for obj in objectives
        if obj.end_date <= next_week and obj.status != "completed"
    )
    
    return DashboardMetrics(
        total_objectives=total_objectives,
        completed_objectives=completed_objectives,
        avg_progress=Decimal(str(avg_progress)),
        on_track_percentage=Decimal(str(on_track_percentage)),
        at_risk_count=at_risk_count,
        pending_check_ins=pending_check_ins,
        upcoming_deadlines=upcoming_deadlines
    )


@router.get("/department-progress", response_model=List[DepartmentProgress])
async def get_department_progress(
    cycle_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Get progress by department"""
    # Get current cycle if not provided
    if not cycle_id:
        result = await db.execute(
            select(Cycle).where(Cycle.is_active == True).order_by(Cycle.created_at.desc())
        )
        cycle = result.scalar_one_or_none()
        if cycle:
            cycle_id = cycle.id
    
    if not cycle_id:
        return []
    
    # Get departments
    depts_result = await db.execute(select(Department))
    departments = depts_result.scalars().all()
    
    department_progress_list = []
    for dept in departments:
        # Get users in department
        users_result = await db.execute(
            select(User).where(User.department_id == dept.id)
        )
        users = users_result.scalars().all()
        user_ids = [user.id for user in users]
        
        if not user_ids:
            continue
        
        # Get objectives for users in this department
        objectives_result = await db.execute(
            select(Objective).where(
                Objective.cycle_id == cycle_id,
                Objective.owner_id.in_(user_ids)
            )
        )
        objectives = objectives_result.scalars().all()
        
        if objectives:
            avg_progress = sum(float(obj.progress) for obj in objectives) / len(objectives)
            department_progress_list.append(
                DepartmentProgress(
                    name=dept.name,
                    progress=Decimal(str(avg_progress)),
                    objectives=len(objectives)
                )
            )
    
    return department_progress_list


@router.get("/monthly-progress", response_model=List[MonthlyProgress])
async def get_monthly_progress(
    cycle_id: str = None,
    db: AsyncSession = Depends(get_db)
):
    """Get monthly progress for the cycle"""
    # Get current cycle if not provided
    if not cycle_id:
        result = await db.execute(
            select(Cycle).where(Cycle.is_active == True).order_by(Cycle.created_at.desc())
        )
        cycle = result.scalar_one_or_none()
        if cycle:
            cycle_id = cycle.id
    
    if not cycle_id:
        return []
    
    result = await db.execute(select(Cycle).where(Cycle.id == cycle_id))
    cycle = result.scalar_one_or_none()
    if not cycle:
        return []
    
    # Get objectives for the cycle
    objectives_result = await db.execute(
        select(Objective).where(Objective.cycle_id == cycle_id)
    )
    objectives = objectives_result.scalars().all()
    
    # Get check-ins for objectives in this cycle
    check_ins_result = await db.execute(
        select(CheckIn).join(Objective).where(Objective.cycle_id == cycle_id)
    )
    check_ins = check_ins_result.scalars().all()
    
    # Group by month and calculate average progress
    monthly_data = {}
    month_names = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    
    current_date = cycle.start_date
    while current_date <= cycle.end_date:
        month_key = current_date.strftime("%Y-%m")
        if month_key not in monthly_data:
            monthly_data[month_key] = {
                "month": month_names[current_date.month - 1],
                "progress_values": []
            }
        current_date += timedelta(days=30)
    
    # Calculate progress based on check-ins (simplified - in real app would be more complex)
    for check_in in check_ins:
        month_key = check_in.created_at.strftime("%Y-%m")
        if month_key in monthly_data:
            monthly_data[month_key]["progress_values"].append(float(check_in.progress))
    
    monthly_progress_list = []
    for month_key, data in sorted(monthly_data.items()):
        if data["progress_values"]:
            avg_progress = sum(data["progress_values"]) / len(data["progress_values"])
        else:
            avg_progress = 0
        monthly_progress_list.append(
            MonthlyProgress(
                month=data["month"],
                progress=Decimal(str(avg_progress))
            )
        )
    
    return monthly_progress_list

