from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "Threat Intelligence Platform"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql://tip_user:tip_password@localhost:5432/tip_db",
        description="PostgreSQL connection string"
    )
    
    # Redis
    REDIS_URL: str = Field(
        default="redis://localhost:6379/0",
        description="Redis connection string for Celery"
    )
    
    # Security
    SECRET_KEY: str = Field(
        default="your-secret-key-change-in-production",
        description="JWT secret key - MUST be changed in production"
    )
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Encryption for API keys
    ENCRYPTION_KEY: str = Field(
        default="your-encryption-key-change-in-production",
        description="Fernet encryption key for storing API keys"
    )
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://localhost:3001",
    ]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # GeoIP Database Path
    GEOIP_DB_PATH: Optional[str] = None
    
    # Celery
    CELERY_BROKER_URL: str = Field(default="redis://localhost:6379/0")
    CELERY_RESULT_BACKEND: str = Field(default="redis://localhost:6379/0")
    
    # Data Retention (days)
    IOC_RETENTION_DAYS: int = 90
    NEWS_RETENTION_DAYS: int = 30
    AUDIT_LOG_RETENTION_DAYS: int = 365
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
