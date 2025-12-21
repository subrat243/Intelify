from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import require_analyst, require_viewer
from app.models.models import IOC, Source, User, IOCType, ThreatCategory
from app.models.schemas import IOCCreate, IOCUpdate, IOCResponse, TrendingThreat

router = APIRouter(prefix="/api/iocs", tags=["IOCs"])


@router.get("", response_model=List[IOCResponse])
async def search_iocs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    indicator: Optional[str] = None,
    ioc_type: Optional[IOCType] = None,
    category: Optional[ThreatCategory] = None,
    country: Optional[str] = None,
    min_confidence: Optional[float] = Query(None, ge=0.0, le=1.0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Search and filter IOCs.
    """
    query = db.query(IOC)
    
    if indicator:
        query = query.filter(IOC.indicator.ilike(f"%{indicator}%"))
    
    if ioc_type:
        query = query.filter(IOC.type == ioc_type)
    
    if category:
        query = query.filter(IOC.category == category)
    
    if country:
        query = query.filter(IOC.geo_country == country.upper())
    
    if min_confidence is not None:
        query = query.filter(IOC.confidence_score >= min_confidence)
    
    iocs = query.order_by(desc(IOC.last_seen)).offset(skip).limit(limit).all()
    return iocs


@router.get("/{ioc_id}", response_model=IOCResponse)
async def get_ioc(
    ioc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get detailed IOC information.
    """
    ioc = db.query(IOC).filter(IOC.id == ioc_id).first()
    if not ioc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="IOC not found"
        )
    return ioc


@router.post("", response_model=IOCResponse, status_code=status.HTTP_201_CREATED)
async def create_ioc(
    ioc_data: IOCCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """
    Manually submit an IOC (Analyst only).
    """
    # Check if source exists
    source = db.query(Source).filter(Source.id == ioc_data.source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Source not found"
        )
    
    # Check if IOC already exists
    existing_ioc = db.query(IOC).filter(
        IOC.indicator == ioc_data.indicator,
        IOC.type == ioc_data.type
    ).first()
    
    if existing_ioc:
        # Update existing IOC
        existing_ioc.last_seen = datetime.utcnow()
        existing_ioc.correlation_count += 1
        # Boost confidence score
        existing_ioc.confidence_score = min(1.0, existing_ioc.confidence_score + 0.1)
        db.commit()
        db.refresh(existing_ioc)
        return existing_ioc
    
    # Create new IOC
    new_ioc = IOC(
        indicator=ioc_data.indicator,
        type=ioc_data.type,
        source_id=ioc_data.source_id,
        category=ioc_data.category,
        tags=ioc_data.tags,
        confidence_score=ioc_data.confidence_score,
        metadata=ioc_data.metadata or {}
    )
    
    db.add(new_ioc)
    db.commit()
    db.refresh(new_ioc)
    
    return new_ioc


@router.put("/{ioc_id}", response_model=IOCResponse)
async def update_ioc(
    ioc_id: int,
    ioc_data: IOCUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_analyst)
):
    """
    Update an IOC (Analyst only).
    """
    ioc = db.query(IOC).filter(IOC.id == ioc_id).first()
    if not ioc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="IOC not found"
        )
    
    update_data = ioc_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ioc, field, value)
    
    db.commit()
    db.refresh(ioc)
    
    return ioc


@router.get("/stats/overview")
async def get_ioc_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get IOC statistics.
    """
    total_iocs = db.query(func.count(IOC.id)).scalar()
    
    # IOCs in last 24 hours
    yesterday = datetime.utcnow() - timedelta(days=1)
    iocs_24h = db.query(func.count(IOC.id)).filter(IOC.created_at >= yesterday).scalar()
    
    # Top categories
    top_categories = db.query(
        IOC.category,
        func.count(IOC.id).label("count")
    ).filter(
        IOC.category.isnot(None)
    ).group_by(IOC.category).order_by(desc("count")).limit(5).all()
    
    # Top countries
    top_countries = db.query(
        IOC.geo_country,
        func.count(IOC.id).label("count")
    ).filter(
        IOC.geo_country.isnot(None)
    ).group_by(IOC.geo_country).order_by(desc("count")).limit(10).all()
    
    return {
        "total_iocs": total_iocs,
        "iocs_last_24h": iocs_24h,
        "top_categories": [{"category": cat, "count": count} for cat, count in top_categories],
        "top_countries": [{"country": country, "count": count} for country, count in top_countries]
    }


@router.get("/trending/threats", response_model=List[TrendingThreat])
async def get_trending_threats(
    limit: int = Query(10, ge=1, le=50),
    days: int = Query(7, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get trending threats based on recent activity.
    """
    since = datetime.utcnow() - timedelta(days=days)
    
    trending = db.query(
        IOC.indicator,
        IOC.type,
        IOC.category,
        func.count(IOC.id).label("count"),
        func.min(IOC.first_seen).label("first_seen"),
        func.max(IOC.last_seen).label("last_seen")
    ).filter(
        IOC.last_seen >= since
    ).group_by(
        IOC.indicator, IOC.type, IOC.category
    ).order_by(
        desc("count")
    ).limit(limit).all()
    
    return [
        {
            "indicator": ind,
            "type": typ,
            "category": cat,
            "count": cnt,
            "first_seen": first,
            "last_seen": last
        }
        for ind, typ, cat, cnt, first, last in trending
    ]
