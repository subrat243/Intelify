from typing import List, Dict, Any
import feedparser
import re
from datetime import datetime
from bs4 import BeautifulSoup


class NewsAdapter:
    """Base adapter for security news feeds."""
    
    def __init__(self, url: str, name: str, category: str = None):
        self.url = url
        self.name = name
        self.category = category
    
    def fetch_and_parse(self) -> List[Dict[str, Any]]:
        """
        Fetch and parse RSS feed.
        
        Returns:
            List of article dictionaries
        """
        articles = []
        
        try:
            feed = feedparser.parse(self.url)
            
            for entry in feed.entries:
                article = self.parse_entry(entry)
                if article:
                    articles.append(article)
        
        except Exception as e:
            print(f"Error fetching news from {self.name}: {e}")
        
        return articles
    
    def parse_entry(self, entry) -> Dict[str, Any]:
        """Parse a single feed entry."""
        # Extract text content
        summary = entry.get("summary", "")
        if summary:
            # Remove HTML tags
            summary = BeautifulSoup(summary, "html.parser").get_text()
        
        # Parse published date
        published_at = None
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            published_at = datetime(*entry.published_parsed[:6])
        
        article = {
            "title": entry.get("title", ""),
            "url": entry.get("link", ""),
            "summary": summary[:1000] if summary else None,  # Limit length
            "published_at": published_at,
            "category": self.category
        }
        
        # Extract keywords
        article["keywords"] = self.extract_keywords(article["title"] + " " + (summary or ""))
        
        # Extract CVE references
        article["cve_references"] = self.extract_cves(article["title"] + " " + (summary or ""))
        
        return article
    
    def extract_keywords(self, text: str) -> List[str]:
        """Extract security-related keywords from text."""
        keywords = []
        
        # Common security keywords
        security_terms = [
            "malware", "ransomware", "phishing", "vulnerability", "exploit",
            "breach", "attack", "threat", "zero-day", "apt", "botnet",
            "trojan", "backdoor", "spyware", "ddos", "injection",
            "authentication", "encryption", "credential", "patch"
        ]
        
        text_lower = text.lower()
        for term in security_terms:
            if term in text_lower:
                keywords.append(term)
        
        return keywords
    
    def extract_cves(self, text: str) -> List[str]:
        """Extract CVE references from text."""
        cve_pattern = r'CVE-\d{4}-\d{4,7}'
        cves = re.findall(cve_pattern, text, re.IGNORECASE)
        return [cve.upper() for cve in cves]


# Pre-configured news sources
NEWS_SOURCES = {
    "krebs": NewsAdapter(
        url="https://krebsonsecurity.com/feed/",
        name="Krebs on Security",
        category="General"
    ),
    "thehackernews": NewsAdapter(
        url="https://feeds.feedburner.com/TheHackersNews",
        name="The Hacker News",
        category="General"
    ),
    "bleepingcomputer": NewsAdapter(
        url="https://www.bleepingcomputer.com/feed/",
        name="Bleeping Computer",
        category="General"
    ),
    "cisa": NewsAdapter(
        url="https://www.cisa.gov/cybersecurity-advisories/all.xml",
        name="CISA Advisories",
        category="Advisory"
    ),
}


def get_news_adapter(source_url: str, source_name: str, category: str = None) -> NewsAdapter:
    """
    Create a news adapter for a given source.
    
    Args:
        source_url: RSS feed URL
        source_name: Name of the source
        category: Optional category
    
    Returns:
        NewsAdapter instance
    """
    return NewsAdapter(source_url, source_name, category)
