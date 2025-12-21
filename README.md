# 🛡️ Threat Intelligence Platform (TIP)

A production-grade, open-source **Threat Intelligence Platform** that collects, processes, enriches, correlates, and visualizes OSINT threat data.

![Platform Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)

## 🎯 Features

### Core Capabilities
- ✅ **Dynamic Source Management** - Add/remove threat intelligence sources via admin panel
- ✅ **Free OSINT Collection** - AbuseIPDB, PhishTank, MalwareBazaar, URLhaus
- ✅ **News Aggregation** - Security news from Krebs, THN, Bleeping Computer, CISA
- ✅ **Global Threat Map** - Interactive world map with geo-located threats
- ✅ **Enrichment Engine** - GeoIP, ASN, reverse DNS, reputation scoring
- ✅ **Correlation Engine** - Cross-source IOC matching with confidence boosting
- ✅ **MITRE ATT&CK Mapping** - Automatic technique mapping
- ✅ **Role-Based Access Control** - Super Admin, Analyst, Viewer roles
- ✅ **Background Processing** - Celery workers for async data ingestion

### Supported IOC Types
- IP Addresses
- Domains
- URLs
- File Hashes (MD5, SHA256)
- CVEs

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js UI    │  ← Admin Panel, Dashboards, Threat Map
└────────┬────────┘
         │
┌────────▼────────┐
│  FastAPI Backend│  ← REST API, Authentication, RBAC
└────────┬────────┘
         │
     ┌───┴──────────┐
     │              │
┌────▼────────┐  ┌──▼─────┐
│ PostgreSQL  │  │ Redis  │
└─────────────┘  └──┬─────┘
                    │
         ┌──────────▼────┐
         │    Celery     │  ← Background Tasks
         │    Workers    │
         └───────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- WSL2 (for Windows users)

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Intelify
```

2. **Copy environment file**
```bash
cp .env.example .env
```

3. **Edit `.env` and change security keys**
```bash
# IMPORTANT: Change these in production!
SECRET_KEY=your-super-secret-jwt-key-change-this
ENCRYPTION_KEY=your-encryption-key-for-api-keys-change-this
```

4. **Start the platform**
```bash
docker-compose up -d
```

5. **Create admin user**
```bash
# Access the backend container
docker exec -it tip_backend bash

# Run Python shell
python

# Create admin user
from app.core.database import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    username="admin",
    email="admin@tip.local",
    hashed_password=get_password_hash("admin123"),
    role="super_admin"
)
db.add(admin)
db.commit()
exit()
```

6. **Access the platform**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

7. **Login**
- Username: `admin`
- Password: `admin123`

## 📦 Project Structure

```
Intelify/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Config, security, database
│   │   ├── models/       # SQLAlchemy models & schemas
│   │   ├── services/     # Enrichment, correlation
│   │   ├── sources/      # Source adapters
│   │   │   └── adapters/ # Concrete implementations
│   │   ├── news/         # News aggregation
│   │   └── workers/      # Celery tasks
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/              # Next.js pages
│   ├── components/       # React components
│   ├── lib/              # API client, utilities
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

## 🔌 Adding New Sources

### Via Admin Panel (Recommended)

The easiest way to add sources is through the web interface:

1. **Access Admin Panel**
   - Login to the platform
   - Navigate to **Admin → Sources** (requires Super Admin or Analyst role)

2. **Click "Add Source"**
   - Click the blue "Add Source" button in the top-right corner

3. **Fill in Source Details**
   
   **Required Fields:**
   - **Source Name**: Descriptive name (e.g., "Custom Threat Feed")
   - **Source Type**: Choose from:
     - **REST API**: JSON-based API endpoints
     - **RSS Feed**: RSS/Atom feeds for news and bulletins
     - **CSV File**: CSV-formatted threat data
     - **GitHub Repository**: GitHub-hosted intelligence
   - **URL**: API endpoint or feed URL

   **Optional Fields:**
   - **API Key**: For authenticated sources (automatically encrypted)
   - **Description**: Brief description of the source
   - **Trust Weight**: How much to trust this source (0-100%)
   - **Fetch Interval**: How often to fetch data (in minutes)

4. **Submit**
   - Click "Create Source"
   - Source will be enabled immediately and start fetching within the specified interval

#### Example: Adding an RSS Feed

```
Name: Security News Feed
Type: RSS Feed
URL: https://www.bleepingcomputer.com/feed/
Description: Latest cybersecurity news
Trust Weight: 70%
Fetch Interval: 30 minutes
```

#### Example: Adding a REST API Source

```
Name: Custom Threat API
Type: REST API
URL: https://api.threatfeed.com/v1/indicators
API Key: your-api-key-here (encrypted automatically)
Description: Custom threat intelligence feed
Trust Weight: 90%
Fetch Interval: 60 minutes
```

### Creating Custom Adapters

For sources that don't match standard formats, create a custom adapter:

#### 1. Create Source Adapter

Create a new file in `backend/app/sources/adapters/`:

