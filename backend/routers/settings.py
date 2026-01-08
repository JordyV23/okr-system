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
    async with db.begin():
        # Assuming there's only one organization for now
        result = await db.execute(select(Organization))
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
    
    return SettingsRead(
        evaluation_scale_objectives=organization.settings.get("evaluation_scale_objectives", "1-5"),
        evaluation_scale_competencies=organization.settings.get("evaluation_scale_competencies", "1-5"),
        weight_objectives=organization.settings.get("weight_objectives", 70),
        weight_competencies=organization.settings.get("weight_competencies", 30)
    )

@router.put("/", response_model=SettingsRead)
@router.put("", response_model=SettingsRead)
async def update_settings(settings: SettingsUpdate, db: AsyncSession = Depends(get_db)):
    """Update organization settings"""
    async with db.begin():
        result = await db.execute(select(Organization))
        organization = result.scalar_one_or_none()
        if not organization:
            # Create default organization if none exists
            organization = Organization(
                name="Default Organization",
                settings={}
            )
            db.add(organization)
        
        # Update settings
        organization.settings["evaluation_scale_objectives"] = settings.evaluation_scale_objectives
        organization.settings["evaluation_scale_competencies"] = settings.evaluation_scale_competencies
        organization.settings["weight_objectives"] = settings.weight_objectives
        organization.settings["weight_competencies"] = settings.weight_competencies
        
        await db.commit()
    
    return SettingsRead(
        evaluation_scale_objectives=organization.settings["evaluation_scale_objectives"],
        evaluation_scale_competencies=organization.settings["evaluation_scale_competencies"],
        weight_objectives=organization.settings["weight_objectives"],
        weight_competencies=organization.settings["weight_competencies"]
    )