import uuid
from datetime import datetime, date
from typing import List, Optional
from sqlalchemy import String, ForeignKey, Boolean, DateTime, JSON, Numeric, Integer, Text, Date, CLOB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    # Oracle a veces requiere manejar nombres de tablas en mayúsculas o específicos
    pass


# --- MODELOS ---


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255))
    logo_url: Mapped[Optional[str]] = mapped_column(String(500))
    # En Oracle 21c+ existe tipo JSON, en anteriores usar CLOB con JSON válido
    settings: Mapped[dict] = mapped_column(JSON().with_variant(CLOB(), 'oracle'), default={})
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    departments: Mapped[List["Department"]] = relationship(
        back_populates="organization"
    )


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    department_id: Mapped[str] = mapped_column(ForeignKey("departments.id"))
    manager_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    full_name: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    department: Mapped["Department"] = relationship(back_populates="users")
    manager: Mapped[Optional["User"]] = relationship("User", remote_side=[id], back_populates="subordinates")
    subordinates: Mapped[List["User"]] = relationship("User", back_populates="manager")
    objectives: Mapped[List["Objective"]] = relationship("Objective", foreign_keys="[Objective.owner_id]", back_populates="owner")
    check_ins: Mapped[List["CheckIn"]] = relationship("CheckIn", back_populates="user")
    evaluations: Mapped[List["Evaluation"]] = relationship("Evaluation", foreign_keys="[Evaluation.user_id]", back_populates="user")
    pdis: Mapped[List["PDI"]] = relationship("PDI", back_populates="user")


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id"))
    name: Mapped[str] = mapped_column(String(255))

    organization: Mapped["Organization"] = relationship(back_populates="departments")
    users: Mapped[List["User"]] = relationship(back_populates="department")


class Cycle(Base):
    __tablename__ = "cycles"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100))  # e.g., "H2 2024"
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    objectives: Mapped[List["Objective"]] = relationship("Objective", back_populates="cycle")


class Objective(Base):
    __tablename__ = "objectives"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    cycle_id: Mapped[str] = mapped_column(ForeignKey("cycles.id"))
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    title: Mapped[str] = mapped_column(String(500))
    description: Mapped[Optional[str]] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String(50))  # strategic, operational, innovation, development
    status: Mapped[str] = mapped_column(String(50), default="on-track")  # on-track, at-risk, delayed, completed
    approval_status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, approved, rejected
    progress: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)  # 0-100
    weight: Mapped[float] = mapped_column(Numeric(5, 2))  # percentage weight
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    methodology: Mapped[str] = mapped_column(String(20), default="okr")  # okr or smart
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    cycle: Mapped["Cycle"] = relationship("Cycle", back_populates="objectives")
    owner: Mapped["User"] = relationship("User", back_populates="objectives")
    key_results: Mapped[List["KeyResult"]] = relationship("KeyResult", back_populates="objective", cascade="all, delete-orphan")
    check_ins: Mapped[List["CheckIn"]] = relationship("CheckIn", back_populates="objective")


class KeyResult(Base):
    __tablename__ = "key_results"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    objective_id: Mapped[str] = mapped_column(ForeignKey("objectives.id"))
    title: Mapped[str] = mapped_column(String(500))
    metric: Mapped[Optional[str]] = mapped_column(String(255))
    target: Mapped[float] = mapped_column(Numeric(10, 2))
    current: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    unit: Mapped[str] = mapped_column(String(50))  # %, puntos, horas, etc.
    progress: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)  # 0-100
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    objective: Mapped["Objective"] = relationship("Objective", back_populates="key_results")


class CheckIn(Base):
    __tablename__ = "check_ins"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    objective_id: Mapped[str] = mapped_column(ForeignKey("objectives.id"))
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    progress: Mapped[float] = mapped_column(Numeric(5, 2))  # 0-100
    previous_progress: Mapped[float] = mapped_column(Numeric(5, 2))
    comment: Mapped[Optional[str]] = mapped_column(Text)
    blockers: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    
    objective: Mapped["Objective"] = relationship("Objective", back_populates="check_ins")
    user: Mapped["User"] = relationship("User", back_populates="check_ins")


class Competency(Base):
    __tablename__ = "competencies"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(255))
    description: Mapped[Optional[str]] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(50))  # core, leadership, technical, functional
    levels: Mapped[int] = mapped_column(Integer, default=5)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=True)  # Logical delete flag

    level_descriptions: Mapped[dict] = mapped_column(JSON().with_variant(CLOB(), 'oracle'), default={})
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    
    evaluation_competencies: Mapped[List["EvaluationCompetency"]] = relationship("EvaluationCompetency", back_populates="competency", cascade="all, delete-orphan")


