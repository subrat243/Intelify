from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import datetime, timedelta

from app.models.models import IOC, NewsArticle


class CorrelationService:
    """Service for correlating IOCs across sources and with news articles."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def correlate_iocs(self) -> Dict[str, Any]:
        """
        Find and correlate IOCs across multiple sources.
        
        Returns:
            Dictionary with correlation statistics
        """
        correlations_found = 0
        confidence_boosts = 0
        
        # Find duplicate indicators across different sources
        duplicates = self.db.query(
            IOC.indicator,
            IOC.type,
            func.count(func.distinct(IOC.source_id)).label("source_count"),
            func.array_agg(func.distinct(IOC.id)).label("ioc_ids")
        ).group_by(
            IOC.indicator, IOC.type
        ).having(
            func.count(func.distinct(IOC.source_id)) > 1
        ).all()
        
        for indicator, ioc_type, source_count, ioc_ids in duplicates:
            correlations_found += 1
            
            # Update all related IOCs
            iocs = self.db.query(IOC).filter(IOC.id.in_(ioc_ids)).all()
            
            for ioc in iocs:
                # Update correlation count
                ioc.correlation_count = source_count
                
                # Boost confidence score based on number of sources
                boost = min(0.3, (source_count - 1) * 0.1)
                new_confidence = min(1.0, ioc.confidence_score + boost)
                
                if new_confidence > ioc.confidence_score:
                    confidence_boosts += 1
                    ioc.confidence_score = new_confidence
                
                # Update last seen
                ioc.last_seen = datetime.utcnow()
        
        self.db.commit()
        
        return {
            "correlations_found": correlations_found,
            "confidence_boosts": confidence_boosts,
            "timestamp": datetime.utcnow()
        }
    
    def correlate_news_with_iocs(self, days: int = 7) -> Dict[str, Any]:
        """
        Correlate news articles with IOCs based on content.
        
        Args:
            days: Number of days to look back
        
        Returns:
            Dictionary with correlation statistics
        """
        since = datetime.utcnow() - timedelta(days=days)
        links_created = 0
        
        # Get recent news articles
        articles = self.db.query(NewsArticle).filter(
            NewsArticle.created_at >= since
        ).all()
        
        for article in articles:
            related_iocs = []
            
            # Search for IOCs mentioned in article content
            content = f"{article.title} {article.summary or ''} {article.content or ''}".lower()
            
            # Find IPs (simple regex)
            import re
            ip_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
            ips_in_content = re.findall(ip_pattern, content)
            
            for ip in ips_in_content:
                ioc = self.db.query(IOC).filter(
                    IOC.indicator == ip,
                    IOC.type == "ip"
                ).first()
                
                if ioc:
                    related_iocs.append(ioc.id)
            
            # Find domains (simplified)
            domain_pattern = r'\b[a-z0-9-]+\.[a-z]{2,}\b'
            domains_in_content = re.findall(domain_pattern, content)
            
            for domain in domains_in_content[:10]:  # Limit to avoid false positives
                ioc = self.db.query(IOC).filter(
                    IOC.indicator == domain,
                    IOC.type == "domain"
                ).first()
                
                if ioc:
                    related_iocs.append(ioc.id)
            
            # Update article with related IOCs
            if related_iocs:
                article.related_iocs = list(set(related_iocs))
                links_created += len(related_iocs)
        
        self.db.commit()
        
        return {
            "articles_processed": len(articles),
            "links_created": links_created,
            "timestamp": datetime.utcnow()
        }
    
    def find_related_indicators(self, ioc_id: int, limit: int = 10) -> List[IOC]:
        """
        Find IOCs related to a given IOC.
        
        Args:
            ioc_id: ID of the IOC
            limit: Maximum number of related IOCs to return
        
        Returns:
            List of related IOCs
        """
        ioc = self.db.query(IOC).filter(IOC.id == ioc_id).first()
        if not ioc:
            return []
        
        related = []
        
        # Same indicator, different sources
        same_indicator = self.db.query(IOC).filter(
            IOC.indicator == ioc.indicator,
            IOC.id != ioc_id
        ).limit(limit).all()
        related.extend(same_indicator)
        
        # Same category and country
        if ioc.category and ioc.geo_country:
            same_category_country = self.db.query(IOC).filter(
                IOC.category == ioc.category,
                IOC.geo_country == ioc.geo_country,
                IOC.id != ioc_id
            ).limit(limit).all()
            related.extend(same_category_country)
        
        # Deduplicate and limit
        seen = set()
        unique_related = []
        for r in related:
            if r.id not in seen:
                seen.add(r.id)
                unique_related.append(r)
                if len(unique_related) >= limit:
                    break
        
        return unique_related
