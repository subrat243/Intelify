from fastapi import APIRouter, Request, HTTPException, BackgroundTasks
from typing import List
from models.schemas import FeedInfo
from services.feed_manager import FEED_DEFINITIONS

router = APIRouter()


def _get_fm(request: Request):
    return request.app.state.feed_manager


@router.get("/", response_model=List[FeedInfo])
async def list_feeds(request: Request):
    return _get_fm(request).get_feeds()


@router.get("/{feed_id}", response_model=FeedInfo)
async def get_feed(feed_id: str, request: Request):
    feed = _get_fm(request).get_feed(feed_id)
    if not feed:
        raise HTTPException(status_code=404, detail="Feed not found")
    return feed


@router.post("/{feed_id}/refresh")
async def refresh_feed(feed_id: str, request: Request, background_tasks: BackgroundTasks):
    fm = _get_fm(request)
    feed_def = next((f for f in FEED_DEFINITIONS if f["id"] == feed_id), None)
    if not feed_def:
        raise HTTPException(status_code=404, detail="Feed not found")
    background_tasks.add_task(fm.fetch_feed, feed_def)
    return {"status": "refresh_queued", "feed_id": feed_id}


@router.post("/refresh-all")
async def refresh_all(request: Request, background_tasks: BackgroundTasks):
    fm = _get_fm(request)
    for fd in FEED_DEFINITIONS:
        background_tasks.add_task(fm.fetch_feed, fd)
    return {"status": "all_feeds_refresh_queued", "count": len(FEED_DEFINITIONS)}
