from fastapi import APIRouter, Request, Query
from models.schemas import IOCStats
from datetime import datetime

router = APIRouter()


def _get_fm(request: Request):
    return request.app.state.feed_manager


@router.get("/", response_model=IOCStats)
async def get_stats(request: Request):
    fm = _get_fm(request)
    all_iocs = fm.get_all_iocs()
    feeds = fm.get_feeds()

    by_type = {}
    by_source = {}
    critical = 0
    high = 0

    for ioc in all_iocs:
        t = ioc.type.value
        by_type[t] = by_type.get(t, 0) + 1
        by_source[ioc.source] = by_source.get(ioc.source, 0) + 1
        if ioc.confidence.value == "Critical":
            critical += 1
        elif ioc.confidence.value == "High":
            high += 1

    feeds_online = sum(1 for f in feeds if f.status.value == "ok")

    return IOCStats(
        total=len(all_iocs),
        critical=critical,
        high=high,
        feeds_online=feeds_online,
        feeds_total=len(feeds),
        by_type=by_type,
        by_source=by_source,
        last_updated=datetime.utcnow(),
        ingestion_history=fm.get_ingestion_history(),
    )
