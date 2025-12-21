from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.deps import require_admin, require_viewer
from app.models.models import NewsSource, NewsArticle, User
from app.models.schemas import (
    NewsSourceCreate, NewsSourceUpdate, NewsSourceResponse,
    NewsArticleResponse
)

router = APIRouter(prefix="/api/news", tags=["News"])


# News Articles
@router.get("", response_model=List[NewsArticleResponse])
async def list_news_articles(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    List news articles with optional filtering.
    """
    query = db.query(NewsArticle)
    
    if category:
        query = query.filter(NewsArticle.category == category)
    
    if search:
        query = query.filter(NewsArticle.title.ilike(f"%{search}%"))
    
    articles = query.order_by(desc(NewsArticle.published_at)).offset(skip).limit(limit).all()
    return articles


@router.get("/{article_id}", response_model=NewsArticleResponse)
async def get_news_article(
    article_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get a specific news article.
    """
    article = db.query(NewsArticle).filter(NewsArticle.id == article_id).first()
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Article not found"
        )
    return article


# News Sources
@router.get("/sources", response_model=List[NewsSourceResponse])
async def list_news_sources(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    is_enabled: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    List all news sources.
    """
    query = db.query(NewsSource)
    
    if is_enabled is not None:
        query = query.filter(NewsSource.is_enabled == is_enabled)
    
    sources = query.offset(skip).limit(limit).all()
    return sources


@router.get("/sources/{source_id}", response_model=NewsSourceResponse)
async def get_news_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_viewer)
):
    """
    Get a specific news source.
    """
    source = db.query(NewsSource).filter(NewsSource.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News source not found"
        )
    return source


@router.post("/sources", response_model=NewsSourceResponse, status_code=status.HTTP_201_CREATED)
async def create_news_source(
    source_data: NewsSourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Create a new news source (Admin only).
    """
    # Check if source name already exists
    if db.query(NewsSource).filter(NewsSource.name == source_data.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="News source name already exists"
        )
    
    new_source = NewsSource(
        name=source_data.name,
        url=source_data.url,
        description=source_data.description,
        category=source_data.category,
        fetch_interval_minutes=source_data.fetch_interval_minutes
    )
    
    db.add(new_source)
    db.commit()
    db.refresh(new_source)
    
    return new_source


@router.put("/sources/{source_id}", response_model=NewsSourceResponse)
async def update_news_source(
    source_id: int,
    source_data: NewsSourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Update a news source (Admin only).
    """
    source = db.query(NewsSource).filter(NewsSource.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News source not found"
        )
    
    update_data = source_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(source, field, value)
    
    db.commit()
    db.refresh(source)
    
    return source


@router.delete("/sources/{source_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Delete a news source (Admin only).
    """
    source = db.query(NewsSource).filter(NewsSource.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News source not found"
        )
    
    db.delete(source)
    db.commit()
    
    return None


@router.post("/sources/{source_id}/toggle", response_model=NewsSourceResponse)
async def toggle_news_source(
    source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """
    Enable or disable a news source (Admin only).
    """
    source = db.query(NewsSource).filter(NewsSource.id == source_id).first()
    if not source:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="News source not found"
        )
    
    source.is_enabled = not source.is_enabled
    db.commit()
    db.refresh(source)
    
    return source
