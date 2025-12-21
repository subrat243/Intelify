from typing import List, Dict, Any
import json
from datetime import datetime

from app.sources.base import RESTAdapter


class AbuseIPDBAdapter(RESTAdapter):
    """
    Adapter for AbuseIPDB - Free tier available.
    Provides malicious IP addresses.
    
    Free tier: 1000 requests/day
    Requires API key (free registration)
    """
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(
            url="https://api.abuseipdb.com/api/v2/blacklist",
            config=config
        )
        self.name = "AbuseIPDB"
    
    def fetch(self) -> bytes:
        """Fetch blacklist from AbuseIPDB."""
        api_key = self.config.get("api_key")
        if not api_key:
            raise Exception("AbuseIPDB API key required")
        
        headers = {
            "Key": api_key,
            "Accept": "application/json"
        }
        
        params = {
            "confidenceMinimum": 75,  # Only high-confidence IPs
            "limit": 10000
        }
        
        response = self.make_request(
            self.url,
            headers=headers,
            params=params
        )
        
        return response.content
    
    def parse(self, raw_data: bytes) -> List[Dict[str, Any]]:
        """Parse AbuseIPDB response."""
        data = json.loads(raw_data)
        iocs = []
        
        for entry in data.get("data", []):
            ip = entry.get("ipAddress")
            confidence = entry.get("abuseConfidenceScore", 0) / 100.0
            
            ioc = self.normalize_ioc(
                indicator=ip,
                ioc_type="ip",
                category="malware",
                tags=["abuse", "malicious-ip"],
                confidence_score=confidence,
                metadata={
                    "country_code": entry.get("countryCode"),
                    "usage_type": entry.get("usageType"),
                    "isp": entry.get("isp"),
                    "total_reports": entry.get("totalReports", 0)
                }
            )
            
            iocs.append(ioc)
        
        return iocs
