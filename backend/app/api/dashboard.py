from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import require_viewer
from app.models.models import IOC, Source, NewsArticle, User, ThreatCategory
from app.models.schemas import DashboardOverview, ThreatMapData

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/overview", response_model=DashboardOverview)
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get global threat intelligence overview.
    """
    # Total counts
    total_iocs = db.query(func.count(IOC.id)).scalar()
    total_sources = db.query(func.count(Source.id)).scalar()
    active_sources = db.query(func.count(Source.id)).filter(Source.is_enabled == True).scalar()
    total_news = db.query(func.count(NewsArticle.id)).scalar()
    
    # Last 24 hours
    yesterday = datetime.utcnow() - timedelta(days=1)
    iocs_24h = db.query(func.count(IOC.id)).filter(IOC.created_at >= yesterday).scalar()
    news_24h = db.query(func.count(NewsArticle.id)).filter(NewsArticle.created_at >= yesterday).scalar()
    
    # Top countries
    top_countries = db.query(
        IOC.geo_country,
        func.count(IOC.id).label("count")
    ).filter(
        IOC.geo_country.isnot(None)
    ).group_by(IOC.geo_country).order_by(desc("count")).limit(10).all()
    
    # Top categories
    top_categories = db.query(
        IOC.category,
        func.count(IOC.id).label("count")
    ).filter(
        IOC.category.isnot(None)
    ).group_by(IOC.category).order_by(desc("count")).limit(5).all()
    
    return {
        "total_iocs": total_iocs,
        "total_sources": total_sources,
        "active_sources": active_sources,
        "total_news": total_news,
        "iocs_last_24h": iocs_24h,
        "news_last_24h": news_24h,
        "top_countries": [{"country": country, "count": count} for country, count in top_countries],
        "top_categories": [{"category": cat, "count": count} for cat, count in top_categories]
    }


@router.get("/threat-map", response_model=List[ThreatMapData])
async def get_threat_map_data(
    days: int = Query(7, ge=1, le=30),
    category: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get geo-aggregated threat data for the global threat map.
    """
    since = datetime.utcnow() - timedelta(days=days)
    
    query = db.query(
        IOC.geo_country,
        IOC.geo_latitude,
        IOC.geo_longitude,
        IOC.category,
        func.count(IOC.id).label("count")
    ).filter(
        IOC.geo_country.isnot(None),
        IOC.geo_latitude.isnot(None),
        IOC.geo_longitude.isnot(None),
        IOC.last_seen >= since
    )
    
    if category:
        query = query.filter(IOC.category == category)
    
    results = query.group_by(
        IOC.geo_country,
        IOC.geo_latitude,
        IOC.geo_longitude,
        IOC.category
    ).all()
    
    # Aggregate by country
    country_data = {}
    for country, lat, lon, cat, count in results:
        if country not in country_data:
            country_data[country] = {
                "country_code": country,
                "country_name": country,  # TODO: Add country name mapping
                "latitude": lat,
                "longitude": lon,
                "threat_count": 0,
                "categories": {}
            }
        
        country_data[country]["threat_count"] += count
        cat_name = cat.value if cat else "unknown"
        country_data[country]["categories"][cat_name] = \
            country_data[country]["categories"].get(cat_name, 0) + count
    
    return list(country_data.values())


@router.get("/mitre-heatmap")
async def get_mitre_heatmap(
    days: int = Query(30, ge=1, le=90),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get MITRE ATT&CK technique heatmap data.
    """
    since = datetime.utcnow() - timedelta(days=days)
    
    # Get all IOCs with MITRE techniques
    iocs = db.query(IOC).filter(
        IOC.mitre_techniques.isnot(None),
        IOC.last_seen >= since
    ).all()
    
    # Count technique occurrences
    technique_counts = {}
    for ioc in iocs:
        if ioc.mitre_techniques:
            for technique in ioc.mitre_techniques:
                technique_counts[technique] = technique_counts.get(technique, 0) + 1
    
    # Sort by count
    sorted_techniques = sorted(
        technique_counts.items(),
        key=lambda x: x[1],
        reverse=True
    )
    
    return {
        "techniques": [
            {"technique_id": tech, "count": count}
            for tech, count in sorted_techniques[:50]
        ]
    }


@router.get("/source-stats")
async def get_source_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get source contribution statistics.
    """
    # IOCs per source
    source_stats = db.query(
        Source.name,
        Source.is_enabled,
        func.count(IOC.id).label("ioc_count")
    ).join(IOC, Source.id == IOC.source_id).group_by(
        Source.id, Source.name, Source.is_enabled
    ).order_by(desc("ioc_count")).all()
    
    return {
        "sources": [
            {
                "name": name,
                "is_enabled": enabled,
                "ioc_count": count
            }
            for name, enabled, count in source_stats
        ]
    }
