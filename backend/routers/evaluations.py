from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional
from datetime import datetime
from decimal import Decimal
from database.database import get_db
from models.models import Evaluation, EvaluationCompetency, EvaluationObjective, User, Cycle, Competency, Objective
from schemas.schemas import (
    EvaluationCreate, EvaluationRead, EvaluationUpdate,
    EvaluationCompetencyCreate, EvaluationObjectiveCreate,
    EvaluationCompetencyRead, EvaluationObjectiveRead,
    UserRead, CompetencyRead, ObjectiveRead
)

# Temporary: disable database dependency for testing
async def mock_get_db():
    # Mock database session for testing
    class MockSession:
        pass
    return MockSession()

router = APIRouter(prefix="/api/evaluations", tags=["evaluations"])

# Mock data for evaluations
MOCK_EVALUATIONS = [
    {
        "id": "eval-1",
        "user_id": "user-1",
        "cycle_id": "cycle-1",
        "period": "Q1 2024",
        "phase": "self-evaluation",
        "objectives_weight": Decimal("70.0"),
        "competencies_weight": Decimal("30.0"),
        "objectives_score": Decimal("85.0"),
        "competencies_score": Decimal("4.2"),
        "final_score": Decimal("78.5"),
        "strengths": "Strong analytical skills and project management",
        "improvements": "Could improve communication in team settings",
        "development_actions": "Attend communication workshop",
        "created_at": datetime(2024, 1, 15, 10, 0, 0),
        "updated_at": datetime(2024, 1, 15, 10, 0, 0),
        "user": {
            "id": "user-1",
            "email": "john.doe@company.com",
            "full_name": "John Doe",
            "role": "Software Engineer",
            "department_id": "dept-1",
            "manager_id": "user-2",
            "is_active": True
        },
        "evaluation_competencies": [
            {
                "id": "ec-1",
                "evaluation_id": "eval-1",
                "competency_id": "comp-1",
                "self_score": 4,
                "leader_score": 4,
                "expected_level": 4,
                "comment": "Good technical skills",
                "competency": {
                    "id": "comp-1",
                    "name": "Technical Expertise",
                    "description": "Ability to apply technical knowledge",
                    "category": "Technical",
                    "levels": 5,
                    "level_descriptions": {"1": "Basic", "2": "Intermediate", "3": "Advanced", "4": "Expert", "5": "Master"},
                    "created_at": datetime(2024, 1, 1, 0, 0, 0),
                    "updated_at": datetime(2024, 1, 1, 0, 0, 0)
                }
            }
        ],
        "evaluation_objectives": [
            {
                "id": "eo-1",
                "evaluation_id": "eval-1",
                "objective_id": "obj-1",
                "self_score": Decimal("90.0"),
                "leader_score": Decimal("85.0"),
                "weight": Decimal("50.0"),
                "target_progress": Decimal("100.0"),
                "comment": "Exceeded expectations",
                "objective": {
                    "id": "obj-1",
                    "title": "Complete project X",
                    "description": "Deliver project X by end of quarter",
                    "type": "commitment",
                    "start_date": datetime(2024, 1, 1).date(),
                    "end_date": datetime(2024, 3, 31).date(),
                    "methodology": "OKR",
                    "owner_id": "user-1",
                    "created_at": datetime(2024, 1, 1, 0, 0, 0),
                    "updated_at": datetime(2024, 1, 1, 0, 0, 0),
                    "key_results": [
                        {
                            "id": "kr-1",
                            "objective_id": "obj-1",
                            "title": "Implement feature A",
                            "description": "Complete implementation of feature A",
                            "target_value": Decimal("100.0"),
                            "current_value": Decimal("100.0"),
                            "unit": "percent",
                            "created_at": datetime(2024, 1, 1, 0, 0, 0),
                            "updated_at": datetime(2024, 1, 1, 0, 0, 0)
                        }
                    ],
                    "owner": {
                        "id": "user-1",
                        "email": "john.doe@company.com",
                        "full_name": "John Doe",
                        "role": "Software Engineer",
                        "department_id": "dept-1",
                        "manager_id": "user-2",
                        "is_active": True
                    }
                }
            }
        ]
    }
]


@router.get("/", response_model=List[EvaluationRead])
async def get_evaluations(
    skip: int = 0,
    limit: int = 100,
    user_id: Optional[str] = None,
    cycle_id: Optional[str] = None,
    phase: Optional[str] = None,
    db: AsyncSession = Depends(mock_get_db)
):
    """Get all evaluations with optional filtering"""
    # Filter mock data based on parameters
    filtered_evaluations = MOCK_EVALUATIONS
    
    if user_id:
        filtered_evaluations = [e for e in filtered_evaluations if e["user_id"] == user_id]
    if cycle_id:
        filtered_evaluations = [e for e in filtered_evaluations if e["cycle_id"] == cycle_id]
    if phase:
        filtered_evaluations = [e for e in filtered_evaluations if e["phase"] == phase]
    
    # Apply pagination
    paginated_evaluations = filtered_evaluations[skip:skip + limit]
    
    # Convert to Pydantic models
    return [EvaluationRead(**eval_data) for eval_data in paginated_evaluations]


