from typing import Dict, Any, Optional
import socket
import ipaddress
import re

try:
    import geoip2.database
    GEOIP_AVAILABLE = True
except ImportError:
    GEOIP_AVAILABLE = False

from app.core.config import settings


class EnrichmentService:
    """Service for enriching IOCs with additional context."""
    
    def __init__(self):
        self.geoip_reader = None
        if GEOIP_AVAILABLE and settings.GEOIP_DB_PATH:
            try:
                self.geoip_reader = geoip2.database.Reader(settings.GEOIP_DB_PATH)
            except Exception as e:
                print(f"Failed to load GeoIP database: {e}")
    
    def enrich_ioc(self, indicator: str, ioc_type: str) -> Dict[str, Any]:
        """
        Enrich an IOC with additional context.
        
        Args:
            indicator: The IOC value
            ioc_type: Type of IOC (ip, domain, url, etc.)
        
        Returns:
            Dictionary with enrichment data
        """
        enrichment = {}
        
        if ioc_type == "ip":
            enrichment.update(self.enrich_ip(indicator))
        elif ioc_type == "domain":
            enrichment.update(self.enrich_domain(indicator))
        elif ioc_type == "url":
            enrichment.update(self.enrich_url(indicator))
        
        return enrichment
    
    def enrich_ip(self, ip: str) -> Dict[str, Any]:
        """Enrich IP address with GeoIP and ASN data."""
        enrichment = {}
        
        try:
            # Validate IP
            ip_obj = ipaddress.ip_address(ip)
            
            # Skip private IPs
            if ip_obj.is_private:
                return enrichment
            
            # GeoIP lookup
            if self.geoip_reader:
                try:
                    response = self.geoip_reader.city(ip)
                    enrichment["geo_country"] = response.country.iso_code
                    enrichment["geo_city"] = response.city.name
                    enrichment["geo_latitude"] = response.location.latitude
                    enrichment["geo_longitude"] = response.location.longitude
                except Exception:
                    pass
            
            # Reverse DNS
            try:
                hostname = socket.gethostbyaddr(ip)[0]
                enrichment["reverse_dns"] = hostname
            except Exception:
                pass
            
            # ASN lookup (simplified - in production use a proper ASN database)
            # This is a placeholder
            enrichment["asn"] = None
            enrichment["asn_org"] = None
            
        except Exception as e:
            print(f"Error enriching IP {ip}: {e}")
        
        return enrichment
    
    def enrich_domain(self, domain: str) -> Dict[str, Any]:
        """Enrich domain with DNS and registration data."""
        enrichment = {}
        
        try:
            # DNS resolution
            try:
                ip = socket.gethostbyname(domain)
                enrichment["resolved_ip"] = ip
                
                # Enrich the resolved IP
                ip_enrichment = self.enrich_ip(ip)
                enrichment.update(ip_enrichment)
            except Exception:
                pass
            
        except Exception as e:
            print(f"Error enriching domain {domain}: {e}")
        
        return enrichment
    
    def enrich_url(self, url: str) -> Dict[str, Any]:
        """Enrich URL by extracting and enriching the domain."""
        enrichment = {}
        
        try:
            # Extract domain from URL
            domain_match = re.search(r'https?://([^/]+)', url)
            if domain_match:
                domain = domain_match.group(1)
                enrichment.update(self.enrich_domain(domain))
        except Exception as e:
            print(f"Error enriching URL {url}: {e}")
        
        return enrichment
    
    def calculate_reputation_score(self, ioc_data: Dict[str, Any]) -> float:
        """
        Calculate reputation score based on various factors.
        
        Args:
            ioc_data: IOC data dictionary
        
        Returns:
            Reputation score (-100 to 100, negative is bad)
        """
        score = 0.0
        
        # Base score from confidence
        confidence = ioc_data.get("confidence_score", 0.5)
        score -= (confidence * 100)  # Higher confidence = worse reputation
        
        # Correlation count (more sources = worse)
        correlation_count = ioc_data.get("correlation_count", 1)
        score -= (correlation_count * 10)
        
        # Category-based scoring
        category = ioc_data.get("category")
        category_scores = {
            "ransomware": -30,
            "apt": -25,
            "malware": -20,
            "phishing": -15,
            "botnet": -20,
            "c2": -25
        }
        score += category_scores.get(category, 0)
        
        # Clamp to -100 to 100
        return max(-100, min(100, score))
    
    def map_to_mitre(self, ioc_data: Dict[str, Any]) -> list[str]:
        """
        Map IOC to MITRE ATT&CK techniques.
        
        This is a simplified mapping. In production, use a more sophisticated
        approach with ML or rule-based mapping.
        
        Args:
            ioc_data: IOC data dictionary
        
        Returns:
            List of MITRE technique IDs
        """
        techniques = []
        
        category = ioc_data.get("category")
        ioc_type = ioc_data.get("type")
        
        # Simple category-based mapping
        if category == "phishing":
            techniques.extend(["T1566", "T1598"])  # Phishing techniques
        elif category == "malware":
            techniques.extend(["T1204", "T1059"])  # User Execution, Command Scripting
        elif category == "ransomware":
            techniques.extend(["T1486", "T1490"])  # Data Encrypted, Inhibit Recovery
        elif category == "c2":
            techniques.extend(["T1071", "T1095"])  # Application Layer Protocol
        elif category == "botnet":
            techniques.extend(["T1071", "T1573"])  # C2, Encrypted Channel
        
        # Type-based mapping
        if ioc_type == "url" or ioc_type == "domain":
            techniques.append("T1071.001")  # Web Protocols
        
        return list(set(techniques))  # Remove duplicates


# Global enrichment service instance
enrichment_service = EnrichmentService()
