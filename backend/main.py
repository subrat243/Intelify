"""
ThreatIntel·OS — Cyber Threat Intelligence Platform
Backend: FastAPI + APScheduler + aiohttp
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio

from routers import iocs, feeds, stats, search
from services.feed_manager import FeedManager

feed_manager = FeedManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start background feed ingestion on startup
    asyncio.create_task(feed_manager.start_scheduler())
    yield
    await feed_manager.stop()


app = FastAPI(
    title="ThreatIntel·OS API",
    description="Real-time Cyber Threat Intelligence Platform — open-source feeds",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(iocs.router, prefix="/api/v1/iocs", tags=["IOCs"])
app.include_router(feeds.router, prefix="/api/v1/feeds", tags=["Feeds"])
app.include_router(stats.router, prefix="/api/v1/stats", tags=["Stats"])
app.include_router(search.router, prefix="/api/v1/search", tags=["Search"])

# Expose feed_manager to routers via app state
app.state.feed_manager = feed_manager


@app.get("/")
async def root():
    return {"status": "ok", "message": "ThreatIntel·OS API is running"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
