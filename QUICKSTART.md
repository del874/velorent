# Quick Start Guide - VeloRent Deployment

This guide will help you deploy VeloRent to production in **30 minutes** using Vercel + Supabase (100% free).

---

## Step 1: Prepare Code (5 minutes)

### Push to GitHub

```bash
cd bike-app

# Create .env if not exists
cp .env.example .env

# Commit changes
git add .
git commit -m "Ready for deployment"

# If you don't have GitHub remote yet:
# 1. Go to https://github.com/new
# 2. Create new repository (name: velorent)
# 3. Copy the repository URL
# 4. Run:
git remote add origin https://github.com/YOUR_USERNAME/velorent.git
git push -u origin master
```

---

## Step 2: Set up Supabase Database (10 minutes)

### Create Account & Project

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with **GitHub** (recommended)
4. Click **"New Project"**

### Configure Project

Fill in the form:
- **Name:** `velorent-db`
- **Database Password:** Click Generate & **SAVE THIS PASSWORD!**
- **Region:** Northeast Asia (Tokyo) or Southeast Asia (Singapore)
- **Pricing Plan:** Free (default)
- Click **"Create new project"**

### Get Connection String

Wait 2-3 minutes, then:

1. Click **Settings** (gear icon) → **Database**
2. Find **Connection string** section
3. Click **URI** tab
4. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password
6. **Save this string** - you'll need it next!

---

## Step 3: Create Database Tables (5 minutes)

### Option A: Using SQL Editor (Recommended)

1. In Supabase, click **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste and run this SQL:

```sql
-- Create tables for VeloRent
CREATE TABLE "Bike" (
    "id" TEXT PRIMARY KEY,
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

CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT,
    "phone" TEXT,
    "password" TEXT,
    "role" TEXT DEFAULT 'user' NOT NULL,
    "createdAt" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE "Booking" (
    "id" TEXT PRIMARY KEY,
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

CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
CREATE INDEX "Booking_bikeId_idx" ON "Booking"("bikeId");
```

4. Click **"Run"** → You should see "Success" message

### Option B: Add Sample Data (Optional)

Add sample bikes to test:

```sql
INSERT INTO "Bike" ("id", "name", "nameEn", "type", "brand", "price", "priceUnit", "image", "description", "features", "specifications", "available")
VALUES
  ('bike-1', '城市通勤车', 'City Commuter', '城市通勤', 'Giant', 50, '天', 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=800', '适合日常城市通勤', '轻便|7速|舒适坐垫', '铝合金|12kg|700c', true),
  ('bike-2', '山地自行车', 'Mountain Bike', '山地越野', 'Trek', 80, '天', 'https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=800', '专业山地自行车', '前叉避震|27速|液压碟刹', '碳纤维|11kg|27.5英寸', true);
```

---

## Step 4: Deploy to Vercel (10 minutes)

### Create Account

1. Go to **https://vercel.com**
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Authorize Vercel

### Import Project

1. Click **"Add New..."** → **"Project"**
2. Find your `velorent` repository
3. Click **"Import"**

### Configure Environment Variables

Before clicking "Deploy", add these environment variables:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Paste your Supabase connection string from Step 2 |
| `JWT_SECRET` | Generate one (see below) |
| `NODE_ENV` | `production` |

**Generate JWT_SECRET:**
- Visit https://generate-secret.vercel.app/32
- Or run: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`

### Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes...
3. You'll get a URL: `https://velorent-xxx.vercel.app`
4. **Click the link** - Your app is live! 🎉

---

## Step 5: Post-Deployment Setup (5 minutes)

### Create Admin Account

1. Open your deployed site
2. Click **"注册"** (Sign up)
3. Create an account
4. Go to Supabase → **SQL Editor**
5. Run this to make yourself admin:

```sql
UPDATE "User" SET "role" = 'admin' WHERE "email" = 'YOUR_EMAIL@example.com';
```

6. Log out and log back in
7. Access admin panel at `/admin`

### Test Your App

- [ ] Browse bikes on home page
- [ ] Test user login
- [ ] Access admin panel
- [ ] Try creating a booking

---

## Troubleshooting

### "Can't reach database server"

**Solution:**
- Check `DATABASE_URL` in Vercel project settings
- Make sure you replaced `[YOUR-PASSWORD]` with actual password
- Supabase project should be "Active" (not paused)

### "Database tables not found"

**Solution:**
- Run the SQL from Step 3 in Supabase SQL Editor
- Make sure you clicked "Run" and saw "Success"

### Build fails on Vercel

**Solution:**
- Check Vercel build logs
- Make sure you pushed all files to GitHub
- Check `.env.example` exists in repository

### Login not working

**Solution:**
- Make sure `JWT_SECRET` is set in Vercel environment variables
- It should be a long random string (32+ characters)
- Redeploy after adding

---

## What's Next?

1. **Custom Domain** (optional)
   - Go to Vercel project → Settings → Domains
   - Add your domain (e.g., `bikes.yourdomain.com`)
   - Update DNS as instructed

2. **Monitor Usage**
   - Vercel Dashboard: See bandwidth and function usage
   - Supabase Dashboard: Monitor database storage

3. **Backup**
   - Supabase auto-backs up daily
   - Export data regularly from Supabase → Database → Backups

---

## Cost & Limits

| Service | Free Tier | When to Upgrade |
|---------|-----------|-----------------|
| **Vercel** | 100GB bandwidth, 10k builds/mo | >10k monthly visitors |
| **Supabase** | 500MB DB, 1GB bandwidth/mo | >1k users or heavy images |

**Total Cost: ¥0/month** 🎉

---

## Support

- Full guide: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Vercel docs: https://vercel.com/docs
- Supabase docs: https://supabase.com/docs

---

**Congratulations! Your VeloRent platform is now live!** 🚴‍♂️
