from typing import Dict, Type, Optional
from app.sources.base import SourceAdapter
from app.sources.adapters.abuse_ipdb import AbuseIPDBAdapter
from app.sources.adapters.phishtank import PhishTankAdapter
from app.sources.adapters.malware_bazaar import MalwareBazaarAdapter
from app.sources.adapters.urlhaus import URLhausAdapter


# Registry of available adapters
ADAPTER_REGISTRY: Dict[str, Type[SourceAdapter]] = {
    "abuseipdb": AbuseIPDBAdapter,
    "phishtank": PhishTankAdapter,
    "malwarebazaar": MalwareBazaarAdapter,
    "urlhaus": URLhausAdapter,
}


def get_adapter(adapter_name: str, config: Optional[Dict] = None) -> SourceAdapter:
    """
    Get an adapter instance by name.
    
    Args:
        adapter_name: Name of the adapter (lowercase)
        config: Configuration dictionary for the adapter
    
    Returns:
        Adapter instance
    
    Raises:
        ValueError: If adapter not found
    """
    adapter_class = ADAPTER_REGISTRY.get(adapter_name.lower())
    
    if not adapter_class:
        raise ValueError(f"Unknown adapter: {adapter_name}")
    
    return adapter_class(config or {})


def list_adapters() -> list[str]:
    """Get list of available adapter names."""
    return list(ADAPTER_REGISTRY.keys())
