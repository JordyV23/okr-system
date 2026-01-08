from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


# ========== Organization Schemas ==========
class OrganizationBase(BaseModel):
    name: str
    logo_url: Optional[str] = None
    settings: dict = {}

    model_config = ConfigDict(from_attributes=True)

class OrganizationCreate(OrganizationBase):
    pass

class OrganizationRead(OrganizationBase):
    id: str
    created_at: datetime

# ========== Department Schemas ==========
class DepartmentBase(BaseModel):
    name: str
    organization_id: str

    model_config = ConfigDict(from_attributes=True)

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentRead(DepartmentBase):
    id: str

# ========== User Schemas ==========
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str
    department_id: str
    manager_id: Optional[str] = None
    is_active: bool = True

    model_config = ConfigDict(from_attributes=True)

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: Optional[str] = None
    department_id: Optional[str] = None
    manager_id: Optional[str] = None
    is_active: Optional[bool] = None

    model_config = ConfigDict(from_attributes=True)

class UserRead(UserBase):
    id: str

class UserWithDepartment(UserRead):
    department: Optional[DepartmentRead] = None

# ========== Cycle Schemas ==========
class CycleBase(BaseModel):
    name: str
    start_date: date
    end_date: date
    is_active: bool = False

    model_config = ConfigDict(from_attributes=True)

class CycleCreate(CycleBase):
    pass

class CycleRead(CycleBase):
    id: str
    created_at: datetime

# ========== KeyResult Schemas ==========
class KeyResultBase(BaseModel):
    title: str
    metric: Optional[str] = None
    target: Decimal
    current: Decimal = Decimal("0.0")
    unit: str
    progress: Decimal = Decimal("0.0")

    model_config = ConfigDict(from_attributes=True)

class KeyResultCreate(KeyResultBase):
    pass

class KeyResultUpdate(BaseModel):
    title: Optional[str] = None
    metric: Optional[str] = None
    target: Optional[Decimal] = None
    current: Optional[Decimal] = None
    unit: Optional[str] = None
    progress: Optional[Decimal] = None

    model_config = ConfigDict(from_attributes=True)

class KeyResultRead(KeyResultBase):
    id: str
    objective_id: str
    created_at: datetime
    updated_at: datetime

# ========== Objective Schemas ==========
class ObjectiveBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: str  # strategic, operational, innovation, development
    status: str = "on-track"  # on-track, at-risk, delayed, completed
    approval_status: str = "pending"  # pending, approved, rejected
    progress: Decimal = Decimal("0.0")
    weight: Decimal
    start_date: date
    end_date: date
    methodology: str = "okr"  # okr or smart
    cycle_id: str
    owner_id: str

    model_config = ConfigDict(from_attributes=True)

class ObjectiveCreate(ObjectiveBase):
    key_results: Optional[List[KeyResultCreate]] = []

class ObjectiveUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    approval_status: Optional[str] = None
    progress: Optional[Decimal] = None
    weight: Optional[Decimal] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    methodology: Optional[str] = None
    owner_id: Optional[str] = None
    key_results: Optional[List[KeyResultCreate]] = None

    model_config = ConfigDict(from_attributes=True)

class ObjectiveRead(ObjectiveBase):
    id: str
    created_at: datetime
    updated_at: datetime
    key_results: List[KeyResultRead] = []
    owner: Optional[UserRead] = None

# ========== CheckIn Schemas ==========
class CheckInBase(BaseModel):
    objective_id: str
    user_id: str
    progress: Decimal
    previous_progress: Decimal
    comment: Optional[str] = None
    blockers: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CheckInCreate(CheckInBase):
    pass

class CheckInUpdate(BaseModel):
    progress: Optional[Decimal] = None
    previous_progress: Optional[Decimal] = None
    comment: Optional[str] = None
    blockers: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CheckInRead(CheckInBase):
    id: str
    created_at: datetime
    objective: Optional[ObjectiveRead] = None
    user: Optional[UserRead] = None

# ========== Competency Schemas ==========
class CompetencyBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str  # core, leadership, technical, functional
    levels: int = 5
    level_descriptions: dict = {}

    model_config = ConfigDict(from_attributes=True)

class CompetencyCreate(CompetencyBase):
    pass

class CompetencyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    levels: Optional[int] = None
    level_descriptions: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)

class CompetencyRead(CompetencyBase):
    id: str
    created_at: datetime
    updated_at: datetime

