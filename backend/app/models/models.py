from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, JSON, Float, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "super_admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class IOCType(str, enum.Enum):
    IP = "ip"
    DOMAIN = "domain"
    URL = "url"
    HASH_MD5 = "hash_md5"
    HASH_SHA256 = "hash_sha256"
    CVE = "cve"


class SourceType(str, enum.Enum):
    REST = "rest"
    RSS = "rss"
    CSV = "csv"
    GITHUB = "github"
    TAXII = "taxii"


class ThreatCategory(str, enum.Enum):
    MALWARE = "malware"
    PHISHING = "phishing"
    RANSOMWARE = "ransomware"
    BOTNET = "botnet"
    APT = "apt"
    EXPLOIT = "exploit"
    C2 = "c2"


class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.VIEWER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    audit_logs = relationship("AuditLog", back_populates="user")


class Source(Base):
    __tablename__ = "sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    type = Column(SQLEnum(SourceType), nullable=False)
    url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True)
    trust_weight = Column(Float, default=1.0)  # 0.0 to 1.0
    
    # Configuration (API keys, headers, etc.)
    config = Column(JSON, nullable=True)  # Encrypted API keys stored here
    
    # Scheduling
    fetch_interval_minutes = Column(Integer, default=60)
    last_fetch_at = Column(DateTime(timezone=True), nullable=True)
    next_fetch_at = Column(DateTime(timezone=True), nullable=True)
    
    # Health monitoring
    last_success_at = Column(DateTime(timezone=True), nullable=True)
    last_error = Column(Text, nullable=True)
    consecutive_failures = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    iocs = relationship("IOC", back_populates="source")


class NewsSource(Base):
    __tablename__ = "news_sources"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    url = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True)
    category = Column(String(50), nullable=True)  # Malware, Ransomware, APT, etc.
    
    fetch_interval_minutes = Column(Integer, default=30)
    last_fetch_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    articles = relationship("NewsArticle", back_populates="source")


class IOC(Base):
    __tablename__ = "iocs"
    
    id = Column(Integer, primary_key=True, index=True)
    indicator = Column(String(500), nullable=False, index=True)
    type = Column(SQLEnum(IOCType), nullable=False, index=True)
    
    # Source information
    source_id = Column(Integer, ForeignKey("sources.id"), nullable=False)
    source = relationship("Source", back_populates="iocs")
    
    # Classification
    category = Column(SQLEnum(ThreatCategory), nullable=True, index=True)
    tags = Column(JSON, default=list)  # List of tags
    
    # Confidence and reputation
    confidence_score = Column(Float, default=0.5)  # 0.0 to 1.0
    reputation_score = Column(Float, nullable=True)  # -100 to 100
    
    # Enrichment data
    geo_country = Column(String(2), nullable=True, index=True)
    geo_city = Column(String(100), nullable=True)
    geo_latitude = Column(Float, nullable=True)
    geo_longitude = Column(Float, nullable=True)
    asn = Column(String(50), nullable=True)
    asn_org = Column(String(200), nullable=True)
    reverse_dns = Column(String(255), nullable=True)
    
    # MITRE ATT&CK
    mitre_techniques = Column(JSON, default=list)  # List of technique IDs
    
    # Additional metadata
    metadata = Column(JSON, default=dict)
    
    # Temporal data
    first_seen = Column(DateTime(timezone=True), server_default=func.now())
    last_seen = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Correlation count (how many sources reported this)
    correlation_count = Column(Integer, default=1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class NewsArticle(Base):
    __tablename__ = "news_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    url = Column(String(1000), unique=True, nullable=False)
    summary = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    
    # Source
    source_id = Column(Integer, ForeignKey("news_sources.id"), nullable=False)
    source = relationship("NewsSource", back_populates="articles")
    
    # Classification
    category = Column(String(50), nullable=True, index=True)
    tags = Column(JSON, default=list)
    
    # Extracted information
    keywords = Column(JSON, default=list)
    cve_references = Column(JSON, default=list)  # List of CVE IDs
    affected_regions = Column(JSON, default=list)
    
    # Related IOCs (if any)
    related_iocs = Column(JSON, default=list)  # List of IOC IDs
    
    published_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class CorrelationRule(Base):
    __tablename__ = "correlation_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    rule_logic = Column(JSON, nullable=False)  # Rule definition
    is_enabled = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    user = relationship("User", back_populates="audit_logs")
    
    action = Column(String(100), nullable=False, index=True)
    resource_type = Column(String(50), nullable=True)
    resource_id = Column(Integer, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)


class AlertRule(Base):
    __tablename__ = "alert_rules"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    condition = Column(JSON, nullable=False)  # Alert condition
    is_enabled = Column(Boolean, default=True)
    
    # Notification settings
    notification_channels = Column(JSON, default=list)  # email, slack, etc.
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
