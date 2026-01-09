import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from database.database import get_db
from models.models import Organization
from schemas.schemas import SettingsRead, SettingsUpdate

router = APIRouter(prefix="/api/settings", tags=["settings"])

@router.get("/", response_model=SettingsRead)
@router.get("", response_model=SettingsRead)
async def get_settings(db: AsyncSession = Depends(get_db)):
    """Get organization settings"""
    # Get the first organization (or create default if none exists)
    result = await db.execute(select(Organization).limit(1))
    organization = result.scalar_one_or_none()
    if not organization:
        # Create default organization if none exists
        organization = Organization(
            name="Default Organization",
            settings={
                "evaluation_scale_objectives": "1-5",
                "evaluation_scale_competencies": "1-5",
                "weight_objectives": 70,
                "weight_competencies": 30
            }
        )
        db.add(organization)
        await db.commit()
    
    # Handle Oracle JSON field that might be string
    settings_dict = organization.settings
    if isinstance(settings_dict, str):
        settings_dict = json.loads(settings_dict) if settings_dict else {}
    
    return SettingsRead(
        evaluation_scale_objectives=settings_dict.get("evaluation_scale_objectives", "1-5"),
        evaluation_scale_competencies=settings_dict.get("evaluation_scale_competencies", "1-5"),
        weight_objectives=settings_dict.get("weight_objectives", 70),
        weight_competencies=settings_dict.get("weight_competencies", 30)
    )

@router.put("/", response_model=SettingsRead)
@router.put("", response_model=SettingsRead)
async def update_settings(settings: SettingsUpdate, db: AsyncSession = Depends(get_db)):
    """Update organization settings"""
    result = await db.execute(select(Organization).limit(1))
    organization = result.scalar_one_or_none()
    if not organization:
        # Create default organization if none exists
        organization = Organization(
            name="Default Organization",
            settings={}
        )
        db.add(organization)
    
    # Handle Oracle JSON field that might be string
    settings_dict = organization.settings
    if isinstance(settings_dict, str):
        settings_dict = json.loads(settings_dict) if settings_dict else {}
    
    # Update settings
    settings_dict["evaluation_scale_objectives"] = settings.evaluation_scale_objectives
    settings_dict["evaluation_scale_competencies"] = settings.evaluation_scale_competencies
    settings_dict["weight_objectives"] = settings.weight_objectives
    settings_dict["weight_competencies"] = settings.weight_competencies
    
    organization.settings = settings_dict
    
    await db.commit()
    
    # Handle Oracle JSON field that might be string
    settings_dict = organization.settings
    if isinstance(settings_dict, str):
        settings_dict = json.loads(settings_dict) if settings_dict else {}
    
    return SettingsRead(
        evaluation_scale_objectives=settings_dict["evaluation_scale_objectives"],
        evaluation_scale_competencies=settings_dict["evaluation_scale_competencies"],
        weight_objectives=settings_dict["weight_objectives"],
        weight_competencies=settings_dict["weight_competencies"]
    )