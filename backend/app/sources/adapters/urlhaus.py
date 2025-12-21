from typing import List, Dict, Any
import json

from app.sources.base import RESTAdapter


class URLhausAdapter(RESTAdapter):
    """
    Adapter for URLhaus by abuse.ch - Completely free.
    Provides malicious URLs used for malware distribution.
    
    No API key required.
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(
            url="https://urlhaus-api.abuse.ch/v1/",
            config=config or {}
        )
        self.name = "URLhaus"
    
    def fetch(self) -> bytes:
        """Fetch recent malicious URLs from URLhaus."""
        # Get recent URLs
        data = {
            "query": "get_recent",
            "limit": 100
        }
        
        response = self.make_request(
            f"{self.url}urls/recent/",
            method="POST",
            data=data
        )
        
        return response.content
    
    def parse(self, raw_data: bytes) -> List[Dict[str, Any]]:
        """Parse URLhaus response."""
        response_data = json.loads(raw_data)
        iocs = []
        
        if response_data.get("query_status") != "ok":
            return iocs
        
        for entry in response_data.get("urls", []):
            url = entry.get("url")
            if not url:
                continue
            
            # Determine category based on threat type
            threat = entry.get("threat", "malware")
            category_map = {
                "malware_download": "malware",
                "phishing": "phishing",
                "botnet_cc": "c2"
            }
            category = category_map.get(threat, "malware")
            
            ioc = self.normalize_ioc(
                indicator=url,
                ioc_type="url",
                category=category,
                tags=["malicious-url", threat],
                confidence_score=0.8,
                metadata={
                    "url_status": entry.get("url_status"),
                    "threat": threat,
                    "tags": entry.get("tags", []),
                    "date_added": entry.get("date_added"),
                    "reporter": entry.get("reporter"),
                    "host": entry.get("host")
                }
            )
            
            iocs.append(ioc)
        
        return iocs
