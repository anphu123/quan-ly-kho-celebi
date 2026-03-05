# Vercel Deployment Guide

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
   - `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.railway.app/api/v1`)

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

The frontend needs a backend API. Deploy the NestJS backend separately:

### Option 1: Railway (Recommended)
1. Go to https://railway.app
2. Create new project from GitHub
3. Select `apps/backend` as root directory
4. Add environment variables from `.env.example`
5. Deploy

### Option 2: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set Root Directory to `apps/backend`
5. Build Command: `pnpm install && pnpm build`
6. Start Command: `pnpm start:prod`
7. Add environment variables
8. Deploy

### Option 3: Heroku
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