class Evaluation(Base):
    __tablename__ = "evaluations"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    cycle_id: Mapped[str] = mapped_column(ForeignKey("cycles.id"))
    period: Mapped[str] = mapped_column(String(50))  # e.g., "H2 2024"
    phase: Mapped[str] = mapped_column(String(50))  # self-evaluation, leader-evaluation, calibration, feedback, completed
    objectives_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    competencies_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    final_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))
    objectives_weight: Mapped[float] = mapped_column(Numeric(5, 2), default=70.0)
    competencies_weight: Mapped[float] = mapped_column(Numeric(5, 2), default=30.0)
    strengths: Mapped[Optional[str]] = mapped_column(Text)
    improvements: Mapped[Optional[str]] = mapped_column(Text)
    development_actions: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user: Mapped["User"] = relationship("User", back_populates="evaluations")
    cycle: Mapped["Cycle"] = relationship("Cycle")
    evaluation_competencies: Mapped[List["EvaluationCompetency"]] = relationship("EvaluationCompetency", back_populates="evaluation", cascade="all, delete-orphan")
    evaluation_objectives: Mapped[List["EvaluationObjective"]] = relationship("EvaluationObjective", back_populates="evaluation", cascade="all, delete-orphan")


class EvaluationCompetency(Base):
    __tablename__ = "evaluation_competencies"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    evaluation_id: Mapped[str] = mapped_column(ForeignKey("evaluations.id"))
    competency_id: Mapped[str] = mapped_column(ForeignKey("competencies.id"))
    self_score: Mapped[Optional[int]] = mapped_column(Integer)  # 1-5
    leader_score: Mapped[Optional[int]] = mapped_column(Integer)  # 1-5
    expected_level: Mapped[int] = mapped_column(Integer)
    comment: Mapped[Optional[str]] = mapped_column(Text)
    
    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="evaluation_competencies")
    competency: Mapped["Competency"] = relationship("Competency", back_populates="evaluation_competencies")


class EvaluationObjective(Base):
    __tablename__ = "evaluation_objectives"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    evaluation_id: Mapped[str] = mapped_column(ForeignKey("evaluations.id"))
    objective_id: Mapped[str] = mapped_column(ForeignKey("objectives.id"))
    self_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))  # 0-100
    leader_score: Mapped[Optional[float]] = mapped_column(Numeric(5, 2))  # 0-100
    weight: Mapped[float] = mapped_column(Numeric(5, 2))
    target_progress: Mapped[float] = mapped_column(Numeric(5, 2))
    comment: Mapped[Optional[str]] = mapped_column(Text)
    
    evaluation: Mapped["Evaluation"] = relationship("Evaluation", back_populates="evaluation_objectives")
    objective: Mapped["Objective"] = relationship("Objective")


class PDI(Base):
    __tablename__ = "pdis"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    cycle_id: Mapped[str] = mapped_column(ForeignKey("cycles.id"))
    period: Mapped[str] = mapped_column(String(50))
    strengths: Mapped[Optional[str]] = mapped_column(Text)
    improvements: Mapped[Optional[str]] = mapped_column(Text)
    career_goals: Mapped[Optional[str]] = mapped_column(Text)
    resources_needed: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user: Mapped["User"] = relationship("User", back_populates="pdis")
    cycle: Mapped["Cycle"] = relationship("Cycle")
    actions: Mapped[List["PDIAction"]] = relationship("PDIAction", back_populates="pdi", cascade="all, delete-orphan")


class PDIAction(Base):
    __tablename__ = "pdi_actions"
    
    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    pdi_id: Mapped[str] = mapped_column(ForeignKey("pdis.id"))
    type: Mapped[str] = mapped_column(String(50))  # training, project, mentoring, rotation, coaching, certification, other
    description: Mapped[str] = mapped_column(Text)
    deadline: Mapped[Optional[date]] = mapped_column(Date)
    responsible_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"))
    success_indicator: Mapped[Optional[str]] = mapped_column(String(500))
    status: Mapped[str] = mapped_column(String(50), default="pending")  # pending, in-progress, completed, cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    pdi: Mapped["PDI"] = relationship("PDI", back_populates="actions")
    responsible: Mapped[Optional["User"]] = relationship("User")
