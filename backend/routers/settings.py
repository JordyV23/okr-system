import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from sqlalchemy.orm import selectinload
from database.database import get_db
from models.models import Organization, Competency
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
    
    # Convert to JSON string for Oracle compatibility
    organization.settings = json.dumps(settings_dict)
    
    # Update existing competencies if scale or weight changed
    await update_existing_competencies(db, settings_dict)
    
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

async def update_existing_competencies(db: AsyncSession, settings_dict: dict):
    """
    Update existing competencies to adapt to new scale settings
    """
    try:
        # Get all active competencies
        result = await db.execute(select(Competency).where(Competency.is_active == True))
        competencies = result.scalars().all()
        
        new_scale = settings_dict.get("evaluation_scale_competencies", "1-5")
        
        # Define scale mapping
        scale_mapping = {
            "1-5": {"min": 1, "max": 5, "default": 3},
            "1-10": {"min": 1, "max": 10, "default": 5},
            "letters": {"min": 1, "max": 5, "default": 3},  # Letters map to 1-5 internally
            "descriptive": {"min": 1, "max": 5, "default": 3}  # Descriptive map to 1-5 internally
        }
        
        new_scale_info = scale_mapping.get(new_scale, scale_mapping["1-5"])
        
        # Update each competency's level descriptions to match new scale
        for comp in competencies:
            current_descriptions = comp.level_descriptions
            if isinstance(current_descriptions, str):
                try:
                    current_descriptions = json.loads(current_descriptions) if current_descriptions.strip() else {}
                except json.JSONDecodeError:
                    current_descriptions = {}
            elif not isinstance(current_descriptions, dict):
                current_descriptions = {}
            
            # Get current levels
            current_levels = comp.levels or 5
            
            # Adjust levels if necessary
            if current_levels != new_scale_info["max"]:
                new_level_descriptions = {}
                new_levels = new_scale_info["max"]
                
                # Map existing levels to new scale
                for i in range(1, new_levels + 1):
                    if i <= current_levels:
                        # Keep existing description if available
                        new_level_descriptions[str(i)] = current_descriptions.get(str(i), f"Nivel {i}")
                    else:
                        # Create default description for new levels
                        new_level_descriptions[str(i)] = f"Nivel {i}"
                
                # Update competency
                comp.levels = new_levels
                comp.level_descriptions = json.dumps(new_level_descriptions)
        
        await db.commit()
        
    except Exception as e:
        print(f"Error updating competencies: {str(e)}")
        # Don't raise error here, as settings update should still succeed
        pass