@router.get("/{evaluation_id}", response_model=EvaluationRead)
async def get_evaluation(evaluation_id: str, db: AsyncSession = Depends(mock_get_db)):
    """Get a specific evaluation by ID"""
    # Find evaluation in mock data
    evaluation = next((e for e in MOCK_EVALUATIONS if e["id"] == evaluation_id), None)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return EvaluationRead(**evaluation)


@router.post("/", response_model=EvaluationRead, status_code=201)
async def create_evaluation(evaluation: EvaluationCreate, db: AsyncSession = Depends(mock_get_db)):
    """Create a new evaluation"""
    # Generate a new ID
    new_id = f"eval-{len(MOCK_EVALUATIONS) + 1}"
    
    # Create the evaluation data
    evaluation_data = evaluation.model_dump(exclude={"evaluation_competencies", "evaluation_objectives"})
    evaluation_data.update({
        "id": new_id,
        "created_at": datetime.now(),
        "updated_at": datetime.now(),
        "user": {
            "id": evaluation.user_id,
            "email": "mock@example.com",
            "full_name": "Mock User",
            "role": "Employee",
            "department_id": "dept-1",
            "manager_id": None,
            "is_active": True
        },
        "evaluation_competencies": [],
        "evaluation_objectives": []
    })
    
    # Add competencies
    for i, ec_data in enumerate(evaluation.evaluation_competencies or []):
        ec_dict = ec_data.model_dump()
        ec_dict.update({
            "id": f"ec-{len(MOCK_EVALUATIONS) + 1}-{i + 1}",
            "evaluation_id": new_id,
            "competency": {
                "id": ec_data.competency_id,
                "name": "Mock Competency",
                "description": "Mock competency description",
                "category": "Technical",
                "levels": 5,
                "level_descriptions": {"1": "Basic", "2": "Intermediate", "3": "Advanced", "4": "Expert", "5": "Master"},
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
        })
        evaluation_data["evaluation_competencies"].append(ec_dict)
    
    # Add objectives
    for i, eo_data in enumerate(evaluation.evaluation_objectives or []):
        eo_dict = eo_data.model_dump()
        eo_dict.update({
            "id": f"eo-{len(MOCK_EVALUATIONS) + 1}-{i + 1}",
            "evaluation_id": new_id,
            "objective": {
                "id": eo_data.objective_id,
                "title": "Mock Objective",
                "description": "Mock objective description",
                "type": "commitment",
                "start_date": datetime.now().date(),
                "end_date": (datetime.now().replace(month=12, day=31)).date(),
                "methodology": "OKR",
                "owner_id": evaluation.user_id,
                "created_at": datetime.now(),
                "updated_at": datetime.now(),
                "key_results": [],
                "owner": {
                    "id": evaluation.user_id,
                    "email": "mock@example.com",
                    "full_name": "Mock User",
                    "role": "Employee",
                    "department_id": "dept-1",
                    "manager_id": None,
                    "is_active": True
                }
            }
        })
        evaluation_data["evaluation_objectives"].append(eo_dict)
    
    # Add to mock data
    MOCK_EVALUATIONS.append(evaluation_data)
    
    return EvaluationRead(**evaluation_data)


@router.put("/{evaluation_id}", response_model=EvaluationRead)
async def update_evaluation(
    evaluation_id: str,
    evaluation_update: EvaluationUpdate,
    db: AsyncSession = Depends(mock_get_db)
):
    """Update an evaluation"""
    # Find evaluation in mock data
    evaluation = next((e for e in MOCK_EVALUATIONS if e["id"] == evaluation_id), None)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Update the evaluation data
    update_data = evaluation_update.model_dump(exclude_unset=True)
    evaluation.update(update_data)
    evaluation["updated_at"] = datetime.now()
    
    return EvaluationRead(**evaluation)


@router.delete("/{evaluation_id}", status_code=204)
async def delete_evaluation(evaluation_id: str, db: AsyncSession = Depends(mock_get_db)):
    """Delete an evaluation"""
    # Find and remove evaluation from mock data
    evaluation = next((e for e in MOCK_EVALUATIONS if e["id"] == evaluation_id), None)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    MOCK_EVALUATIONS.remove(evaluation)
    return None

