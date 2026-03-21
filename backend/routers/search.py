from fastapi import APIRouter, Request, Query
from typing import Optional

router = APIRouter()


def _get_fm(request: Request):
    return request.app.state.feed_manager


@router.get("/")
async def search(
    request: Request,
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(50, ge=1, le=200),
):
    fm = _get_fm(request)
    all_iocs = fm.get_all_iocs()
    ql = q.lower()
    hits = [
        i for i in all_iocs
        if ql in i.value.lower()
        or ql in (i.malware or "").lower()
        or ql in i.source.lower()
        or any(ql in t.lower() for t in i.tags)
        or (i.description and ql in i.description.lower())
    ]
    return {"results": [h.model_dump() for h in hits[:limit]], "total": len(hits), "query": q}
