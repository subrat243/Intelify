from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from app.workers.celery_app import celery_app
from app.core.database import SessionLocal
from app.models.models import Source, IOC, NewsSource, NewsArticle
from app.sources.loader import get_adapter
from app.core.security import decrypt_api_key
from app.services.enrichment import enrichment_service
from app.services.correlation import CorrelationService
from app.news.news_adapter import get_news_adapter


@celery_app.task(name="fetch_source_data")
def fetch_source_data(source_id: int):
    """
    Fetch and ingest data from a threat intelligence source.
    
    Args:
        source_id: ID of the source to fetch
    """
    db = SessionLocal()
    
    try:
        source = db.query(Source).filter(Source.id == source_id).first()
        if not source or not source.is_enabled:
            return {"status": "skipped", "reason": "Source not found or disabled"}
        
        # Decrypt API key if present
        config = source.config or {}
        if "api_key" in config:
            config["api_key"] = decrypt_api_key(config["api_key"])
        
        # Get adapter
        adapter_name = source.name.lower().replace(" ", "")
        adapter = get_adapter(adapter_name, config)
        
        # Fetch data
        source.last_fetch_at = datetime.utcnow()
        db.commit()
        
        raw_data = adapter.fetch()
        iocs_data = adapter.parse(raw_data)
        
        # Ingest IOCs
        new_iocs = 0
        updated_iocs = 0
        
        for ioc_data in iocs_data:
            # Check if IOC exists
            existing_ioc = db.query(IOC).filter(
                IOC.indicator == ioc_data["indicator"],
                IOC.type == ioc_data["type"]
            ).first()
            
            if existing_ioc:
                # Update existing
                existing_ioc.last_seen = datetime.utcnow()
                existing_ioc.correlation_count += 1
                existing_ioc.confidence_score = min(1.0, existing_ioc.confidence_score + 0.05)
                updated_iocs += 1
            else:
                # Create new IOC
                new_ioc = IOC(
                    indicator=ioc_data["indicator"],
                    type=ioc_data["type"],
                    source_id=source.id,
                    category=ioc_data.get("category"),
                    tags=ioc_data.get("tags", []),
                    confidence_score=ioc_data.get("confidence_score", 0.5),
                    extra_data=ioc_data.get("metadata", {})  # Keep 'metadata' key in dict for backward compatibility
                )
                db.add(new_ioc)
                new_iocs += 1
                
                # Enrich new IOC
                enrichment = enrichment_service.enrich_ioc(
                    new_ioc.indicator,
                    new_ioc.type
                )
                
                for key, value in enrichment.items():
                    setattr(new_ioc, key, value)
                
                # Calculate reputation
                new_ioc.reputation_score = enrichment_service.calculate_reputation_score({
                    "confidence_score": new_ioc.confidence_score,
                    "correlation_count": new_ioc.correlation_count,
                    "category": new_ioc.category
                })
                
                # Map to MITRE
                new_ioc.mitre_techniques = enrichment_service.map_to_mitre({
                    "category": new_ioc.category,
                    "type": new_ioc.type
                })
        
        db.commit()
        
        # Update source status
        source.last_success_at = datetime.utcnow()
        source.consecutive_failures = 0
        source.last_error = None
        source.next_fetch_at = datetime.utcnow() + timedelta(minutes=source.fetch_interval_minutes)
        db.commit()
        
        return {
            "status": "success",
            "source_id": source_id,
            "new_iocs": new_iocs,
            "updated_iocs": updated_iocs
        }
    
    except Exception as e:
        # Update source with error
        if source:
            source.consecutive_failures += 1
            source.last_error = str(e)[:500]
            source.next_fetch_at = datetime.utcnow() + timedelta(minutes=source.fetch_interval_minutes * 2)
            db.commit()
        
        return {
            "status": "error",
            "source_id": source_id,
            "error": str(e)
        }
    
    finally:
        db.close()


