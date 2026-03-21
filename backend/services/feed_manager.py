"""
FeedManager — fetches, parses, and stores IOCs from open-source threat intel feeds.
Runs background refresh every N minutes per feed.
"""

import asyncio
import aiohttp
import hashlib
import json
import csv
import io
import logging
from datetime import datetime
from typing import Dict, List, Optional
from models.schemas import IOC, IOCType, Confidence, FeedInfo, FeedStatus

logger = logging.getLogger(__name__)

# ── Feed definitions ──────────────────────────────────────────────────────────
FEED_DEFINITIONS = [
    {
        "id": "feodo",
        "name": "Feodo Tracker",
        "org": "Abuse.ch",
        "type": "Botnet C2 IPs",
        "color": "#ef4444",
        "url": "https://feodotracker.abuse.ch/downloads/ipblocklist.csv",
        "refresh_interval_minutes": 5,
    },
    {
        "id": "urlhaus",
        "name": "URLhaus",
        "org": "Abuse.ch",
        "type": "Malware URLs",
        "color": "#f97316",
        "url": "https://urlhaus.abuse.ch/downloads/csv_recent/",
        "refresh_interval_minutes": 5,
    },
    {
        "id": "threatfox",
        "name": "ThreatFox",
        "org": "Abuse.ch",
        "type": "Multi-type IOCs",
        "color": "#a78bfa",
        "url": "https://threatfox.abuse.ch/export/csv/recent/",
        "refresh_interval_minutes": 5,
    },
    {
        "id": "bazaar",
        "name": "MalwareBazaar",
        "org": "Abuse.ch",
        "type": "Malware Hashes",
        "color": "#fbbf24",
        "url": "https://bazaar.abuse.ch/export/csv/recent/",
        "refresh_interval_minutes": 10,
    },
    {
        "id": "cisa_kev",
        "name": "CISA KEV",
        "org": "CISA",
        "type": "Known Exploited CVEs",
        "color": "#00ffa3",
        "url": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
        "refresh_interval_minutes": 60,
    },
    {
        "id": "sslbl",
        "name": "SSL Blacklist",
        "org": "Abuse.ch",
        "type": "Malicious SSL Certs",
        "color": "#60a5fa",
        "url": "https://sslbl.abuse.ch/blacklist/sslblacklist.csv",
        "refresh_interval_minutes": 30,
    },
    {
        "id": "blocklistde_ssh",
        "name": "Blocklist.de SSH",
        "org": "Blocklist.de",
        "type": "SSH Brute-Force IPs",
        "color": "#f472b6",
        "url": "https://lists.blocklist.de/lists/ssh.txt",
        "refresh_interval_minutes": 10,
    },
    {
        "id": "cinsscore",
        "name": "CINS Score",
        "org": "Sentinel IPS",
        "type": "Bad Actor IPs",
        "color": "#34d399",
        "url": "https://cinsscore.com/list/ci-badguys.txt",
        "refresh_interval_minutes": 15,
    },
]