# ========== EvaluationCompetency Schemas ==========
class EvaluationCompetencyBase(BaseModel):
    competency_id: str
    self_score: Optional[int] = None  # 1-5
    leader_score: Optional[int] = None  # 1-5
    expected_level: int
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EvaluationCompetencyCreate(EvaluationCompetencyBase):
    pass

class EvaluationCompetencyRead(EvaluationCompetencyBase):
    id: str
    evaluation_id: str
    competency: Optional[CompetencyRead] = None

# ========== EvaluationObjective Schemas ==========
class EvaluationObjectiveBase(BaseModel):
    objective_id: str
    self_score: Optional[Decimal] = None  # 0-100
    leader_score: Optional[Decimal] = None  # 0-100
    weight: Decimal
    target_progress: Decimal
    comment: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EvaluationObjectiveCreate(EvaluationObjectiveBase):
    pass

class EvaluationObjectiveRead(EvaluationObjectiveBase):
    id: str
    evaluation_id: str
    objective: Optional[ObjectiveRead] = None

# ========== Evaluation Schemas ==========
class EvaluationBase(BaseModel):
    user_id: str
    cycle_id: str
    period: str
    phase: str  # self-evaluation, leader-evaluation, calibration, feedback, completed
    objectives_weight: Decimal = Decimal("70.0")
    competencies_weight: Decimal = Decimal("30.0")
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    development_actions: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EvaluationCreate(EvaluationBase):
    evaluation_competencies: Optional[List[EvaluationCompetencyCreate]] = []
    evaluation_objectives: Optional[List[EvaluationObjectiveCreate]] = []

class EvaluationUpdate(BaseModel):
    phase: Optional[str] = None
    objectives_score: Optional[Decimal] = None
    competencies_score: Optional[Decimal] = None
    final_score: Optional[Decimal] = None
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    development_actions: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class EvaluationRead(EvaluationBase):
    id: str
    objectives_score: Optional[Decimal] = None
    competencies_score: Optional[Decimal] = None
    final_score: Optional[Decimal] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserRead] = None
    evaluation_competencies: List[EvaluationCompetencyRead] = []
    evaluation_objectives: List[EvaluationObjectiveRead] = []

# ========== PDIAction Schemas ==========
class PDIActionBase(BaseModel):
    type: str  # training, project, mentoring, rotation, coaching, certification, other
    description: str
    deadline: Optional[date] = None
    responsible_id: Optional[str] = None
    success_indicator: Optional[str] = None
    status: str = "pending"  # pending, in-progress, completed, cancelled

    model_config = ConfigDict(from_attributes=True)

class PDIActionCreate(PDIActionBase):
    pass

class PDIActionUpdate(BaseModel):
    type: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    responsible_id: Optional[str] = None
    success_indicator: Optional[str] = None
    status: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PDIActionRead(PDIActionBase):
    id: str
    pdi_id: str
    created_at: datetime
    updated_at: datetime
    responsible: Optional[UserRead] = None

# ========== PDI Schemas ==========
class PDIBase(BaseModel):
    user_id: str
    cycle_id: str
    period: str
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    career_goals: Optional[str] = None
    resources_needed: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PDICreate(PDIBase):
    actions: Optional[List[PDIActionCreate]] = []

class PDIUpdate(BaseModel):
    strengths: Optional[str] = None
    improvements: Optional[str] = None
    career_goals: Optional[str] = None
    resources_needed: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class PDIRead(PDIBase):
    id: str
    created_at: datetime
    updated_at: datetime
    user: Optional[UserRead] = None
    actions: List[PDIActionRead] = []

# ========== Dashboard Schemas ==========
class DashboardMetrics(BaseModel):
    total_objectives: int
    completed_objectives: int
    avg_progress: Decimal
    on_track_percentage: Decimal
    at_risk_count: int
    pending_check_ins: int
    upcoming_deadlines: int

class DepartmentProgress(BaseModel):
    name: str
    progress: Decimal
    objectives: int

class MonthlyProgress(BaseModel):
    month: str
    progress: Decimal

# ========== Settings Schemas ==========
class SettingsBase(BaseModel):
    evaluation_scale_objectives: str
    evaluation_scale_competencies: str
    weight_objectives: int
    weight_competencies: int

class SettingsRead(SettingsBase):
    pass

class SettingsUpdate(SettingsBase):
    pass