@celery_app.task(name="enrich_ioc")
def enrich_ioc_task(ioc_id: int):
    """
    Enrich a single IOC with additional context.
    
    Args:
        ioc_id: ID of the IOC to enrich
    """
    db = SessionLocal()
    
    try:
        ioc = db.query(IOC).filter(IOC.id == ioc_id).first()
        if not ioc:
            return {"status": "error", "reason": "IOC not found"}
        
        # Enrich
        enrichment = enrichment_service.enrich_ioc(ioc.indicator, ioc.type)
        
        for key, value in enrichment.items():
            setattr(ioc, key, value)
        
        # Update reputation
        ioc.reputation_score = enrichment_service.calculate_reputation_score({
            "confidence_score": ioc.confidence_score,
            "correlation_count": ioc.correlation_count,
            "category": ioc.category
        })
        
        # Update MITRE mapping
        ioc.mitre_techniques = enrichment_service.map_to_mitre({
            "category": ioc.category,
            "type": ioc.type
        })
        
        db.commit()
        
        return {"status": "success", "ioc_id": ioc_id}
    
    except Exception as e:
        return {"status": "error", "ioc_id": ioc_id, "error": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="correlate_iocs")
def correlate_iocs_task():
    """Run correlation engine to find related IOCs."""
    db = SessionLocal()
    
    try:
        correlation_service = CorrelationService(db)
        result = correlation_service.correlate_iocs()
        return {"status": "success", **result}
    
    except Exception as e:
        return {"status": "error", "error": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="fetch_news_feeds")
def fetch_news_feeds_task():
    """Fetch and aggregate security news from all enabled sources."""
    db = SessionLocal()
    
    try:
        sources = db.query(NewsSource).filter(NewsSource.is_enabled == True).all()
        
        total_articles = 0
        
        for source in sources:
            try:
                adapter = get_news_adapter(source.url, source.name, source.category)
                articles = adapter.fetch_and_parse()
                
                for article_data in articles:
                    # Check if article already exists
                    existing = db.query(NewsArticle).filter(
                        NewsArticle.url == article_data["url"]
                    ).first()
                    
                    if not existing:
                        article = NewsArticle(
                            title=article_data["title"],
                            url=article_data["url"],
                            summary=article_data.get("summary"),
                            source_id=source.id,
                            category=article_data.get("category"),
                            keywords=article_data.get("keywords", []),
                            cve_references=article_data.get("cve_references", []),
                            published_at=article_data.get("published_at")
                        )
                        db.add(article)
                        total_articles += 1
                
                source.last_fetch_at = datetime.utcnow()
                db.commit()
            
            except Exception as e:
                print(f"Error fetching news from {source.name}: {e}")
                continue
        
        return {
            "status": "success",
            "sources_processed": len(sources),
            "new_articles": total_articles
        }
    
    except Exception as e:
        return {"status": "error", "error": str(e)}
    
    finally:
        db.close()


@celery_app.task(name="cleanup_old_data")
def cleanup_old_data_task():
    """Clean up old data based on retention policies."""
    db = SessionLocal()
    
    try:
        from app.core.config import settings
        
        # Delete old IOCs
        ioc_cutoff = datetime.utcnow() - timedelta(days=settings.IOC_RETENTION_DAYS)
        deleted_iocs = db.query(IOC).filter(IOC.last_seen < ioc_cutoff).delete()
        
        # Delete old news
        news_cutoff = datetime.utcnow() - timedelta(days=settings.NEWS_RETENTION_DAYS)
        deleted_news = db.query(NewsArticle).filter(NewsArticle.created_at < news_cutoff).delete()
        
        db.commit()
        
        return {
            "status": "success",
            "deleted_iocs": deleted_iocs,
            "deleted_news": deleted_news
        }
    
    except Exception as e:
        return {"status": "error", "error": str(e)}
    
    finally:
        db.close()


# Periodic tasks (configured in Celery beat)
@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    """Set up periodic tasks."""
    # Correlate IOCs every hour
    sender.add_periodic_task(3600.0, correlate_iocs_task.s(), name="correlate-hourly")
    
    # Fetch news every 30 minutes
    sender.add_periodic_task(1800.0, fetch_news_feeds_task.s(), name="fetch-news")
    
    # Cleanup old data daily
    sender.add_periodic_task(86400.0, cleanup_old_data_task.s(), name="cleanup-daily")
