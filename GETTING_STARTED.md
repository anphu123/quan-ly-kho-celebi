# 🚀 Celebi Project - Quick Start Guide

## 📋 Prerequisites Installed

Make sure you have:
- ✅ Node.js >= 20.0.0
- ✅ pnpm >= 8.0.0
- ✅ Docker & Docker Compose

## 🏁 Getting Started

### Step 1: Install Dependencies

```powershell
# Install pnpm if you haven't
npm install -g pnpm@8.15.1

# Install all dependencies
pnpm install
```

### Step 2: Start Docker Services

```powershell
# Navigate to docker folder and start services
cd docker
docker-compose up -d

# Check if services are running
docker-compose ps
```

Services will be available at:
- PostgreSQL: `localhost:5432`
- Redis: `localhost:6379`
- MinIO Console: http://localhost:9001 (admin/password: minio_admin/minio_password)

### Step 3: Setup Environment Variables

```powershell
# Copy environment template
cp .env.example .env

# The .env file is already configured for local development
# No changes needed for local setup!
```

### Step 4: Run Database Migrations & Seed

```powershell
# Generate Prisma Client
cd apps/backend
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed initial data
pnpm prisma:seed
```

### Step 5: Start Development Servers

```powershell
# Go back to root
cd ../..

# Start all apps in development mode
pnpm dev
```

This will start:
- 🔧 Backend API: http://localhost:6868
- 📚 Swagger Docs: http://localhost:6868/api
- 🌐 Web App: http://localhost:5173 (when implemented)

## 👤 Default Accounts

After seeding, you can login with:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@celebi.com | password123 |
| Inventory Manager | kho@celebi.com | password123 |
| Cashier | thungan@celebi.com | password123 |
| Accountant | ketoan@celebi.com | password123 |

## 🛠️ Useful Commands

```powershell
# Development
pnpm dev              # Start all apps in dev mode
pnpm build            # Build all apps
pnpm lint             # Lint all code
pnpm test             # Run all tests

# Database
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Prisma Studio GUI
pnpm db:seed          # Seed database

# Docker
cd docker
docker-compose up -d       # Start services
docker-compose down        # Stop services
docker-compose logs -f     # View logs
docker-compose ps          # Check status
```

## 📡 Testing the API

### Using Swagger UI
Visit http://localhost:6868/api

### Using curl

```powershell
# Login
curl -X POST http://localhost:6868/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"email\":\"admin@celebi.com\",\"password\":\"password123\"}'

# Get Profile (replace TOKEN with accessToken from login)
curl http://localhost:6868/api/v1/auth/me `
  -H "Authorization: Bearer TOKEN"
```

## 🐛 Troubleshooting

### Port already in use
```powershell
# Check what's using port 6868
netstat -ano | findstr :6868

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Docker services not starting
```powershell
# Remove volumes and restart
cd docker
docker-compose down -v
docker-compose up -d
```

### Prisma Client not generated
```powershell
cd apps/backend
pnpm prisma:generate
```

## 🎯 Next Steps

Phase 1 is complete! ✅

Now you can:
1. ✅ Test authentication endpoints
2. 🔨 Start building Catalog module (Products, Categories, Brands)
3. 🔨 Build Inventory module  
4. 🔨 Build POS/Sales module
5. 🌐 Build React frontend

---

Happy coding! 🎉
