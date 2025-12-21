from typing import List, Dict, Any
import json

from app.sources.base import CSVAdapter


class PhishTankAdapter(CSVAdapter):
    """
    Adapter for PhishTank - Completely free, no API key required.
    Provides verified phishing URLs.
    
    Updated hourly.
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        super().__init__(
            url="http://data.phishtank.com/data/online-valid.json",
            config=config or {}
        )
        self.name = "PhishTank"
    
    def fetch(self) -> bytes:
        """Fetch phishing URLs from PhishTank."""
        response = self.make_request(self.url)
        return response.content
    
    def parse(self, raw_data: bytes) -> List[Dict[str, Any]]:
        """Parse PhishTank JSON data."""
        data = json.loads(raw_data)
        iocs = []
        
        for entry in data:
            url = entry.get("url")
            if not url:
                continue
            
            ioc = self.normalize_ioc(
                indicator=url,
                ioc_type="url",
                category="phishing",
                tags=["phishing", "verified"],
                confidence_score=0.9,  # PhishTank URLs are verified
                metadata={
                    "phish_id": entry.get("phish_id"),
                    "target": entry.get("target"),
                    "submission_time": entry.get("submission_time"),
                    "verified": entry.get("verified") == "yes",
                    "verification_time": entry.get("verification_time")
                }
            )
            
            iocs.append(ioc)
        
        return iocs
