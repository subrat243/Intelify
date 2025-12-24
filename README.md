# Intelify - Threat Intelligence Platform (TIP)

A **production-ready Threat Intelligence Platform** built with **Next.js**, designed for Security Operations Centers (SOC) to collect, analyze, and visualize threat intelligence data from multiple sources.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.1-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-6.2-2D3748)

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Default User Accounts](#-default-user-accounts)
- [API Endpoints](#-api-endpoints)
- [Security Best Practices](#-security-best-practices)
- [Deployment](#-deployment)
- [Database Management](#-database-management)
- [Why Supabase?](#-why-supabase)
- [Troubleshooting](#-troubleshooting)

## 🔗 Quick Links

- 📖 **Setup Guide**: [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
- 🚶 **Walkthrough**: Check artifacts for detailed walkthrough
- 🎓 **For Students**: Perfect for final-year projects and portfolios

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
- **Supabase Account** (free tier available at https://supabase.com)
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

### 3. Set Up Supabase Database

1. **Create a Supabase project**:
   - Go to https://supabase.com/dashboard
   - Click "New Project"
   - Fill in project details and create

2. **Get your connection string**:
   - Go to **Settings** → **Database**
   - Scroll to **Connection string** section
   - Select **URI** tab
   - Copy the connection string

3. **Note your database password** (you set this when creating the project)

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

**Replace**:
- `[YOUR-PASSWORD]` with your Supabase database password
- `[PROJECT-REF]` with your project reference (e.g., `abc123xyz`)

**Generate a secure NextAuth secret**:
```bash
openssl rand -base64 32
```

### 5. Set Up the Database

**Option A: Automated Setup (Recommended)**

Run the automated setup script:

```powershell
# PowerShell (Windows)
.\setup-supabase.ps1
```

This script will:
- ✅ Validate your `.env` file
- ✅ Generate Prisma client
- ✅ Push schema to Supabase
- ✅ Seed sample data

**Option B: Manual Setup**

```bash
# Generate Prisma client
npm run db:generate

# Push schema to Supabase
npm run db:push

# Seed the database with sample data
npm run db:seed
```

> 💡 **Tip**: If you encounter connection issues, verify your DATABASE_URL and DIRECT_URL are correct in `.env`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

> 📚 **Need Help?** Check `SUPABASE_SETUP.md` for detailed Supabase configuration instructions.

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

Vercel works perfectly with Supabase for production deployment:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Import project in Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add environment variables**
   
   In Vercel dashboard, add these variables:
   ```
   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
   DIRECT_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your-production-secret
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy automatically

5. **Run database migrations**
   
   After first deployment, run:
   ```bash
   # From your local machine with production DATABASE_URL
   npx prisma db push
   npx prisma db seed
   ```

### Production Checklist

Before deploying to production:

- [ ] Change default user passwords
- [ ] Generate new `NEXTAUTH_SECRET`
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Enable Supabase Row Level Security (RLS) if needed
- [ ] Set up Supabase backups
- [ ] Configure CORS if using external APIs
- [ ] Review and update API rate limits
- [ ] Enable Vercel Analytics (optional)

### Docker

For containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "start"]
```

**Build and run**:
```bash
# Build image
docker build -t intelify .

# Run container
docker run -p 3000:3000 --env-file .env intelify
```

### Other Platforms

The application can be deployed to:
- **Railway**: Auto-deploy from GitHub with PostgreSQL addon
- **Render**: Static site + PostgreSQL database
- **DigitalOcean App Platform**: Full-stack deployment
- **AWS Amplify**: Serverless deployment with RDS

> 💡 **Tip**: Always use connection pooling (`pgbouncer=true`) in production for better performance.

---

## 🧪 Database Management

```bash
# Open Prisma Studio (GUI for viewing/editing data)
npm run db:studio

# View your data in Supabase Dashboard
# Go to: https://supabase.com/dashboard → Your Project → Table Editor

# Create migration (for production)
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

### Supabase Dashboard Features
- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom SQL queries
- **Database**: Monitor performance and connections
- **API**: Auto-generated REST and GraphQL APIs

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

## 🎯 Why Supabase?

This project uses **Supabase** as the database provider for several key advantages:

| Feature | Benefit |
|---------|---------|
| **Free Tier** | Generous limits for development and small projects |
| **Managed PostgreSQL** | No server setup or maintenance required |
| **Built-in Dashboard** | Visual interface to view and edit data |
| **Auto-scaling** | Handles traffic spikes automatically |
| **Daily Backups** | Automatic backups included |
| **Global CDN** | Fast access worldwide |
| **SSL by Default** | Secure connections out of the box |
| **Perfect for Vercel** | Seamless deployment integration |

---

## 🐛 Troubleshooting

### Database Connection Issues

**Problem**: Cannot connect to Supabase database

**Solutions**:
```bash
# 1. Verify your connection string
# Check that DATABASE_URL and DIRECT_URL in .env are correct

# 2. Test connection with Prisma
npx prisma db pull

# 3. Check Supabase project status
# Go to: https://supabase.com/dashboard → Your Project → Settings → Database
```

### Prisma Client Issues

**Problem**: `@prisma/client` not found or outdated

**Solutions**:
```bash
# Regenerate Prisma client
npm run db:generate

# Or manually
npx prisma generate
```

### Migration Errors

**Problem**: Schema push fails

**Solutions**:
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Then re-run setup
npm run db:push
npm run db:seed
```

### Build Errors

**Problem**: Next.js build fails

**Solutions**:
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma client
npm run db:generate
```

### Authentication Issues

**Problem**: Cannot login or session expires immediately

**Solutions**:
1. Verify `NEXTAUTH_SECRET` is set in `.env`
2. Generate a new secret: `openssl rand -base64 32`
3. Ensure `NEXTAUTH_URL` matches your development URL
4. Clear browser cookies and try again

### Port Already in Use

**Problem**: Port 3000 is already in use

**Solutions**:
```bash
# Use a different port
PORT=3001 npm run dev

# Or kill the process using port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Need More Help?

- Check `SUPABASE_SETUP.md` for detailed Supabase configuration
- Review `walkthrough.md` for step-by-step guidance
- Open an issue on GitHub with error details

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
