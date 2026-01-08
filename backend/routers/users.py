from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from database.database import get_db
from models.models import User, Department
from schemas.schemas import UserCreate, UserRead, UserUpdate, UserWithDepartment

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=List[UserRead])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    department_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Get all users with optional filtering"""
    query = select(User)
    if department_id:
        query = query.where(User.department_id == department_id)
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    users = result.scalars().all()
    return users


@router.get("/{user_id}", response_model=UserWithDepartment)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get a specific user by ID"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/", response_model=UserRead, status_code=201)
async def create_user(user: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user"""
    # Check if department exists
    dept_result = await db.execute(select(Department).where(Department.id == user.department_id))
    if not dept_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Department not found")
    
    # Check if email already exists
    email_result = await db.execute(select(User).where(User.email == user.email))
    if email_result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    db_user = User(**user.model_dump())
    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.put("/{user_id}", response_model=UserRead)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update a user"""
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    await db.commit()
    await db.refresh(db_user)
    return db_user


@router.delete("/{user_id}", status_code=204)
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a user"""
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(db_user)
    await db.commit()
    return None

