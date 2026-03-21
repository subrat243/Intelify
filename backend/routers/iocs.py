from fastapi import APIRouter, Request, Query
from typing import Optional
from models.schemas import IOC, SearchResult

router = APIRouter()


def _get_fm(request: Request):
    return request.app.state.feed_manager


@router.get("/", response_model=SearchResult)
async def list_iocs(
    request: Request,
    q: Optional[str] = Query(None, description="Search query"),
    type: Optional[str] = Query(None, description="IOC type filter"),
    confidence: Optional[str] = Query(None, description="Confidence filter"),
    source: Optional[str] = Query(None, description="Source feed filter"),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=200),
):
    fm = _get_fm(request)
    all_iocs = fm.get_all_iocs()

    # Filter
    filtered = all_iocs
    if q:
        ql = q.lower()
        filtered = [i for i in filtered if ql in i.value.lower() or ql in (i.malware or "").lower() or ql in i.source.lower() or any(ql in t.lower() for t in i.tags)]
    if type and type != "All":
        filtered = [i for i in filtered if i.type.value == type]
    if confidence and confidence != "All":
        filtered = [i for i in filtered if i.confidence.value == confidence]
    if source and source != "All":
        filtered = [i for i in filtered if i.source == source]

    total = len(filtered)
    start = (page - 1) * limit
    data = filtered[start: start + limit]

    return SearchResult(iocs=data, total=total, page=page, pages=max(1, -(-total // limit)), query=q or "")


@router.get("/{ioc_id}", response_model=IOC)
async def get_ioc(ioc_id: str, request: Request):
    fm = _get_fm(request)
    for ioc in fm.get_all_iocs():
        if ioc.id == ioc_id:
            return ioc
    from fastapi import HTTPException
    raise HTTPException(status_code=404, detail="IOC not found")


@router.post("/lookup")
async def lookup_ioc(request: Request, body: dict):
    """Bulk lookup: { values: ["1.2.3.4", "evil.com"] }"""
    fm = _get_fm(request)
    values = body.get("values", [])
    all_iocs = fm.get_all_iocs()
    results = {}
    for val in values[:50]:  # cap at 50
        vl = val.lower()
        hits = [i for i in all_iocs if vl in i.value.lower()]
        results[val] = [h.model_dump() for h in hits[:5]]
    return {"results": results, "queried": len(values)}
