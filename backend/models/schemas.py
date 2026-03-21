from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class IOCType(str, Enum):
    IP = "IP"
    DOMAIN = "Domain"
    URL = "URL"
    HASH = "Hash"
    CVE = "CVE"
    EMAIL = "Email"


class Confidence(str, Enum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class FeedStatus(str, Enum):
    OK = "ok"
    LOADING = "loading"
    ERROR = "error"
    PENDING = "pending"


class IOC(BaseModel):
    id: str
    type: IOCType
    value: str
    confidence: Confidence = Confidence.MEDIUM
    malware: Optional[str] = None
    source: str
    tags: List[str] = Field(default_factory=list)
    first_seen: Optional[str] = None
    last_seen: Optional[str] = None
    port: Optional[str] = None
    file_type: Optional[str] = None
    status: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    score: int = 50
    fetched_at: datetime = Field(default_factory=datetime.utcnow)


class FeedInfo(BaseModel):
    id: str
    name: str
    org: str
    type: str
    color: str
    url: str
    status: FeedStatus = FeedStatus.PENDING
    ioc_count: int = 0
    last_fetch: Optional[datetime] = None
    error: Optional[str] = None
    refresh_interval_minutes: int = 5


class IOCStats(BaseModel):
    total: int
    critical: int
    high: int
    feeds_online: int
    feeds_total: int
    by_type: dict
    by_source: dict
    last_updated: Optional[datetime] = None
    ingestion_history: List[int] = Field(default_factory=list)


class SearchResult(BaseModel):
    iocs: List[IOC]
    total: int
    page: int
    pages: int
    query: str
