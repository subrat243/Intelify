# Intelify - Threat Intelligence Platform (TIP)

A **production-ready Threat Intelligence Platform** built with **Next.js**, designed for Security Operations Centers (SOC) to collect, analyze, and visualize threat intelligence data from multiple sources.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748)

---

## 🚀 Features

### Core Capabilities
- **Threat Feed Ingestion**: Collect IOCs from multiple threat intelligence feeds
- **Security News Aggregation**: Automated RSS feed parsing from top security news sources
- **IOC Management**: Track IPs, domains, URLs, file hashes, and emails
- **Correlation Engine**: Identify related threats based on shared infrastructure
- **Alert System**: Automated alert generation for high-risk indicators
- **MITRE ATT&CK Mapping**: Visualize tactics and techniques
- **Role-Based Access Control**: Admin, Analyst, and Viewer roles

### Dashboard Features
- **Real-time Metrics**: Total indicators, high-risk threats, active alerts, critical CVEs
- **Interactive Charts**: Activity trends, indicator type distribution, confidence levels
- **Searchable IOC Table**: Advanced filtering and sorting
- **News Intelligence**: Security news with CVE linking
- **Alert Management**: Status tracking and workflow management
- **MITRE Heatmap**: Tactic and technique activity visualization

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Frontend** | React 19, Tailwind CSS |
| **Backend** | Next.js API Routes |
| **Database** | PostgreSQL |
| **ORM** | Prisma |
| **Authentication** | NextAuth v5 |
| **Charts** | Recharts |
| **Validation** | Zod |

---

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Git**

---

## 🔧 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/intelify.git
cd intelify
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/intelify?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Optional: External Threat Feed API Keys
ALIENVAULT_API_KEY=""
ABUSEIPDB_API_KEY=""
VIRUSTOTAL_API_KEY=""
```

**Generate a secure NextAuth secret:**
```bash
openssl rand -base64 32
```

### 4. Set Up the Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 👤 Default User Accounts

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@intelify.com | admin123 |
| **Analyst** | analyst@intelify.com | analyst123 |
| **Viewer** | viewer@intelify.com | viewer123 |

> ⚠️ **Important**: Change these passwords in production!

---

## 📁 Project Structure

```
intelify/
├── app/
│   ├── api/                    # API routes
│   │   ├── auth/              # NextAuth endpoints
│   │   ├── ingest/            # Threat feed ingestion
│   │   ├── news/              # Security news fetching
│   │   ├── search/            # IOC search
│   │   ├── correlation/       # Correlation engine
│   │   ├── alerts/            # Alert management
│   │   └── dashboard/         # Dashboard stats
│   ├── auth/                  # Authentication pages
│   │   └── login/
│   ├── dashboard/             # Dashboard pages
│   │   ├── threats/           # Threat intelligence
│   │   ├── news/              # News intelligence
│   │   ├── alerts/            # Alerts
│   │   └── mitre/             # MITRE ATT&CK
│   ├── layout.tsx             # Root layout
│   ├── page.tsx               # Home page
│   └── globals.css            # Global styles
├── components/
│   ├── ui/                    # Reusable UI components
│   └── dashboard/             # Dashboard-specific components
├── lib/
│   ├── auth.ts                # NextAuth configuration
│   ├── db.ts                  # Prisma client
│   └── types.ts               # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed script
└── middleware.ts              # Route protection
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Threat Intelligence
- `POST /api/ingest` - Ingest threat feeds
- `GET /api/ingest` - Get ingestion history
- `GET /api/search?q=<query>&type=<type>` - Search IOCs

### News
- `POST /api/news` - Fetch security news
- `GET /api/news?page=<page>&limit=<limit>` - Get news articles

### Correlation
- `POST /api/correlation` - Run correlation analysis
- `GET /api/correlation` - Get correlation results

### Alerts
- `POST /api/alerts` - Create alert
- `GET /api/alerts?status=<status>&severity=<severity>` - Get alerts
- `PATCH /api/alerts` - Update alert status

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

---

## 🎨 Features Walkthrough

### 1. Dashboard Overview
- View real-time metrics and trends
- Interactive charts for activity analysis
- Quick access to critical alerts

### 2. Threat Intelligence
- Search and filter IOCs
- View risk scores and confidence levels
- Track indicator sources

### 3. News Intelligence
- Automated security news aggregation
- CVE linking and tracking
- Refresh feeds on demand

### 4. MITRE ATT&CK
- Heatmap visualization of tactics and techniques
- Activity-based color coding
- Technique details and counts

### 5. Alerts
- Status-based workflow (New → Acknowledged → Resolved)
- Severity filtering
- False positive marking

---

## 🔒 Security Best Practices

- ✅ Password hashing with bcrypt
- ✅ JWT-based session management
- ✅ Role-based access control (RBAC)
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Protected API routes
- ✅ Secure environment variable handling

---

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build image
docker build -t intelify .

# Run container
docker run -p 3000:3000 --env-file .env intelify
```

---

## 🧪 Database Management

```bash
# Open Prisma Studio (GUI)
npm run db:studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset
```

---

## 📊 Sample Data

The seed script creates:
- 3 users (Admin, Analyst, Viewer)
- 4 threat sources
- 3 sample threat indicators
- 2 sample CVEs
- 2 MITRE ATT&CK techniques
- 1 sample alert

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **MITRE ATT&CK** - Adversary tactics and techniques framework
- **AlienVault OTX** - Open Threat Exchange
- **AbuseIPDB** - IP abuse reporting
- **The Hacker News** - Security news source

---

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Built with ❤️ for the cybersecurity community**
