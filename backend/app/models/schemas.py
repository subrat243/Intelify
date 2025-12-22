from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ANALYST = "analyst"
    VIEWER = "viewer"


class IOCType(str, Enum):
    IP = "ip"
    DOMAIN = "domain"
    URL = "url"
    HASH_MD5 = "hash_md5"
    HASH_SHA256 = "hash_sha256"
    CVE = "cve"


class SourceType(str, Enum):
    REST = "rest"
    RSS = "rss"
    CSV = "csv"
    GITHUB = "github"
    TAXII = "taxii"


class ThreatCategory(str, Enum):
    MALWARE = "malware"
    PHISHING = "phishing"
    RANSOMWARE = "ransomware"
    BOTNET = "botnet"
    APT = "apt"
    EXPLOIT = "exploit"
    C2 = "c2"


# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole = UserRole.VIEWER


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# Auth Schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[int] = None
    type: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# Source Schemas
class SourceBase(BaseModel):
    name: str
    type: SourceType
    url: str
    description: Optional[str] = None
    trust_weight: float = Field(default=1.0, ge=0.0, le=1.0)
    fetch_interval_minutes: int = Field(default=60, ge=5)


class SourceCreate(SourceBase):
    config: Optional[Dict[str, Any]] = None


class SourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    trust_weight: Optional[float] = Field(None, ge=0.0, le=1.0)
    fetch_interval_minutes: Optional[int] = Field(None, ge=5)
    config: Optional[Dict[str, Any]] = None


class SourceResponse(SourceBase):
    id: int
    is_enabled: bool
    last_fetch_at: Optional[datetime] = None
    next_fetch_at: Optional[datetime] = None
    last_success_at: Optional[datetime] = None
    last_error: Optional[str] = None
    consecutive_failures: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# News Source Schemas
class NewsSourceBase(BaseModel):
    name: str
    url: str
    description: Optional[str] = None
    category: Optional[str] = None
    fetch_interval_minutes: int = Field(default=30, ge=5)


class NewsSourceCreate(NewsSourceBase):
    pass


class NewsSourceUpdate(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    is_enabled: Optional[bool] = None
    category: Optional[str] = None
    fetch_interval_minutes: Optional[int] = Field(None, ge=5)


class NewsSourceResponse(NewsSourceBase):
    id: int
    is_enabled: bool
    last_fetch_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# IOC Schemas
class IOCBase(BaseModel):
    indicator: str
    type: IOCType
    category: Optional[ThreatCategory] = None
    tags: List[str] = []


class IOCCreate(IOCBase):
    source_id: int
    confidence_score: float = Field(default=0.5, ge=0.0, le=1.0)
    extra_data: Optional[Dict[str, Any]] = None


class IOCUpdate(BaseModel):
    category: Optional[ThreatCategory] = None
    tags: Optional[List[str]] = None
    confidence_score: Optional[float] = Field(None, ge=0.0, le=1.0)


class IOCResponse(IOCBase):
    id: int
    source_id: int
    confidence_score: float
    reputation_score: Optional[float] = None
    geo_country: Optional[str] = None
    geo_city: Optional[str] = None
    geo_latitude: Optional[float] = None
    geo_longitude: Optional[float] = None
    asn: Optional[str] = None
    asn_org: Optional[str] = None
    reverse_dns: Optional[str] = None
    mitre_techniques: List[str] = []
    extra_data: Dict[str, Any] = {}
    first_seen: datetime
    last_seen: datetime
    correlation_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True


# News Article Schemas
class NewsArticleBase(BaseModel):
    title: str
    url: str
    summary: Optional[str] = None
    category: Optional[str] = None


class NewsArticleResponse(NewsArticleBase):
    id: int
    source_id: int
    tags: List[str] = []
    keywords: List[str] = []
    cve_references: List[str] = []
    affected_regions: List[str] = []
    related_iocs: List[int] = []
    published_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Dashboard Schemas
class ThreatMapData(BaseModel):
    country_code: str
    country_name: str
    latitude: float
    longitude: float
    threat_count: int
    categories: Dict[str, int]


class DashboardOverview(BaseModel):
    total_iocs: int
    total_sources: int
    active_sources: int
    total_news: int
    iocs_last_24h: int
    news_last_24h: int
    top_countries: List[Dict[str, Any]]
    top_categories: List[Dict[str, Any]]


class TrendingThreat(BaseModel):
    indicator: str
    type: str
    category: Optional[str]
    count: int
    first_seen: datetime
    last_seen: datetime