class FeedManager:
    def __init__(self):
        self._iocs: Dict[str, List[IOC]] = {}          # feed_id -> list of IOCs
        self._feed_info: Dict[str, FeedInfo] = {}       # feed_id -> FeedInfo
        self._ingestion_history: List[int] = [0] * 20   # rolling count history
        self._running = False
        self._tasks: List[asyncio.Task] = []
        self._session: Optional[aiohttp.ClientSession] = None

        # Init feed info
        for fd in FEED_DEFINITIONS:
            self._feed_info[fd["id"]] = FeedInfo(**{k: v for k, v in fd.items() if k != "refresh_interval_minutes"},
                                                  refresh_interval_minutes=fd["refresh_interval_minutes"])
            self._iocs[fd["id"]] = []

    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=20)
            headers = {"User-Agent": "ThreatIntelOS/1.0 (github.com/yourname/threatintel-os)"}
            self._session = aiohttp.ClientSession(timeout=timeout, headers=headers)
        return self._session

    # ── Parsers ───────────────────────────────────────────────────────────────

    def _parse_feodo(self, text: str, feed_id: str) -> List[IOC]:
        iocs = []
        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = [p.strip('"') for p in line.split(",")]
            if len(parts) < 2:
                continue
            ip = parts[1] if len(parts) > 1 else parts[0]
            if not ip or not self._is_valid_ip(ip):
                continue
            iocs.append(IOC(
                id=self._make_id(feed_id, ip),
                type=IOCType.IP,
                value=ip,
                confidence=Confidence.HIGH,
                malware=parts[3].strip('"') if len(parts) > 3 else "Botnet C2",
                port=parts[2].strip('"') if len(parts) > 2 else None,
                source="Feodo Tracker",
                tags=["botnet", "c2", "ip"],
                first_seen=parts[0].strip('"') if parts else None,
            ))
        return iocs[:200]

    def _parse_urlhaus(self, text: str, feed_id: str) -> List[IOC]:
        iocs = []
        reader = csv.reader(io.StringIO(text), quotechar='"')
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            if len(row) < 4:
                continue
            url = row[2].strip() if len(row) > 2 else ""
            if not url.startswith("http"):
                continue
            tags_raw = row[5].strip() if len(row) > 5 else ""
            tags = [t.strip() for t in tags_raw.split(",") if t.strip()] or ["malware", "url"]
            iocs.append(IOC(
                id=self._make_id(feed_id, url),
                type=IOCType.URL,
                value=url,
                confidence=Confidence.CRITICAL if row[3].strip() == "online" else Confidence.HIGH,
                malware=tags[0] if tags else "Malware",
                status=row[3].strip() if len(row) > 3 else None,
                source="URLhaus",
                tags=tags[:4],
                first_seen=row[1].strip() if len(row) > 1 else None,
            ))
        return iocs[:200]

    def _parse_threatfox(self, text: str, feed_id: str) -> List[IOC]:
        iocs = []
        reader = csv.reader(io.StringIO(text), quotechar='"')
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            if len(row) < 5:
                continue
            raw_type = row[2].strip().lower() if len(row) > 2 else ""
            ioc_type = IOCType.IP
            if "url" in raw_type:
                ioc_type = IOCType.URL
            elif "domain" in raw_type:
                ioc_type = IOCType.DOMAIN
            elif "sha256" in raw_type or "md5" in raw_type or "sha1" in raw_type:
                ioc_type = IOCType.HASH
            value = row[3].strip() if len(row) > 3 else ""
            if not value or len(value) < 4:
                continue
            try:
                score = int(row[7].strip()) if len(row) > 7 else 50
            except ValueError:
                score = 50
            conf = Confidence.CRITICAL if score > 75 else Confidence.HIGH if score > 50 else Confidence.MEDIUM
            iocs.append(IOC(
                id=self._make_id(feed_id, value),
                type=ioc_type,
                value=value,
                confidence=conf,
                score=score,
                malware=row[4].strip() if len(row) > 4 else "Unknown",
                source="ThreatFox",
                tags=[row[4].strip(), raw_type][:4] if row[4].strip() else [raw_type],
                first_seen=row[0].strip() if row else None,
            ))
        return iocs[:200]

    def _parse_bazaar(self, text: str, feed_id: str) -> List[IOC]:
        iocs = []
        reader = csv.reader(io.StringIO(text), quotechar='"')
        for row in reader:
            if not row or row[0].startswith("#"):
                continue
            if len(row) < 4:
                continue
            sha256 = row[1].strip() if len(row) > 1 else ""
            if len(sha256) != 64:
                continue
            iocs.append(IOC(
                id=self._make_id(feed_id, sha256),
                type=IOCType.HASH,
                value=sha256,
                confidence=Confidence.HIGH,
                malware=row[4].strip() if len(row) > 4 else "Unknown",
                file_type=row[6].strip() if len(row) > 6 else None,
                source="MalwareBazaar",
                tags=[row[4].strip(), row[6].strip()][:3] if len(row) > 6 else ["malware", "hash"],
                first_seen=row[0].strip() if row else None,
            ))
        return iocs[:200]

    def _parse_cisa_kev(self, text: str, feed_id: str) -> List[IOC]:
        iocs = []
        try:
            data = json.loads(text)
            for v in data.get("vulnerabilities", [])[:200]:
                iocs.append(IOC(
                    id=self._make_id(feed_id, v.get("cveID", "")),
                    type=IOCType.CVE,
                    value=v.get("cveID", ""),
                    confidence=Confidence.CRITICAL,
                    score=95,
                    malware=v.get("product", v.get("vendorProject", "Unknown")),
                    source="CISA KEV",
                    tags=[v.get("vendorProject", ""), v.get("product", "")][:3],
                    first_seen=v.get("dateAdded"),
                    due_date=v.get("dueDate"),
                    description=v.get("shortDescription", "")[:300],
                ))
        except json.JSONDecodeError:
            pass
        return iocs

    def _parse_sslbl(self, text: str, feed_id: str) -> List[IOC]:
        iocs = []
        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            parts = [p.strip('"') for p in line.split(",")]
            sha1 = parts[0] if parts else ""
            if len(sha1) != 40:
                continue
            iocs.append(IOC(
                id=self._make_id(feed_id, sha1),
                type=IOCType.HASH,
                value=sha1,
                confidence=Confidence.HIGH,
                malware=parts[2] if len(parts) > 2 else "Malicious SSL",
                source="SSL Blacklist",
                tags=["ssl", "certificate", "malware"],
                first_seen=parts[1] if len(parts) > 1 else None,
            ))
        return iocs[:200]

    def _parse_plain_ips(self, text: str, feed_id: str, source: str, malware: str, tags: List[str]) -> List[IOC]:
        iocs = []
        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            ip = line.split()[0] if " " in line else line
            if not self._is_valid_ip(ip):
                continue
            iocs.append(IOC(
                id=self._make_id(feed_id, ip),
                type=IOCType.IP,
                value=ip,
                confidence=Confidence.MEDIUM,
                malware=malware,
                source=source,
                tags=tags,
            ))
        return iocs[:200]

    # ── Fetch + dispatch ──────────────────────────────────────────────────────

    async def fetch_feed(self, feed_def: dict) -> None:
        feed_id = feed_def["id"]
        fi = self._feed_info[feed_id]
        fi.status = FeedStatus.LOADING
        logger.info(f"Fetching feed: {fi.name}")

        try:
            session = await self._get_session()
            async with session.get(feed_def["url"]) as resp:
                if resp.status != 200:
                    raise Exception(f"HTTP {resp.status}")
                text = await resp.text(encoding="utf-8", errors="replace")

            # Dispatch to correct parser
            if feed_id == "feodo":
                iocs = self._parse_feodo(text, feed_id)
            elif feed_id == "urlhaus":
                iocs = self._parse_urlhaus(text, feed_id)
            elif feed_id == "threatfox":
                iocs = self._parse_threatfox(text, feed_id)
            elif feed_id == "bazaar":
                iocs = self._parse_bazaar(text, feed_id)
            elif feed_id == "cisa_kev":
                iocs = self._parse_cisa_kev(text, feed_id)
            elif feed_id == "sslbl":
                iocs = self._parse_sslbl(text, feed_id)
            elif feed_id == "blocklistde_ssh":
                iocs = self._parse_plain_ips(text, feed_id, "Blocklist.de SSH", "SSH Brute-Force", ["ssh", "bruteforce", "ip"])
            elif feed_id == "cinsscore":
                iocs = self._parse_plain_ips(text, feed_id, "CINS Score", "Bad Actor", ["scanner", "attacker", "ip"])
            else:
                iocs = []

            self._iocs[feed_id] = iocs
            fi.status = FeedStatus.OK
            fi.ioc_count = len(iocs)
            fi.last_fetch = datetime.utcnow()
            fi.error = None
            logger.info(f"Feed {fi.name}: loaded {len(iocs)} IOCs")

            # Update rolling ingestion history
            total = sum(len(v) for v in self._iocs.values())
            self._ingestion_history = self._ingestion_history[1:] + [total]

        except asyncio.CancelledError:
            raise
        except Exception as e:
            fi.status = FeedStatus.ERROR
            fi.error = str(e)
            fi.last_fetch = datetime.utcnow()
            logger.error(f"Feed {fi.name} failed: {e}")

    # ── Background scheduler ─────────────────────────────────────────────────

    async def _feed_loop(self, feed_def: dict) -> None:
        """Per-feed loop: fetch immediately, then repeat every N minutes."""
        await self.fetch_feed(feed_def)
        interval = feed_def["refresh_interval_minutes"] * 60
        while self._running:
            await asyncio.sleep(interval)
            await self.fetch_feed(feed_def)

    async def start_scheduler(self) -> None:
        self._running = True
        # Stagger initial fetches by 1s each to avoid hammering
        for i, fd in enumerate(FEED_DEFINITIONS):
            await asyncio.sleep(i * 1.2)
            task = asyncio.create_task(self._feed_loop(fd))
            self._tasks.append(task)

    async def stop(self) -> None:
        self._running = False
        for t in self._tasks:
            t.cancel()
        if self._session and not self._session.closed:
            await self._session.close()

    # ── Public accessors ─────────────────────────────────────────────────────

    def get_all_iocs(self) -> List[IOC]:
        result = []
        for iocs in self._iocs.values():
            result.extend(iocs)
        return result

    def get_feed_iocs(self, feed_id: str) -> List[IOC]:
        return self._iocs.get(feed_id, [])

    def get_feeds(self) -> List[FeedInfo]:
        return list(self._feed_info.values())

    def get_feed(self, feed_id: str) -> Optional[FeedInfo]:
        return self._feed_info.get(feed_id)

    def get_ingestion_history(self) -> List[int]:
        return self._ingestion_history

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _make_id(feed_id: str, value: str) -> str:
        return f"{feed_id}-{hashlib.md5(value.encode()).hexdigest()[:10]}"

    @staticmethod
    def _is_valid_ip(s: str) -> bool:
        parts = s.split(".")
        if len(parts) != 4:
            return False
        try:
            return all(0 <= int(p) <= 255 for p in parts)
        except ValueError:
            return False
