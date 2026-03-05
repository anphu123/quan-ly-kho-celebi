# Vercel Deployment Guide

## � Cost: 100% FREE for Small Projects

**Frontend (Vercel):**
- ✅ FREE Hobby Plan
- 100 GB bandwidth/month
- Unlimited deployments
- Custom domains included

**Backend (Railway):**
- ⚠️ FREE with $5 credit/month (requires credit card for verification)
- 500 hours execution time
- 8GB RAM, 8 vCPUs

**Alternative: Render.com (100% FREE - No Card Required!):**
- ✅ Completely FREE tier
- No credit card needed
- 750 hours/month (enough for 24/7)
- Auto-sleep after 15min inactivity
- Slower cold starts (~30s)

**Database Options:**
- Railway PostgreSQL: Included in $5 credit (requires card)
- Supabase: ✅ FREE 500MB PostgreSQL (no card!)
- Neon: ✅ FREE 10GB PostgreSQL (no card!)

🎉 **Recommended FREE Stack (No Card):**
- Frontend: Vercel
- Backend: Render.com
- Database: Supabase or Neon
- **Total Cost: $0/month, no credit card needed!**

---

## �🚀 Quick Start (Deploy Both from Same Repo)

**You have ONE GitHub repo with both frontend and backend!**

### Step 1: Deploy Backend (Render - 100% FREE, No Card!)
1. Go to https://render.com → Sign up with GitHub (FREE)
2. "New" → "Web Service" → Select `anphu123/quan-ly-kho-celebi`
3. Root Directory: `apps/backend`
4. Build Command: `pnpm build-production`
5. Start Command: `pnpm start:prod`
6. Add PostgreSQL database (also FREE on Render)
7. Copy your Render URL: `https://your-app.onrender.com`

### Step 2: Deploy Frontend (Vercel - 100% FREE)
1. Go to https://vercel.com/new → Import GitHub repo
2. Select `anphu123/quan-ly-kho-celebi` (same repo!)
3. Set `VITE_API_URL` = `https://your-app.onrender.com/api/v1` (from Step 1)
4. Deploy!

✅ Done! Both deployed 100% FREE - No credit card needed!

---

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- GitHub repository connected to Vercel
- Backend API deployed separately (e.g., Railway, Render, Heroku, etc.)

## Deployment Steps

### 1. Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### 2. Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `anphu123/quan-ly-kho-celebi`
3. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (keep as root)
   - **Build Command**: `cd apps/web && pnpm install && pnpm build`
   - **Output Directory**: `apps/web/dist`
   - **Install Command**: `pnpm install`

4. Add Environment Variables:
   - `VITE_API_URL`: Your Railway backend URL (e.g., `https://xxx.up.railway.app/api/v1`)
   - **Important:** Get this URL from Railway after deploying backend (see Backend Deployment section below)

5. Click "Deploy"

### 3. Deploy via Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

The CLI will prompt you for configuration. Use the same settings as above.

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-api.com/api/v1` | Backend API endpoint |

## Backend Deployment

The frontend needs a backend API. Choose ONE option:

### Option 1: Render.com (100% FREE - No Credit Card! ⭐ Recommended)

**Deploy Backend:**
1. Go to https://render.com (sign up with GitHub - FREE)
2. "New" → "Web Service" → "Build and deploy from a Git repository"
3. Select `anphu123/quan-ly-kho-celebi` repo
4. Configure:
   - **Name**: `celebi-backend` (or any name)
   - **Root Directory**: `apps/backend`
   - **Environment**: `Node`
   - **Build Command**: `pnpm build-production` (Render auto-runs pnpm install first)
   - **Start Command**: `pnpm start:prod`
   - **Instance Type**: FREE (choose Free)

**Add PostgreSQL Database (FREE):**
1. In Render dashboard, "New" → "PostgreSQL"
2. Name: `celebi-db`, Plan: FREE
3. Copy the "Internal Database URL"
4. Go back to your Web Service → "Environment"
5. Add environment variables:

```env
DATABASE_URL=<paste-internal-database-url-here>
NODE_ENV=production
JWT_SECRET=your-super-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-secret-key
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app
APP_PORT=10000
```

6. Click "Save Changes" → Render auto-deploys!

**Get Backend URL:**
- Your backend URL will be: `https://celebi-backend.onrender.com`
- Copy this - you need it for Vercel!

**⚠️ Note:** Free tier sleeps after 15min inactivity. First request takes ~30s to wake up.

---

### Option 2: Railway (Faster but needs Credit Card)
1. Go to https://railway.app and login
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `anphu123/quan-ly-kho-celebi` (same repo!)
4. Railway will auto-detect the monorepo
5. Add environment variables (see below)
6. Click "Deploy"

**Railway will automatically:**
- Detect `nixpacks.toml` and `railway.json` configuration
- Build from `apps/backend` directory
- Install dependencies with pnpm
- Run Prisma migrations
- Start the server

**Required Environment Variables on Railway:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NODE_ENV=production
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
FRONTEND_URL=https://your-app.vercel.app
CORS_ORIGINS=https://your-app.vercel.app
```

**Add PostgreSQL Database:**
- In Railway project, click "New" → "Database" → "Add PostgreSQL"
- Railway auto-sets `DATABASE_URL` for you

**Copy Backend URL:**
- After deploy, Railway gives you a URL like: `https://xxx.up.railway.app`
- Copy this URL - you'll need it for Vercel!

---

### ~~Option 3: Heroku~~ (Not recommended - requires credit card)
```bash
cd apps/backend
heroku create your-app-name
git subtree push --prefix apps/backend heroku main
```

## Database Setup

Make sure your backend has access to:
- PostgreSQL database (e.g., use Railway PostgreSQL, Supabase, or Neon)
- Redis instance (optional, for caching)

## Post-Deployment

1. Update `CORS_ORIGINS` in backend to include your Vercel URL:
   ```
   CORS_ORIGINS=https://your-app.vercel.app
   ```

2. Run database migrations on your production database:
   ```bash
   pnpm prisma migrate deploy
   ```

3. Seed initial data if needed:
   ```bash
   pnpm prisma db seed
   ```

## Custom Domain (Optional)

1. Go to Vercel Dashboard → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update CORS settings in backend

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure `pnpm-lock.yaml` is committed
- Verify all dependencies are in `package.json`

### API Connection Issues
- Verify `VITE_API_URL` is set correctly
- Check backend CORS settings include Vercel URL
- Ensure backend is running and accessible

### Blank Page After Deploy
- Check browser console for errors
- Verify API URL is correct
- Check routing configuration in `vercel.json`

## Vercel Configuration

The project includes `vercel.json` with:
- SPA routing support (rewrites all routes to index.html)
- Asset caching headers
- Build configuration for monorepo

## Monitoring

- Check Vercel Analytics: https://vercel.com/dashboard/analytics
- View deployment logs: https://vercel.com/dashboard/deployments
- Monitor backend health via your hosting provider

## Updates

To deploy updates:
1. Push changes to GitHub
2. Vercel automatically deploys from the main branch
3. Or trigger manual deployment in Vercel dashboard

---

For more help, see:
- Vercel Docs: https://vercel.com/docs
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
