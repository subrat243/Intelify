from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import require_admin, require_analyst
from app.core.security import encrypt_api_key
from app.models.models import Source, User
from app.models.schemas import SourceCreate, SourceUpdate, SourceResponse

router = APIRouter(prefix="/api/sources", tags=["Sources"])


@router.get("", response_model=List[SourceResponse])
async def list_sources(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    is_enabled: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """
    List all threat intelligence sources.
    """
    query = db.query(Source)
    
    if is_enabled is not None:
        query = query.filter(Source.is_enabled == is_enabled)
    
    sources = query.offset(skip).limit(limit).all()
    return sources


@router.get("/{source_id}", response_model=SourceResponse)
async def get_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """
    Get a specific source by ID.
    """
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    return source


@router.post("", response_model=SourceResponse, status_code=status.HTTP_201_CREATED)
async def create_source(
    source_data: SourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new threat intelligence source (Admin only).
    """
    # Check if source name already exists
    if db.query(Source).filter(Source.name == source_data.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Source name already exists"
        )
    
    # Encrypt API keys in config if present
    config = source_data.config or {}
    if "api_key" in config:
        config["api_key"] = encrypt_api_key(config["api_key"])
    
    # Create source
    new_source = Source(
        name=source_data.name,
        type=source_data.type,
        url=source_data.url,
        description=source_data.description,
        trust_weight=source_data.trust_weight,
        fetch_interval_minutes=source_data.fetch_interval_minutes,
        config=config,
        next_fetch_at=datetime.utcnow() + timedelta(minutes=source_data.fetch_interval_minutes)
    )
    
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    
    return new_source


@router.put("/{source_id}", response_model=SourceResponse)
async def update_source(
    source_id: int,
    source_data: SourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update a source (Admin only).
    """
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    
    # Update fields
    update_data = source_data.model_dump(exclude_unset=True)
    
    # Handle API key encryption
    if "config" in update_data and update_data["config"]:
        config = update_data["config"]
        if "api_key" in config:
            config["api_key"] = encrypt_api_key(config["api_key"])
        update_data["config"] = config
    
    for field, value in update_data.items():
        setattr(source, field, value)
    
    # Update next fetch time if interval changed
    if "fetch_interval_minutes" in update_data:
        source.next_fetch_at = datetime.utcnow() + timedelta(minutes=source.fetch_interval_minutes)
    
    db.commit()
    db.refresh(source)
    
    return source


@router.delete("/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a source (Admin only).
    """
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    
    db.delete(source)
    db.commit()
    
    return None


@router.post("/{source_id}/toggle", response_model=SourceResponse)
async def toggle_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Enable or disable a source (Admin only).
    """
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    
    source.is_enabled = not source.is_enabled
    db.commit()
    db.refresh(source)
    
    return source


@router.get("/{source_id}/health")
async def get_source_health(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """
    Get source health status.
    """
    source = db.query(Source).filter(Source.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    
    # Calculate health status
    is_healthy = source.consecutive_failures < 3
    
    return {
        "source_id": source.id,
        "source_name": source.name,
        "is_healthy": is_healthy,
        "is_enabled": source.is_enabled,
        "last_fetch_at": source.last_fetch_at,
        "last_success_at": source.last_success_at,
        "last_error": source.last_error,
        "consecutive_failures": source.consecutive_failures,
        "next_fetch_at": source.next_fetch_at
    }
