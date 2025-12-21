# 🛠️ Development Guide - Threat Intelligence Platform

This guide covers different ways to run the platform locally for development.

## 📋 Table of Contents

- [Option 1: Frontend Only (Quick Development)](#option-1-frontend-only-quick-development)
- [Option 2: Backend via Docker + Frontend via npm (Recommended)](#option-2-backend-via-docker--frontend-via-npm-recommended)
- [Option 3: Everything with npm (Full Local Development)](#option-3-everything-with-npm-full-local-development)
- [Environment Configuration](#environment-configuration)
- [Recommended Workflows](#recommended-workflows)
- [Available npm Commands](#available-npm-commands)
- [Troubleshooting](#troubleshooting)

---

## Option 1: Frontend Only (Quick Development)

**Use Case**: Quick frontend changes, UI tweaks, component development

### Steps

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if not done already)
npm install

# Run development server
npm run dev
```

The frontend will start at **http://localhost:3000**

### ⚠️ Important Note

You'll still need the backend running (via Docker) for API calls to work:

```bash
# In another terminal
docker-compose up -d postgres redis backend celery_worker
```

### Pros & Cons

✅ **Pros**:
- Fast hot reload
- Instant feedback on UI changes
- No Docker rebuild needed

❌ **Cons**:
- Still requires backend via Docker
- Can't modify backend code

---

## Option 2: Backend via Docker + Frontend via npm (Recommended)

**Use Case**: Frontend development with stable backend

This is the **best setup for frontend development** as it combines backend stability with frontend hot reload.

### Steps

#### Terminal 1: Start Backend Services

```bash
# Start only backend services (not frontend)
docker-compose up postgres redis backend celery_worker
```

#### Terminal 2: Run Frontend with npm

```bash
cd frontend
npm run dev
```

### Benefits

✅ **Hot reload** - Changes reflect instantly  
✅ **Faster development cycle** - No container rebuilds  
✅ **Better error messages** - See detailed Next.js errors  
✅ **No Docker image rebuilds** - Save time on frontend changes  
✅ **Backend stability** - Consistent API behavior

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

---

## Option 3: Everything with npm (Full Local Development)

**Use Case**: Full-stack development, debugging both frontend and backend

For complete local development without Docker containers.

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Backend Setup

#### Terminal 1: Backend API

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run backend with hot reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2: Celery Worker

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run Celery worker
celery -A app.workers.celery_app worker --loglevel=info
```

#### Terminal 3: Celery Beat (Optional - for scheduled tasks)

```bash
cd backend
source venv/bin/activate

# Run Celery beat scheduler
celery -A app.workers.celery_app beat --loglevel=info
```

### Frontend Setup

#### Terminal 4: Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database Services

You'll still need PostgreSQL and Redis. Use Docker for these:

```bash
# Start only database services
docker-compose up postgres redis
```

**OR** install them locally:

**PostgreSQL**:
```bash
# Ubuntu/Debian
sudo apt install postgresql

# macOS
brew install postgresql
```

**Redis**:
```bash
# Ubuntu/Debian
sudo apt install redis-server

# macOS
brew install redis
```

---

## 📝 Environment Configuration

### Frontend Environment

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend Environment

Ensure `backend/.env` or root `.env` has:

```bash
DATABASE_URL=postgresql://tip_user:tip_password@localhost:5432/tip_db
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-secret-key-change-in-production
ENCRYPTION_KEY=your-encryption-key-change-in-production
```

**Note**: If using Docker for databases, use `localhost` instead of container names.

---

## 🎯 Recommended Development Workflows

### For Frontend Development (Fastest)

```bash
# Terminal 1: Start backend services with Docker
docker-compose up -d postgres redis backend celery_worker

# Terminal 2: Run frontend with npm for hot reload
cd frontend
npm run dev
```

**Why this works best**:
- Backend is stable and consistent
- Frontend has instant hot reload
- No need to rebuild Docker images
- Can see detailed Next.js errors

### For Backend Development

```bash
# Terminal 1: Start database services
docker-compose up -d postgres redis

# Terminal 2: Run backend locally
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 3: Run Celery worker
cd backend
source venv/bin/activate
celery -A app.workers.celery_app worker --loglevel=info

# Terminal 4: Run frontend
cd frontend
npm run dev
```

**Why this works best**:
- Backend has hot reload via uvicorn
- Can debug Python code easily
- See detailed error traces
- Modify and test backend logic instantly

### For Full-Stack Development

```bash
# Terminal 1: Databases only
docker-compose up postgres redis

# Terminal 2: Backend
cd backend && source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 3: Celery
cd backend && source venv/bin/activate
celery -A app.workers.celery_app worker --loglevel=info

# Terminal 4: Frontend
cd frontend
npm run dev
```

---

## 🔧 Available npm Commands

### Frontend Commands

```bash
# Development server (hot reload)
npm run dev

# Production build
npm run build

# Start production server (after build)
npm start

# Lint code
npm run lint

# Clean build artifacts
rm -rf .next
```

### Backend Commands

```bash
# Run with hot reload
uvicorn app.main:app --reload

# Run with specific host/port
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Run Celery worker
celery -A app.workers.celery_app worker --loglevel=info

# Run Celery beat
celery -A app.workers.celery_app beat --loglevel=info

# Run both worker and beat
celery -A app.workers.celery_app worker --beat --loglevel=info
```

---

## ⚡ Quick Start for Development

### Fastest Setup (Recommended)

```bash
# 1. Start backend via Docker
docker-compose up -d postgres redis backend celery_worker

# 2. Run frontend with npm
cd frontend
npm run dev

# 3. Open browser
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

This gives you the **best of both worlds**:
- ✅ Backend stability (Docker)
- ✅ Frontend hot reload (npm)
- ✅ Fast development cycle
- ✅ Easy debugging

---

## 🐛 Troubleshooting

### Frontend Issues

**Port 3000 already in use**:
```bash
# Find and kill process
lsof -ti:3000 | xargs kill -9  # Linux/Mac
netstat -ano | findstr :3000   # Windows

# Or use different port
npm run dev -- -p 3001
```

**Module not found errors**:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**TypeScript errors**:
```bash
cd frontend
npm run build  # This will show all errors
```

### Backend Issues

**Database connection failed**:
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Check connection
docker exec -it tip_postgres psql -U tip_user -d tip_db
```

**Celery not processing tasks**:
```bash
# Check Celery worker logs
docker logs -f tip_celery_worker

# Or if running locally
celery -A app.workers.celery_app worker --loglevel=debug
```

**Import errors**:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt --upgrade
```

### Docker Issues

**Containers not starting**:
```bash
# Check logs
docker-compose logs backend

# Restart services
docker-compose restart

# Clean start
docker-compose down
docker-compose up -d
```

**Port conflicts**:
```bash
# Check what's using the port
lsof -i :8000  # Backend
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Stop conflicting services or change ports in docker-compose.yml
```

---

## 📚 Additional Resources

- **Next.js Docs**: https://nextjs.org/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Celery Docs**: https://docs.celeryq.dev
- **Docker Compose**: https://docs.docker.com/compose

---

## 💡 Pro Tips

1. **Use multiple terminals** - One for backend, one for frontend, one for logs
2. **Enable hot reload** - Both uvicorn and Next.js support it
3. **Check logs frequently** - `docker-compose logs -f` is your friend
4. **Use API docs** - http://localhost:8000/docs for testing endpoints
5. **Git ignore** - Don't commit `.env.local`, `node_modules`, or `venv`

---

**Happy Coding! 🚀**
