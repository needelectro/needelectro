# NEED ELECTRO — Vercel & Supabase Deployment Guide

This guide walks you step-by-step through deploying the **NEED ELECTRO** web application and Progressive Web App to **Vercel** with a **Supabase PostgreSQL** cloud database.

---

## Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │          Vercel Platform             │
                      │   Next.js 15 App Router Edge/Node    │
                      │  60 Routes (Web, PWA & Admin Portal) │
                      └──────────────────┬───────────────────┘
                                         │
             ┌───────────────────────────┴───────────────────────────┐
             │                                                       │
             ▼ (Port 6543 - PgBouncer)                               ▼ (Port 5432 - Direct)
  ┌───────────────────────────────────┐               ┌───────────────────────────────────┐
  │         DATABASE_URL              │               │            DIRECT_URL             │
  │   Supabase Transaction Pooler     │               │    Supabase Direct Connection     │
  │   (Next.js Serverless Queries)    │               │   (Prisma Migrations & DB Push)   │
  └─────────────────┬─────────────────┘               └─────────────────┬─────────────────┘
                    │                                                   │
                    └─────────────────────────┬─────────────────────────┘
                                              │
                                              ▼
                               ┌─────────────────────────────┐
                               │     Supabase PostgreSQL     │
                               │   Tables, Relations, RBAC   │
                               └─────────────────────────────┘
```

---

## Step 1: Create a Supabase Project

1. Log in or sign up at [https://supabase.com](https://supabase.com).
2. Click **"New Project"**.
3. Fill in the details:
   - **Name**: `need-electro`
   - **Database Password**: Choose a strong password and save it securely.
   - **Region**: Choose **Singapore (`ap-southeast-1`)** for minimal latency to Bangladesh.
   - **Pricing Plan**: Free tier is sufficient for launch.
4. Click **"Create new project"** and wait ~1-2 minutes for provisioning.

---

## Step 2: Obtain Supabase Connection Strings

1. In your Supabase dashboard, go to:
   **Project Settings** (gear icon at bottom left) ➔ **Database**.
2. Scroll to the **Connection strings** section.
3. Select the **URI** tab.

### A. Connection Pooler (Transaction Mode) ➔ `DATABASE_URL`
- In the mode dropdown, select **Transaction** (Port `6543`).
- Copy the URI string. It will look like:
  ```
  postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
  ```
- *Replace `[YOUR-PASSWORD]` with the database password you chose in Step 1.*

### B. Direct Connection (Session Mode) ➔ `DIRECT_URL`
- In the mode dropdown, select **Session** or **Direct** (Port `5432`).
- Copy the URI string. It will look like:
  ```
  postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
  ```

---

## Step 3: Push Schema & Seed Initial Database

From your local computer terminal in `d:\NEED ELECTRO FINAL WEBSITE`:

1. Update your local `.env` file with the real Supabase strings:
   ```env
   DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
   ```

2. Push all tables and relations to Supabase:
   ```bash
   npx prisma db push
   ```
   *(This will create all 22 tables including Users, Bookings, Orders, Warranties, Training, Branches, Sellers, etc. directly inside your Supabase PostgreSQL database).*

3. (Optional) Seed standard services, training courses, and verified profiles:
   ```bash
   node prisma/seed.mjs
   ```

4. Verify tables in the **Supabase Table Editor** in your browser dashboard.

---

## Step 4: Deploy on Vercel

1. Log in to [https://vercel.com](https://vercel.com) (sign in with your GitHub account).
2. Click **"Add New..."** ➔ **"Project"**.
3. Find your GitHub repository: **`needelectro/need-electro-website`** and click **"Import"**.
4. In the **Configure Project** screen:
   - **Framework Preset**: Next.js (automatically detected)
   - **Root Directory**: `./`
   - **Build Command**: `prisma generate && next build` (or leave default, `vercel.json` already sets this up)
   - **Install Command**: `npm install`
5. Expand **Environment Variables** and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres.[REF]:[PASS]@...:6543/postgres?pgbouncer=true` | Supabase Pooler URI |
| `DIRECT_URL` | `postgresql://postgres.[REF]:[PASS]@...:5432/postgres` | Supabase Direct URI |
| `JWT_SECRET` | `need_electro_super_secure_production_jwt_key_2026_moulvibazar` | Auth signing secret |
| `NEXT_PUBLIC_APP_URL` | `https://your-project-name.vercel.app` (or your custom domain) | Base site URL |
| `NEXT_PUBLIC_APP_NAME` | `NEED ELECTRO` | Brand name |
| `NEXT_PUBLIC_SUPPORT_PHONE` | `01733 983752` | Hotline |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | `needelectro23@gmail.com` | Official email |
| `NEXT_PUBLIC_OFFICE_ADDRESS` | `Moulvibazar, Bangladesh` | Regional office |

6. Click **"Deploy"**.
7. Vercel will install dependencies, generate Prisma Client, compile all 60 routes, and provision your live HTTPS URL (e.g. `https://need-electro.vercel.app`).

---

## Step 5: Custom Domain Setup (Optional)

1. In Vercel, go to **Project Settings** ➔ **Domains**.
2. Enter your domain (e.g., `needelectro.com` or `www.needelectro.com`).
3. Add the displayed DNS records (A record / CNAME) in your domain registrar (e.g., Namecheap, GoDaddy, Cloudflare).
4. Vercel automatically generates an SSL/TLS Certificate.