```python
from app.sources.base import RESTAdapter
from typing import List, Dict, Any
import json

class MySourceAdapter(RESTAdapter):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(
            url="https://api.example.com/threats",
            config=config
        )
        self.name = "MySource"
    
    def fetch(self) -> bytes:
        response = self.make_request(self.url)
        return response.content
    
    def parse(self, raw_data: bytes) -> List[Dict[str, Any]]:
        data = json.loads(raw_data)
        iocs = []
        
        for item in data:
            ioc = self.normalize_ioc(
                indicator=item["ip"],
                ioc_type="ip",
                category="malware",
                confidence_score=0.8
            )
            iocs.append(ioc)
        
        return iocs
```

#### 2. Register Adapter

Add to `backend/app/sources/loader.py`:

```python
from app.sources.adapters.mysource import MySourceAdapter

ADAPTER_REGISTRY = {
    "mysource": MySourceAdapter,
    # ... other adapters
}
```

#### 3. Add via Admin Panel

Follow the UI steps above to add your custom source.

### Security Notes

- **API Keys**: All API keys are encrypted using Fernet encryption before storage
- **HTTPS Only**: Always use HTTPS URLs for security
- **Trust Weight**: Lower trust weight for untested sources
- **Rate Limiting**: Be mindful of API rate limits when setting fetch intervals

### Troubleshooting

**Source Shows as "Unhealthy"**
- Check the error message in the source card
- Verify the URL is correct and accessible
- Ensure API key is valid (if required)
- Check fetch interval isn't too aggressive

**No Data Being Fetched**
- Verify the source is enabled (green status indicator)
- Check Celery workers: `docker logs tip_celery_worker`
- Review backend logs: `docker logs tip_backend`


## 🗺️ Threat Map Usage

The Global Threat Map visualizes threats geographically:

1. Navigate to **Dashboard → Threat Map**
2. Use filters:
   - **Time Range**: Last 24h, 7 days, 30 days
   - **Category**: Malware, Phishing, Ransomware, Botnet
3. Click on markers to view threat details
4. Hover over countries for statistics

## 📊 Dashboard Features

### Overview Dashboard
- Total IOCs and sources
- Recent activity (24h)
- Top threat categories
- Top affected countries

### IOC Search
- Advanced filtering by type, category, country
- Confidence score filtering
- Trending threats

### News Feed
- Latest security news
- CVE extraction
- Keyword tagging
- Related IOC linking

## 🔐 Security

### Authentication
- JWT-based authentication
- HTTP-only cookies
- Token expiration (30 min access, 7 day refresh)

### API Key Storage
- Encrypted at rest using Fernet
- Decrypted only when needed
- Never exposed in API responses

### RBAC Roles
- **Super Admin**: Full access, user management
- **Analyst**: Read/write IOCs, sources
- **Viewer**: Read-only access

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `REDIS_URL` | Redis connection string | `redis://...` |
| `SECRET_KEY` | JWT signing key | **CHANGE IN PRODUCTION** |
| `ENCRYPTION_KEY` | API key encryption key | **CHANGE IN PRODUCTION** |
| `IOC_RETENTION_DAYS` | Days to keep IOCs | `90` |
| `NEWS_RETENTION_DAYS` | Days to keep news | `30` |

### Source Configuration

Sources can have custom configuration:

```json
{
  "api_key": "your-api-key",  // Encrypted automatically
  "headers": {
    "User-Agent": "TIP/1.0"
  },
  "params": {
    "limit": 1000
  }
}
```

## 📈 Monitoring

### Health Checks
- Backend: `http://localhost:8000/health`
- Database: Automatic via Docker healthcheck
- Redis: Automatic via Docker healthcheck

### Logs
```bash
# Backend logs
docker logs tip_backend

# Celery worker logs
docker logs tip_celery_worker

# Database logs
docker logs tip_postgres
```

## 🧪 Development

### Backend Development
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Development
```bash
cd frontend
npm install
npm run dev
```

### Running Celery Locally
```bash
# Worker
celery -A app.workers.celery_app worker --loglevel=info

# Beat (scheduler)
celery -A app.workers.celery_app beat --loglevel=info
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

### Free OSINT Sources
- [AbuseIPDB](https://www.abuseipdb.com/) - Malicious IP database
- [PhishTank](https://phishtank.org/) - Phishing URL database
- [MalwareBazaar](https://bazaar.abuse.ch/) - Malware hash database
- [URLhaus](https://urlhaus.abuse.ch/) - Malicious URL database

### News Sources
- Krebs on Security
- The Hacker News
- Bleeping Computer
- CISA Cybersecurity Advisories

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API docs at `/docs`

## 🚀 Roadmap

- [ ] STIX 2.1 export
- [ ] TAXII server mode
- [ ] Email/Slack alerting
- [ ] ML-based IOC scoring
- [ ] Elasticsearch integration
- [ ] Advanced MITRE ATT&CK visualization
- [ ] Custom correlation rules UI
- [ ] API rate limiting dashboard

---

**Built for SOC teams, threat intelligence analysts, and security researchers** 🛡️