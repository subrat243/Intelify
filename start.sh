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
sleep 10

echo ""
echo "✅ Platform is starting up!"
echo ""
echo "📍 Access Points:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:8000"
echo "   API Docs:  http://localhost:8000/docs"
echo ""
echo "👤 Create Admin User:"
echo "   Run: docker exec -it tip_backend python"
echo "   Then paste the code from README.md"
echo ""
echo "📊 Check Status:"
echo "   docker-compose ps"
echo ""
echo "📝 View Logs:"
echo "   docker-compose logs -f backend"
echo ""
echo "🛑 Stop Platform:"
echo "   docker-compose down"
echo ""
