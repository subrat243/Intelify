from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import requests
from datetime import datetime


class SourceAdapter(ABC):
    """
    Base class for threat intelligence source adapters.
    
    All source adapters must inherit from this class and implement
    the fetch() and parse() methods.
    """
    
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        """
        Initialize the adapter with configuration.
        
        Args:
            config: Dictionary containing adapter-specific configuration
                   (API keys, headers, etc.)
        """
        self.config = config or {}
        self.name = self.__class__.__name__
        self.type = "unknown"
    
    @abstractmethod
    def fetch(self) -> bytes:
        """
        Fetch raw data from the source.
        
        Returns:
            Raw data as bytes
        
        Raises:
            Exception: If fetch fails
        """
        pass
    
    @abstractmethod
    def parse(self, raw_data: bytes) -> List[Dict[str, Any]]:
        """
        Parse raw data into normalized IOC format.
        
        Args:
            raw_data: Raw data from fetch()
        
        Returns:
            List of normalized IOC dictionaries with fields:
            - indicator: str
            - type: str (ip, domain, url, hash_md5, hash_sha256, cve)
            - category: str (optional)
            - tags: List[str] (optional)
            - confidence_score: float (0.0 to 1.0)
            - metadata: Dict[str, Any] (optional)
        """
        pass
    
    def validate(self, ioc: Dict[str, Any]) -> bool:
        """
        Validate IOC format.
        
        Args:
            ioc: IOC dictionary
        
        Returns:
            True if valid, False otherwise
        """
        required_fields = ["indicator", "type"]
        return all(field in ioc for field in required_fields)
    
    def normalize_ioc(self, indicator: str, ioc_type: str, **kwargs) -> Dict[str, Any]:
        """
        Helper method to create a normalized IOC dictionary.
        
        Args:
            indicator: The IOC value
            ioc_type: Type of IOC
            **kwargs: Additional fields
        
        Returns:
            Normalized IOC dictionary
        """
        ioc = {
            "indicator": indicator.strip(),
            "type": ioc_type,
            "category": kwargs.get("category"),
            "tags": kwargs.get("tags", []),
            "confidence_score": kwargs.get("confidence_score", 0.5),
            "metadata": kwargs.get("metadata", {})
        }
        return ioc
    
    def make_request(self, url: str, method: str = "GET", **kwargs) -> requests.Response:
        """
        Helper method to make HTTP requests with error handling.
        
        Args:
            url: URL to request
            method: HTTP method
            **kwargs: Additional arguments for requests
        
        Returns:
            Response object
        
        Raises:
            Exception: If request fails
        """
        try:
            response = requests.request(method, url, timeout=30, **kwargs)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            raise Exception(f"Request failed: {str(e)}")


class RESTAdapter(SourceAdapter):
    """Base adapter for REST API sources."""
    
    def __init__(self, url: str, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self.url = url
        self.type = "rest"


class RSSAdapter(SourceAdapter):
    """Base adapter for RSS feed sources."""
    
    def __init__(self, url: str, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self.url = url
        self.type = "rss"


class CSVAdapter(SourceAdapter):
    """Base adapter for CSV file sources."""
    
    def __init__(self, url: str, config: Optional[Dict[str, Any]] = None):
        super().__init__(config)
        self.url = url
        self.type = "csv"
