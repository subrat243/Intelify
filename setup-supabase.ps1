# Intelify - Supabase Quick Setup Script
# Run this after configuring your .env file with Supabase credentials

Write-Host "🚀 Intelify TIP - Supabase Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-Not (Test-Path ".env")) {
    Write-Host "❌ Error: .env file not found!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please create a .env file with your Supabase credentials:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "DATABASE_URL=`"postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1`"" -ForegroundColor Gray
    Write-Host "DIRECT_URL=`"postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`"" -ForegroundColor Gray
    Write-Host "NEXTAUTH_URL=`"http://localhost:3000`"" -ForegroundColor Gray
    Write-Host "NEXTAUTH_SECRET=`"your-secret-here`"" -ForegroundColor Gray
    Write-Host ""
    Write-Host "See SUPABASE_SETUP.md for detailed instructions" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found .env file" -ForegroundColor Green
Write-Host ""

# Step 1: Generate Prisma Client
Write-Host "📦 Step 1: Generating Prisma Client..." -ForegroundColor Cyan
npm run db:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate Prisma client" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Prisma client generated" -ForegroundColor Green
Write-Host ""

# Step 2: Push schema to Supabase
Write-Host "🗄️  Step 2: Pushing schema to Supabase..." -ForegroundColor Cyan
npm run db:push
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to push schema to Supabase" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check:" -ForegroundColor Yellow
    Write-Host "  1. Your DATABASE_URL and DIRECT_URL are correct" -ForegroundColor Yellow
    Write-Host "  2. Your Supabase project is running" -ForegroundColor Yellow
    Write-Host "  3. Your database password is correct" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Schema pushed to Supabase" -ForegroundColor Green
Write-Host ""

# Step 3: Seed the database
Write-Host "🌱 Step 3: Seeding database with sample data..." -ForegroundColor Cyan
npm run db:seed
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Database seeded successfully" -ForegroundColor Green
Write-Host ""

# Success message
Write-Host "🎉 Setup Complete!" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host ""
Write-Host "Your Intelify TIP is ready to use!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Run: npm run dev" -ForegroundColor White
Write-Host "  2. Open: http://localhost:3000" -ForegroundColor White
Write-Host "  3. Login with: admin@intelify.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host "View your data:" -ForegroundColor Yellow
Write-Host "  • Prisma Studio: npm run db:studio" -ForegroundColor White
Write-Host "  • Supabase Dashboard: https://supabase.com/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Happy threat hunting! 🛡️" -ForegroundColor Cyan
