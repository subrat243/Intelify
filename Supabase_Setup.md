# Supabase Database Configuration Guide

## 🔗 Getting Your Supabase Connection String

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string** section
5. Select **URI** tab
6. Copy the connection string (it will look like this):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

## 📝 Environment Variables

Update your `.env` file with the following:

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here-generate-with-openssl-rand-base64-32"

# Optional: External Threat Feed API Keys
ALIENVAULT_API_KEY=""
ABUSEIPDB_API_KEY=""
VIRUSTOTAL_API_KEY=""
```

## 🔑 Why Two Connection Strings?

- **DATABASE_URL**: Used for connection pooling (PgBouncer) - better for serverless
- **DIRECT_URL**: Direct connection for migrations and schema changes

## ⚙️ Prisma Configuration

Your `prisma/schema.prisma` needs a small update for Supabase:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## 🚀 Setup Steps

1. **Get your Supabase connection string** (see above)
2. **Update `.env`** with both DATABASE_URL and DIRECT_URL
3. **Generate NextAuth secret**:
   ```bash
   openssl rand -base64 32
   ```
4. **Push schema to Supabase**:
   ```bash
   npm run db:generate
   npm run db:push
   ```
5. **Seed the database**:
   ```bash
   npm run db:seed
   ```

## ✅ Verify Connection

After setup, you can verify the connection:

```bash
npx prisma studio
```

This will open Prisma Studio where you can view your Supabase database tables.

## 🔒 Security Notes

- Never commit your `.env` file to Git
- Keep your database password secure
- Use Supabase's Row Level Security (RLS) for additional protection
- Consider using Supabase's built-in auth if you want to integrate it later

## 📊 Supabase Dashboard

You can also view your data directly in Supabase:
1. Go to your project dashboard
2. Click **Table Editor** in the sidebar
3. View all your tables created by Prisma

## 🌐 Production Deployment

For production (Vercel, etc.):
1. Add both `DATABASE_URL` and `DIRECT_URL` to your environment variables
2. Use the connection pooling URL for better performance
3. Ensure your Supabase project is in the same region as your deployment for lower latency
