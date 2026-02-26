# VeloRent Deployment Guide

**Platform:** Vercel + Supabase (Free Tier)
**Estimated Time:** 30-45 minutes
**Difficulty:** Beginner-friendly

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Set up Supabase Database](#step-1-set-up-supabase-database)
3. [Step 2: Prepare GitHub Repository](#step-2-prepare-github-repository)
4. [Step 3: Deploy to Vercel](#step-3-deploy-to-vercel)
5. [Step 4: Configure Domain (Optional)](#step-4-configure-domain-optional)
6. [Step 5: Post-Deployment Setup](#step-5-post-deployment-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have:

- [ ] GitHub account (free)
- [ ] Vercel account (free) - https://vercel.com
- [ ] Supabase account (free) - https://supabase.com
- [ ] Git installed on your computer
- [ ] Node.js 18+ installed

---

## Step 1: Set up Supabase Database

### 1.1 Create Supabase Project

1. Go to https://supabase.com
2. Click **"Start your project"**
3. Sign up/login with GitHub
4. Click **"New Project"**
5. Fill in the form:
   - **Name:** `velorent-bike-app` (or any name you prefer)
   - **Database Password:** Generate a strong password (save it!)
   - **Region:** Choose a region close to your users
   - **Pricing Plan:** Free Tier (default)
6. Click **"Create new project**
7. Wait 2-3 minutes for the project to be ready

### 1.2 Get Database Connection String

1. In your Supabase project, click **Settings** (gear icon) → **Database**
2. Scroll down to **Connection string**
3. Select **"URI"** tab
4. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your database password
6. Save this string - you'll need it later!

### 1.3 Test Database Connection (Optional)

1. In Supabase, go to **Table Editor** → **Create a new table**
2. Verify you can create tables (we'll do this automatically later)

---

## Step 2: Prepare GitHub Repository

### 2.1 Push Code to GitHub

```bash
cd bike-app

# If you don't have a GitHub repository yet:
# Go to https://github.com/new and create a new repository

# Add remote (replace YOUR_USERNAME/REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push code
git add .
git commit -m "Ready for deployment to Vercel + Supabase"
git push -u origin master
```

### 2.2 Verify Repository

1. Go to your GitHub repository
2. Verify all files are there (especially `.env.example`, `prisma/schema.prisma`)

---

## Step 3: Deploy to Vercel

### 3.1 Connect Vercel to GitHub

1. Go to https://vercel.com
2. Click **"Sign Up"** or **"Login"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

### 3.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find and select your `bike-app` repository
3. Click **"Import"**

### 3.3 Configure Project

Vercel will auto-detect Next.js settings. You need to add environment variables:

**Environment Variables to Add:**

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Supabase connection string from Step 1.2 |
| `JWT_SECRET` | Generate a secure random string (see below) |
| `NODE_ENV` | `production` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g., `https://your-app.vercel.app`) |

**Generate JWT_SECRET:**
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 2: Use OpenSSL (if available)
openssl rand -base64 32
```

### 3.4 Complete Deployment

1. Click **"Deploy"**
2. Wait 2-3 minutes for deployment
3. You'll get a URL like: `https://bike-app-xxxxx.vercel.app`

### 3.5 Run Database Migrations on Vercel

Since we need to create database tables, you need to run migrations. The easiest way is through Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Pull environment variables
vercel env pull .env.local

# Run Prisma migrations
npx prisma db push

# Seed the database (optional)
npx prisma db seed
```

**Alternative: Use Supabase SQL Editor**

1. Go to your Supabase project
2. Click **SQL Editor** → **New Query**
3. Run this SQL to create tables:

```sql
-- Create Bike table
CREATE TABLE "Bike" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "name" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "priceUnit" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT NOT NULL,
    "specifications" TEXT NOT NULL,
    "available" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create User table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "role" TEXT DEFAULT 'user' NOT NULL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Create Booking table
CREATE TABLE "Booking" (
    "id" TEXT PRIMARY KEY NOT NULL,
    "userId" TEXT,
    "bikeId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "pickupLocation" TEXT NOT NULL,
    "returnLocation" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT DEFAULT 'pending' NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE SET NULL,
    FOREIGN KEY ("bikeId") REFERENCES "Bike"(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_bikeId_idx" ON "Booking"("bikeId");
```

### 3.6 Deploy Again (if needed)

If you made changes, push to GitHub and Vercel will auto-redeploy:

```bash
git add .
git commit -m "Update database configuration"
git push
```

---

## Step 4: Configure Domain (Optional)

### 4.1 Use Your Own Domain

1. Go to your Vercel project
2. Click **Settings** → **Domains**
3. Enter your domain name
4. Update DNS records as instructed by Vercel
5. Wait for DNS propagation (up to 24 hours)

### 4.2 Update Environment Variables

After domain is set, update in Vercel:
- `NEXT_PUBLIC_APP_URL` = `https://yourdomain.com`

---

## Step 5: Post-Deployment Setup

### 5.1 Create Admin User

You'll need to create an admin user to access the admin panel:

1. Go to your deployed app: `https://your-app.vercel.app`
2. Sign up as a new user
3. In Supabase SQL Editor, update their role to admin:

```sql
UPDATE "User" SET "role" = 'admin' WHERE "email" = 'your-email@example.com';
```

### 5.2 Seed Initial Data (Optional)

To add sample bikes to the database, run in Supabase SQL Editor:

```sql
INSERT INTO "Bike" ("id", "name", "nameEn", "type", "brand", "price", "priceUnit", "image", "description", "features", "specifications", "available", "createdAt", "updatedAt")
VALUES
  ('bike-1', '城市通勤车', 'City Commuter', '城市通勤', 'Giant', 50, '天', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800', '适合日常城市通勤的舒适自行车', '轻便车架|7速变速|舒适坐垫', '车架:铝合金|重量:12kg|轮径:700c', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('bike-2', '山地自行车', 'Mountain Bike', '山地越野', 'Trek', 80, '天', 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800', '专业的山地自行车，适合越野骑行', '前叉避震|27速变速|液压碟刹', '车架:碳纤维|重量:11kg|轮径:27.5英寸', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('bike-3', '电动助力车', 'E-Bike', '电动助力', 'Specialized', 120, '天', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', '电动助力自行车，让骑行更轻松', '锂电池|50km续航|智能显示', '电机:250W|电池:36V|充电时间:4小时', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
```

### 5.3 Test Your Application

1. Visit your deployed URL
2. Test user registration/login
3. Test bike browsing
4. Test booking flow
5. Test admin panel

---

## Troubleshooting

### Database Connection Error

**Error:** `Can't reach database server`

**Solution:**
1. Check `DATABASE_URL` is correct in Vercel environment variables
2. Verify Supabase project is active
3. Check Supabase project URL is correct

### JWT Secret Error

**Error:** Authentication not working

**Solution:**
1. Make sure `JWT_SECRET` is set in Vercel environment variables
2. Regenerate and use a secure random string (min 32 chars)
3. Redeploy after adding the variable

### Prisma Migration Error

**Error:** Database tables not found

**Solution:**
1. Use the SQL scripts in Section 3.5 to create tables manually
2. Or use Vercel CLI to run `prisma db push`

### Build Error

**Error:** Build fails on Vercel

**Solution:**
1. Check build logs in Vercel dashboard
2. Make sure all dependencies are in `package.json`
3. Try adding `.vercelignore` file if needed

### CORS Error (API requests)

**Error:** API requests blocked

**Solution:**
1. Update `NEXT_PUBLIC_APP_URL` environment variable
2. Check API routes in `app/api/` folder

---

## Useful Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Test production build locally
npm run start

# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset

# Seed database
npm run db:seed
```

---

## Next Steps

1. **Monitor your usage:** Check Vercel and Supabase dashboards regularly
2. **Set up analytics:** Consider adding Google Analytics or Vercel Analytics
3. **Custom domain:** Add your own domain for professional appearance
4. **Email notifications:** Configure SMTP settings for booking emails
5. **Backup:** Supabase automatically backs up, but consider export scripts

---

## Support & Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs

---

## Cost Breakdown (Free Tier)

| Service | Free Tier Limit | Estimated Cost |
|---------|----------------|----------------|
| **Vercel** | 100GB bandwidth/mo | ¥0 |
| **Supabase** | 500MB database, 1GB bandwidth/mo | ¥0 |
| **Total** | - | **¥0/month** |

**When to upgrade:**
- >10,000 visitors per month
- Need more database storage
- Want custom domain features

---

**Congratulations!** Your VeloRent platform is now live! 🎉
