#!/bin/bash

echo "🛡️  Threat Intelligence Platform - Quick Start"
echo "=============================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env created"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env and change SECRET_KEY and ENCRYPTION_KEY before production!"
    echo ""
fi

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be ready..."
sleep 15

# Check if backend is ready
echo "🔍 Checking backend status..."
until docker exec tip_backend python -c "from app.core.database import engine; engine.connect()" 2>/dev/null; do
    echo "   Waiting for database connection..."
    sleep 3
done

echo ""
echo "✅ All services are running!"
echo ""

# Check if admin user exists
echo "👤 Checking for admin user..."
ADMIN_EXISTS=$(docker exec tip_backend python -c "
from app.core.database import SessionLocal
from app.models.models import User
db = SessionLocal()
admin = db.query(User).filter(User.username == 'admin').first()
print('exists' if admin else 'not_found')
" 2>/dev/null)

if [ "$ADMIN_EXISTS" = "not_found" ]; then
    echo ""
    echo "🔐 Admin User Setup"
    echo "==================="
    echo ""
    
    # Get username
    read -p "Enter admin username [admin]: " ADMIN_USERNAME
    ADMIN_USERNAME=${ADMIN_USERNAME:-admin}
    
    # Get email
    read -p "Enter admin email [admin@tip.local]: " ADMIN_EMAIL
    ADMIN_EMAIL=${ADMIN_EMAIL:-admin@tip.local}
    
    # Get password
    while true; do
        read -sp "Enter admin password: " ADMIN_PASSWORD
        echo ""
        read -sp "Confirm password: " ADMIN_PASSWORD_CONFIRM
        echo ""
        
        if [ "$ADMIN_PASSWORD" = "$ADMIN_PASSWORD_CONFIRM" ]; then
            if [ -z "$ADMIN_PASSWORD" ]; then
                echo "❌ Password cannot be empty. Please try again."
                echo ""
            else
                break
            fi
        else
            echo "❌ Passwords do not match. Please try again."
            echo ""
        fi
    done
    
    # Create admin user
    echo ""
    echo "Creating admin user..."
    docker exec tip_backend python -c "
from app.core.database import SessionLocal
from app.models.models import User
from app.core.security import get_password_hash

db = SessionLocal()
admin = User(
    username='$ADMIN_USERNAME',
    email='$ADMIN_EMAIL',
    hashed_password=get_password_hash('$ADMIN_PASSWORD'),
    role='super_admin'
)
db.add(admin)
db.commit()
print('✅ Admin user created successfully!')
"
    
    echo ""
    echo "📝 Admin Credentials:"
    echo "   Username: $ADMIN_USERNAME"
    echo "   Email: $ADMIN_EMAIL"
    echo ""
else
    echo "✅ Admin user already exists"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎉 Platform is ready!"
echo ""
echo "📍 Access Points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "📊 Useful Commands:"
echo "   Check status:    docker-compose ps"
echo "   View logs:       docker-compose logs -f backend"
echo "   Stop platform:   docker-compose down"
echo ""
echo "🛡️  Happy threat hunting!"
echo ""
